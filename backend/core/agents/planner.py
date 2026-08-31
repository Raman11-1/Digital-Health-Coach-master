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
    llm_output = generate_text(prompt)
    
    # DEBUG: Print what the AI actually sent so we can see errors in terminal
    print(f"--- LLM RAW OUTPUT ---\n{llm_output}\n----------------------")

    # 2. Clean and Extract
    clean_str = extract_json_str(llm_output)

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
            # Fallback only if BOTH methods fail
            data = {
                "workout": [],
                "diet": {
                    "breakfast": ["AI Error - Could not parse plan"],
                    "lunch": ["Please try regenerating"],
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

    # 4. Generate diet_text for frontend
    diet_info = data.get("diet", {})
    diet_text = ""
    
    if isinstance(diet_info, dict):
        for k, v in diet_info.items():
            val_str = ", ".join(v) if isinstance(v, list) else str(v)
            diet_text += f"{k.capitalize()}: {val_str}\n"
    else:
        diet_text = str(diet_info)

    return {
        "workout": data.get("workout", []),
        "diet": diet_info,
        "diet_text": diet_text.strip(),
    }