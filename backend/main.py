from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ai_service import ask_ai

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AssistantRequest(BaseModel):
    text: str
    task: str = "question"


@app.get("/")
def home():
    return {
        "message": "AI Smart Assistant is running"
    }


@app.post("/api/assistant")
def assistant(request: AssistantRequest):
    try:
        answer = ask_ai(request.text, request.task)

        return {
            "success": True,
            "answer": answer
        }

    except Exception as e:
        print("AI ERROR:", e)

        return {
            "success": False,
            "answer": "⚠️ The AI service is temporarily unavailable because the Gemini API quota has been exceeded. Please try again later."
        }