from ai_service import ask_ai
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AssistantRequest(BaseModel):
    text:str
    task:str ="question"

@app.get("/")
def home():
    return{
        "message":"Ai Smart Assistant is running" 
          }

@app.post("/api/assistant")
def assistant(request:AssistantRequest):
    answer=ask_ai(request.text,request.task)

    return{
        "success":True,
        "answer":answer
    }
