from typing import Dict, Any
from core.llm_client import generate_text
import json
import re
import ast  # NEW: Library to parse Python-style dictionaries (single quotes)

def extract_json_str(text: str) -> str:
    """
    Helper to extract the JSON object {...} from the AI's response.
    """
    # 1. Remove markdown code blocks like ```json ... ``` or ```python ... ```
    text = re.sub(r"```(json|python)?\s*|\s*```", "", text)
    
    # 2. Find the start { and end }
    start = text.find("{")
    end = text.rfind("}")
    
    if start != -1 and end != -1:
        return text[start : end + 1]

    return text


def _stringify_diet_value(value) -> str:
    """
    Diet sections come back from the LLM as flat strings, lists of strings,
    or (very often in practice) richer nested lists/dicts (e.g. a meal with
    an "items" breakdown). Flatten any of these into readable text instead
    of assuming one fixed shape.
    """
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        return ", ".join(_stringify_diet_value(item) for item in value)
    if isinstance(value, dict):
        label = value.get("meal") or value.get("food") or value.get("name") or value.get("snack")
        rest = {k: v for k, v in value.items() if k not in ("meal", "food", "name", "snack")}
        rest_str = ", ".join(_stringify_diet_value(v) for v in rest.values())
        if label and rest_str:
            return f"{label} ({rest_str})"
        return str(label) if label else rest_str
    return str(value)


def generate_workout_and_diet(profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate workout + diet using LLM.
    Robustly handles both JSON (double quotes) and Python Dicts (single quotes).
    """
    
    # We explicitly ask for JSON, but AI models can be stubborn.
    prompt = f"""
You are an expert fitness coach AI.

User Profile:
- Name: {profile.get('name', 'User')}
- Goal: {profile.get('weight_goal', 70)} kg ({profile.get('fitness_goal', 'General Fitness')})
- Training: {profile.get('training_preference', 'Mix')}
- Dietary Pref: {profile.get('dietary_preference', 'None')}

Task: Create a 7-day workout plan and a daily diet plan.

Output STRICT JSON format only. Use DOUBLE QUOTES for all keys and strings.
No intro text. No markdown.

REQUIRED SCHEMA:
{{
  "workout": [
    {{ 
      "day": "Monday", 
      "exercises": [ 
         {{ "name": "Squats", "sets": "3", "reps": "12" }}
      ] 
    }},
    ... (Repeat for all 7 days)
  ],
  "diet": {{
    "breakfast": ["Oatmeal", "Boiled Eggs"],
    "lunch": ["Grilled Chicken Salad"],
    "snacks": ["Almonds"],
    "dinner": ["Salmon"]
  }}
}}
"""
    # 1. Get Text from LLM
    try:
        llm_output = generate_text(prompt)
        # DEBUG: Print what the AI actually sent so we can see errors in terminal
        print(f"--- LLM RAW OUTPUT ---\n{llm_output}\n----------------------")
        clean_str = extract_json_str(llm_output)
    except Exception as e:
        print(f"LLM call failed while generating plan: {e}")
        clean_str = ""

    try:
        # ATTEMPT 1: Standard JSON parsing (Expects double quotes)
        data = json.loads(clean_str)

    except json.JSONDecodeError:
        print("Standard JSON parsing failed. Trying Python eval...")
        try:
            # ATTEMPT 2: Python Literal Eval (Handles single quotes & trailing commas)
            data = ast.literal_eval(clean_str)
        except Exception as e:
            print(f"CRITICAL PARSING ERROR: {e}")
            # Fallback only if BOTH methods fail (or the LLM call itself failed)
            data = {
                "workout": [],
                "diet": {
                    "breakfast": ["Couldn't generate a new plan right now"],
                    "lunch": ["Please try again in a moment"],
                    "dinner": [],
                    "snacks": []
                }
            }

    # 3. Validation: Force the schema keys to exist
    if not isinstance(data, dict): 
        data = {}
        
    if "workout" not in data or not isinstance(data["workout"], list):
        data["workout"] = []
        
    if "diet" not in data or not isinstance(data["diet"], dict):
        data["diet"] = {
            "breakfast": ["Healthy Choice"],
            "lunch": ["Healthy Choice"],
            "dinner": ["Healthy Choice"],
            "snacks": ["Healthy Choice"]
        }

    # 4. Generate diet_text for frontend — defensive: the LLM's actual shape
    # for each section varies a lot in practice, so never let formatting
    # this crash the whole plan generation.
    diet_info = data.get("diet", {})
    diet_text = ""

    try:
        if isinstance(diet_info, dict):
            for k, v in diet_info.items():
                diet_text += f"{k.capitalize()}: {_stringify_diet_value(v)}\n"
        else:
            diet_text = str(diet_info)
    except Exception as e:
        print(f"diet_text formatting failed: {e}")
        diet_text = "See the structured diet plan above."

    return {
        "workout": data.get("workout", []),
        "diet": diet_info,
        "diet_text": diet_text.strip(),
    }