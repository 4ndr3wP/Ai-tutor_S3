// API Configuration for Apple Silicon M4 Max optimized backend
export const API_CONFIG = {
  // Backend running on Apple Silicon with MPS acceleration and Ollama
  BASE_URL: "http://localhost:8002",  // Changed from 8001 to 8002
  
  // Endpoints
  ENDPOINTS: {
    QUERY: "/query",
    QUIZ: "/generate-quiz", // Add quiz endpoint
  },
  
  // Default request parameters optimized for Apple Silicon performance
  DEFAULT_PARAMS: {
    size: 1, // Number of documents to retrieve
    temperature: 0.1, // Low temperature for consistent responses
  },
  
  // Request timeout (increased for local LLM processing)
  TIMEOUT: 60000, // 60 seconds for local inference
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Add quiz generation function
export const generateQuiz = async (taskId: string, taskTitle: string, filename: string, numQuestions: number = 5) => {
  const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.QUIZ), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      task_id: taskId,
      task_title: taskTitle,
      filename: filename,
      num_questions: numQuestions
    }),
  });

  if (!response.ok) {
    throw new Error(`Quiz generation failed: ${response.statusText}`);
  }

  return response.json();
};
