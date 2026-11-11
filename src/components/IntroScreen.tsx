import { motion } from 'framer-motion'
import { ASSETS, COPY } from '../config'
import { Character } from './Character'

type Props = {
  onStart: () => void
}

export function IntroScreen({ onStart }: Props) {
  return (
    <section className="screen intro">
      <div className="intro__glow" aria-hidden />
      <motion.p
        className="brand"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {COPY.brand}
      </motion.p>

      <motion.div
        className="intro__stage"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        <Character photo={ASSETS.umutPhoto} alt="Umut karakteri" speaking />
        <motion.div
          className="speech"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          <p>{COPY.introSpeech}</p>
        </motion.div>
      </motion.div>

      <motion.button
        className="btn btn--primary"
        type="button"
        onClick={onStart}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        whileTap={{ scale: 0.97 }}
      >
        {COPY.start}
      </motion.button>
    </section>
  )
}
