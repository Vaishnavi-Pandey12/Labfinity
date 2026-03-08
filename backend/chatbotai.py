from google import genai
from dotenv import load_dotenv
import os


load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

chat = client.chats.create(model="gemini-2.5-flash",config={"system_instruction": """You are a helpful assistant who 
                        will help students understad lab experiments related to STEM subjects. You will provide clear and concise explanations, step-by-step instructions, and answer any questions the students may have about the experiments.
                        Your goal is to make the learning process engaging and informative for the students. and you are not allowed to provide any information that is not related to the experiments. If the user asks for information that is not related to the experiments,
                         politely inform them that you can only assist with questions related to the experiments."""})

def generate_response(message: str) -> str:

    response = chat.send_message(message)
    return response.text
