from flask import Flask, request, jsonify
from flask_cors import CORS
import re
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

def extract_task(text):
    # Simple NLP: look for phrases like "remind me to", "add task", or dates like "tomorrow"
    task = None
    date = None

    # Try to find a date
    date_match = re.search(r'(today|tomorrow|\\d{4}-\\d{2}-\\d{2})', text, re.IGNORECASE)
    if date_match:
        date_str = date_match.group(1).lower()
        if date_str == 'today':
            date = datetime.now().strftime('%Y-%m-%d')
        elif date_str == 'tomorrow':
            date = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        else:
            date = date_str

    # Try to find a task description (naive)
    match = re.search(r'(remind me to|add task|create task|schedule|todo|task) (.+?)(?: on | at | for | by |$)', text, re.IGNORECASE)
    if match:
        task = match.group(2).strip()
    elif date and not task:
        # Fallback: use everything before the date as the task
        task = text.split(date_match.group(1))[0].strip(' ,.')

    if task and date:
        return {
            'id': int(datetime.now().timestamp() * 1000),
            'title': task,
            'date': date
        }
    return None

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')
    task_obj = extract_task(message)
    if task_obj:
        response = f"Got it! I'll add the task: '{task_obj['title']}' for {task_obj['date']}."
    else:
        response = "I'm here to help! Ask me to add a task, e.g., 'Remind me to call Alex tomorrow.'"
    return jsonify({'response': response, 'new_task': task_obj})

if __name__ == '__main__':
    app.run(port=5000)