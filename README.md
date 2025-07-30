PneumoDetect: Pneumonia Diagnosis
A web-based platform for rapid pneumonia detection from chest X-ray scans, connecting patients with medical professionals.

🚀 The Problem
Pneumonia is a leading cause of mortality, especially in regions with limited access to radiologists. Early and accurate diagnosis is critical for effective treatment, but delays can occur due to the time it takes for a specialist to review an X-ray. This tool aims to bridge that gap by providing instant, AI-driven analysis to assist both patients and doctors.

✨ Our Solution
PneumoDetect is a user-friendly application that leverages a machine learning model to instantly analyze chest X-ray images for signs of pneumonia. It serves two key user groups:

Patients: Can get a preliminary, AI-driven screening of their X-ray scans. If the result indicates a high probability of pneumonia, the platform provides a list of nearby doctors to facilitate a professional consultation.

Doctors: Can use the platform as a diagnostic aid to accelerate the screening process. They have access to a dashboard to view and manage past patient scans and analyses, helping them track cases and make informed decisions.

📋 Features
For Patients
Secure X-Ray Upload: Easily upload chest X-ray images for analysis.

Instant AI Diagnosis: Receive an immediate prediction from our machine learning model.

Find a Doctor: If diagnosed, view a list of registered doctors.

Location-Based Filtering: Filter the doctor list by location to find a convenient specialist.

For Doctors
Diagnostic Aid: Use the AI model as a second opinion for faster and more confident diagnoses.

Patient History: Access a dashboard with a history of all analyzed scans.

Case Review: View previous patient X-rays and their corresponding AI-generated predictions.

🛠️ Technology Stack
Frontend: Static HTML, JavaScript, and Tailwind CSS for a clean, responsive, and modern user interface.

Backend: Node.js and Express.js to handle API requests, user logic, and process management.

Database: MongoDB for storing user data, scan history, and analysis results.

Machine Learning: A Python script (script.py) that runs the pneumonia detection model. The Node.js backend spawns this script as a child process to perform the analysis.

⚙️ System Architecture
A user (Patient or Doctor) uploads an X-ray image through the web interface.

The frontend sends the image to the Node.js/Express.js backend.

The backend saves the image and spawns a Python process, passing the image path to script.py.

The Python script executes the ML model, which analyzes the image and returns a prediction (e.g., "Pneumonia" or "Normal").

The backend receives the prediction, saves the result to the MongoDB database, and sends it back to the frontend.

The user sees the result on their screen. If a patient is diagnosed, the app queries the database for a list of doctors to display.

🧑‍🤝‍🧑 Project Team
(Add your team members' names here)

Member 1: Aayush Chhajed

Member 2: Aryan Kothawade

Member 3: Nirav Jain

Member 4: Varad Palod