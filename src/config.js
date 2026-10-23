import { readFile } from 'node:fs/promises'
import path from 'node:path'

const LOCALAPPDATA = process.env.LOCALAPPDATA
const defaults = {
  livelyPath: path.join(
    LOCALAPPDATA,
    'Programs',
    'Lively Wallpaper',
    'Lively.exe'
  ),
  libraryPaths: [
    path.join(LOCALAPPDATA, 'Lively Wallpaper', 'Library', 'wallpapers'),
    path.join(LOCALAPPDATA, 'Lively Wallpaper', 'Library', 'SaveData', 'wptmp')
  ],
  intervalHours: 24
}

export const loadConfig = async () => {
  const configPath = path.join(import.meta.dirname, '..', 'config.json')

  let userConfig = {}

  try {
    const text = await readFile(configPath, 'utf8')

    if (text.trim() !== '') {
      userConfig = JSON.parse(text)
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }
  return { ...defaults, ...userConfig }
}
