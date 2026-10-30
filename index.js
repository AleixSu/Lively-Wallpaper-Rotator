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
  } else {
    await log('Not time to change yet')
  }
}

try {
  const command = process.argv[2]

  if (command === 'install') {
    await installTask()
    await log('Task installed. Wallpapers will rotate automatically.')
  } else if (command === 'uninstall') {
    await uninstallTask()
    await log('Task removed.')
  } else if (command === undefined) {
    await run()
  } else {
    throw new Error(
      `Unknown command "${command}". Use install, uninstall or no command.`
    )
  }
} catch (error) {
  await logError(error.message)
  process.exitCode = 1
}
