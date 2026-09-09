"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { IntroScene, ManifestoScene, CreateScene, DiscoverScene, ServicesScene, OutroScene } from "./Scenes";
import { assetRoot, scenes } from "./story-data";
import { createDissolve, useFilmEffects } from "./film-effects";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const easeOut = (value: number) => 1 - (1 - clamp(value)) ** 3;

export function Journey() {
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sceneRefs = useRef<(HTMLElement | null)[]>([]);
  const progressRef = useRef<HTMLSpanElement>(null);
  const updateRef = useRef<(() => void) | null>(null);
  const toggleRef = useRef<(() => void) | null>(null);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(true);
  const [filmError, setFilmError] = useState(false);
  useFilmEffects(rootRef, videoRef);

  useEffect(() => {
    const root = rootRef.current;
    const stage = root?.querySelector<HTMLElement>(".journey-stage");
    if (!root || !stage) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const words = sceneRefs.current.map(scene => Array.from(scene?.querySelectorAll<HTMLElement>(".journey-word") ?? []));
    const supporting = sceneRefs.current.map(scene => Array.from(scene?.querySelectorAll<HTMLElement>(".journey-heading > .journey-label,.journey-heading > .journey-pill,.journey-tagline,.journey-corner-copy,.journey-intro-aside,.journey-service-links > a,.journey-footer") ?? []));
    words[0].forEach((word, i) => word.style.setProperty("--arrival-delay", `${i * 110}ms`));
    const dissolve = createDissolve(stage);
    let frame = 0;
    let lastActive = 0;
    function render() {
      frame = 0;
      if (!root || !stage) return;
      setReady(true);
      setReduced(media.matches);
      if (media.matches) {
        dissolve.render([], "", 0);
        return;
      }
      const progress = clamp(-root.getBoundingClientRect().top / Math.max(1, root.offsetHeight - stage.clientHeight));
      let current = -1;
      let dissolving = false;
      scenes.forEach((scene, index) => {
        const element = sceneRefs.current[index];
        if (!element) return;
        const delta = progress - scene.start;
        const enter = index === 0 ? 1 : clamp(delta / .032);
        const exit = index === 5 ? 1 : clamp((scene.end - progress) / .026);
        const visibility = Math.min(enter, exit);
        const departure = index === 5 ? 0 : clamp((progress - (scene.end - .055)) / .055);
        const opacity = Math.min(enter, 1 - clamp(departure * 4));
        element.style.opacity = String(opacity);
        element.style.visibility = visibility > .001 ? "visible" : "hidden";
        element.style.transform = "none";
        if (opacity > .05) current = index;
        if (visibility <= .001) return;
        words[index].forEach((word, wordIndex) => {
          const arrival = index === 0 ? 1 : easeOut((delta - wordIndex * .0028) / .035);
          const remaining = 1 - arrival;
          const direction = wordIndex % 2 === 0 ? 1 : -1;
          let transform = "translate3d(0,0%,0)";
          let blur = 0;
          switch (index) {
            case 1: transform = `translate3d(0,${remaining * 24}px,0) scale(${1 + remaining * .14})`; blur = remaining * 9; break;
            case 2: transform = `translate3d(${direction * remaining * 110}%,0,0)`; break;
            case 3: transform = `scale(${.76 + arrival * .24}) rotate(${direction * remaining * 5}deg)`; blur = remaining * 5; break;
            case 4: transform = `perspective(700px) translate3d(0,${remaining * 110}%,0) rotateX(${remaining * -65}deg)`; break;
            case 5: transform = `translate3d(${direction * remaining * 24}px,${remaining * 32}px,0) scale(${1 + remaining * .08})`; blur = remaining * 7; break;
          }
          word.style.transform = transform;
          word.style.filter = blur > .01 ? `blur(${blur}px)` : "none";
          word.style.opacity = String(arrival);
        });
        supporting[index].forEach((element, itemIndex) => {
          const arrival = index === 0 ? 1 : easeOut((delta - .011 - itemIndex * .003) / .035);
          element.style.opacity = String(arrival);
          element.style.transform = `translate3d(${index === 2 ? (1 - arrival) * 30 : 0}px,${(1 - arrival) * 24}px,0)`;
        });
        if (departure > 0 && departure < 1) {
          dissolve.render([element], String(index), departure);
          dissolving = true;
        }
      });
      if (!dissolving) dissolve.render([], "", 0);
      if (current !== lastActive) { lastActive = current; setActive(current); }
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
    const resize = () => { dissolve.invalidate(); schedule(); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize);
    media.addEventListener("change", schedule);
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    observer.observe(stage);
    updateRef.current = schedule;
    schedule();
    return () => {
      updateRef.current = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      dissolve.dispose();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
      media.removeEventListener("change", schedule);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const root = rootRef.current;
    if (!video || !root) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let userPaused = media.matches;
    let visible = true;
    const update = () => {
      if (userPaused || document.hidden || !visible) video.pause();
      else void video.play().catch(() => setPaused(true));
    };
    const preference = () => { userPaused = media.matches; update(); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    observer.observe(root);
    toggleRef.current = () => { userPaused = !video.paused; update(); };
    video.addEventListener("loadeddata", update);
    document.addEventListener("visibilitychange", update);
    media.addEventListener("change", preference);
    update();
    return () => {
      observer.disconnect();
      toggleRef.current = null;
      video.removeEventListener("loadeddata", update);
      document.removeEventListener("visibilitychange", update);
      media.removeEventListener("change", preference);
      video.pause();
    };
  }, []);

  function jump(index: number) {
    const root = rootRef.current;
    const stage = root?.querySelector<HTMLElement>(".journey-stage");
    if (!root || !stage) return;
    if (reduced) { sceneRefs.current[index]?.scrollIntoView({ behavior: "instant", block: "center" }); return; }
    window.scrollTo({ top: window.scrollY + root.getBoundingClientRect().top + (index === 0 ? 0 : scenes[index].start + .057) * (root.offsetHeight - stage.clientHeight), behavior: "instant" });
    updateRef.current?.();
  }
  const content = [<IntroScene key="intro" jump={jump} />, <ManifestoScene key="manifesto" />, <CreateScene key="create" />, <DiscoverScene key="discover" />, <ServicesScene key="services" />, <OutroScene key="outro" jump={jump} />];
  return <section ref={rootRef} className={`journey${ready ? " journey-ready" : ""}${reduced ? " journey-reduced" : ""}`} aria-label="And Ideaの世界をめぐる">
    <div className="journey-stage">
      <div className="journey-film" aria-hidden="true">
        {/* Original video/poster layers rely on natural cover dimensions. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${assetRoot}/background.jpg`} alt="" fetchPriority="high" />
        <video ref={videoRef} src={`${assetRoot}/background.mp4`} poster={`${assetRoot}/background.jpg`} preload="auto" autoPlay loop muted playsInline disablePictureInPicture hidden={filmError} onError={() => setFilmError(true)} onPlay={() => setPaused(false)} onPause={() => setPaused(true)} />
      </div>
      <div className="journey-vignette" aria-hidden="true" />
      {scenes.map((scene, index) => <article key={scene.style} ref={element => { sceneRefs.current[index] = element; }} className={`journey-scene journey-${scene.style}`} aria-hidden={ready && !reduced && active !== index} inert={ready && !reduced && active !== index}>{content[index]}</article>)}
      {!filmError && <button type="button" className="film-playback-control" onClick={() => toggleRef.current?.()} aria-label={paused ? "背景動画を再生" : "背景動画を一時停止"}>{paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}<span>{paused ? "再生" : "一時停止"}</span></button>}
      <nav className="journey-markers" aria-label="ストーリーの場面へ移動">{scenes.map((scene, index) => <button key={scene.style} onClick={() => jump(index)} aria-label={`${index + 1}. ${scene.name}`} aria-current={active === index ? "step" : undefined}><span />{active === index && <small>0{index + 1}</small>}</button>)}</nav>
      <div className={`journey-bottom${active === 5 ? " journey-bottom-hidden" : ""}`} aria-hidden="true"><span>AND IDEA — A JOURNEY THROUGH IMAGINATION</span><span>{active < 0 ? "EXPLORE" : `0${active + 1} / 06`}</span></div>
      <div className="journey-progress" aria-hidden="true"><span ref={progressRef} /></div>
      {filmError && <p className="journey-error" role="status">映像を読み込めませんでした。スクロールして各ページをご覧いただけます。</p>}
    </div>
    <noscript><p className="journey-noscript">JavaScriptを有効にすると、スクロールに合わせた映像とアニメーションをご覧いただけます。</p></noscript>
  </section>;
}
