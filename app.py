from flask import Flask, request, render_template, jsonify
from flask_cors import CORS
import json
import logging
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Model initialization with error handling
model_name = "facebook/blenderbot-400M-distill"
model = None
tokenizer = None
conversation_history = []

def load_model():
    """Load the model and tokenizer with error handling"""
    global model, tokenizer
    try:
        logger.info(f"Loading model: {model_name}")
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
        logger.info("Model loaded successfully!")
        return True
    except Exception as e:
        logger.error(f"Error loading model: {str(e)}")
        return False

# Load model on startup
if not load_model():
    logger.warning("Model failed to load. API will return errors until model loads.")

@app.route('/', methods=['GET'])
def home():
    """Serve the main HTML page"""
    return render_template('index.html')

@app.route('/chatbot', methods=['POST'])
def handle_prompt():
    """Handle chatbot API requests"""
    try:
        if model is None or tokenizer is None:
            return jsonify({
                'error': 'Model is still loading. Please wait a moment and try again.',
                'response': None
            }), 503
        
        # Parse request
        data = request.get_json()
        if not data or 'prompt' not in data:
            return jsonify({
                'error': 'Invalid request. Please provide a "prompt" field.',
                'response': None
            }), 400
        
        input_text = data['prompt'].strip()
        if not input_text:
            return jsonify({
                'error': 'Prompt cannot be empty.',
                'response': None
            }), 400

        # Create conversation history string (limit to last 5 exchanges)
        history_list = conversation_history[-10:] if len(conversation_history) > 10 else conversation_history
        history = "\n".join(history_list)

        # Tokenize the input text and history
        inputs = tokenizer(history, input_text, return_tensors="pt", truncation=True, max_length=256)
        
        # Generate the response from the model
        outputs = model.generate(**inputs, max_length=100, num_beams=2, temperature=0.9, do_sample=True)

        # Decode the response
        response = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()

        # Add interaction to conversation history
        conversation_history.append(input_text)
        conversation_history.append(response)

        return jsonify({
            'response': response,
            'error': None
        })
        
    except json.JSONDecodeError:
        logger.error("Invalid JSON in request")
        return jsonify({
            'error': 'Invalid JSON in request body.',
            'response': None
        }), 400
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return jsonify({
            'error': f'Error processing your request: {str(e)}',
            'response': None
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    model_loaded = model is not None and tokenizer is not None
    return jsonify({
        'status': 'running',
        'model_loaded': model_loaded,
        'model_name': model_name
    })

if __name__ == '__main__':
    logger.info("Starting Flask app on http://127.0.0.1:5000")
    app.run(debug=True, host='127.0.0.1', port=5000)