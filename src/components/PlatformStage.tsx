import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ASSETS, COPY } from '../config'

type Props = {
  onComplete: () => void
}

type Heart = { id: number; x: number; y: number; collected: boolean }
type Platform = { x: number; y: number; w: number }

const PLAYER_W = 52
const PLAYER_H = 72
const GRAVITY = 0.55
const JUMP = -11.2
const MOVE = 3.4

export function PlatformStage({ onComplete }: Props) {
  const areaRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [heartsLeft, setHeartsLeft] = useState(3)
  const [done, setDone] = useState(false)
  const [tick, setTick] = useState(0)

  const state = useRef({
    x: 40,
    y: 0,
    vx: 0,
    vy: 0,
    onGround: false,
    facing: 1 as 1 | -1,
    width: 360,
    height: 640,
    platforms: [] as Platform[],
    hearts: [] as Heart[],
    keys: { left: false, right: false },
  })

  useEffect(() => {
    const el = areaRef.current
    if (!el) return

    const layout = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      const s = state.current
      s.width = w
      s.height = h

      const groundY = h - 28
      const p1 = { x: 18, y: groundY - 8, w: w * 0.42 }
      const p2 = { x: w * 0.38, y: h * 0.58, w: w * 0.36 }
      const p3 = { x: w * 0.12, y: h * 0.36, w: w * 0.34 }
      s.platforms = [p1, p2, p3]
      s.hearts = [
        { id: 1, x: p1.x + p1.w * 0.55, y: p1.y - 36, collected: false },
        { id: 2, x: p2.x + p2.w * 0.5, y: p2.y - 36, collected: false },
        { id: 3, x: p3.x + p3.w * 0.55, y: p3.y - 36, collected: false },
      ]
      s.x = 36
      s.y = p1.y - PLAYER_H
      s.vx = 0
      s.vy = 0
      setReady(true)
      setHeartsLeft(3)
      setDone(false)
    }

    layout()
    const ro = new ResizeObserver(layout)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!ready || done) return
    let raf = 0
    let last = performance.now()

    const step = (now: number) => {
      const dt = Math.min(32, now - last) / 16.67
      last = now
      const s = state.current

      const wantLeft = s.keys.left
      const wantRight = s.keys.right
      if (wantLeft && !wantRight) {
        s.vx = -MOVE
        s.facing = -1
      } else if (wantRight && !wantLeft) {
        s.vx = MOVE
        s.facing = 1
      } else {
        s.vx *= 0.78
        if (Math.abs(s.vx) < 0.08) s.vx = 0
      }

      s.vy += GRAVITY * dt
      s.x += s.vx * dt
      s.y += s.vy * dt

      s.x = Math.max(0, Math.min(s.width - PLAYER_W, s.x))

      s.onGround = false
      for (const p of s.platforms) {
        const withinX = s.x + PLAYER_W > p.x + 4 && s.x < p.x + p.w - 4
        const feet = s.y + PLAYER_H
        const wasAbove = feet - s.vy * dt <= p.y + 2
        if (withinX && wasAbove && feet >= p.y && s.vy >= 0) {
          s.y = p.y - PLAYER_H
          s.vy = 0
          s.onGround = true
        }
      }

      if (s.y > s.height + 40) {
        s.x = 36
        s.y = s.platforms[0].y - PLAYER_H
        s.vx = 0
        s.vy = 0
      }

      let collectedNow = false
      for (const heart of s.hearts) {
        if (heart.collected) continue
        const cx = heart.x + 14
        const cy = heart.y + 14
        const px = s.x + PLAYER_W / 2
        const py = s.y + PLAYER_H * 0.35
        const dx = cx - px
        const dy = cy - py
        if (dx * dx + dy * dy < 38 * 38) {
          heart.collected = true
          collectedNow = true
        }
      }

      if (collectedNow) {
        const left = s.hearts.filter((h) => !h.collected).length
        setHeartsLeft(left)
        if (left === 0) setDone(true)
      }

      setTick((t) => t + 1)
      raf = requestAnimationFrame(step)
    }

    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [ready, done])

  const jump = () => {
    const s = state.current
    if (s.onGround && !done) {
      s.vy = JUMP
      s.onGround = false
    }
  }

  const setKey = (key: 'left' | 'right', value: boolean) => {
    state.current.keys[key] = value
  }

  const s = state.current
  void tick

  return (
    <section className="screen stage stage--platform">
      <header className="stage__bar">
        <div>
          <p className="stage__eyebrow">{COPY.stage1Title}</p>
          <p className="stage__hint">{COPY.stage1Hint}</p>
        </div>
        <div className="heart-count" aria-live="polite">
          💜 {3 - heartsLeft}/3
        </div>
      </header>

      <div
        className="playfield"
        ref={areaRef}
        onPointerDown={jump}
        role="application"
        aria-label="Platform oyunu"
      >
        <div className="playfield__sky" aria-hidden />
        {ready &&
          s.platforms.map((p, i) => (
            <div
              key={i}
              className="platform"
              style={{ left: p.x, top: p.y, width: p.w }}
            />
          ))}
        {ready &&
          s.hearts.map((h) =>
            h.collected ? null : (
              <div
                key={h.id}
                className="heart-pickup"
                style={{ left: h.x, top: h.y }}
                aria-hidden
              >
                💜
              </div>
            ),
          )}
        {ready && (
          <div
            className="player"
            style={{
              left: s.x,
              top: s.y,
              transform: `scaleX(${s.facing})`,
            }}
          >
            <div className="player__head">
              <img src={ASSETS.feyzaPhoto} alt="Feyza karakteri" draggable={false} />
            </div>
            <div className="player__body" />
            <div className="player__boot player__boot--l" />
            <div className="player__boot player__boot--r" />
          </div>
        )}
        <p className="playfield__tip">Ekrana dokun = zıpla</p>
      </div>

      <div className="controls">
        <button
          type="button"
          className="ctrl"
          onPointerDown={(e) => {
            e.preventDefault()
            setKey('left', true)
          }}
          onPointerUp={() => setKey('left', false)}
          onPointerLeave={() => setKey('left', false)}
          onPointerCancel={() => setKey('left', false)}
        >
          ←
        </button>
        <button type="button" className="ctrl ctrl--jump" onPointerDown={jump}>
          Zıpla
        </button>
        <button
          type="button"
          className="ctrl"
          onPointerDown={(e) => {
            e.preventDefault()
            setKey('right', true)
          }}
          onPointerUp={() => setKey('right', false)}
          onPointerLeave={() => setKey('right', false)}
          onPointerCancel={() => setKey('right', false)}
        >
          →
        </button>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div
            className="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="overlay__card"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
            >
              <p className="overlay__title">{COPY.stageComplete}</p>
              <button type="button" className="btn btn--primary" onClick={onComplete}>
                {COPY.nextStage}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
