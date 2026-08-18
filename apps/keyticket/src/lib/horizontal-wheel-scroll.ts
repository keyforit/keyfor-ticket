import type { MouseEvent, WheelEvent } from 'react'

export function handleHorizontalWheelScroll(event: WheelEvent<HTMLDivElement>) {
  const element = event.currentTarget
  const hasHorizontalOverflow = element.scrollWidth > element.clientWidth
  const primaryDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY

  if (!hasHorizontalOverflow || primaryDelta === 0) return

  const maxScrollLeft = element.scrollWidth - element.clientWidth
  const canScrollLeft = primaryDelta < 0 && element.scrollLeft > 0
  const canScrollRight = primaryDelta > 0 && element.scrollLeft < maxScrollLeft

  if (!canScrollLeft && !canScrollRight) return

  event.preventDefault()
  const nextScrollLeft = element.scrollLeft + primaryDelta
  element.scrollLeft = Math.min(maxScrollLeft, Math.max(0, nextScrollLeft))
}

export function handleHorizontalMouseDragScroll(event: MouseEvent<HTMLDivElement>) {
  if (event.buttons !== 1) return
  const element = event.currentTarget
  if (element.scrollWidth <= element.clientWidth) return
  event.preventDefault()
  element.scrollLeft -= event.movementX
}
