import * as React from "react"
import { X, FileText, Brain, Sparkles, Target, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"

interface OnTrackTask {
  id: string
  title: string
  filename: string
}

interface QuizModalProps {
  isOpen: boolean
  onClose: () => void
  onTaskSelect: (task: OnTrackTask) => void
}

// List of OnTrack tasks - ordered from lowest to highest number
const onTrackTasks: OnTrackTask[] = [
  { id: "2.1P", title: "2.1P", filename: "2.1P OnTrack Task Sheet.md" },
  { id: "2.2C", title: "2.2C", filename: "2.2C OnTrack Task Sheet.md" },
  { id: "4.1P", title: "4.1P", filename: "4.1P OnTrack Task Sheet.md" },
  { id: "5.1P", title: "5.1P", filename: "5.1P OnTrack Task Sheet.md" },
  { id: "5.2C", title: "5.2C", filename: "5.2C OnTrack Task Sheet.md" },
  { id: "6.1P", title: "6.1P", filename: "6.1P OnTrack Task Sheet.md" },
  { id: "7.1P", title: "7.1P", filename: "7.1P OnTrack Task Sheet.md" },
  { id: "8.1P", title: "8.1P", filename: "8.1P OnTrack Task Sheet.md" },
  { id: "9.1P", title: "9.1P", filename: "9.1P OnTrack Task Sheet.md" },
  { id: "10.1P", title: "10.1P", filename: "10.1P OnTrack Task Sheet.md" },
  { id: "10.2C", title: "10.2C", filename: "10.2C OnTrack Task Sheet.md" },
  { id: "11.1P", title: "11.1P", filename: "11.1P OnTrack Task Sheet.md" },
  { id: "11.2P", title: "11.2P", filename: "11.2P OnTrack Task Sheet.md" },
]

export function QuizModal({ isOpen, onClose, onTaskSelect }: QuizModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden border-4 border-gradient-to-r from-blue-200 to-purple-200"
          initial={{ scale: 0.9, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Brain className="h-6 w-6" />
                </motion.div>
                <div>
                  <h2 className="text-3xl font-bold flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-yellow-300" />
                    Generate Quiz
                  </h2>
                  <p className="text-blue-100 text-lg">Choose your challenge! 🎯</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-10 w-10 text-white hover:bg-white/20 rounded-xl"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="text-center mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
              >
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Select Your Learning Topic</h3>
                <p className="text-gray-600">
                  Pick any task to generate a personalized quiz that tests your understanding!
                </p>
              </motion.div>
            </div>
            
            <div className="grid gap-4 max-h-96 overflow-y-auto pr-2">
              {onTrackTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-300 bg-white/90 backdrop-blur-sm group"
                    onClick={() => onTaskSelect(task)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-4">
                        <motion.div 
                          className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300"
                          whileHover={{ rotate: 5 }}
                        >
                          {task.title}
                        </motion.div>
                        <div className="flex-1">
                          <CardTitle className="text-xl text-gray-800 group-hover:text-blue-600 transition-colors">
                            Task {task.title}
                          </CardTitle>
                          <CardDescription className="text-gray-500 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            Click to generate quiz questions
                          </CardDescription>
                        </div>
                        <motion.div
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          whileHover={{ x: 5 }}
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Brain className="h-4 w-4 text-blue-600" />
                          </div>
                        </motion.div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-500" />
                          Perfect for testing your knowledge and reinforcing key concepts!
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex justify-center p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="px-8 py-3 text-lg font-semibold rounded-xl border-2 hover:bg-gray-100 transition-all duration-300"
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}