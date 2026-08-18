import { useEffect } from 'react'

let lockCount = 0
let lockedScrollY = 0
let previousBodyStyles: Partial<CSSStyleDeclaration> | null = null

interface BodyScrollLockOptions {
  blockNavigationWhileLocked?: boolean
}

export function useBodyScrollLock(locked: boolean, options: BodyScrollLockOptions = {}) {
  const { blockNavigationWhileLocked = false } = options

  useEffect(() => {
    if (!locked) return

    const handleNavigationBack = () => {
      window.history.go(1)
    }

    if (blockNavigationWhileLocked) {
      window.addEventListener('popstate', handleNavigationBack)
      window.addEventListener('hashchange', handleNavigationBack)
    }

    if (lockCount === 0) {
      const bodyStyle = document.body.style
      lockedScrollY = window.scrollY
      previousBodyStyles = {
        overflow: bodyStyle.overflow,
        position: bodyStyle.position,
        top: bodyStyle.top,
        width: bodyStyle.width,
        touchAction: bodyStyle.touchAction,
      }

      bodyStyle.overflow = 'hidden'
      bodyStyle.position = 'fixed'
      bodyStyle.top = `-${lockedScrollY}px`
      bodyStyle.width = '100%'
      bodyStyle.touchAction = 'none'
    }

    lockCount += 1

    return () => {
      if (blockNavigationWhileLocked) {
        window.removeEventListener('popstate', handleNavigationBack)
        window.removeEventListener('hashchange', handleNavigationBack)
      }

      lockCount = Math.max(0, lockCount - 1)
      if (lockCount > 0) return

      const bodyStyle = document.body.style
      bodyStyle.overflow = previousBodyStyles?.overflow ?? ''
      bodyStyle.position = previousBodyStyles?.position ?? ''
      bodyStyle.top = previousBodyStyles?.top ?? ''
      bodyStyle.width = previousBodyStyles?.width ?? ''
      bodyStyle.touchAction = previousBodyStyles?.touchAction ?? ''
      window.scrollTo(0, lockedScrollY)
      previousBodyStyles = null
    }
  }, [locked, blockNavigationWhileLocked])
}
