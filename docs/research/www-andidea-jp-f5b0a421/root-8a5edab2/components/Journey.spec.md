# Journey controller specification
Target: src/components/sites/www-andidea-jp-f5b0a421/root-8a5edab2/Journey.tsx
Interaction: native scroll-driven progress, explicit chapter-jump controls, time-driven autoplay/loop film, pause/resume control. No Lenis or click-only scene replacement.
DOM: section.journey > div.journey-stage > div.journey-film(img,video), .journey-vignette, six article.journey-scene, film-playback-control, nav.journey-markers, .journey-bottom, .journey-progress>span.
Screenshots and all computed styles: original-{1440,768,390}-scene-{1..6}.png and corresponding state JSON.
Desktop1440x900 .journey height9900, .journey-stage sticky top0 height900. Source CSS controls all responsive values (1100svh total desktop).
Source scene intervals: [0,.11],[.16,.29],[.35,.47],[.53,.64],[.7,.83],[.89,1]. Progress clamp(-root.top/(root.offsetHeight-stage.clientHeight)).
Enter clamp((progress-start)/.032) except scene0=1; exit clamp((end-progress)/.026) except scene5=1; visibility min(enter,exit)>.001. ASCII dissolve progress clamp((progress-(end-.055))/.055), except scene5=0. Opacity=min(enter,1-clamp(dissolve*4)); active scene opacity>.05 else -1. Hidden scenes inert and aria-hidden, including transition gaps.
Word arrival easeOutCubic((progress-start-wordIndex*.0028)/.035); each scene distinctive blur, translate, rotateX/scale as captured in source-scroll-story.js.txt. Intro source CSS arrival delay110ms per word. Supporting elements arrival easeOutCubic((progress-start-.011-index*.003)/.035), translateY(24*(1-arrival)); create also translateX30*(1-arrival).
Jump goes instantly to start+.057 times scroll distance (scene0=0). Reduced motion shows all scenes in normal document flow and jump scrollIntoView center instant.
Footer hides .journey-bottom during scene5. Progress bar transform scaleX(progress). Markers aria-label numbered Japanese scene names, aria-current=step; active marker small01..06.
Video: local background.mp4, poster background.jpg, preload auto, autoplay loop muted playsInline disablePictureInPicture. Pause label 背景動画を一時停止 with 一時停止; play label 背景動画を再生 with 再生. Honor manual pause, document visibility, intersection and reduced motion. If video fails keep poster and show exact Japanese source error.
Cleanup all listeners, RAFs and observers. Effects handled by film-effects.ts. No generated image substitute.
Validate production build, chapters and scroll at1440/768/390, pause/resume, no browser runtime errors and source comparison.
