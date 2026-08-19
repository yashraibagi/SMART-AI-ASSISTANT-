import { useState, useEffect, useRef } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";

const API_URL = import.meta.env.DEV
  ? "http://127.0.0.1:8000"
  : "https://smart-ai-assistant-backend-75ey.onrender.com";

function App() {
  const [text, setText] = useState("");
  const [task, setTask] = useState("question");
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chatHistory");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatHistory", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const generateId = () => {
    return (
      Date.now().toString(36) +
      Math.random().toString(36).substring(2)
    );
  };

  const getTaskEmoji = () => {
    const emojis = {
      question: "🤖",
      summarize: "📝",
      generate: "✨",
      analyze: "🔍",
      suggest: "💡",
    };

    return emojis[task] || "🤖";
  };

  const getTaskLabel = () => {
    const labels = {
      question: "Ask AI",
      summarize: "Summarize",
      generate: "Generate",
      analyze: "Analyze",
      suggest: "Get Suggestions",
    };

    return labels[task] || "Ask AI";
  };

  const handleAskAI = async () => {
    if (!text.trim()) {
      setError("⚠️ Please enter something first.");

      textareaRef.current?.classList.add("shake");

      setTimeout(() => {
        textareaRef.current?.classList.remove("shake");
      }, 500);

      return;
    }

    setError("");

    const userMessage = {
      id: generateId(),
      type: "user",
      content: text,
      task: task,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentInput = text;

    setText("");
    setLoading(true);

    const aiMessageId = generateId();

    const tempAiMessage = {
      id: aiMessageId,
      type: "ai",
      content: "⏳ Thinking...",
      task: task,
      timestamp: new Date().toISOString(),
      status: "loading",
    };

    setMessages((prev) => [...prev, tempAiMessage]);

    try {
      const response = await fetch(
        `${API_URL}/api/assistant`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            text: currentInput,
            task: task,
          }),
        }
      );

      if (!response.ok) {
        let errorMsg = `Server error (${response.status})`;

        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorMsg;
        } catch (e) {
          errorMsg = response.statusText || errorMsg;
        }

        throw new Error(errorMsg);
      }

      const data = await response.json();

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: data.answer || "No response received.",
                status: "sent",
                timestamp: new Date().toISOString(),
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error:", error);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                content: `❌ ${
                  error.message ||
                  "Something went wrong. Please try again."
                }`,
                status: "error",
                timestamp: new Date().toISOString(),
              }
            : msg
        )
      );

      setError(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleClear = () => {
    if (messages.length === 0) return;

    if (
      window.confirm(
        "🗑️ Clear all conversation history?"
      )
    ) {
      setMessages([]);
      setText("");
      setError("");

      localStorage.removeItem("chatHistory");

      textareaRef.current?.focus();
    }
  };

  const handleClearInput = () => {
    setText("");
    setError("");

    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (
      (e.ctrlKey || e.metaKey) &&
      e.key === "Enter"
    ) {
      e.preventDefault();
      handleAskAI();
    }

    if (e.key === "Escape") {
      handleClearInput();
    }
  };

  const getMessageStyle = (message) => {
    if (message.status === "loading") {
      return "message-loading";
    }

    if (message.status === "error") {
      return "message-error";
    }

    return "";
  };

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);

      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  };

  return (
    <div className="app">

      <header className="header">
        <div className="header-content">

          <div className="header-left">

            <div className="header-logo">
              🤖
            </div>

            <div className="header-title">
              <h1>AI Smart Assistant</h1>

              <p>
                Your intelligent AI-powered assistant
              </p>
            </div>

          </div>

          <div className="header-right">

            {messages.length > 0 && (
              <button
                className="clear-history-btn"
                onClick={handleClear}
              >
                🗑️ Clear History
              </button>
            )}

            <span className="status-badge">

              <span
                className={`status-dot ${
                  loading
                    ? "loading"
                    : "online"
                }`}
              ></span>

              {loading
                ? "Thinking..."
                : "Online"}

            </span>

          </div>

        </div>
      </header>

      <main className="container">

        <div className="input-area">

          {error && (
            <div
              className="error-banner"
              onClick={() => setError("")}
            >
              <span className="error-icon">
                ❌
              </span>

              <span className="error-text">
                {error}
              </span>

              <button className="error-close">
                ✕
              </button>
            </div>
          )}

          <div className="task-section">

            <div className="task-options-grid">

              {[
                {
                  value: "question",
                  label: "🤖 Ask AI",
                },
                {
                  value: "summarize",
                  label: "📝 Summarize",
                },
                {
                  value: "generate",
                  label: "✨ Generate",
                },
                {
                  value: "analyze",
                  label: "🔍 Analyze",
                },
                {
                  value: "suggest",
                  label: "💡 Suggest",
                },
              ].map((option) => (
                <button
                  key={option.value}
                  className={`task-option-card ${
                    task === option.value
                      ? "selected"
                      : ""
                  }`}
                  data-task={option.value}
                  onClick={() =>
                    setTask(option.value)
                  }
                >
                  {option.label}
                </button>
              ))}

            </div>

          </div>

          <div className="input-section">

            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                task === "summarize"
                  ? "📝 Paste text to summarize... (Ctrl+Enter to submit)"
                  : task === "generate"
                  ? "✨ Describe what to generate... (Ctrl+Enter to submit)"
                  : task === "analyze"
                  ? "🔍 Paste text to analyze... (Ctrl+Enter to submit)"
                  : task === "suggest"
                  ? "💡 Describe your situation... (Ctrl+Enter to submit)"
                  : "🤖 Ask me anything... (Ctrl+Enter to submit)"
              }
              disabled={loading}
              className="input-textarea"
              rows={2}
            />

          </div>

          <div className="button-section">

            <button
              className="ask-button"
              onClick={handleAskAI}
              disabled={
                loading ||
                !text.trim()
              }
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Thinking...
                </>
              ) : (
                <>
                  {task === "summarize"
                    ? "📝 Summarize"
                    : task === "generate"
                    ? "✨ Generate"
                    : task === "analyze"
                    ? "🔍 Analyze"
                    : task === "suggest"
                    ? "💡 Suggest"
                    : "🤖 Ask AI"}
                </>
              )}
            </button>

            <button
              className="clear-button"
              onClick={handleClearInput}
              disabled={loading}
            >
              🗑️ Clear
            </button>

            {text.length > 0 && (
              <span className="char-counter">
                {text.length}
              </span>
            )}

          </div>

          <div className="shortcuts-hint">

            <span>
              <kbd>Ctrl</kbd> +{" "}
              <kbd>Enter</kbd> to submit
            </span>

            <span>
              <kbd>Esc</kbd> to clear
            </span>

          </div>

        </div>

        <div className="messages-container">

          {messages.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                🤖
              </div>

              <h2>
                Welcome to AI Smart Assistant
              </h2>

              <p>
                Your intelligent conversation
                partner
              </p>

              <div className="example-questions">

                <p>💡 Try asking:</p>

                <div className="example-chips">

                  <button
                    onClick={() => {
                      setText(
                        "What is machine learning?"
                      );
                      textareaRef.current?.focus();
                    }}
                  >
                    What is ML?
                  </button>

                  <button
                    onClick={() => {
                      setText(
                        "How to make a perfect pizza?"
                      );
                      textareaRef.current?.focus();
                    }}
                  >
                    How to make pizza?
                  </button>

                  <button
                    onClick={() => {
                      setText(
                        "Write a Python function to sort a list"
                      );
                      textareaRef.current?.focus();
                    }}
                  >
                    Write Python code
                  </button>

                  <button
                    onClick={() => {
                      setText(
                        "Explain quantum computing in simple terms"
                      );
                      textareaRef.current?.focus();
                    }}
                  >
                    Quantum computing
                  </button>

                </div>

              </div>

            </div>

          ) : (

            messages.map((msg, index) => (

              <div
                key={msg.id || index}
                className={`message ${
                  msg.type
                } ${getMessageStyle(msg)}`}
              >

                <div className="message-header">

                  <span className="message-avatar">
                    {msg.type === "user"
                      ? "👤"
                      : getTaskEmoji()}
                  </span>

                  <span className="message-label">
                    {msg.type === "user"
                      ? "You"
                      : getTaskLabel()}
                  </span>

                  {msg.task &&
                    msg.type === "ai" && (
                      <span className="message-task-tag">
                        {msg.task}
                      </span>
                    )}

                  <span className="message-time">
                    {formatTime(
                      msg.timestamp
                    )}
                  </span>

                </div>

                <div className="message-content">

                  {msg.type === "ai" &&
                  msg.status === "loading" ? (

                    <div className="loading-dots">

                      <span></span>
                      <span></span>
                      <span></span>

                    </div>

                  ) : (

                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>

                  )}

                </div>

                {msg.type === "ai" &&
                  msg.status === "sent" && (

                    <button
                      className="copy-button"
                      onClick={(e) => {

                        navigator.clipboard.writeText(
                          msg.content
                        );

                        const btn =
                          e.currentTarget;

                        btn.textContent =
                          "✅ Copied!";

                        setTimeout(() => {
                          btn.textContent =
                            "📋 Copy";
                        }, 2000);

                      }}
                    >
                      📋 Copy
                    </button>

                  )}

              </div>

            ))

          )}

          <div ref={messagesEndRef} />

        </div>

      </main>

      <footer>

        <p>
          AI Smart Assistant • Created by Yash •{" "}
          {messages.length} messages
        </p>

      </footer>

    </div>
  );
}

export default App;