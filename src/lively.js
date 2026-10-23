import { execFile } from 'child_process'
import { promisify } from 'util'

const LIVELY =
  'C:\\Users\\aleix\\AppData\\Local\\Programs\\Lively Wallpaper\\Lively.exe'

const execFileAsync = promisify(execFile)

export const setWallpaper = async (file) => {
  await execFileAsync(LIVELY, ['setwp', '--file', file], { timeout: 10000 })
}

export const isLivelyRunning = async () => {
  const { stdout } = await execFileAsync('tasklist', [
    '/FI',
    'IMAGENAME eq Lively.exe',
    '/FO',
    'CSV',
    '/NH'
  ])
  return stdout.includes('Lively.exe')
}
