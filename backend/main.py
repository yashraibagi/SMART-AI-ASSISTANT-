from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ai_service import ask_ai

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://smart-ai-assistant-io4g.vercel.app",
    ],
    allow_credentials=True,
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
    answer = ask_ai(request.text, request.task)

    return {
        "success": True,
        "answer": answer
    }