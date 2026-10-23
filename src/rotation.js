import { readdir } from 'node:fs/promises'
import path from 'node:path'

export const getWallpapers = async (libraryPaths) => {
  const wallpapers = []
  for (const folder of libraryPaths) {
    try {
      const entries = await readdir(folder, { withFileTypes: true })
      for (const entry of entries) {
        if (entry.isDirectory()) {
          wallpapers.push(path.join(folder, entry.name))
        }
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error
      }
    }
  }
  return wallpapers.sort()
}

export const shouldChange = (lastChange, intervalHours) => {
  let elapsed = new Date() - new Date(lastChange)
  const intervalMs = intervalHours * 60 * 60 * 1000
  if (Number.isNaN(elapsed)) {
    return true
  }
  return elapsed >= intervalMs
}

export const getNextWallpaper = (wallpapers, lastWallpaper) => {
  const nextWallPaperIndex = wallpapers.indexOf(lastWallpaper) + 1
}
