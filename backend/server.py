from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import requests
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

print("Downloading and Loading AI Models...")
print("(The new image model will take a minute to download the first time!)")

# Load the Text Model
text_detector = pipeline("text-classification", model="Hello-SimpleAI/chatgpt-detector-roberta")
# Load the NEW Image Model
image_detector = pipeline("image-classification", model="umm-maybe/AI-image-detector")

print("Both AI Models are Awake and Ready!")

# --- TEXT SCANNING ROUTE (Unchanged) ---
@app.route('/scan', methods=['POST'])
def scan_text():
    data = request.get_json()
    text_received = data.get('text', '')[:1500] 
    
    if len(text_received) < 50:
        return jsonify({'ai_percentage': 0})

    try:
        result = text_detector(text_received)[0]
        score = result['score']
        ai_percentage = score * 100 if result['label'] == 'ChatGPT' else (1.0 - score) * 100
        print(f"[SERVER] Text Scanned | AI Probability: {ai_percentage:.1f}%")
        return jsonify({'ai_percentage': ai_percentage})
        
    except Exception as e:
        return jsonify({'ai_percentage': 0})

# --- NEW IMAGE SCANNING ROUTE ---
@app.route('/scan-image', methods=['POST'])
def scan_image():
    data = request.get_json()
    image_url = data.get('src', '')

    try:
        # 1. Trick websites into letting us download the image by pretending to be a browser
        headers = {'User-Agent': 'Mozilla/5.0'} 
        response = requests.get(image_url, headers=headers, stream=True)
        
        # 2. Open the image file
        img = Image.open(response.raw).convert('RGB')
        
        # 3. Feed the image to the AI
        result = image_detector(img)
        
        # 4. The model returns a list of labels ('artificial' or 'human'). We find the 'artificial' score.
        ai_percentage = 0
        for label_data in result:
            if label_data['label'] == 'artificial':
                ai_percentage = label_data['score'] * 100
                break

        print(f"[SERVER] Image Scanned | AI Probability: {ai_percentage:.1f}%")
        return jsonify({'ai_percentage': ai_percentage})

    except Exception as e:
        print(f"Error scanning image: {e}")
        return jsonify({'ai_percentage': 0, 'error': str(e)})

if __name__ == '__main__':
    app.run(port=5000)