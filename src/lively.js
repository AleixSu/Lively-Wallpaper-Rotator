import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

export const setWallpaper = async (livelyPath, file) => {
  await execFileAsync(livelyPath, ['setwp', '--file', file], { timeout: 10000 })
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
