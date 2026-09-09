# Server setup

Project: `/root/ai-website-cloner`
Source template: https://github.com/JCodesMore/ai-website-cloner-template
Runtime: Node.js 24.13.1. Install dependencies with `npm ci`.

The production preview runs on port 3100 through `ai-website-cloner.service`.

```bash
systemctl status ai-website-cloner
journalctl -u ai-website-cloner -n 50
```

Start Claude Code in this directory with `claude`, approve the project's Playwright MCP when prompted, then enter `/clone-website <target-url>`.
The project MCP uses the existing headless Chromium installation, so no desktop Chrome extension is required. Browser MCP invocation and AI authentication must be verified in that agent session.

After generating or editing a site:

```bash
npm run check
systemctl restart ai-website-cloner
```

To install the service again:

```bash
cp deploy/ai-website-cloner.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now ai-website-cloner
```

This is an independent local Git repository. No remote is configured; add your own repository as origin before pushing. Do not push generated sites to the upstream template.
