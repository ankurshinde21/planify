import requests

sample_messages = [
    "Remind me to call Alex tomorrow",
    "Add task buy groceries on 2025-04-17",
    "I want to schedule a meeting for today",
    "What can you do?",
    "todo: finish the report by tomorrow"
]

for msg in sample_messages:
    resp = requests.post(
        "http://localhost:5000/chat",
        json={"message": msg}
    )
    print(f"User: {msg}")
    print("Response:", resp.json(), "\n")