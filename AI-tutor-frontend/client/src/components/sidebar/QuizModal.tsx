import * as React from "react"
import { X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Generate Quiz</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Select an OnTrack task to generate a multiple choice quiz based on its content.
          </p>
          
          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {onTrackTasks.map((task) => (
              <Card 
                key={task.id} 
                className="cursor-pointer hover:shadow-md transition-shadow border hover:border-blue-300"
                onClick={() => onTaskSelect(task)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{task.title}</CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    OnTrack Task
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600">
                    Click to generate quiz questions based on this task's requirements and content.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}