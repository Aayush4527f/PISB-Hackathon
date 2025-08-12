import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0" # set environment variable for dnn so that we get precise floating values
import numpy as np
from flask import Flask, request, jsonify
from PIL import Image
import io
from tensorflow.keras.models import load_model
import google.generativeai as genai
from dotenv import load_dotenv


# --- Step 1: Initialize Flask and Load Environment Variables ---
app = Flask(__name__)

# Load environment variables from ../.env
# This will look for a .env file in the directory *above* the current one
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

# --- Step 2: Configure the Gemini API ---
# Make sure you have GOOGLE_API_KEY="YOUR_API_KEY" in your .env file
try:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in .env file or environment variables.")
    genai.configure(api_key=api_key)
    print("Gemini API configured successfully.")
except Exception as e:
    print(f"Error configuring Gemini API: {e}")
    # You might want to handle this more gracefully, but for now, we print the error
    genai_model = None

# --- Step 3: Load your trained model ---
print("Loading pneumonia detection model...")
try:
    # Make sure 'pneumonia_detection_model.h5' is in the same directory or provide the full path
    model_path = 'C:/Users/admin/Desktop/code/clg/hackathon/ml/pneumonia_detection_model.h5'
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at: {model_path}")
    model = load_model(model_path)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading Keras model: {e}")
    model = None # Set model to None if loading fails

# --- Step 4: Define your image preprocessing function ---
def preprocess_image(img_bytes):
    """
    Preprocesses the image for model prediction.
    """
    img = Image.open(io.BytesIO(img_bytes)).convert('L')
    img = img.resize((150, 150))
    img_array = np.array(img)
    img_array = img_array / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    img_array = np.expand_dims(img_array, axis=-1)
    return img_array

# --- (NEW) Step 5: Define a placeholder for your specific scan analysis ---
def analyze_scan_for_details(image_bytes):
    """
    This is a placeholder function.
    In a real application, this function would contain the logic
    to analyze the scan and return specific details.
    For now, it returns a hardcoded example string.
    """
    # In your real implementation, you would run your other model/logic here
    print("Performing detailed scan analysis (placeholder)...")
    return "Fluid accumulation has been observed in the lower lobe of the left lung."


# --- Step 6: Define the function to get recommendations from Gemini ---
def get_gemini_summary(location,chances):
    if 'genai_model' in globals() and genai_model is None:
        return "Could not generate summary because the Gemini API is not configured."

    # Select the model
    gemini_model = genai.GenerativeModel('gemini-1.5-flash-latest')

    # Construct the prompt
    prompt = f"""
    You are a helpful medical assistant. Your role is to provide a clear, personalized summary and general recommendations for a patient based on their chest X-ray findings. Do not provide a diagnosis, but explain the findings in simple terms.

    A patient's X-ray scan shows potential signs of pneumonia. Here is the location of the most fluid concentration:
    "{location}"

    Chances of Pneumonia are {chances*100}%

    Based on this, please generate a response of atleast 150 to 200 words max that includes:
    1. A brief, easy-to-understand summary of the findings.
    2. General, non-prescriptive recommendations (e.g., "it is important to consult with a healthcare provider," "ensure you get plenty of rest," "stay hydrated").
    3. Home remedies that could be dangerous or things to avoid which might increase complications.
    4. Make sure the chances of pneumonia is mentioned at the start

    Keep the tone reassuring and professional. Structure the output clearly.
    "Remember, this is just a summary of the X-ray findings. Please discuss the complete report with your doctor to get a formal diagnosis and develop a personalized treatment plan."
    ALWAYS SAY THIS AT THE END
    """

    try:
        print("Sending prompt to Gemini")
        response = gemini_model.generate_content(prompt)
        print("Received response from Gemini.")
        return response.text
    except Exception as e:
        print(f"An error occurred while calling the Gemini API: {e}")
        return "There was an error generating the personalized summary."


# --- Step 7: Define the prediction endpoint (Updated) ---
@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Pneumonia detection model is not available.'}), 503

    if 'file' not in request.files:
        return jsonify({'error': 'no file provided'}), 400

    file = request.files['file']

    try:
        img_bytes = file.read()
        
        # Preprocess the image for the Keras model
        processed_image = preprocess_image(img_bytes)
        
        # Make a prediction
        prediction = model.predict(processed_image)
        score = float(prediction[0][0])
        label = 'Pneumonia' if score > 0.5 else 'Normal'

        # (MODIFIED) Initialize summary variable
        summary = "No summary needed for a normal scan."

        # (MODIFIED) If pneumonia is detected, get more details and a Gemini summary
        if label == 'Pneumonia':
            # 1. Get specific details from your other function
            scan_details = analyze_scan_for_details(img_bytes)
            
            # 2. Get the personalized summary from Gemini
            summary = get_gemini_summary(scan_details,score)

        # (MODIFIED) Create the final result dictionary
        result = {
            'prediction': label,
            'score': score,
            'summary': summary  # Add the summary to the response
        }

        return jsonify(result)

    except Exception as e:
        # Log the full error for debugging
        print(f"An error occurred in the /predict endpoint: {e}")
        return jsonify({'error': 'An internal error occurred. See server logs for details.'}), 500

# --- Step 8: Run the app ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
