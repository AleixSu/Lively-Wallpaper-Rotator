import { appendFile } from 'node:fs/promises'
import path from 'node:path'

const LOG_PATH = path.join(import.meta.dirname, '..', 'lively-rotator.log')

const formatLine = (level, message) => {
  const line = `${new Date().toISOString()} ${level} - ${message}\n`
  return line
}
export const log = async (message) => {
  console.log('LOG_PATH:', LOG_PATH)
  console.log(message)
  await appendFile(LOG_PATH, formatLine('INFO', message))
}
export const logError = async (message) => {
  console.error(message)
  await appendFile(LOG_PATH, formatLine('ERROR', message))
}
