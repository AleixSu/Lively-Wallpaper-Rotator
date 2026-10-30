#!/usr/bin/env node
import { loadConfig } from './src/config.js'
import { isLivelyRunning, setWallpaper } from './src/lively.js'
import path from 'node:path'
import { log, logError } from './src/logger.js'
import {
  getNextWallpaper,
  getWallpapers,
  shouldChange
} from './src/rotation.js'
import { loadStateFile, writeStateFile } from './src/state.js'
import { installTask, uninstallTask } from './src/task.js'
import { notify } from './src/notifier.js'

const run = async () => {
  const config = await loadConfig()
  const userState = await loadStateFile()
  const changeWallpaper = shouldChange(
    userState.lastChange,
    config.intervalHours
  )

  if (changeWallpaper) {
    const running = await isLivelyRunning()
    if (!running) {
      throw new Error('Lively is not running. Open it and try again.')
    }
    const wallpapers = await getWallpapers(config.libraryPaths)
    const nextWallpaper = getNextWallpaper(wallpapers, userState.lastWallpaper)
    await setWallpaper(config.livelyPath, nextWallpaper)
    await writeStateFile({
      lastWallpaper: nextWallpaper,
      lastChange: new Date().toISOString()
    })
    await log(`Wallpaper changed to ${path.basename(nextWallpaper)}`)
    if (config.notifications) {
      await notify(`Wallpaper changed to ${path.basename(nextWallpaper)}`)
    }
  } else {
    await log('Not time to change yet')
  }
}

try {
  const command = process.argv[2]

  if (command === 'install') {
    await installTask()
    await log('Task installed. Wallpapers will rotate automatically.')
    await notify('Task installed. Wallpapers will rotate automatically.')
  } else if (command === 'uninstall') {
    await uninstallTask()
    await log('Task removed.')
    await notify('Task removed.')
  } else if (command === undefined) {
    await run()
  } else {
    throw new Error(
      `Unknown command "${command}". Use install, uninstall or no command.`
    )
  }
} catch (error) {
  await logError(error.message)

  try {
    let notificationsOn = true
    try {
      const config = await loadConfig()
      notificationsOn = config.notifications
    } catch {
      // Config can't be read (maybe that's the error itself): keep notifying
    }

    const state = await loadStateFile()

    if (notificationsOn && state.lastNotifiedError !== error.message) {
      await notify(`Error: ${error.message}`)
    }

    await writeStateFile({ ...state, lastNotifiedError: error.message })
  } catch {
    // Notifying and saving state are best-effort: the error is already in the log
  }

  process.exitCode = 1
}
