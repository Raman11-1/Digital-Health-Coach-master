import os
import requests
from config import LLM_API_KEY, MODEL_NAME

BASE_URL = "https://api.mistral.ai/v1"

def generate_text(prompt: str) -> str:
    """
    Calls the Mistral AI endpoint and returns the generated text.

    Raises RuntimeError on any failure (network, auth, empty response) so
    callers can decide how to degrade gracefully instead of accidentally
    saving/displaying a raw error string as if it were real AI output.
    """
    url = f"{BASE_URL}/chat/completions"

    headers = {
        "Authorization": f"Bearer {LLM_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": "You are a helpful fitness coach AI."},
            {"role": "user",   "content": prompt}
        ],
        "temperature": 0.7
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(f"[llm_client] Mistral call failed: {e}")
        raise RuntimeError(f"LLM call failed: {e}") from e

    choices = data.get("choices") or []
    if not choices:
        print(f"[llm_client] Mistral returned no choices: {data}")
        raise RuntimeError("LLM returned no output")

    return choices[0]["message"]["content"].strip()
