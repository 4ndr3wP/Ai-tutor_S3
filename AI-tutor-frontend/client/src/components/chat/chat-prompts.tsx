function ChatPrompts() {
    return (
        <div className="mx-auto max-w-2xl flex flex-col justify-center items-center gap-8 pt-16">
            <div className="max-w-2xl text-center">
                <h1 className="font-bold text-5xl mb-4">
                    <span className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-700 bg-clip-text text-transparent">
                        OnTrack
                    </span>
                    <span className="text-slate-700 ml-2">
                        Assistant
                    </span>
                </h1>
            </div>
            <div className="flex flex-col gap-4 text-center max-w-xl">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="font-semibold text-lg text-blue-800 mb-2">Ask me about</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm text-blue-700">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span>Task requirements</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                            <span>Project deliverables</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span>Assignment guidance</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                            <span>Submission formats</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatPrompts