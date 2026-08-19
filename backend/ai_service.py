from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def ask_ai(prompt, task="question"):

    if task == "summarize":
        prompt = f"""
Summarize the following text clearly and concisely.

Text:
{prompt}
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt
    )

    return response.text