from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import os

# Suppress TensorFlow warnings
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

app = Flask(__name__)
CORS(app)

# ============================================
# LOAD MODEL
# ============================================
print("=" * 50)
print("Loading Disease Detection Model v2...")
print("=" * 50)

MODEL_PATH = 'models/disease_model_v2.h5'
CLASS_NAMES_PATH = 'models/class_names_v2.txt'

model = load_model(MODEL_PATH, compile=False)

with open(CLASS_NAMES_PATH, 'r') as f:
    class_names = [line.strip() for line in f.readlines()]

print(f"Model loaded: {len(class_names)} classes")
print("=" * 50)

IMG_SIZE = 224

# ============================================
# TREATMENT DATABASE (All 36 Classes)
# ============================================
TREATMENTS = {
    # Banana
    'Banana_Cordana': 'Apply Mancozeb fungicide. Remove infected leaves. Improve air circulation.',
    'Banana_Healthy': 'Plant is healthy. Continue regular care and monitoring.',
    'Banana_Pestalotiopsis': 'Apply copper-based fungicide. Remove affected leaves immediately.',
    'Banana_Sigatoka': 'Apply Chlorothalonil or Mancozeb. Remove infected leaves.',
    
    # Chilli
    'Chilli_Healthy': 'Plant is healthy. Continue regular care and monitoring.',
    'Chilli_Leaf_Curl': 'Control whiteflies with insecticide. Remove severely infected plants.',
    'Chilli_Leaf_Spot': 'Apply Mancozeb fungicide. Avoid overhead watering.',
    'Chilli_Whitefly': 'Apply neem oil or Imidacloprid. Use yellow sticky traps.',
    'Chilli_Yellowish': 'Check nutrient deficiency. Apply balanced NPK fertilizer.',
    
    # Cotton
    'Cotton_Bacterial_Blight': 'Apply copper-based bactericide. Use resistant varieties.',
    'Cotton_Curl_Virus': 'Control whiteflies. Remove infected plants immediately.',
    'Cotton_Healthy': 'Plant is healthy. Continue monitoring.',
    'Cotton_Leaf_Hopper_Jassids': 'Apply Imidacloprid. Monitor regularly.',
    'Cotton_Leaf_Redding': 'Check soil nutrients. Apply potassium if deficient.',
    
    # Groundnut
    'Groundnut_Early_Leaf_Spot': 'Apply Mancozeb 75% WP @ 2g/L. Remove infected leaves.',
    'Groundnut_Late_Leaf_Spot': 'Apply Chlorothalonil or Hexaconazole. Improve air circulation.',
    'Groundnut_Rust': 'Apply Wettable Sulphur @ 2g/L or Hexaconazole @ 1ml/L.',
    
    # Lemon
    'Lemon_Aphids': 'Apply neem oil or Imidacloprid. Control ants around trees.',
    'Lemon_Gummosis': 'Remove affected bark. Apply Bordeaux paste on wounds.',
    'Lemon_Healthy': 'Plant is healthy. Continue regular care.',
    'Lemon_Leaf_Minor': 'Apply recommended insecticide. Remove affected leaves.',
    
    # Paddy
    'Paddy_Bacterial_Leaf_Blight': 'Apply copper-based fungicide. Drain field temporarily.',
    'Paddy_Brown_Spot': 'Apply Mancozeb @ 2g/L. Ensure balanced fertilization.',
    'Paddy_Leaf_Smut': 'Apply Carbendazim @ 1g/L. Use disease-free seeds.',
    
    # Pepper
    'Pepper_Bacterial_Spot': 'Apply copper fungicide. Avoid overhead watering.',
    'Pepper_Healthy': 'Plant is healthy. Continue regular care.',
    
    # Potato
    'Potato_Early_Blight': 'Apply Mancozeb or Chlorothalonil. Remove affected leaves.',
    'Potato_Healthy': 'Plant is healthy. Continue monitoring.',
    'Potato_Late_Blight': 'Apply Metalaxyl + Mancozeb. Destroy infected plants.',
    
    # Tomato
    'Tomato_Bacterial_Spot': 'Spray copper fungicide. Avoid overhead watering.',
    'Tomato_Early_Blight': 'Apply Mancozeb @ 2g/L. Remove lower leaves.',
    'Tomato_Healthy': 'Plant is healthy. Continue regular care.',
    'Tomato_Late_Blight': 'Apply Chlorothalonil or Copper. Destroy infected plants.',
    
    # Turmeric
    'Turmeric_Dry_Leaf': 'Improve irrigation. Apply mulch to retain moisture.',
    'Turmeric_Healthy_Leaf': 'Plant is healthy. Continue regular care.',
    'Turmeric_Leaf_Blotch': 'Apply Mancozeb. Remove infected leaves.',
}

# ============================================
# ROUTES
# ============================================
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'disease-detection-v2',
        'classes': len(class_names)
    })

@app.route('/classes', methods=['GET'])
def get_classes():
    return jsonify({'classes': class_names, 'total': len(class_names)})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No image provided'}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400

        # Save temp file
        temp_path = 'temp_image.jpg'
        file.save(temp_path)

        # Preprocess
        img = image.load_img(temp_path, target_size=(IMG_SIZE, IMG_SIZE))
        img_array = image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Predict
        predictions = model.predict(img_array, verbose=0)
        pred_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][pred_idx]) * 100
        predicted_class = class_names[pred_idx]

        # Top 3 predictions
        top_3_idx = np.argsort(predictions[0])[-3:][::-1]
        top_3 = [
            {'disease': class_names[i], 'confidence': round(float(predictions[0][i]) * 100, 2)}
            for i in top_3_idx
        ]

        # Clean up
        os.remove(temp_path)

        # Parse class name
        parts = predicted_class.split('_')
        crop = parts[0]
        disease = ' '.join(parts[1:])

        is_healthy = 'Healthy' in predicted_class
        treatment = TREATMENTS.get(predicted_class, 'Consult your local agriculture expert.')

        return jsonify({
            'success': True,
            'disease': disease,
            'crop': crop,
            'full_class': predicted_class,
            'confidence': round(confidence, 2),
            'is_healthy': is_healthy,
            'treatment': treatment,
            'top_3': top_3
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ============================================
# START SERVER
# ============================================
if __name__ == '__main__':
    print("\nStarting Disease Detection Service v2...")
    print("Port: 5002")
    print("=" * 50)
    app.run(port=5002, debug=True, use_reloader=False)