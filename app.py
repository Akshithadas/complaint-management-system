from flask import Flask, request, jsonify
from config import SQLALCHEMY_DATABASE_URI, SQLALCHEMY_TRACK_MODIFICATIONS, SECRET_KEY, GEMINI_API_KEY
from models import db, Complaint
from flask_cors import CORS
from google import genai
import json

app = Flask(__name__)
CORS(app)
app.config.from_object('config')
db.init_app(app)
client = genai.Client(api_key=GEMINI_API_KEY)

@app.route('/')
def home():
    return "Complaint System Running"

@app.route('/complaints', methods=['POST'])
def add_complaint():
    data = request.get_json()

    # Validation
    required = ['title', 'description', 'category', 'citizen_name']
    for field in required:
        if field not in data or not data[field].strip():
            return jsonify({"error": f"{field} is required"}), 400

    if data['category'] not in ['Road', 'Water', 'Electricity', 'Sanitation']:
        return jsonify({"error": "Invalid category. Choose from Road, Water, Electricity, Sanitation"}), 400

    complaint = Complaint(
        title=data['title'],
        description=data['description'],
        category=data['category'],
        citizen_name=data['citizen_name']
    )
    db.session.add(complaint)
    db.session.commit()
    return jsonify({"message": "Complaint registered", "id": complaint.id}), 201
@app.route('/complaints/<int:id>', methods=['GET'])
def get_complaint(id):
    complaint = Complaint.query.get_or_404(id)
    return jsonify({
        "id": complaint.id,
        "title": complaint.title,
        "status": complaint.status,
        "priority": complaint.priority,
        "category": complaint.category,
        "citizen_name": complaint.citizen_name
    })

@app.route('/admin/complaints', methods=['GET'])
def get_all_complaints():
    status = request.args.get('status')
    category = request.args.get('category')
    query = Complaint.query
    if status:
        query = query.filter_by(status=status)
    if category:
        query = query.filter_by(category=category)
    complaints = query.all()
    return jsonify([{
        "id": c.id,
        "title": c.title,
        "status": c.status,
        "priority": c.priority,
        "citizen_name": c.citizen_name,
        "category": c.category
    } for c in complaints])

@app.route('/admin/complaints/<int:id>/status', methods=['PATCH'])
def update_status(id):
    complaint = Complaint.query.get_or_404(id)
    data = request.get_json()
    allowed = ['Open', 'In Progress', 'Resolved']
    if data['status'] not in allowed:
        return jsonify({"error": "Invalid status"}), 400
    complaint.status = data['status']
    db.session.commit()
    return jsonify({"message": "Status updated"})

@app.route('/admin/complaints/<int:id>/priority', methods=['PATCH'])
def update_priority(id):
    complaint = Complaint.query.get_or_404(id)
    data = request.get_json()
    allowed = ['Low', 'Medium', 'High']
    if data['priority'] not in allowed:
        return jsonify({"error": "Invalid priority"}), 400
    complaint.priority = data['priority']
    db.session.commit()
    return jsonify({"message": "Priority updated"})

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

@app.route('/complaints/ai', methods=['POST'])
def add_complaint_ai():
    data = request.get_json()
    user_message = data.get('message')
    citizen_name = data.get('citizen_name')

    if not user_message or not citizen_name:
        return jsonify({"error": "message and citizen_name are required"}), 400

    prompt = f"""
    Analyze this citizen message and respond ONLY in valid JSON, no markdown, no backticks.
    Message: "{user_message}"

    If the message does NOT describe an actual complaint or issue (e.g. it's just a greeting, thanks, or unrelated chat), return:
    {{"is_complaint": false, "reply": "a short friendly conversational reply"}}

    If it DOES describe a real complaint, return:
    {{
        "is_complaint": true,
        "title": "short title under 10 words",
        "description": "cleaned up full description",
        "category": "one of: Road, Water, Electricity, Sanitation",
        "priority": "one of: Low, Medium, High based on urgency/sentiment of the message"
    }}
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        text = response.text.strip() 
        text = text.replace('```json', '').replace('```', '').strip()
        ai_data = json.loads(text)

        if not ai_data.get('is_complaint'):
            return jsonify({
                "is_complaint": False,
                "reply": ai_data.get('reply', "Got it!")
            }), 200

        complaint = Complaint(
            title=ai_data['title'],
            description=ai_data['description'],
            category=ai_data['category'],
            priority=ai_data['priority'],
            citizen_name=citizen_name
        )
        db.session.add(complaint)
        db.session.commit()

        return jsonify({
            "message": "Complaint registered via AI",
            "id": complaint.id,
            "ai_extracted": ai_data
        }), 201

    except Exception as e:
        return jsonify({"error": f"AI processing failed: {str(e)}"}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)