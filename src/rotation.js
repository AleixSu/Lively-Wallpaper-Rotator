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
