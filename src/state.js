import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const STATE_PATH = path.join(import.meta.dirname, '..', 'state.json')

export const loadStateFile = async () => {
  let userState = {}

  try {
    const text = await readFile(STATE_PATH, 'utf8')

    if (text.trim() !== '') {
      userState = JSON.parse(text)
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }
  return userState
}

export const writeStateFile = async (stateData) => {
  const text = JSON.stringify(stateData, null, 2)
  await writeFile(STATE_PATH, text)
}
