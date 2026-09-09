const gpuStatus = document.getElementById("gpu-status");
const cliproxyStatus = document.getElementById("cliproxy-status");
const sourceSelect = document.getElementById("source");
const modelInput = document.getElementById("model");
const messageInput = document.getElementById("message");
const replyBox = document.getElementById("reply");
const sendButton = document.getElementById("send");
const refreshButton = document.getElementById("refresh-models");

function setStatus(el, ok, detail) {
  el.textContent = ok ? "연결됨" : `오프라인: ${detail}`;
  el.className = `status ${ok ? "ok" : "bad"}`;
}

async function loadHealth() {
  const res = await fetch("/api/health");
  const data = await res.json();
  setStatus(gpuStatus, data.gpu_server.ok, data.gpu_server.error || "");
  setStatus(cliproxyStatus, data.cliproxy.ok, data.cliproxy.error || "");
}

async function loadModels() {
  const res = await fetch("/api/models");
  const data = await res.json();
  const source = sourceSelect.value;
  const models = source === "ollama" ? data.ollama : data.cliproxy;

  if (models.length > 0) {
    modelInput.value = models[0];
  }
}

async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) {
    replyBox.textContent = "메시지를 입력하세요.";
    return;
  }

  sendButton.disabled = true;
  replyBox.textContent = "요청 중...";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        model: modelInput.value.trim(),
        source: sourceSelect.value,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || "요청 실패");
    }

    replyBox.textContent = data.reply;
  } catch (error) {
    replyBox.textContent = `에러: ${error.message}`;
  } finally {
    sendButton.disabled = false;
  }
}

sourceSelect.addEventListener("change", loadModels);
refreshButton.addEventListener("click", loadModels);
sendButton.addEventListener("click", sendMessage);

loadHealth();
loadModels();
