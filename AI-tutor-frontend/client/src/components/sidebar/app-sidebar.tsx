import * as React from "react"
import {
  MessageCircleQuestion,
  ThumbsUp,
  Brain,
  Loader2 // Add loading icon
} from "lucide-react"
import { FeedbackModal } from "./FeedbackModal"
import { QuizModal } from "./QuizModal"
import { QuizDisplay } from "../quiz/QuizDisplay"
import { NavSecondary } from "@/components/sidebar/nav-secondary"
import { TeamSwitcher } from "@/components/sidebar/team-switcher"
import DeakinLogo from "/logo.png"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { HelpModal } from "./HelpModal"
import { generateQuiz } from "@/lib/api"

const data = {
  teams: [
    {
      name: "OnTrack Assistant",
      logo: DeakinLogo,
      isImage: true,
      plan: "SIT378",
    },
  ],
  navSecondary: [
    {
      title: "Generate Quiz",
      url: "#",
      icon: Brain,
      onClick: "quiz",
    },
    {
      title: "Help",
      url: "#",
      icon: MessageCircleQuestion,
      onClick: "help", 
    },
    {
      title: "Feedback for Us",
      url: "#",
      icon: ThumbsUp,
      onClick: "feedback", 
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [isHelpModalOpen, setHelpModalOpen] = React.useState(false)
  const [isFeedbackModalOpen, setFeedbackModalOpen] = React.useState(false)
  const [isQuizModalOpen, setQuizModalOpen] = React.useState(false)
  const [isQuizDisplayOpen, setQuizDisplayOpen] = React.useState(false)
  const [quizData, setQuizData] = React.useState(null)
  const [isGeneratingQuiz, setIsGeneratingQuiz] = React.useState(false) // Add loading state

  const handleNavSecondaryClick = (item: any) => {
    if (item.onClick === "quiz") {
      setQuizModalOpen(true)
    }
    if (item.onClick === "help") {
      setHelpModalOpen(true)
    }
    if (item.onClick === "feedback") {
      setFeedbackModalOpen(true)
    }
  }

  const handleTaskSelect = async (task: any) => {
    console.log("Selected task:", task)
    setQuizModalOpen(false)
    setIsGeneratingQuiz(true) // Start loading
    
    try {
      // Generate the quiz with 3 questions
      const quizData = await generateQuiz(task.id, task.title, task.filename, 3)
      console.log("Quiz generated successfully:", quizData)
      
      // Store quiz data and show quiz display
      setQuizData(quizData)
      setQuizDisplayOpen(true)
    } catch (error) {
      console.error("Quiz generation failed:", error)
      alert("Failed to generate quiz. Check console for details.")
    } finally {
      setIsGeneratingQuiz(false) // Stop loading
    }
  }

  return (
    <>
      <Sidebar className="border-r-0" {...props}>
        <SidebarHeader>
          <TeamSwitcher teams={data.teams} />
        </SidebarHeader>
        <SidebarContent>
          <NavSecondary
            items={data.navSecondary}
            className="mt-auto"
            onItemClick={handleNavSecondaryClick}
          />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      <HelpModal isOpen={isHelpModalOpen} onClose={() => setHelpModalOpen(false)} />
      <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setFeedbackModalOpen(false)} />
      <QuizModal 
        isOpen={isQuizModalOpen} 
        onClose={() => setQuizModalOpen(false)}
        onTaskSelect={handleTaskSelect}
      />
      
      {/* Loading indicator */}
      {isGeneratingQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <h3 className="text-lg font-semibold">Generating Quiz...</h3>
            <p className="text-gray-600 text-center">
              Please wait while we create your quiz questions.
            </p>
          </div>
        </div>
      )}
      
      {quizData && (
        <QuizDisplay 
          quizData={quizData} 
          onClose={() => {
            setQuizDisplayOpen(false)
            setQuizData(null)
          }}
        />
      )}
    </>
  )
}
