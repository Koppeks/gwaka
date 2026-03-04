# WakaTime for Google Apps Script

![Popup extension](images/popup.png)

> Track time inside Google Apps Script editor with WakaTime.

![Status](https://img.shields.io/badge/status-early%20WIP-orange)
![Platform](https://img.shields.io/badge/platform-Chrome-blue)
![WakaTime](https://img.shields.io/badge/powered%20by-WakaTime-1f8acb)

---

## What is this?

[**WakaTime for Google Apps Script**](https://wakatime-for-apps-script.vercel.app/) is a Chrome extension that automatically tracks the time you spend coding inside [Google Apps Script](https://script.google.com) and reports it directly to your [WakaTime](https://wakatime.com) dashboard — just like any other editor plugin would.

Once installed, it runs silently in the background. Every time you write or edit code in the Apps Script IDE, a heartbeat is sent to WakaTime and your time gets logged under:

- **Editor:** Google Apps Script
- **Language:** Google Apps Script
- **Project:** The name of your Apps Script project
- **Machine:** Your configured machine name (e.g. `Browser Google IDE`)

---

## Features

- ⏱ Automatic time tracking inside the Google Apps Script IDE
- 📁 Per-project tracking — each script shows up as its own project in WakaTime
- 🖥 Configurable machine name via the extension popup
- 🔑 Simple API key setup — no CLI or config files needed

---

## Installation

> 🚧 The extension is not yet published on the Chrome Web Store. Once available, installation will be:

1. Go to the Chrome Web Store listing *(link coming soon)*
2. Click **Add to Chrome**
3. Click the extension icon in your toolbar
4. Enter your [WakaTime API key](https://wakatime.com/settings/api-key)
5. Optionally set a custom machine name (defaults to `Browser Google IDE`)
6. Click **Save** — you're done!

Open [script.google.com](https://script.google.com) and start coding. Time will be tracked automatically (With a rate limit of 2 minutes)

### For now (local install)

1. Clone or download this repository
   ```bash
   git clone https://github.com/Koppeks/wakatime-google-apps-script
   ```
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** and select the project folder
5. Click the extension icon and enter your WakaTime API key

---

## How It Works

The extension injects a content script into `script.google.com` that listens for typing and file change activity in the editor. When activity is detected, it sends a **heartbeat** directly to the [WakaTime API](https://wakatime.com/developers#heartbeats) via `fetch`.

```
User types in Apps Script IDE
        ↓
Content script detects activity
        ↓
Heartbeat sent to WakaTime API
  - entity: current file path
  - project: script project name
  - language: Google Apps Script
  - user_agent: wakatime/24.0.0 (...) Google-Apps-Script/1.0
  - X-Machine-Name: (your configured machine name)
        ↓
Time appears in WakaTime dashboard
```

### Key technical details

- **No wakatime-cli needed** — heartbeats are sent directly from the browser via the REST API
- **Heartbeat throttling** — a heartbeat is only sent if 2 minutes have passed since the last one, or the file has changed, following the [official WakaTime plugin spec](https://wakatime.com/help/creating-plugin)
- **API key** is stored in `chrome.storage.sync` and syncs across Chrome sign-ins
- **OS detection** is done via `navigator.userAgent` and included in the `user_agent` string

---

## Configuration

Click the extension icon to open the popup:

| Setting | Description | Default |
|---|---|---|
| **API Key** | Your WakaTime API key | *(required)* |
| **Machine Name** | How this browser shows up in your WakaTime dashboard | `Browser Google IDE` |

---

## Project Structure

```
/
├── manifest.json         # Chrome extension manifest (MV3)
├── content.js            # Injected into script.google.com, sends heartbeats
├── utils.js              # Shared helpers (OS detection, hostname, encoding)
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic (save API key + machine name)
└── background.js         # Service worker (if needed)
```

---

## Contributing

Contributions are welcome! This project is in early development and there's a lot of room to improve.

### Getting started

1. Fork the repository
2. Clone your fork
   ```bash
   git clone https://github.com/YOUR_USERNAME/wakatime-google-apps-script
   ```
3. Load it unpacked in Chrome (see [local install](#for-now-local-install) above)
4. Make your changes and test them at [script.google.com](https://script.google.com)
5. Open a pull request against `main`

### Reporting issues

Open an issue on [GitHub Issues](https://github.com/Koppeks/wakatime-google-apps-script/issues) with:
- What you expected to happen
- What actually happened
- Your Chrome version and OS

---

### 📂 Related Repositories
Check out the [Wakatime For Apps Script SPA](https://github.com/Koppeks/wakatime-gas-spa) - The single page application that showcase the extension.

## Acknowledgements

- [WakaTime](https://wakatime.com) for their open API and plugin documentation
- [browser-wakatime](https://github.com/wakatime/browser-wakatime) for reference on how browser-based heartbeats work

---

> Made by [@Koppeks](https://github.com/Koppeks) — PRs welcome!