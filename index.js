#!/usr/bin/env node
import { loadConfig } from './src/config.js'
import { isLivelyRunning, setWallpaper } from './src/lively.js'
import { getWallpapers } from './src/rotation.js'

const running = await isLivelyRunning()

try {
  if (!running) {
    throw new Error('Lively is not running. Open it and try again.')
  }
  const config = await loadConfig()
  console.log(config)

  const wallpapers = await getWallpapers(config.libraryPaths)

  await setWallpaper(config.livelyPath, 'random')
  console.log('Wallpaper Changed')
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
