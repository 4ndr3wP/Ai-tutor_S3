import { useEffect, useRef, useState } from "react";
import ChatInput from "./components/chat/chat-input";
import ChatMessages from "./components/chat/chat-messages";
import ChatPrompts from "./components/chat/chat-prompts";
import { useScrollBottom } from "./hooks/use-scroll-bottom";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { AppSidebar } from "./components/sidebar/app-sidebar";
import { MathJaxContext } from "better-react-mathjax";
import axios from "axios";
import { getApiUrl, API_CONFIG } from "./lib/api";

export interface Message {
  id: number;
  text: string;
  sender: "user" | "assistant";
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  const { messagesEndRef, scrollToBottom } = useScrollBottom();
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [inputText, setInputText] = useState<string>("");
  const [sessionId] = useState<string>(() => {
    let existingSessionId = sessionStorage.getItem("session_id");
    if (!existingSessionId) {
      existingSessionId = generateUUID();
      sessionStorage.setItem("session_id", existingSessionId);
    }
    return existingSessionId;
  });

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleSubmit = async (
    message: string,
    setMessage: React.Dispatch<React.SetStateAction<string>>,
    resetHeight: () => void
  ) => {
    if (!message.trim()) return;

    const userMessageId = messages.length + 1;
    const assistantMessageId = userMessageId + 1;

    setMessages((prevMessages) => [
      ...prevMessages,
      { id: userMessageId, text: message, sender: "user" },
      { id: assistantMessageId, text: "", sender: "assistant" }, // Placeholder for assistant
    ]);

    setMessage("");
    resetHeight();

    try {
      setIsStreaming(true);
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // const res = await axios.post("http://10.164.18.48:8000/query", { // Original server endpoint
      const res = await axios.post(getApiUrl(API_CONFIG.ENDPOINTS.QUERY), { // Apple Silicon M4 Max optimized backend
        query: message,
        size: API_CONFIG.DEFAULT_PARAMS.size,
        session_id: sessionId,
      }, {
        timeout: API_CONFIG.TIMEOUT, // Extended timeout for local LLM processing
      });

      const responseText = res.data?.response;
      if (!responseText || typeof responseText !== "string") {
        throw new Error("Invalid response from server");
      }

      const CHUNK_SIZE = 10;
      const CHUNK_DELAY = 10; // ms

      for (let i = 0; i < responseText.length; i += CHUNK_SIZE) {
        if (signal.aborted) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, CHUNK_DELAY));
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, text: responseText.slice(0, i + CHUNK_SIZE) }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("API error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, text: "Something went wrong. Please try again." }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Quiz modal state
  const [showQuizModal, setShowQuizModal] = useState(false)

  const handleQuizClick = () => {
    console.log("Quiz button clicked!") // Debug log
    setShowQuizModal(true)
  }

  return (
    <MathJaxContext config={{
      tex2jax: { inlineMath: [["$", "$"], ["\\(", "\\)"]] }
    }}>
      <SidebarProvider>
        <AppSidebar 
          showQuizModal={showQuizModal}
          setShowQuizModal={setShowQuizModal}
        />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 sticky bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
            <div className="flex items-center gap-3 px-6">
              <SidebarTrigger className="text-white hover:bg-white/20" />
              <div className="h-8 w-px bg-white/30" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold">🧠</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">SmartNotes AI</h1>
                  <p className="text-sm text-blue-100">Your Personal Learning Assistant</p>
                </div>
              </div>
            </div>
            <div className="ml-auto px-6">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-white/20 rounded-full">
                  <span className="text-sm font-medium">AI Assistant</span>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </header>
          <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="flex-1 overflow-y-auto">
              {messages.length > 0 ? (
                <ChatMessages messages={messages} isStreaming={isStreaming} />
              ) : (
                <ChatPrompts onQuizClick={handleQuizClick} />
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="w-full mx-auto max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl mb-6">
              <div className="flex flex-col items-center gap-3">
                <ChatInput
                  handleSubmit={handleSubmit}
                  isStreaming={isStreaming}
                  handleStopGeneration={handleStopGeneration}
                  inputText={inputText}
                  setInputText={setInputText}
                />
                <p className="text-muted-foreground text-xs flex items-center gap-1">
                  <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                  AI can make mistakes. Check important info.
                </p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </MathJaxContext>
  );
}

export default App;
