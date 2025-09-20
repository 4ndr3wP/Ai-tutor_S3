import {
  Bot,
  User,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Clock
} from "lucide-react";

import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { useState } from "react";
import { Message } from "@/App";
import { AnimatePresence, motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { MathJax } from "better-react-mathjax";

interface ChatMessagesProps {
  messages: Message[];
  isStreaming: boolean;
}

function ChatMessages({ messages, isStreaming }: ChatMessagesProps) {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="pt-8 pb-4 px-4 mx-auto max-w-4xl space-y-6">
      <AnimatePresence>
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="flex gap-4"
          >
            {/* USER MESSAGE */}
            {message.sender === "user" && (
              <>
                <div className="flex-1" />
                <div className="flex gap-3 max-w-[80%]">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-br-md px-6 py-4 shadow-lg">
                    <p className="text-sm font-medium leading-relaxed">{message.text}</p>
                  </div>
                  <Avatar className="w-10 h-10 border-2 border-blue-200">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold">
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                </div>
              </>
            )}

            {/* ASSISTANT MESSAGE */}
            {message.sender === "assistant" && (
              <>
                <Avatar className="w-10 h-10 border-2 border-gray-200 shadow-sm">
                  <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                    <Bot className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 max-w-[80%]">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-3 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-semibold text-gray-800">OnTrack Assistant</span>
                          {isStreaming && message.text === "" && (
                            <div className="flex items-center gap-1 text-xs text-blue-600">
                              <Clock className="w-3 h-3 animate-spin" />
                              Thinking...
                            </div>
                          )}
                        </div>
                        {message.text && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(message.id, message.text)}
                              className="h-7 px-2 text-xs hover:bg-blue-100"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              {copiedId === message.id ? "Copied!" : "Copy"}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-green-100">
                              <ThumbsUp className="w-3 h-3 text-green-600" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-red-100">
                              <ThumbsDown className="w-3 h-3 text-red-600" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-4">
                      {isStreaming && message.text === "" ? (
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                              <div
                                key={i}
                                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.2}s` }}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">Generating response...</span>
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <div className="prose prose-sm max-w-none leading-relaxed text-gray-800">
                            <MathJax>
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkBreaks]}
                                components={{
                                  h1: ({ node, ...props }) => (
                                    <h1 className="text-xl font-bold text-gray-900 mt-4 mb-3 flex items-center gap-2" {...props} />
                                  ),
                                  h2: ({ node, ...props }) => (
                                    <h2 className="text-lg font-semibold text-gray-800 mt-4 mb-2 flex items-center gap-2" {...props} />
                                  ),
                                  h3: ({ node, ...props }) => (
                                    <h3 className="text-base font-medium text-gray-700 mt-3 mb-2" {...props} />
                                  ),
                                  ul: ({ node, ...props }) => (
                                    <ul className="list-disc list-inside space-y-1 my-3" {...props} />
                                  ),
                                  ol: ({ node, ...props }) => (
                                    <ol className="list-decimal list-inside space-y-1 my-3" {...props} />
                                  ),
                                  li: ({ node, ...props }) => (
                                    <li className="text-gray-700" {...props} />
                                  ),
                                  p: ({ node, ...props }) => (
                                    <p className="mb-3 text-gray-800 leading-relaxed" {...props} />
                                  ),
                                  code: ({ node, ...props }) => (
                                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-blue-700" {...props} />
                                  ),
                                  pre: ({ node, ...props }) => (
                                    <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto my-3" {...props} />
                                  ),
                                }}
                              >
                                {message.text}
                              </ReactMarkdown>
                            </MathJax>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default ChatMessages;
