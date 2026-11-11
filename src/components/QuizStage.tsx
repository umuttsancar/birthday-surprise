import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { COPY } from '../config'
import { isFeyzaBirthdayAnswer } from '../utils'

type Props = {
  onComplete: () => void
}

type Phase = 'q1' | 'congrats1' | 'q2' | 'congrats2'

export function QuizStage({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('q1')
  const [answer, setAnswer] = useState('')
  const [wrong, setWrong] = useState(false)

  const submitQ2 = () => {
    if (isFeyzaBirthdayAnswer(answer)) {
      setWrong(false)
      setPhase('congrats2')
    } else {
      setWrong(true)
    }
  }

  return (
    <section className="screen stage stage--quiz">
      <header className="stage__bar stage__bar--solo">
        <p className="stage__eyebrow">{COPY.quizTitle}</p>
      </header>

      <AnimatePresence mode="wait">
        {phase === 'q1' && (
          <motion.div
            key="q1"
            className="quiz"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
          >
            <h2 className="quiz__q">{COPY.q1}</h2>
            <div className="quiz__options">
              {COPY.q1Options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="btn btn--option"
                  onClick={() => setPhase('congrats1')}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'congrats1' && (
          <motion.div
            key="c1"
            className="congrats"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="congrats__burst" aria-hidden>
              ✦
            </div>
            <h2>{COPY.congrats}</h2>
            <p>Doğru cevap — devam edelim.</p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setPhase('q2')}
            >
              {COPY.continue}
            </button>
          </motion.div>
        )}

        {phase === 'q2' && (
          <motion.div
            key="q2"
            className="quiz"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
          >
            <h2 className="quiz__q">{COPY.q2}</h2>
            <label className="quiz__field">
              <span className="sr-only">{COPY.q2Hint}</span>
              <textarea
                className="quiz__textarea"
                rows={4}
                inputMode="text"
                enterKeyHint="done"
                placeholder={COPY.q2Hint}
                value={answer}
                onChange={(e) => {
                  setAnswer(e.target.value)
                  setWrong(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    submitQ2()
                  }
                }}
              />
            </label>
            {wrong && <p className="quiz__wrong">{COPY.q2Wrong}</p>}
            <button
              type="button"
              className="btn btn--primary"
              onClick={submitQ2}
              disabled={!answer.trim()}
            >
              {COPY.q2Submit}
            </button>
          </motion.div>
        )}

        {phase === 'congrats2' && (
          <motion.div
            key="c2"
            className="congrats"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="congrats__burst" aria-hidden>
              ★
            </div>
            <h2>{COPY.congrats}</h2>
            <p>{COPY.stage2Pass}</p>
            <button type="button" className="btn btn--primary" onClick={onComplete}>
              {COPY.nextStage}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
