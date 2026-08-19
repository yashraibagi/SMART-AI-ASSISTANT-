from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def ask_ai(prompt, task="question"):

    # Task-specific instructions
    if task == "summarize":
        prompt = f"""
Summarize the following text clearly and concisely.

Text:
{prompt}
"""

    elif task == "generate":
        prompt = f"""
Generate high-quality content based on the following request.

Text:
{prompt}
"""

    elif task == "analyze":
        prompt = f"""
Analyze the following text carefully.

Provide:

1. Key points
2. Important information
3. Main insights
4. Possible issues or concerns
5. A short conclusion

Text:
{prompt}
"""

    elif task == "suggest":
        prompt = f"""
Analyze the following situation or text and provide useful,
practical suggestions.

Provide:

1. Key observation
2. Recommended actions
3. Practical tips
4. Possible improvements

Keep the suggestions clear and actionable.

Text:
{prompt}
"""

    # General AI instructions
    system_prompt = """
You are a helpful AI assistant.

Structure your responses clearly:

- Use numbered points (1., 2., 3.) for step-by-step procedures.
- Use bullet points (-) for lists.
- Use ## for main headings.
- Use ### for subheadings.
- Keep paragraphs short.
- Use Markdown formatting.
- Use code blocks with language specification when providing code.
- Use **bold** for important information.
- Break long answers into clear sections.
- Give accurate, useful and easy-to-understand answers.
"""

    final_prompt = f"""
{system_prompt}

User request:

{prompt}
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash",
        contents=final_prompt
    )

    return response.text