import { useState, useEffect } from "react"
import { SendIcon, StopCircleIcon, Sparkles, Mic, Paperclip } from "lucide-react"
import { motion } from 'framer-motion'
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import { useAdjustHeight } from "@/hooks/use-adjust-height"

interface ChatInputProps {
    handleSubmit: (message: string, setMessage: React.Dispatch<React.SetStateAction<string>>, resetHeight: () => void) => Promise<void>
    isStreaming: boolean
    handleStopGeneration: () => void
    inputText: string
    setInputText: React.Dispatch<React.SetStateAction<string>>
}

function ChatInput({ handleSubmit, isStreaming, handleStopGeneration, inputText, setInputText }: ChatInputProps) {
    const [message, setMessage] = useState(inputText)
    const [isFocused, setIsFocused] = useState(false)
    const { textareaRef, adjustHeight, resetHeight } = useAdjustHeight()
    
    useEffect(() => {
        setMessage(inputText)
        adjustHeight()
    }, [inputText])

    const handleMessageOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        adjustHeight()
        setMessage(e.target.value)
        setInputText(e.target.value)
    }

    const handleMessageSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent> | React.KeyboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault()
        if (message.trim()) {
            handleSubmit(message, setMessage, resetHeight)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleMessageSubmit(e)
        }
    }

    return (
        <motion.div 
            className={`relative bg-white border-2 rounded-2xl shadow-lg transition-all duration-300 ${
                isFocused ? 'border-blue-400 shadow-xl shadow-blue-100' : 'border-gray-200'
            }`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Input Area */}
            <div className="relative p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-1 relative">
                        <motion.div
                            initial={{ height: "auto" }}
                            animate={{ height: textareaRef.current?.style.height }}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        >
                            <Textarea
                                ref={textareaRef}
                                value={message}
                                onChange={handleMessageOnChange}
                                onKeyDown={handleKeyDown}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                disabled={isStreaming}
                                className="resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 overflow-y-auto text-gray-800 placeholder:text-gray-400 min-h-[20px] max-h-[200px]"
                                placeholder="Type here..."
                                rows={1}
                            />
                        </motion.div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            disabled={isStreaming}
                        >
                            <Paperclip className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            disabled={isStreaming}
                        >
                            <Mic className="h-4 w-4" />
                        </Button>
                        
                        {isStreaming ? (
                            <Button 
                                onClick={handleStopGeneration} 
                                variant="destructive" 
                                size="icon"
                                className="h-10 w-10 rounded-xl shadow-lg"
                            >
                                <StopCircleIcon className="h-5 w-5" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleMessageSubmit}
                                disabled={message.trim().length === 0}
                                className={`h-10 w-10 rounded-xl shadow-lg transition-all duration-300 ${
                                    message.trim().length > 0 
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 scale-100' 
                                        : 'bg-gray-300 scale-95'
                                }`}
                            >
                                <SendIcon className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 pb-3 text-xs text-gray-500">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        AI-Powered
                    </span>
                    <span>{message.length}/2000</span>
                </div>
                {message.length > 0 && (
                    <span>Press <kbd className="bg-gray-100 px-1 py-0.5 rounded text-xs">↵</kbd> to send</span>
                )}
            </div>
        </motion.div>
    )
}

export default ChatInput
