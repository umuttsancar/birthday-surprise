import { motion } from 'framer-motion'
import { ASSETS, COPY } from '../config'

export function MessageScreen() {
  return (
    <section className="screen message">
      <div className="message__glow" aria-hidden />
      <motion.p
        className="brand brand--soft"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {COPY.messageTitle}
      </motion.p>
      <motion.article
        className="message__letter"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.65 }}
      >
        {ASSETS.birthdayMessage.split('\n').map((line, i) =>
          line.trim() ? <p key={i}>{line}</p> : <br key={i} />,
        )}
      </motion.article>
      <motion.div
        className="message__faces"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <img src={ASSETS.umutPhoto} alt="" />
        <span aria-hidden>💜</span>
        <img src={ASSETS.feyzaPhoto} alt="" />
      </motion.div>
    </section>
  )
}
