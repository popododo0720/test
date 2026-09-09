"use client";

import { useEffect, type RefObject } from "react";
import luminance from "./film-luminance.json";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function createCanvas(className: string, parent: HTMLElement) {
  const canvas = document.createElement("canvas");
  canvas.className = className;
  canvas.setAttribute("aria-hidden", "true");
  canvas.hidden = true;
  parent.appendChild(canvas);
  return canvas;
}

function watchInk(root: HTMLElement, video: HTMLVideoElement) {
  const poster = video.parentElement?.querySelector("img");
  const motion = matchMedia(reducedMotionQuery);
  let timer = 0;
  let disposed = false;
  function update() {
    timer = 0;
    if (disposed || document.hidden) return;
    const source = motion.matches && poster ? poster : video;
    if (source === video && video.readyState < 2) return;
    const rect = source.getBoundingClientRect();
    if (!rect.width || !rect.height || rect.bottom < 0 || rect.top > innerHeight) return;
    const width = source instanceof HTMLImageElement ? source.naturalWidth : video.videoWidth;
    const height = source instanceof HTMLImageElement ? source.naturalHeight : video.videoHeight;
    if (!width || !height) return;
    // Original page's precomputed brightness map keeps text contrast identical
    // to the source film, without a per-frame canvas readback.
    const filmTime = motion.matches ? 0 : video.currentTime;
    const brightnessFrame = luminance.frames[Math.min(luminance.frames.length - 1, Math.max(0, Math.floor(filmTime * luminance.fps)))];
    const scale = Math.max(rect.width / width, rect.height / height);
    const position = getComputedStyle(source).objectPosition.split(" ").map(parseFloat);
    const cropX = (width * scale - rect.width) * (Number.isFinite(position[0]) ? position[0] / 100 : 0.5) / scale;
    const cropY = (height * scale - rect.height) * (Number.isFinite(position[1]) ? position[1] / 100 : 0.5) / scale;
    for (const heading of root.querySelectorAll<HTMLElement>(".journey-heading h1,.journey-heading h2")) {
      if (heading.closest('[aria-hidden="true"]')) continue;
      const box = heading.getBoundingClientRect();
      if (!box.width || !box.height) continue;
      let brightness = 0;
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 9; col++) {
          const x = cropX + (box.left - rect.left + box.width * (col + 0.5) / 9) / scale;
          const y = cropY + (box.top - rect.top + box.height * (row + 0.5) / 5) / scale;
          const index = (Math.min(26, Math.max(0, Math.floor(y / height * 27))) * 48 + Math.min(47, Math.max(0, Math.floor(x / width * 48))));
          brightness += brightnessFrame[index] / 255;
        }
      }
      heading.dataset.filmInk = brightness / 45 > (heading.dataset.filmInk === "dark" ? 0.16 : 0.22) ? "dark" : "light";
    }
  }
  function schedule() { if (!timer && !disposed) timer = window.setTimeout(update, 80); }
  const events = ["loadeddata", "seeked", "timeupdate"];
  events.forEach(event => video.addEventListener(event, schedule));
  poster?.addEventListener("load", schedule);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  document.addEventListener("visibilitychange", schedule);
  motion.addEventListener("change", schedule);
  schedule();
  return () => {
    disposed = true;
    clearTimeout(timer);
    events.forEach(event => video.removeEventListener(event, schedule));
    poster?.removeEventListener("load", schedule);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    document.removeEventListener("visibilitychange", schedule);
    motion.removeEventListener("change", schedule);
  };
}

function watchPulse(film: HTMLElement, video: HTMLVideoElement) {
  const canvas = createCanvas("film-ascii-pulse", film);
  const context = canvas.getContext("2d");
  const sample = document.createElement("canvas");
  const sampler = sample.getContext("2d", { willReadFrequently: true });
  if (!context || !sampler) { canvas.remove(); return () => {}; }
  const motion = matchMedia(reducedMotionQuery);
  let inView = false;
  let disposed = false;
  let timer = 0;
  let frame = 0;
  let started = 0;
  let lastFrame = 0;
  const active = () => !disposed && inView && !document.hidden && !motion.matches && !video.paused && !video.seeking && video.readyState >= 2;
  function stop() {
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    timer = frame = 0;
    canvas.hidden = true;
    canvas.style.opacity = "0";
  }
  function schedule(delay = 3000) {
    clearTimeout(timer);
    if (active()) timer = window.setTimeout(() => {
      timer = 0;
      if (!active()) return;
      started = performance.now();
      lastFrame = 0;
      canvas.hidden = false;
      frame = requestAnimationFrame(draw);
    }, delay);
  }
  function draw(now: number) {
    frame = 0;
    if (!active() || !context || !sampler) { stop(); return; }
    const elapsed = now - started;
    if (elapsed >= 580) { stop(); schedule(Math.max(0, 3000 - elapsed)); return; }
    if (now - lastFrame < 45) { frame = requestAnimationFrame(draw); return; }
    lastFrame = now;
    const width = Math.min(1200, film.clientWidth);
    const height = Math.round(width * film.clientHeight / Math.max(1, film.clientWidth));
    if (!width || !height) { stop(); return; }
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    const columns = Math.min(108, Math.max(32, Math.floor(width / 10)));
    const rows = Math.max(1, Math.round(columns * height / width * 0.68));
    if (sample.width !== columns || sample.height !== rows) { sample.width = columns; sample.height = rows; }
    const scale = Math.max(width / video.videoWidth, height / video.videoHeight);
    const cropWidth = width / scale;
    const cropHeight = height / scale;
    let pixels: Uint8ClampedArray;
    try {
      sampler.drawImage(video, (video.videoWidth - cropWidth) / 2, (video.videoHeight - cropHeight) / 2, cropWidth, cropHeight, 0, 0, columns, rows);
      pixels = sampler.getImageData(0, 0, columns, rows).data;
    } catch { stop(); return; }
    const progress = elapsed / 580;
    const envelope = Math.sin(Math.PI * progress);
    canvas.style.opacity = String(Math.min(1, envelope * 1.6));
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#041721e8";
    context.fillRect(0, 0, width, height);
    const gradient = context.createLinearGradient(-width * 0.2 + progress * width * 0.5, 0, width, height);
    const stops: [number, string][] = [[0, "#20ccff"], [0.28, "#a9f9ff"], [0.46, "#f5ffff"], [0.62, "#8aabff"], [0.78, "#e1a7f3"], [1, "#28e7ec"]];
    stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
    context.fillStyle = gradient;
    context.font = `bold ${Math.ceil(height / rows)}px monospace`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const index = (row * columns + col) * 4;
        const brightness = (pixels[index] * 0.2126 + pixels[index + 1] * 0.7152 + pixels[index + 2] * 0.0722) / 255;
        if (brightness < 0.035) continue;
        const offset = Math.sin(row * 0.71 + progress * 15) * envelope * 14;
        context.globalAlpha = 0.3 + brightness * 0.7;
        context.fillText(" .:+*X#@"[Math.min(7, Math.floor(brightness * 7 + progress * 2) % 8)], (col + 0.5) * width / columns + offset, (row + 0.5) * height / rows);
      }
    }
    context.globalAlpha = 1;
    frame = requestAnimationFrame(draw);
  }
  function reset() { stop(); schedule(); }
  const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; reset(); });
  observer.observe(film);
  const events = ["playing", "pause", "seeking", "seeked"];
  events.forEach(event => video.addEventListener(event, reset));
  document.addEventListener("visibilitychange", reset);
  motion.addEventListener("change", reset);
  return () => {
    disposed = true;
    stop();
    observer.disconnect();
    events.forEach(event => video.removeEventListener(event, reset));
    document.removeEventListener("visibilitychange", reset);
    motion.removeEventListener("change", reset);
    canvas.remove();
  };
}

function watchPointer(root: HTMLElement, stage: HTMLElement, film: HTMLElement) {
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const motion = matchMedia(reducedMotionQuery);
  let x = 0, y = 0, targetX = 0, targetY = 0, frame = 0;
  let inView = true;
  const properties = ["--holo-rx", "--holo-ry", "--holo-x", "--holo-y", "--holo-dx", "--holo-dy", "--float-x", "--float-y", "--shadow-x"];
  function draw() {
    frame = 0;
    x += (targetX - x) * 0.09;
    y += (targetY - y) * 0.09;
    const values = [`${-y * 2.6}deg`, `${x * 3.2}deg`, `${50 + x * 34}%`, `${50 + y * 34}%`, `${-x * 10}px`, `${-y * 8}px`, `${x * 25}px`, `${y * 19}px`, `${-x * 14}px`];
    properties.forEach((property, index) => stage.style.setProperty(property, values[index]));
    if (Math.abs(targetX - x) + Math.abs(targetY - y) > 0.002) frame = requestAnimationFrame(draw);
  }
  function reset() {
    targetX = targetY = 0;
    film.removeAttribute("data-holo-active");
    if (motion.matches || document.hidden || !fine.matches) x = y = 0;
    if (!frame) frame = requestAnimationFrame(draw);
  }
  function move(event: PointerEvent) {
    if (!fine.matches || motion.matches || !inView || event.pointerType === "touch") return;
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    targetX = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
    targetY = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
    film.dataset.holoActive = "true";
    if (!frame) frame = requestAnimationFrame(draw);
  }
  function visibility() { if (document.hidden) reset(); }
  const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; if (!inView) reset(); });
  observer.observe(root);
  stage.addEventListener("pointermove", move, { passive: true });
  stage.addEventListener("pointerleave", reset);
  fine.addEventListener("change", reset);
  motion.addEventListener("change", reset);
  document.addEventListener("visibilitychange", visibility);
  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    stage.removeEventListener("pointermove", move);
    stage.removeEventListener("pointerleave", reset);
    fine.removeEventListener("change", reset);
    motion.removeEventListener("change", reset);
    document.removeEventListener("visibilitychange", visibility);
    film.removeAttribute("data-holo-active");
    properties.forEach(property => stage.style.removeProperty(property));
  };
}

export function useFilmEffects(rootRef: RefObject<HTMLElement | null>, videoRef: RefObject<HTMLVideoElement | null>): void {
  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    const stage = root?.querySelector<HTMLElement>(".journey-stage");
    const film = root?.querySelector<HTMLElement>(".journey-film");
    if (!root || !video || !stage || !film) return;
    const cleanups = [watchInk(root, video), watchPulse(film, video), watchPointer(root, stage, film)];
    return () => cleanups.forEach(cleanup => cleanup());
  }, [rootRef, videoRef]);
}

interface Particle { x: number; y: number; seed: number; strength: number }

export function createDissolve(stage: HTMLElement) {
  const canvas = createCanvas("ascii-dissolve", stage);
  const context = canvas.getContext("2d");
  let cacheKey = "";
  let width = 0;
  let scale = 1;
  let particles: Particle[] = [];
  let disposed = false;
  function invalidate() { cacheKey = ""; }
  function rasterize(elements: HTMLElement[], key: string) {
    const stageRect = stage.getBoundingClientRect();
    const nextKey = `${key}:${Math.round(stageRect.width)}:${Math.round(stageRect.height)}`;
    if (nextKey === cacheKey) return;
    cacheKey = nextKey;
    width = stageRect.width;
    const height = stageRect.height;
    particles = [];
    if (!width || !height) return;
    scale = Math.min(1, 1200 / width, 900 / height);
    canvas.width = Math.ceil(width * scale);
    canvas.height = Math.ceil(height * scale);
    const raster = document.createElement("canvas");
    raster.width = canvas.width;
    raster.height = canvas.height;
    const painter = raster.getContext("2d", { willReadFrequently: true });
    if (!painter) return;
    painter.scale(scale, scale);
    painter.fillStyle = painter.strokeStyle = "#fff";
    painter.lineWidth = 2;
    const visited = new Set<Element>();
    for (const element of elements) {
      for (const node of [element, ...element.querySelectorAll("*")]) {
        if (visited.has(node)) continue;
        visited.add(node);
        const style = getComputedStyle(node);
        const box = node.getBoundingClientRect();
        if (style.display === "none" || !box.width || !box.height || node instanceof SVGElement) continue;
        if (style.backgroundColor !== "transparent" && !/rgba\([^)]*,\s*0\s*\)/.test(style.backgroundColor)) {
          painter.globalAlpha = 0.55;
          painter.strokeRect(box.left - stageRect.left, box.top - stageRect.top, box.width, box.height);
          painter.globalAlpha = 0.09;
          painter.fillRect(box.left - stageRect.left, box.top - stageRect.top, box.width, box.height);
          painter.globalAlpha = 1;
        }
        painter.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        painter.textBaseline = "middle";
        for (const text of node.childNodes) {
          if (text.nodeType !== Node.TEXT_NODE || !text.textContent?.trim()) continue;
          const range = document.createRange();
          let offset = 0;
          for (const glyph of text.textContent) {
            range.setStart(text, offset);
            offset += glyph.length;
            range.setEnd(text, offset);
            if (!glyph.trim()) continue;
            const rect = range.getBoundingClientRect();
            if (rect.bottom >= stageRect.top && rect.top <= stageRect.bottom) painter.fillText(glyph, rect.left - stageRect.left, rect.top - stageRect.top + rect.height / 2);
          }
        }
      }
    }
    const pixels = painter.getImageData(0, 0, raster.width, raster.height).data;
    const grid = width <= 700 ? 6 : 7;
    for (let y = 3; y < raster.height - 2; y += grid + 2) {
      for (let x = 3; x < raster.width - 2; x += grid) {
        let strength = 0;
        for (let dy = -2; dy <= 2; dy += 2) {
          for (let dx = -2; dx <= 2; dx += 2) strength = Math.max(strength, pixels[((y + dy) * raster.width + x + dx) * 4 + 3] / 255);
        }
        if (strength < 0.02) continue;
        const random = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        particles.push({ x: x / scale, y: y / scale, seed: random - Math.floor(random), strength });
      }
    }
  }
  window.addEventListener("resize", invalidate);
  return {
    render(elements: HTMLElement[], key: string, progress: number): void {
      if (!context || disposed) return;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (progress <= 0 || progress >= 1) { canvas.hidden = true; return; }
      rasterize(elements, key);
      canvas.hidden = false;
      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.font = `bold ${width <= 700 ? 12 : 15}px monospace`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      for (const particle of particles) {
        const phase = clamp((progress - (particle.x / width * 0.18 + particle.seed * 0.14)) / 0.68);
        const alpha = Math.sin(Math.PI * phase) ** 0.55 * clamp(progress * 16);
        if (alpha < 0.01) continue;
        const dx = (particle.seed - 0.45) * 300 * phase * phase;
        const opacity = alpha * Math.max(0.4, particle.strength);
        const x = particle.x + dx;
        const y = particle.y - 150 * phase * phase + Math.sin(particle.x * 0.025 + phase * 10) * phase * 28;
        const glyph = "@#X+=:."[Math.min(6, Math.floor(phase * 6 + particle.seed * 2))];
        context.globalAlpha = opacity;
        context.fillStyle = particle.seed > 0.65 ? "#efffff" : "#17d9ff";
        context.fillText(glyph, x, y);
        if (particle.seed > 0.48) {
          context.globalAlpha = opacity * 0.38;
          context.fillStyle = "#00baff";
          context.fillText(glyph, x - dx * 0.17, y + 10 + phase * 18);
          context.globalAlpha = opacity * 0.16;
          context.fillText(".", x - dx * 0.32, y + 24 + phase * 30);
        }
        if (particle.seed > 0.94 && phase > 0.15 && phase < 0.7) {
          context.globalAlpha = opacity * 0.7;
          context.fillStyle = "#b5faff";
          context.fillRect(x - 15, y, 30 + phase * 40, 1);
        }
      }
      context.globalAlpha = 1;
      context.setTransform(1, 0, 0, 1, 0, 0);
    },
    invalidate,
    dispose(): void {
      disposed = true;
      window.removeEventListener("resize", invalidate);
      canvas.remove();
      particles = [];
    },
  };
}
