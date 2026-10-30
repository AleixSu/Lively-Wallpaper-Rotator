import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'

const execFileAsync = promisify(execFile)

const TASK_NAME = 'LivelyRotator'
const INDEX_PATH = path.join(import.meta.dirname, '..', 'index.js')

export const installTask = async () => {
  const command = `"${process.execPath}" "${INDEX_PATH}"`

  await execFileAsync('schtasks', [
    '/create',
    '/tn',
    TASK_NAME,
    '/tr',
    command,
    '/sc',
    'hourly',
    '/f'
  ])
}

export const uninstallTask = async () => {
  await execFileAsync('schtasks', ['/delete', '/tn', TASK_NAME, '/f'])
}
