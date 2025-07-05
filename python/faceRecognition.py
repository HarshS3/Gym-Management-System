from flask import Flask, request, jsonify
import face_recognition
import numpy as np
import base64
from io import BytesIO
from PIL import Image
from flask_cors import CORS
from datetime import datetime
import os, glob
import requests
import cloudinary
import cloudinary.api
import cloudinary.search
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
if(os.getenv('NODE_ENV') == 'production'):
    CORS(app, resources={r"/*": {"origins": "http://localhost:5000"}}, supports_credentials=True)
else:
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# Cloudinary configuration
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
    secure=True,
)
CLOUDINARY_FOLDER = os.getenv('CLOUDINARY_FOLDER', 'members')  # folder containing member images

def load_faces_from_cloudinary():
    global known_face_encodings, known_face_names
    print('Fetching faces from Cloudinary...')
    try:
        search = cloudinary.search.Search()
        search = search.expression(f"folder:{CLOUDINARY_FOLDER}").with_field("context")
        result = search.max_results(500).execute()
        resources = result.get('resources', [])
        for r in resources:
            url = r.get('secure_url') or r.get('url')
            if not url:
                continue
            try:
                resp = requests.get(url)
                img = Image.open(BytesIO(resp.content))
                img_array = np.array(img)
                encodings = face_recognition.face_encodings(img_array)
                if encodings:
                    known_face_encodings.append(encodings[0])
                    # Determine name: prefer context name, else public_id basename
                    name = r.get('context', {}).get('custom', {}).get('name') if r.get('context') else None
                    if not name:
                        name = os.path.basename(r['public_id'])
                    known_face_names.append(name)
                    print(f"Loaded Cloudinary face: {name}")
            except Exception as err:
                print(f"Failed to process Cloudinary resource {r.get('public_id')}: {err}")
    except Exception as e:
        print(f"Error fetching from Cloudinary: {e}")

# Reset and load
known_face_encodings = []
known_face_names = []
load_faces_from_cloudinary()

@app.route('/recognize-face', methods=['POST'])
def recognize_face():
    try:
        data = request.get_json()
        base64_img = data.get('image')

        if not base64_img:
            return jsonify({'success': False, 'message': 'No image provided'}), 400

        # Convert base64 string to image (handle both data URL and raw base64)
        if ',' in base64_img:
            base64_payload = base64_img.split(',')[1]
        else:
            base64_payload = base64_img
        img_data = base64.b64decode(base64_payload)
        img = Image.open(BytesIO(img_data))
        img_array = np.array(img)

        # Detect face
        face_encodings = face_recognition.face_encodings(img_array)
        if not face_encodings:
            return jsonify({'success': False, 'message': 'No face detected'}), 404

        # Compare with known encodings
        face_encoding = face_encodings[0]
        matches = face_recognition.compare_faces(known_face_encodings, face_encoding, tolerance=0.5)
        name = None
        if True in matches:
            match_index = matches.index(True)
            name = known_face_names[match_index]

        if name:
            recognized = {
                'name': name,
                'lastVisit': datetime.utcnow().isoformat()
            }
            return jsonify({'success': True, 'member': recognized})
        else:
            return jsonify({'success': False, 'message': 'Face not recognized'}), 404

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/refresh-faces', methods=['POST'])
def refresh_faces():
    try:
        global known_face_encodings, known_face_names
        known_face_encodings = []
        known_face_names = []
        load_faces_from_cloudinary()
        return jsonify({'success': True, 'count': len(known_face_names)})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    import os
    port= int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
