import pandas as pd
import requests
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from flask import Flask, jsonify, request
from flask_cors import CORS
import logging

# Initialize Flask app and enable CORS
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Set up logging
logging.basicConfig(level=logging.INFO)

# Download necessary NLTK resources (only if not already downloaded)
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

API_KEY = "agjvxEwJU52u0s3OPQp6lLByhzMDuHbmKBZUR1YT"  # Replace with your actual API key if necessary

# Load natural remedies dataset
try:
    natural_remedies_df = pd.read_csv("expanded_natural_remedy_effects.csv")
    if 'Effect' not in natural_remedies_df.columns or 'Remedy' not in natural_remedies_df.columns:
        raise ValueError("CSV file is missing required columns: 'Effect' and 'Remedy'.")
except Exception as e:
    logging.error(f"Error loading CSV file: {e}")
    natural_remedies_df = pd.DataFrame(columns=['Effect', 'Remedy'])

def get_medicine_effect(medicine_name):
    """Fetch medicine effect from OpenFDA."""
    url = f"https://api.fda.gov/drug/label.json?search=openfda.brand_name:{medicine_name}&limit=1"
    # url += f"&api_key={API_KEY}"  # Uncomment if API key is needed
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        if 'results' not in data or not data['results']:
            return None, "No data found for this medicine."
        indications = data['results'][0].get('indications_and_usage', ['No effect found'])
        return clean_medicine_effect(indications[0]), None
    except requests.exceptions.Timeout:
        return None, "Request to FDA API timed out."
    except requests.exceptions.RequestException as e:
        logging.error(f"API request failed: {e}")
        return None, f"API request failed: {e}"
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return None, f"Unexpected error: {e}"

def clean_medicine_effect(text):
    """Extract key sentences related to medicine usage."""
    sentences = sent_tokenize(text)
    keywords = ["used for", "treats", "helps with", "indicated for", "reduces", "relieves"]
    important_info = [s for s in sentences if any(keyword in s.lower() for keyword in keywords)]
    return " ".join(important_info[:2]) if important_info else sentences[0] if sentences else "No effect found"

def preprocess_text(text):
    stop_words = set(stopwords.words('english'))
    words = word_tokenize(str(text).lower())
    filtered_words = [word for word in words if word.isalnum() and word not in stop_words]
    return " ".join(filtered_words)

def find_closest_remedies(effect, top_n=3):
    if not effect or natural_remedies_df.empty:
        return []
    processed_effect = preprocess_text(effect)
    natural_remedies_df['Processed_Effect'] = natural_remedies_df['Effect'].apply(preprocess_text)
    vectorizer = TfidfVectorizer()
    vectors = vectorizer.fit_transform([processed_effect] + list(natural_remedies_df['Processed_Effect']))
    similarities = cosine_similarity(vectors[0:1], vectors[1:]).flatten()
    top_matches = similarities.argsort()[-top_n:][::-1]
    remedies = []
    for idx in top_matches:
        if similarities[idx] > 0.05:
            best_match = natural_remedies_df.iloc[idx]
            remedies.append({
                'name': best_match['Remedy'],
                'effect': best_match['Effect'],
                'match_score': float(similarities[idx])
            })
    return remedies

@app.route('/api/get_medicine_effect', methods=['GET'])
def get_effect_and_remedies():
    medicine_name = request.args.get('medicine_name')
    if not medicine_name:
        return jsonify({'error': 'Please provide a medicine name.'}), 400
    effect, error = get_medicine_effect(medicine_name)
    if error:
        return jsonify({'error': error}), 404
    remedies = find_closest_remedies(effect)
    return jsonify({
        'effect': effect,
        'remedies': remedies
    })

@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Endpoint not found.'}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'error': 'Internal server error.'}), 500

if __name__ == '__main__':
    app.run(debug=True)
