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
The project MCP uses the installed Google Chrome in headless mode, so no desktop Chrome extension is required. The headless Playwright MCP connection was verified during the And Idea clone. Agent authentication is managed by your existing coding-tool session.

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

Git remote `origin`: `git@github.com:popododo0720/test.git`. The `main` branch contains the original repository history and the website clone. Push changes to this repository, not the upstream template.

## Current preview

http://192.168.0.40:3100 (bond0) serves the reconstructed https://www.andidea.jp/ homepage. Six scroll-driven scenes, original video/assets, desktop and mobile navigation. Links to Works/About/Training/Shop open the source site; those pages were not requested. QA evidence is in docs/research/www-andidea-jp-f5b0a421/root-8a5edab2/.
