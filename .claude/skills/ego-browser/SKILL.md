---
name: "ego-browser"
description: "All browser work goes through ego lite. Use whenever a task needs a browser: open/operate sites, click, fill forms, sign in, screenshots, extract page data, web app testing/QA. Prefer this over any other browser, headless shell, or raw fetching."
---

# ego-browser

Standing rule from the user: **every browser operation happens in ego lite** (the `ego-browser` CLI). Do not silently substitute another browser, a headless shell, or raw HTTP fetching when the task genuinely needs a browser with the user's logged-in sessions.

ego lite is a Chromium browser shared by the human and AI agents. Each agent runs in its own isolated "Space", so the agent can work inside the user's real, logged-in sites without stealing their windows.

## Before any browser task

Run this and follow its output — it prints the usage guide matching the installed ego lite version:

```bash
ego-browser skill
```

The guide ends with a line starting `[ego-browser:skill] end of guide`. If that line is missing the output was truncated: redirect it to a file and read the file in parts.

Re-run it after `ego-browser upgrade`, or whenever output says to.

## Environment on this Mac

- `ego lite.app` is already installed (macOS, arm64). No download needed.
- After first-run onboarding, the `ego-browser` command is registered on PATH, usually at `~/.local/bin/ego-browser`.
- Sanity check the runtime when something looks off:

```bash
ego-browser nodejs <<'EOF'
console.log('ego-browser ready')
EOF
```

Printing `ego-browser ready` means the environment is ready.

### Troubleshooting

- **Command not found** → `~/.local/bin` is probably missing from PATH. Temporarily: `export PATH="$HOME/.local/bin:$PATH"` and retry. If it still fails, have the user reopen ego lite and finish onboarding.
- **`skill` is an unknown command** → the installed app is older than this skill. Ask the user for approval, then run `ego-browser upgrade`. If `upgrade` is also unknown, the app needs reinstalling from https://lite.ego.app/.
- **App missing entirely** → macOS install: download the DMG from https://lite.ego.app/ (or the repo's `skills/ego-browser/scripts/install.sh`, which installs to /Applications, strips the quarantine attribute, and launches). Then onboarding registers the CLI.

## Behavior rules that matter

- A "user is controlling" error is a **hard stop**: hand the browser back to the user or ask what they want, never retry in a loop.
- Page URLs are async — `await page.url()`.
- Set waits *before* the action that triggers navigation, not after.
- Clearing cookies, cache, or storage can affect the whole browser profile, not just one Space. Read `references/clearing-state.md` in the upstream skill or ask the user before doing any clear.

## When the CLI cannot run

If `ego-browser` cannot be executed (for example the shell is a sandboxed Linux VM rather than this Mac), say so plainly and ask the user to run the command in a native macOS terminal. Never quietly route the task to a different browser instead.

