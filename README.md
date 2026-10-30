# Lively Rotator

> Automatically rotate your [Lively Wallpaper](https://github.com/rocksdanister/lively) backgrounds on Windows. Install once, forget about it.

Lively Rotator is a small Node.js CLI that runs in the background as a Windows scheduled task. Every X hours it switches to the next wallpaper in your Lively library, notifies you, and keeps a log of everything it does.

![Platform](https://img.shields.io/badge/platform-Windows-0078D6)
![Node](https://img.shields.io/badge/node-%5E22.22.2%20%7C%7C%20%5E24.15.0%20%7C%7C%20%3E%3D26-339933)
![License](https://img.shields.io/badge/license-ISC-blue)

---

## Features

- **Set and forget** — one command registers a Windows scheduled task; after that it runs on its own.
- **Ordered rotation** — goes through your whole Lively library in order, without repeating, and starts over at the end.
- **Uses your Lively library** — no lists to maintain. Add or remove wallpapers in Lively as usual and the rotation picks them up.
- **Survives shutdowns** — if your PC was off when a change was due, it switches as soon as you're back.
- **Windows notifications** — a toast when the wallpaper changes, and when something goes wrong.
- **No notification spam** — errors are notified once per episode, not every hour.
- **Invisible** — runs without popping up a console window.
- **Logged** — every run is recorded with a timestamp in `lively-rotator.log`.
- **Zero config by default** — paths are detected automatically for the current user.

## Requirements

- **Windows 10 / 11**
- **Node.js** `^22.22.2`, `^24.15.0` or `>=26`
- **[Lively Wallpaper](https://github.com/rocksdanister/lively)** installed (standard installer), with at least one wallpaper in its library

## Installation

```bash
git clone https://github.com/AleixSu/Lively-Wallpaper-Rotator.git
cd lively-rotator
npm install
npm link
```

`npm link` makes the `lively-rotator` command available from any terminal.

Then register the scheduled task:

```bash
lively-rotator install
```

That's it. From now on, your wallpaper rotates automatically.

## Usage

| Command                    | What it does                                                |
| -------------------------- | ----------------------------------------------------------- |
| `lively-rotator install`   | Registers an hourly Windows scheduled task                  |
| `lively-rotator uninstall` | Removes the scheduled task                                  |
| `lively-rotator`           | Runs once: changes the wallpaper if the interval has passed |

> **Moved the project folder?** The scheduled task stores the path to the project, so run `lively-rotator install` again from the new location. If you plan to delete the project, run `lively-rotator uninstall` first.

## Configuration

Configuration is **optional**. To change the defaults, create a `config.json` file in the project root with only the options you want to change:

```json
{
  "intervalHours": 12,
  "notifications": false
}
```

A ready-to-copy example is available in [`config.example.json`](config.example.json).

| Option          | Default         | Description                                       |
| --------------- | --------------- | ------------------------------------------------- |
| `intervalHours` | `24`            | Hours between wallpaper changes                   |
| `notifications` | `true`          | Show Windows notifications for changes and errors |
| `livelyPath`    | _auto-detected_ | Path to `Lively.exe`                              |
| `libraryPaths`  | _auto-detected_ | Folders where Lively stores your wallpapers       |

You only need `livelyPath` or `libraryPaths` if Lively is installed somewhere other than the default location. By default they point to:

```
%LOCALAPPDATA%\Programs\Lively Wallpaper\Lively.exe
%LOCALAPPDATA%\Lively Wallpaper\Library\wallpapers
%LOCALAPPDATA%\Lively Wallpaper\Library\SaveData\wptmp
```

Lively keeps its bundled wallpapers and the ones you add in different folders, which is why there are two library paths.

## Notifications

Lively Rotator uses native Windows notifications to keep you informed without having to check the log:

- **Wallpaper changed** — once per interval, with the name of the new wallpaper.
- **Errors** — for example, if Lively is closed or `config.json` is invalid.

Errors are **deduplicated**. If Lively stays closed for a whole weekend, you get **one** notification, not one every hour. As soon as a wallpaper changes successfully, the slate is wiped clean and the next problem will be notified again. A _different_ error is always notified.

Every run is still written to the log, notified or not.

To turn notifications off, set `"notifications": false` in your `config.json`.

## How it works

```
Windows Task Scheduler (every hour)
        │
        ▼
  Has the interval passed since the last change?
        │
   no ──┴── yes
   │         │
  exit       ▼
        Is Lively running?
             │
        no ──┴── yes
        │         │
   log + notify   ▼
   error once   Pick the next wallpaper from the library
                  │
                  ▼
                Apply it through Lively's command line
                  │
                  ▼
                Save state, log and notify
```

- The task runs **every hour**, but the wallpaper only changes when `intervalHours` have passed since the last change. Most runs simply check the time and exit in a fraction of a second.
- Lively Rotator talks to Lively through its [command line controls](https://github.com/rocksdanister/lively/wiki/Command-Line-Controls). Commands only work while Lively is running.
- The last wallpaper and the time of the change are stored in `state.json`, so the rotation continues where it left off.
- The task runs through `conhost.exe --headless` so no console window flashes on your screen.

## Files

| File                 | Purpose                                                         |
| -------------------- | --------------------------------------------------------------- |
| `config.json`        | Your settings (optional, not tracked by git)                    |
| `state.json`         | Last wallpaper, last change and last notified error (generated) |
| `lively-rotator.log` | Timestamped log of every run (generated)                        |

Example log:

```
2026-10-30T00:45:25.561Z INFO - Wallpaper changed to 2qltly3u.j34
2026-10-30T01:45:02.114Z INFO - Not time to change yet
2026-10-30T02:45:03.870Z ERROR - Lively is not running. Open it and try again.
```

## Troubleshooting

**The wallpaper isn't changing.**
Check `lively-rotator.log`. The most common causes are Lively being closed, or the interval not having passed yet.

**I get "Lively is not running".**
Open Lively. The next hourly run will change the wallpaper.

**I want to test it without waiting.**
Set `"intervalHours": 0` in `config.json` and run `lively-rotator`. Every run will switch to the next wallpaper. Remember to remove it afterwards.

**Your antivirus flags `conhost --headless`.**
Some security tools watch for processes launched this way, since it hides the console window. It's only used here to avoid a window popping up every hour.

## Project structure

```
lively-rotator/
├── index.js            # Entry point: routes commands and handles errors
├── src/
│   ├── config.js       # Defaults + user config.json
│   ├── lively.js       # Talks to Lively.exe
│   ├── logger.js       # Console + log file
│   ├── notifier.js     # Windows notifications
│   ├── rotation.js     # Wallpaper discovery and next-wallpaper logic
│   ├── state.js        # Reads and writes state.json
│   └── task.js         # Install / uninstall the scheduled task
└── config.example.json
```

## License

[ISC](LICENSE)
