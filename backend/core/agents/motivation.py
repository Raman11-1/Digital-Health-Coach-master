from core.llm_client import generate_text

def generate_motivation(reasoning):
    prompt = f"""
    The coach decided the following:
    {reasoning["reasoning_text"]}

    Provide a friendly motivational message to the user.
    """
    return generate_text(prompt)
