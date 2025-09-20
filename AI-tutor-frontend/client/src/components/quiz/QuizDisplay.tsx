import * as React from "react"
import { useState } from "react"
import { CheckCircle, XCircle, RotateCcw, Trophy, Star, Zap, Target, Brain, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"

interface QuizQuestion {
  question: string
  options: string[]
  correct_answer: number
  explanation: string
}

interface QuizData {
  task_title: string
  questions: QuizQuestion[]
  total_questions: number
}

interface QuizDisplayProps {
  quizData: QuizData
  onClose: () => void
}

export function QuizDisplay({ quizData, onClose }: QuizDisplayProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(quizData.total_questions).fill(-1))
  const [showResults, setShowResults] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleAnswerSelect = (answerIndex: number) => {
    if (isSubmitted) return
    
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestion] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < quizData.total_questions - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setShowResults(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
    setShowResults(true)
  }

  const handleRestart = () => {
    setCurrentQuestion(0)
    setSelectedAnswers(new Array(quizData.total_questions).fill(-1))
    setShowResults(false)
    setIsSubmitted(false)
  }

  const getScore = () => {
    let correct = 0
    quizData.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct_answer) {
        correct++
      }
    })
    return correct
  }

  const getScorePercentage = () => {
    return Math.round((getScore() / quizData.total_questions) * 100)
  }

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return { message: "Outstanding! 🎉", color: "text-green-600", icon: Trophy }
    if (percentage >= 80) return { message: "Excellent! ⭐", color: "text-blue-600", icon: Star }
    if (percentage >= 70) return { message: "Good Job! 👍", color: "text-yellow-600", icon: Zap }
    if (percentage >= 60) return { message: "Not Bad! 📚", color: "text-orange-600", icon: Target }
    return { message: "Keep Studying! 📖", color: "text-red-600", icon: XCircle }
  }

  if (showResults) {
    const score = getScore()
    const percentage = getScorePercentage()
    const scoreInfo = getScoreMessage(percentage)
    const ScoreIcon = scoreInfo.icon
    
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center z-50 p-4">
        <motion.div 
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-4 border-gradient-to-r from-blue-200 to-purple-200"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex items-center justify-center gap-4 mb-4">
              <ScoreIcon className="h-12 w-12" />
              <h2 className="text-3xl font-bold">Quiz Complete! 🎯</h2>
            </div>
            <p className="text-center text-blue-100 text-lg">{quizData.task_title}</p>
          </div>
          
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="relative inline-block">
                <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
                  {score}/{quizData.total_questions}
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">{percentage}%</div>
                <div className={`text-2xl font-bold ${scoreInfo.color} flex items-center justify-center gap-2`}>
                  <ScoreIcon className="h-8 w-8" />
                  {scoreInfo.message}
                </div>
              </div>
              
              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <motion.div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-1000 ease-out"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
                <p className="text-sm text-gray-600">Your Progress</p>
              </div>
            </div>

            <div className="space-y-6 max-h-96 overflow-y-auto">
              {quizData.questions.map((question, index) => {
                const isCorrect = selectedAnswers[index] === question.correct_answer
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`${isCorrect ? "border-green-300 bg-gradient-to-r from-green-50 to-green-100" : "border-red-300 bg-gradient-to-r from-red-50 to-red-100"} shadow-lg`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-3">
                          <div className={`p-2 rounded-full ${isCorrect ? "bg-green-200" : "bg-red-200"}`}>
                            {isCorrect ? (
                              <CheckCircle className="h-6 w-6 text-green-700" />
                            ) : (
                              <XCircle className="h-6 w-6 text-red-700" />
                            )}
                          </div>
                          Question {index + 1}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-semibold mb-4 text-gray-800 text-lg">{question.question}</p>
                        <div className="space-y-3">
                          {question.options.map((option, optionIndex) => {
                            let optionClass = "p-4 rounded-xl border-2 font-medium transition-all"
                            if (optionIndex === question.correct_answer) {
                              optionClass += " bg-green-100 border-green-400 text-green-800 shadow-md"
                            } else if (optionIndex === selectedAnswers[index] && !isCorrect) {
                              optionClass += " bg-red-100 border-red-400 text-red-800 shadow-md"
                            } else {
                              optionClass += " bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                            }
                            
                            return (
                              <div key={optionIndex} className={optionClass}>
                                <span className="font-bold text-lg">{String.fromCharCode(65 + optionIndex)}.</span> {option}
                              </div>
                            )
                          })}
                        </div>
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                          <p className="text-sm text-blue-800 font-medium">💡 Explanation:</p>
                          <p className="text-sm text-blue-700 mt-1">{question.explanation}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
          
          <div className="flex justify-center gap-4 p-8 bg-gradient-to-r from-gray-50 to-gray-100">
            <Button 
              onClick={handleRestart} 
              variant="outline" 
              className="flex items-center gap-2 px-6 py-3 text-lg font-semibold border-2 hover:bg-blue-50"
            >
              <RotateCcw className="h-5 w-5" />
              Retake Quiz
            </Button>
            <Button 
              onClick={onClose}
              className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              🎉 Close
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  const currentQ = quizData.questions[currentQuestion]
  const hasAnswered = selectedAnswers[currentQuestion] !== -1

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Target className="h-8 w-8" />
                Quiz: {quizData.task_title}
              </h2>
              <p className="text-blue-100 mt-1">Question {currentQuestion + 1} of {quizData.total_questions}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-200 mb-2">Progress</div>
              <div className="w-40 bg-blue-800 rounded-full h-3">
                <motion.div 
                  className="bg-white h-3 rounded-full transition-all duration-500 ease-out"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentQuestion / (quizData.total_questions - 1)) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="text-xs text-blue-200 mt-1">
                {Math.round((currentQuestion / (quizData.total_questions - 1)) * 100)}% Complete
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl text-gray-800 leading-relaxed">{currentQ.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentQ.options.map((option, index) => {
                    const isSelected = selectedAnswers[currentQuestion] === index
                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.02] ${
                          isSelected 
                            ? "border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 shadow-lg" 
                            : "border-gray-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 text-gray-700"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${
                            isSelected ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="text-lg font-medium">{option}</span>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <div className="flex justify-between items-center p-8 bg-gradient-to-r from-gray-50 to-gray-100">
          <Button 
            onClick={handlePrevious} 
            variant="outline"
            disabled={currentQuestion === 0}
            className="px-6 py-3 text-lg font-semibold border-2"
          >
            ← Previous
          </Button>
          
          <div className="flex gap-3">
            {currentQuestion === quizData.total_questions - 1 ? (
              <Button 
                onClick={handleSubmit}
                disabled={!hasAnswered}
                className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg"
              >
                🎯 Submit Quiz
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={!hasAnswered}
                className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                Next →
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}