import { useRef } from "react";

export const useAdjustHeight = () => {
    const MAX_HEIGHT = 250;
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const adjustHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, MAX_HEIGHT) + 'px';
        }
    };

    const resetHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
        }
    }

    return {
        textareaRef,
        adjustHeight,
        resetHeight
    }

}