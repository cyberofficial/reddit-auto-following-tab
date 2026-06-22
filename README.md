# Reddit Auto Following Tab

A lightweight Chrome extension that automatically keeps you on Reddit's "Following" feed instead of the algorithmic "For You" feed.

## Features

- **Auto-selects "Following" tab** on every visit to `reddit.com`
- **Intercepts Reddit logo clicks** on homepage to stay on Following feed
- **Persists across navigation** - works after profile visits, back/forward, SPA navigation
- **Zero data collection** - no tracking, no analytics, no external requests
- **Tiny footprint** - ~1KB content script, no background processes

## Installation

### From Chrome Web Store
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/happkpbdlpdfpfnpnjjniamppbenbnde?label=Chrome%20Web%20Store)](https://chromewebstore.google.com/detail/reddit-auto-following-tab/happkpbdlpdfpfnpnjjniamppbenbnde?authuser=0&hl=en)

### Developer Mode (for testing)

1. Clone this repo:
   ```bash
   git clone https://github.com/cyberofficial/reddit-auto-following-tab
   ```
2. Open `chrome://extensions/`
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** → Select the cloned folder

## How It Works

The extension uses a Manifest V3 content script that:
- Runs at `document_idle` on `reddit.com` pages
- Uses a `MutationObserver` to detect DOM changes (SPA navigation, full page loads)
- On homepage (`/` path): finds the tab group, clicks the 2nd tab button ("Following")
- Adds a capture-phase click listener to the Reddit logo (`#reddit-logo`) that prevents default navigation and selects "Following" instead
- Only activates on the main homepage - subreddit navigation works normally

## Permissions

| Permission | Purpose |
|------------|---------|
| `scripting` | Inject content script on reddit.com |
| `*://*.reddit.com/*` | Host permission for content script execution |

## Privacy

This extension collects **no user data**. See [PRIVACY.md](PRIVACY.md) for details.

## Files

```
├── manifest.json    # Manifest V3 configuration
├── content.js       # Content script (core logic)
└── PRIVACY.md       # Privacy policy
```

## License

GNU Affero General Public License v3.0 (AGPL-3.0) - see [LICENSE](LICENSE) for details.