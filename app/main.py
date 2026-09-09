import os
from pathlib import Path

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent

GPU_SERVER_URL = os.getenv("GPU_SERVER_URL", "http://localhost:11434")
CLIPROXY_URL = os.getenv("CLIPROXY_URL", "http://localhost:8317")
CLIPROXY_API_KEY = os.getenv("CLIPROXY_API_KEY", "dev-key")

app = FastAPI(title="Model Gateway Dashboard", version="1.0.0")
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    model: str = "local-coder"
    source: str = Field(default="cliproxy", pattern="^(cliproxy|ollama)$")


class ChatResponse(BaseModel):
    model: str
    source: str
    reply: str


async def fetch_json(client: httpx.AsyncClient, url: str, headers: dict | None = None) -> dict | list:
    response = await client.get(url, headers=headers)
    response.raise_for_status()
    return response.json()


@app.get("/", response_class=HTMLResponse)
async def index() -> HTMLResponse:
    return HTMLResponse((BASE_DIR / "templates" / "index.html").read_text(encoding="utf-8"))


@app.get("/api/health")
async def health() -> dict:
    results = {"gpu_server": {"url": GPU_SERVER_URL, "ok": False}, "cliproxy": {"url": CLIPROXY_URL, "ok": False}}

    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            await fetch_json(client, f"{GPU_SERVER_URL}/api/tags")
            results["gpu_server"]["ok"] = True
        except Exception as exc:
            results["gpu_server"]["error"] = str(exc)

        try:
            headers = {"Authorization": f"Bearer {CLIPROXY_API_KEY}"}
            await fetch_json(client, f"{CLIPROXY_URL}/v1/models", headers=headers)
            results["cliproxy"]["ok"] = True
        except Exception as exc:
            results["cliproxy"]["error"] = str(exc)

    return results


@app.get("/api/models")
async def list_models() -> dict:
    payload = {"ollama": [], "cliproxy": []}

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            data = await fetch_json(client, f"{GPU_SERVER_URL}/api/tags")
            payload["ollama"] = [item.get("name", "") for item in data.get("models", [])]
        except Exception as exc:
            payload["ollama_error"] = str(exc)

        try:
            headers = {"Authorization": f"Bearer {CLIPROXY_API_KEY}"}
            data = await fetch_json(client, f"{CLIPROXY_URL}/v1/models", headers=headers)
            payload["cliproxy"] = [item.get("id", "") for item in data.get("data", [])]
        except Exception as exc:
            payload["cliproxy_error"] = str(exc)

    return payload


@app.post("/api/chat", response_model=ChatResponse)
async def chat(body: ChatRequest) -> ChatResponse:
    async with httpx.AsyncClient(timeout=120.0) as client:
        if body.source == "ollama":
            response = await client.post(
                f"{GPU_SERVER_URL}/api/chat",
                json={
                    "model": body.model,
                    "messages": [{"role": "user", "content": body.message}],
                    "stream": False,
                },
            )
            if response.status_code >= 400:
                raise HTTPException(status_code=response.status_code, detail=response.text)
            data = response.json()
            reply = data.get("message", {}).get("content", "")
        else:
            response = await client.post(
                f"{CLIPROXY_URL}/v1/chat/completions",
                headers={"Authorization": f"Bearer {CLIPROXY_API_KEY}"},
                json={
                    "model": body.model,
                    "messages": [{"role": "user", "content": body.message}],
                    "stream": False,
                },
            )
            if response.status_code >= 400:
                raise HTTPException(status_code=response.status_code, detail=response.text)
            data = response.json()
            reply = data.get("choices", [{}])[0].get("message", {}).get("content", "")

    return ChatResponse(model=body.model, source=body.source, reply=reply or "(empty response)")
