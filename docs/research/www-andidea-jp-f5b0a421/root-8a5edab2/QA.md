# And Idea clone verification

## Result
https://www.andidea.jp/ → http://192.168.0.40:3100/ (bond0), served by ai-website-cloner.service.
Only the untouched root starter was replaced. No existing user pages were removed.
Six scenes; eleven React components including three internal helpers; nine implementation specifications; six downloaded original assets plus the source luminance metadata.

## Checks completed
- npm run check: ESLint, TypeScript, Next.js production build passed after the final code change.
- HTTP 200 from bond address, systemd service active and enabled.
- Playwright MCP: 1440,768,390 widths, all 18 chapter jumps matched their target state. No horizontal overflow at any width.
- Back to top, scroll cue, pause/resume, mobile drawer/Escape/focus return: passed.
- Additional independent Playwright session: pointer hologram, timed ASCII pulse, scroll dissolve, all six reduced-motion scenes visible, reduced-motion video pause, modal focus containment, failed-network video poster fallback: passed.
- Browser runtime errors: none observed.
- The failed-media check found an error-before-hydration race; the final code detects existing video.error on initialization. The exact network-abort test passed after the fix.

## Visual comparison
Original desktop/tablet/mobile and each of six scene states captured; local desktop/mobile per-scene screenshots retained. Source and clone reuse the same video, responsive CSS and typography geometry.
Matched first-frame comparisons pause both videos at t=2 seconds. Desktop first-screen mean absolute RGB-channel difference: 0.7445/255; mobile: 1.9615/255. These values apply only to those controlled first-screen captures, not the entire animated site. Remaining differences include cursor/hover and transition timing, font rasterization and native mobile-dialog focus decoration.
The initial button typography mismatch was corrected. Heading ink now uses the source's exact 80-frame luminance map.
See final-1440.png, reference-settled-1440.png, final-390.png, reference-390.png and the per-scene captures in the corresponding design-references folder.

## Scope and limitations
- Works, About, Training, Shop and collaboration links navigate to the original website; those subpages were not requested or copied.
- Contact is the original mailto link; no backend or email delivery was built.
- Motion is responsive to scroll, video time and pointer; separate sessions will not show the same animation frame unless deliberately synchronized.
- A native HTML dialog provides mobile menu focus handling; its focus/close decoration can differ slightly from the original component library.
- JavaScript is needed for the interactive journey; reduced-motion users receive the static six-scene layout.
- Repository is local with no remote configured; focused commits made, push skipped.
