from flask import Flask, request, jsonify
from flask_cors import CORS
from hyperon import MeTTa

app = Flask(__name__)
CORS(app)

@app.route('/run-metta', methods=['POST'])
def run_metta():
    data = request.get_json()

    if not data or 'code' not in data or data.get("language") != "metta":
        return jsonify({"error": "Invalid input"}), 400

    code = data['code']

    try:
        metta = MeTTa()
        result = metta.run(code)

        # Join result lines with newline
        formatted_result = '\n'.join(str(atom) for atom in result) + '\n'

        return jsonify({
            "result": formatted_result
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True)
