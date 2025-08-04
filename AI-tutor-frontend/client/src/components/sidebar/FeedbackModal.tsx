import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
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
            <h2 className="text-2xl font-bold mb-4">Share Your Feedback</h2>
            <p className="text-gray-700 text-sm mb-4">
              We value your feedback! Please let us know how we can improve.
            </p>
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSe1U1Dj6QkOM7bJrtD7kd8eVk59CWsBkMzuICUjGq_16gZXnA/viewform?usp=dialog" // Replace with your Google Form URL
              width="100%"
              height="400"
              frameBorder="0"
              className="rounded"
            ></iframe>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
