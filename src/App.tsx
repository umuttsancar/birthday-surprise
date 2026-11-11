import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IntroScreen } from './components/IntroScreen'
import { PlatformStage } from './components/PlatformStage'
import { QuizStage } from './components/QuizStage'
import { ChoiceStage } from './components/ChoiceStage'
import { MessageScreen } from './components/MessageScreen'
import { notifyLinkOpened, notifyReachedMessage } from './notify'

type Scene = 'intro' | 'platform' | 'quiz' | 'choice' | 'message'

export default function App() {
  const [scene, setScene] = useState<Scene>('intro')

  useEffect(() => {
    notifyLinkOpened()
  }, [])

  useEffect(() => {
    if (scene === 'message') notifyReachedMessage()
  }, [scene])

  return (
    <div className="app-shell">
      <AnimatePresence mode="wait">
        <motion.div
          key={scene}
          className="scene"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28 }}
        >
          {scene === 'intro' && <IntroScreen onStart={() => setScene('platform')} />}
          {scene === 'platform' && <PlatformStage onComplete={() => setScene('quiz')} />}
          {scene === 'quiz' && <QuizStage onComplete={() => setScene('choice')} />}
          {scene === 'choice' && <ChoiceStage onComplete={() => setScene('message')} />}
          {scene === 'message' && <MessageScreen />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
