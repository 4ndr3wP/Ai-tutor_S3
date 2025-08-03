import { BotIcon, FileIcon, LoaderCircleIcon, SearchIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { motion } from "motion/react"

function ChatProgressSteps() {
    const [progressSteps, setProgressSteps] = useState([
        {
            icon: <SearchIcon className="h-4 w-4" />,
            text: "Searching examples and definitions",
            active: true,
            completed: false
        },
        {
            icon: <FileIcon className="h-4 w-4" />,
            text: "Considering sources",
            active: false,
            completed: false
        },
        {
            icon: <BotIcon className="h-4 w-4" />,
            text: "Generating response",
            active: false,
            completed: false
        }
    ])

    // Simulate progress - Should be removed
    useEffect(() => {
        setTimeout(() => {
            setTimeout(() => {
                setProgressSteps((prev) => {
                    return prev.map((step) => {
                        if (step.text === "Generating response") {
                            return { ...step, completed: true, active: true }
                        }
                        return step
                    })
                })
            }, 4000)

            setTimeout(() => {
                setProgressSteps((prev) => {
                    return prev.map((step) => {
                        if (step.text === "Considering sources") {
                            return { ...step, completed: true, active: true }
                        } else if (step.text === "Generating response") {
                            return { ...step, active: true }
                        }
                        return step
                    })
                })
            }, 2000)

            setProgressSteps((prev) => {
                return prev.map((step) => {
                    if (step.text === "Searching examples and definitions") {
                        return { ...step, completed: true }
                    } else if (step.text === "Considering sources") {
                        return { ...step, active: true }
                    }
                    return step
                })
            })
        }, 2000)
    })

    return (
        <motion.div
            exit={{ opacity: 0 }}
            className="border rounded-lg p-4 bg-muted flex flex-col gap-4">
            {
                progressSteps.map((step, index) => {
                    if (step.active) {
                        return (
                            <motion.div
                                key={index}
                                className="flex items-center gap-2"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                            >
                                {step.completed ? step.icon : <LoaderCircleIcon className="h-4 w-4 animate-spin text-green-600" />}
                                <p className="text-sm">{step.text}</p>
                            </motion.div>
                        )
                    }
                })
            }
        </motion.div>
    )
}

export default ChatProgressSteps