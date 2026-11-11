import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ASSETS, COPY } from '../config'

type Props = {
  onComplete: () => void
}

type Heart = { id: number; x: number; y: number; collected: boolean }
type Platform = { x: number; y: number; w: number }

const PLAYER_W = 48
const PLAYER_H = 68
const GRAVITY = 0.42
const JUMP = -12.8
const MOVE = 4.2
const COYOTE_MS = 120

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
    coyoteUntil: 0,
    facing: 1 as 1 | -1,
    width: 360,
    height: 640,
    platforms: [] as Platform[],
    hearts: [] as Heart[],
    keys: { left: false, right: false },
    started: false,
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

      // Merdiven gibi: her basamak zıplama menzilinin içinde
      const step = Math.min(78, Math.max(58, h * 0.145))
      const p1 = { x: 10, y: h - 36, w: Math.max(150, w * 0.58) }
      const p2 = {
        x: Math.max(40, w * 0.32),
        y: p1.y - step,
        w: Math.max(140, w * 0.52),
      }
      const p3 = {
        x: 16,
        y: p2.y - step,
        w: Math.max(140, w * 0.5),
      }
      s.platforms = [p1, p2, p3]

      const placeHeart = (p: Platform, id: number): Heart => ({
        id,
        x: p.x + p.w * 0.5 - 14,
        y: p.y - 38,
        collected: s.started
          ? (s.hearts.find((h) => h.id === id)?.collected ?? false)
          : false,
      })
      s.hearts = [placeHeart(p1, 1), placeHeart(p2, 2), placeHeart(p3, 3)]

      if (!s.started) {
        s.x = 28
        s.y = p1.y - PLAYER_H
        s.vx = 0
        s.vy = 0
        s.onGround = true
        setHeartsLeft(3)
        setDone(false)
      } else {
        // Yeniden boyutlanınca oyuncuyu ekranda tut
        s.x = Math.max(0, Math.min(w - PLAYER_W, s.x))
        s.y = Math.max(0, Math.min(h - PLAYER_H, s.y))
      }

      setReady(true)
      setHeartsLeft(s.hearts.filter((h) => !h.collected).length)
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
      const dt = Math.min(24, now - last) / 16.67
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
        s.vx *= 0.8
        if (Math.abs(s.vx) < 0.08) s.vx = 0
      }

      s.vy += GRAVITY * dt
      // Terminal düşüş hızı — platformdan geçmeyi azaltır
      s.vy = Math.min(s.vy, 14)
      s.x += s.vx * dt
      s.y += s.vy * dt

      s.x = Math.max(0, Math.min(s.width - PLAYER_W, s.x))

      const wasGrounded = s.onGround
      s.onGround = false
      for (const p of s.platforms) {
        const withinX = s.x + PLAYER_W > p.x + 2 && s.x < p.x + p.w - 2
        const feet = s.y + PLAYER_H
        const prevFeet = feet - s.vy * dt
        const landing =
          withinX && s.vy >= 0 && prevFeet <= p.y + 6 && feet >= p.y - 1
        if (landing) {
          s.y = p.y - PLAYER_H
          s.vy = 0
          s.onGround = true
        }
      }

      if (s.onGround) {
        s.coyoteUntil = now + COYOTE_MS
      } else if (wasGrounded) {
        s.coyoteUntil = now + COYOTE_MS
      }

      if (s.y > s.height + 40) {
        s.x = 28
        s.y = s.platforms[0].y - PLAYER_H
        s.vx = 0
        s.vy = 0
        s.onGround = true
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
        if (dx * dx + dy * dy < 42 * 42) {
          heart.collected = true
          collectedNow = true
          s.started = true
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
    const canJump = (s.onGround || performance.now() < s.coyoteUntil) && !done
    if (canJump) {
      s.vy = JUMP
      s.onGround = false
      s.coyoteUntil = 0
      s.started = true
    }
  }

  const setKey = (key: 'left' | 'right', value: boolean) => {
    state.current.keys[key] = value
    if (value) state.current.started = true
  }

  const hold = (key: 'left' | 'right') => (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    setKey(key, true)
  }

  const release = (key: 'left' | 'right') => (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setKey(key, false)
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
              width: PLAYER_W,
              height: PLAYER_H,
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
        <p className="playfield__tip">Sağa basıp Zıpla</p>
      </div>

      <div className="controls">
        <button
          type="button"
          className="ctrl"
          onPointerDown={hold('left')}
          onPointerUp={release('left')}
          onPointerCancel={release('left')}
        >
          ←
        </button>
        <button
          type="button"
          className="ctrl ctrl--jump"
          onPointerDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            jump()
          }}
        >
          Zıpla
        </button>
        <button
          type="button"
          className="ctrl"
          onPointerDown={hold('right')}
          onPointerUp={release('right')}
          onPointerCancel={release('right')}
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
