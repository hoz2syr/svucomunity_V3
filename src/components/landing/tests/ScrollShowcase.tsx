'use client'
import { motion } from "motion/react"
import { useRef, useState, useEffect, type ReactNode, Children } from "react"
import { useReducedMotion } from '../../../hooks/useReducedMotion'

const CARD_WIDTH = 460
const GAP = 12
const END_PADDING = 60
const CENTER_PADDING = CARD_WIDTH / 2

interface ScrollShowcaseProps {
  children: ReactNode
  className?: string
}

export const ScrollShowcase = ({ children, className = '' }: ScrollShowcaseProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isRTL, setIsRTL] = useState(() =>
    typeof window !== 'undefined' ? document.documentElement.dir === 'rtl' : false
  )
  const reducedMotion = useReducedMotion()
  const [offset, setOffset] = useState(0)
  const offsetRef = useRef(0)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsRTL(document.documentElement.dir === 'rtl')
    }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el || reducedMotion) return

    const handleWheel = (e: WheelEvent) => {
      const cardsContainer = el.querySelector('[data-cards]')
      if (!cardsContainer) return

      const numItems = cardsContainer.children.length
      const travel = (numItems - 1) * (CARD_WIDTH + GAP) + END_PADDING
      const delta = e.deltaY
      const current = offsetRef.current

      let next

      if (isRTL) {
        next = Math.max(0, Math.min(travel, current + delta))
        if (next === current) {
          if ((current >= travel && delta > 0) || (current <= 0 && delta < 0)) return
          return
        }
      } else {
        next = Math.max(-travel, Math.min(0, current - delta))
        if (next === current) {
          if ((current <= -travel && delta > 0) || (current >= 0 && delta < 0)) return
          return
        }
      }

      e.preventDefault()
      offsetRef.current = next
      setOffset(next)
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [reducedMotion, isRTL])

  const childrenArray = Children.toArray(children)

  if (reducedMotion) {
    return (
      <section ref={containerRef} className={`relative ${className}`}>
        <div className="overflow-x-auto scrollbar-hide">
          <div
            className="flex gap-3"
            style={{ paddingInlineStart: `${CENTER_PADDING}px`, paddingInlineEnd: `${END_PADDING}px` }}
          >
            {childrenArray.map((child, i) => (
              <div key={i} style={{ width: CARD_WIDTH }} className="flex-shrink-0">
                {child}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      ref={containerRef}
      className={`relative ${className}`}
    >
      <div className="flex flex-col justify-center overflow-hidden">
        <motion.div
          data-cards
          className="flex gap-3 will-change-transform"
          style={{
            x: offset,
            paddingInlineStart: `${CENTER_PADDING}px`,
            paddingInlineEnd: `${END_PADDING}px`
          }}
        >
          {childrenArray.map((child, i) => (
            <div key={i} style={{ width: CARD_WIDTH }} className="flex-shrink-0">
              {child}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}