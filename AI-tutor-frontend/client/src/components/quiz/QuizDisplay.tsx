import * as React from "react"
import { useState } from "react"
import { CheckCircle, XCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

  if (showResults) {
    const score = getScore()
    const percentage = getScorePercentage()
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-center">Quiz Results</h2>
            <p className="text-center text-gray-600 mt-2">{quizData.task_title}</p>
          </div>
          
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">{score}/{quizData.total_questions}</div>
              <div className="text-2xl font-semibold mb-2">{percentage}%</div>
              <Badge variant={percentage >= 70 ? "default" : "destructive"} className="text-lg px-4 py-2">
                {percentage >= 70 ? "Well Done!" : "Keep Studying!"}
              </Badge>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {quizData.questions.map((question, index) => {
                const isCorrect = selectedAnswers[index] === question.correct_answer
                return (
                  <Card key={index} className={isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        Question {index + 1}
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium mb-3">{question.question}</p>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => {
                          let optionClass = "p-2 rounded border"
                          if (optionIndex === question.correct_answer) {
                            optionClass += " bg-green-100 border-green-300 text-green-800"
                          } else if (optionIndex === selectedAnswers[index] && !isCorrect) {
                            optionClass += " bg-red-100 border-red-300 text-red-800"
                          } else {
                            optionClass += " bg-gray-50 border-gray-200"
                          }
                          
                          return (
                            <div key={optionIndex} className={optionClass}>
                              {String.fromCharCode(65 + optionIndex)}. {option}
                            </div>
                          )
                        })}
                      </div>
                      <p className="mt-3 text-sm text-gray-600 italic">{question.explanation}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
          
          <div className="flex justify-center gap-3 p-6 border-t bg-gray-50">
            <Button onClick={handleRestart} variant="outline" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </Button>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = quizData.questions[currentQuestion]
  const hasAnswered = selectedAnswers[currentQuestion] !== -1

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Quiz: {quizData.task_title}</h2>
              <p className="text-gray-600">Question {currentQuestion + 1} of {quizData.total_questions}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Progress</div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / quizData.total_questions) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{currentQ.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentQ.options.map((option, index) => {
                  const isSelected = selectedAnswers[currentQuestion] === index
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected 
                          ? "border-blue-500 bg-blue-50 text-blue-900" 
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-between p-6 border-t bg-gray-50">
          <Button 
            onClick={handlePrevious} 
            variant="outline"
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {currentQuestion === quizData.total_questions - 1 ? (
              <Button 
                onClick={handleSubmit}
                disabled={!hasAnswered}
                className="bg-green-600 hover:bg-green-700"
              >
                Submit Quiz
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={!hasAnswered}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}