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
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-4 text-gray-500 hover:text-black text-lg"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4">Help Desk</h2>
            <p className="text-gray-700 text-sm">
              Welcome to your AI Assistant platform! Here's how you can use it:
            </p>
            <ul className="mt-4 list-disc pl-5 text-gray-700 text-sm space-y-1">
              <li>Start a new chat with your AI tutor.</li>
              <li>Browse your teams and workspaces.</li>
              <li>Customize settings and preferences.</li>
              <li>Access saved prompts and chat history.</li>
              <li>Reach out to support from here.</li>
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence> 
  )
}
