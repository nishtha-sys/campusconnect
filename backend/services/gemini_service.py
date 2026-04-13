import google.generativeai as genai
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


def ask_ai(prompt: str):
    try:
        model = genai.GenerativeModel("gemini-1.0-pro")
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print("Gemini Error:", e)
        return "AI not available"


def summarize_notes(text: str) -> dict:
    prompt = f"""
Summarize these notes and give 3-5 tags.

Reply ONLY in this format:
SUMMARY: your summary here
TAGS: tag1, tag2, tag3

Notes:
{text}
"""

    result = ask_ai(prompt)

    # fallback if AI fails
    if "AI not available" in result:
        return {
            "summary": text[:100],
            "tags": ["general"]
        }

    try:
        summary = result.split("SUMMARY:")[1].split("TAGS:")[0].strip()
        tags = result.split("TAGS:")[1].strip().split(",")

        return {
            "summary": summary,
            "tags": [t.strip() for t in tags]
        }
    except:
        return {
            "summary": result,
            "tags": ["general"]
        }