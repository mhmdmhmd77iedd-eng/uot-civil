// زر «ثبّت التطبيق»: أندرويد/كروم يثبت بضغطة، والآيفون نعرض له الخطوتين
import { useSyncExternalStore } from 'react'

let bip = null
const subs = new Set()
const emit = () => subs.forEach((f) => f())
if (typeof window !== 'undefined') {
  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); bip = e; emit() })
  addEventListener('appinstalled', () => { bip = null; emit() })
}

export const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true
export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

export function useInstall() {
  const can = useSyncExternalStore((f) => (subs.add(f), () => subs.delete(f)), () => !!bip)
  const standalone = isStandalone()
  return {
    standalone,
    can,
    ios: !standalone && isIOS(),
    available: !standalone && (can || isIOS()),
    async prompt() {
      if (!bip) return false
      bip.prompt()
      const r = await bip.userChoice.catch(() => null)
      bip = null; emit()
      return r?.outcome === 'accepted'
    },
  }
}
