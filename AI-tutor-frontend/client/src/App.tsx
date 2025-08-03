import { useEffect, useRef, useState } from "react";
import ChatInput from "./components/chat/chat-input";
import ChatMessages from "./components/chat/chat-messages";
import ChatPrompts from "./components/chat/chat-prompts";
import { useScrollBottom } from "./hooks/use-scroll-bottom";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { AppSidebar } from "./components/sidebar/app-sidebar";
// import { Button } from "./components/ui/button";
// import { Star } from "lucide-react";
import axios from "axios";

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

  const { messagesEndRef, scrollToBottom } = useScrollBottom();
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

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
  
    // 1. Add user message
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: userMessageId, text: message, sender: "user" },
      { id: assistantMessageId, text: "", sender: "assistant" }, // Placeholder for response
    ]);
  
    setMessage("");
    resetHeight();
  
    try {
      setIsStreaming(true);
  
      const res = await axios.post("http://10.72.191.93:8000/query", {
        query: message,
        collection_name: "chroma_db", // Make this dynamic if needed
      });
  
      // Updated to handle response correctly
      const responseText = res.data?.response;
      if (!responseText || typeof responseText !== "string") {
        throw new Error("Invalid response from server");
      }
  
      // Stream response character by character
      const CHUNK_SIZE = 10;
const CHUNK_DELAY = 10; // ms

for (let i = 0; i < responseText.length; i += CHUNK_SIZE) {
  await new Promise((resolve) => setTimeout(resolve, CHUNK_DELAY));
  setMessages((prev) =>
    prev.map((msg) =>
      msg.id === assistantMessageId
        ? { ...msg, text: responseText.slice(0, i + CHUNK_SIZE) }
        : msg
    )
  );
}
    } 
    catch (error) {
      console.error("API error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, text: "Something went wrong. Please try again." }
            : msg
        )
      );
    }
     finally {
      setIsStreaming(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 sticky">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
          </div>
          <div>
            <p>Deakin AI</p>
          </div>
          <div className="ml-auto px-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="hidden font-medium text-muted-foreground md:inline-block">
                Deakin University
              </div>
              {/* <Button variant="ghost" size="icon" className="h-7 w-7">
                <Star />
              </Button> */}
            </div>
          </div>
        </header>
        <div className="flex flex-col h-[calc(100vh-3.5rem)]">
          <div className="flex-1 overflow-y-auto">
            {messages.length > 0 ? (
              <ChatMessages messages={messages} isStreaming={isStreaming} />
            ) : (
              <ChatPrompts />
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="w-full mx-auto max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl mb-4">
            <div className="flex flex-col items-center gap-2">
              <ChatInput
                handleSubmit={handleSubmit}
                isStreaming={isStreaming}
                handleStopGeneration={handleStopGeneration}
              />
              <p className="text-muted-foreground text-xs">
                AI can make mistakes. Check important info.
              </p>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
