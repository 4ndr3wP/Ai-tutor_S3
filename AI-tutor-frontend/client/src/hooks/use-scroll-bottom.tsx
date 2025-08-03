import { useRef } from "react";

export const useScrollBottom = () => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        (messagesEndRef.current as never as HTMLDivElement)?.scrollIntoView({ behavior: "smooth" });
    };

    return {
        messagesEndRef,
        scrollToBottom
    }

}