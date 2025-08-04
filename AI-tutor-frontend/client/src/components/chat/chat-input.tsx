import { useState, useEffect } from "react"
import { SendIcon, StopCircleIcon, WandSparklesIcon } from "lucide-react"
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
        handleSubmit(message, setMessage, resetHeight)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleMessageSubmit(e)
        }
    }

    return (
        <div className="border sm:rounded-md bg-gray-100 p-2 w-full">
            <div className="relative">
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
                        disabled={isStreaming}
                        className="pl-8 resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 overflow-y-auto"
                        placeholder="Ask AI a question or make request"
                    />
                </motion.div>
                <WandSparklesIcon className="absolute top-3 left-2 text-muted-foreground h-4 w-4" />
            </div>

            <div className="flex items-end justify-between">
                <div className="text-xs text-gray-400 ml-2 flex flex-row gap-4 justify-between w-full">
                    <p>{message.length}/2000</p>
                    {message.length > 0 && (
                        <p className="mr-4">Use <code className="bg-muted">shift + enter</code> for new line</p>
                    )}
                </div>

                {isStreaming ? (
                    <Button onClick={handleStopGeneration} variant={"default"} size="icon">
                        <StopCircleIcon className="animate-spin" />
                    </Button>
                ) : (
                    <Button
                        onClick={handleMessageSubmit}
                        variant={message.length > 0 ? "default" : "ghost"}
                        size="icon"
                        disabled={message.length === 0}
                    >
                        <SendIcon />
                    </Button>
                )}
            </div>
        </div>
    )
}

export default ChatInput
