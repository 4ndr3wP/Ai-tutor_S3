import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"

interface HelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.05 }}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-4 text-gray-500 hover:text-black text-lg"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4">Help</h2>
            <p className="text-gray-700 text-sm">
              Welcome to your AI Assistant platform! Here's how you can use it:
            </p>
            <ul className="mt-4 list-disc pl-5 text-gray-700 text-sm space-y-1">
            <li>Welcome to your Reinforcement(SIT796) Learning AI Tutor</li>
            <li>Learn with guidance from an AI that adapts and improves, just like the agents you study.</li>
            <li>Unit Chair: Dr. Thommen George Karimpanal — your academic lead for SIT796.</li>
            <li>Access interactive explanations, curated prompts, and contextual feedback on tasks.</li>
            <li>Explore your teams, track learning progress, and revisit past sessions anytime.</li>
            <li>Need help? Reach out for AI support or connect with your unit resources instantly.</li>

            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence> 
  )
}
