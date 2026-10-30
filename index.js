#!/usr/bin/env node
import { loadConfig } from './src/config.js'
import { isLivelyRunning, setWallpaper } from './src/lively.js'
import {
  getNextWallpaper,
  getWallpapers,
  shouldChange
} from './src/rotation.js'
import { loadStateFile, writeStateFile } from './src/state.js'

try {
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
    console.log('Wallpaper Changed')

    await writeStateFile({
      lastWallpaper: nextWallpaper,
      lastChange: new Date().toISOString()
    })
  } else {
    console.log('Not time to change yet')
  }
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
