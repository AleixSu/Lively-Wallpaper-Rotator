import notifier from 'node-notifier'
import path from 'node:path'

const ICON_PATH = path.join(
  import.meta.dirname,
  '..',
  'assets',
  'livelyIcon.png'
)

export const notify = (message) => {
  return new Promise((resolve) => {
    notifier.notify(
      {
        title: 'Lively Rotator',
        message,
        icon: ICON_PATH,
        sound: true,
        appID: 'Lively Wallpaper Rotator'
      },
      () => {
        resolve()
      }
    )
  })
}
