#!/usr/bin/env node
import { isLivelyRunning, setWallpaper } from './src/lively.js'

const running = await isLivelyRunning()

try {
  if (!running) {
    throw new Error('Lively is not running. Open it and try again.')
  }
  await setWallpaper('random')
  console.log('Wallpaper Changed')
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
