import {
  Edit3 as Edit3Icon,
  Sparkles as SparklesIcon,
  WandSparkles as WandSparklesIcon,
  Copy,
  Info as InfoIcon,
  Key as KeyIcon,
  LogIn as LogInIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { useState } from "react";
import { Message } from "@/App";
import ChatProgressSteps from "./chat-progress-steps";
import { AnimatePresence, motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { MathJax } from "better-react-mathjax";  // <--- Imported for MathJax

interface ShowEdit {
  id: number;
  show: boolean;
}

interface ChatMessagesProps {
  messages: Message[];
  isStreaming: boolean;
}

function ChatMessages({ messages, isStreaming }: ChatMessagesProps) {
  const [showEdit, setShowEdit] = useState<ShowEdit | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const toggleShowEdit = (id: number, value: boolean) => {
    setShowEdit({ id, show: value });
  };

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="pt-12 mx-auto max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl mb-4">
      {messages.map((message) => {
        return (
          <div key={message.id} className="flex flex-col gap-2">
            {/* USER MESSAGE */}
            {message.sender === "user" && (
              <div
                onMouseEnter={() => toggleShowEdit(message.id, true)}
                onMouseLeave={() => toggleShowEdit(message.id, false)}
                className="flex items-start gap-4 p-4 relative"
              >
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    S
                  </AvatarFallback>
                </Avatar>
                <p className="break-words whitespace-pre-wrap">{message.text}</p>
                {showEdit?.show && showEdit.id === message.id && (
                  <Button
                    variant={"ghost"}
                    size={"icon"}
                    className="absolute right-0 bottom-0"
                  >
                    <Edit3Icon className="text-muted-foreground" />
                  </Button>
                )}
              </div>
            )}

            {/* ASSISTANT MESSAGE */}
            {message.sender === "assistant" && (
              <div className="px-4 flex items-start gap-4 rounded-lg mb-8">
                <Avatar>
                  <AvatarFallback>
                    <SparklesIcon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="w-full flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center gap-1">
                      <InfoIcon className="w-4 h-4 text-muted-foreground" />
                      Results
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        variant={"ghost"}
                        size={"sm"}
                        onClick={() => handleCopy(message.id, message.text)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        {copiedId === message.id ? "Copied" : "Copy"}
                      </Button>
                      <Button variant={"ghost"} size={"sm"}>
                        <WandSparklesIcon className="w-4 h-4 mr-1" />
                        Show Steps
                      </Button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isStreaming && message.text === "" ? (
                      <ChatProgressSteps key={"progress-steps"} />
                    ) : (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="prose prose-base dark:prose-invert max-w-none leading-relaxed">
                          {/* 👇👇 Injected MathJax wrapper around ReactMarkdown */}
                          <MathJax>
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm, remarkBreaks]}
                              components={{
                                h2: ({ node, ...props }) => (
                                  <h2 className="mt-6 mb-2 text-xl flex items-center gap-2">
                                    <KeyIcon className="h-5 w-5 text-primary" />
                                    <span {...props} />
                                  </h2>
                                ),
                                h3: ({ node, ...props }) => (
                                  <h3 className="mt-4 mb-1 text-lg flex items-center gap-2">
                                    <LogInIcon className="h-4 w-4 text-muted-foreground" />
                                    <span {...props} />
                                  </h3>
                                ),
                                li: ({ node, ...props }) => (
                                  <li className="mb-1 list-disc ml-4" {...props} />
                                ),
                              }}
                            >
                              {message.text}
                            </ReactMarkdown>
                          </MathJax>
                          {/* 👆👆 */}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ChatMessages;
