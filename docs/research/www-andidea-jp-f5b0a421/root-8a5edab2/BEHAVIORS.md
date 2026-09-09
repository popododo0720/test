# Observed and reproduced behavior

- Original and clone inspected at 1440×900, 768×1024, 390×844 through Playwright MCP.
- Native scroll controls six scenes; intervals [0,.11], [.16,.29], [.35,.47], [.53,.64], [.7,.83], [.89,1]. Gaps intentionally show the film and dissolving text.
- Source page uses requestAnimationFrame and ResizeObserver, not Lenis or tab replacement.
- Intro word arrival; manifesto scale/blur; create horizontal slide; discover scale/rotate; services perspective flip; outro fade/scale; last .055 of each interval dissolves words into ASCII except final scene.
- Clicked source SCROLL TO BEGIN, final marker, BACK TO TOP; each moved to the matching scroll position. Clone all six markers verified at three widths (18 chapter checks).
- Hovered source contact; cyan hover/cursor treatment and source transition rules retained. Fine-pointer film tilt is implemented with source variables/easing; disabled for coarse/reduced-motion input.
- Source video loops independently from scroll, pause/play persists until explicitly resumed; hidden document and reduced motion pause playback.
- Source dynamic heading ink uses an 80-frame luminance map, copied exactly as data. Film video itself remains a local playable MP4, not a screenshot.
- Source/clone mobile menu opened, captured and closed via Escape. Clone uses native modal dialog for focus containment/return and background scroll locking.
- Links to nonrequested source routes resolve to https://www.andidea.jp. Contact retains mailto:info@andidea.jp; no emails are sent during QA.
- Accessibility reduced-motion flow, pointer effect, timed pulse, particle dissolve and failed-video fallback have additional browser checks recorded separately.
