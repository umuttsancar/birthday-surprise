import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ASSETS, COPY } from '../config'

type Props = {
  onComplete: () => void
}

export function ChoiceStage({ onComplete }: Props) {
  const [won, setWon] = useState(false)

  return (
    <section className="screen stage stage--choice">
      <header className="stage__bar stage__bar--solo">
        <p className="stage__eyebrow">{COPY.stage3Title}</p>
      </header>

      <AnimatePresence mode="wait">
        {!won ? (
          <motion.div
            key="pick"
            className="choice"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="choice__grid">
              <button
                type="button"
                className="choice__photo choice__photo--pick"
                onClick={() => setWon(true)}
                aria-label="Umut fotoğrafı"
              >
                <img src={ASSETS.umutPhoto} alt="Umut" draggable={false} />
              </button>

              {/* İdol fotoğrafı bilerek tıklanamaz */}
              <div
                className="choice__photo choice__photo--locked"
                aria-hidden="true"
                title="Bu seçenek kapalı"
              >
                <img src={ASSETS.idolPhoto} alt="" draggable={false} />
                <span className="choice__veil" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="reward"
            className="congrats"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="congrats__burst" aria-hidden>
              ❤
            </div>
            <h2>{COPY.rewardReady}</h2>
            <button type="button" className="btn btn--primary" onClick={onComplete}>
              {COPY.claimReward}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
