import { Brain, MessageCircle, Zap, Award, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"

interface ChatPromptsProps {
  onQuizClick?: () => void
}

export default function ChatPrompts({ onQuizClick }: ChatPromptsProps) {
  const handleQuizClick = () => {
    console.log("Quiz Me Now button clicked!") // Debug log
    if (onQuizClick) {
      onQuizClick()
    } else {
      console.error("onQuizClick prop not provided!")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12">
      {/* Hero Section */}
      <motion.div 
        className="text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <MessageCircle className="h-12 w-12 text-white" />
          </div>
          <motion.div
            className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="h-4 w-4 text-yellow-800" />
          </motion.div>
        </div>
        
        <h1 className="text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            SmartNotes AI
          </span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Your intelligent personal assistant that learns from your notes and documents. 
          Ask questions, get insights, or test your knowledge!
        </p>
      </motion.div>

      <div className="w-full max-w-4xl">
        {/* Quiz Me Button - Hero Feature */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 pointer-events-none"></div>
            <CardHeader className="text-center py-8 relative">
              <motion.div 
                className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Brain className="h-10 w-10 text-white" />
              </motion.div>
              <CardTitle className="text-3xl font-bold text-gray-800 mb-3">
                Ready to Test Your Knowledge? 🧠
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 max-w-2xl mx-auto">
                Challenge yourself with AI-generated quizzes based on your uploaded content.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={handleQuizClick}
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl border-0 cursor-pointer"
                  disabled={false}
                >
                  <Brain className="mr-3 h-6 w-6" />
                  Quiz Me Now!
                  <Award className="ml-3 h-6 w-6" />
                </Button>
              </motion.div>
              
              <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Instant Generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Multiple Choice</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Detailed Explanations</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Simple Call to Action */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">
                Let's chat!
              </h2>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              I've learned from your uploaded documents and notes. 
              Ask me questions, request summaries, or get help understanding any topic!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
