import os
import numpy as np
from flask import Flask, request, jsonify
from PIL import Image
import io
from tensorflow.keras.models import load_model

# Initialize Flask app
app = Flask(__name__)

# --- Step 1: Load your trained model ---
print("Loading model...")
# Load the model from the H5 file
# Make sure 'pneumonia_detection_model.h5' is in the same directory
model = load_model('C:/Users/admin/Desktop/code/clg/hackathon/ml/pneumonia_detection_model.h5')
print("Model loaded successfully!")

# --- Step 2: Define your preprocessing function (Updated from Notebook) ---
def preprocess_image(img_bytes):
    """
    Preprocesses the image for model prediction based on the notebook.
    - Converts bytes to a PIL Image
    - Converts to grayscale
    - Resizes to 150x150
    - Converts to a NumPy array
    - Normalizes the pixel values
    - Expands dimensions to match the model's input shape
    """
    # Open the image from bytes and convert to grayscale
    img = Image.open(io.BytesIO(img_bytes)).convert('L')
    
    # Resize the image to the target size (150x150)
    img = img.resize((150, 150))
    
    # Convert the image to a numpy array
    img_array = np.array(img)
    
    # Normalize the image data by dividing by 255.0
    img_array = img_array / 255.0
    
    # Expand the dimensions to match the model's input shape (1, 150, 150, 1)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = np.expand_dims(img_array, axis=-1)
    
    return img_array

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
        
        # Preprocess the image
        processed_image = preprocess_image(img_bytes)
        
        # Make a prediction
        prediction = model.predict(processed_image)

        # The prediction is a numpy array, e.g., [[0.98]]
        # Convert it to a native Python float.
        score = float(prediction[0][0])

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
