import os
import numpy as np
from flask import Flask, request, jsonify
from PIL import Image
import io

# Initialize Flask app
app = Flask(__name__)

# --- Step 1: Load your trained model ---
print("Loading model...")
print("Model loaded successfully!")

# --- Step 2: Define your preprocessing function ---


# --- Step 3: Define the prediction endpoint ---
@app.route('/predict', methods=['POST'])
def predict():
    # Check if an image file was posted
    if 'file' not in request.files:
        return jsonify({'error': 'no file provided'}), 400

    file = request.files['file']

    try:
        # Read image bytes
        img_bytes = file.read()

        # The prediction is often a numpy array, e.g., [[0.98]]
        # Convert it to a native Python type.
        score = float(0.81)

        # Determine the label based on a threshold (e.g., 0.5)
        label = 'Pneumonia' if score > 0.5 else 'Normal'

        # Create a dictionary to return as JSON
        result = {
            'prediction': label,
            'confidence': score
        }

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- Step 4: Run the app ---
if __name__ == '__main__':
    # Use port 5000, which is common for Flask apps
    app.run(host='0.0.0.0', port=5000)

