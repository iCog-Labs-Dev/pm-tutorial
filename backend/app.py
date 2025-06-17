import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from hyperon import MeTTa

app = Flask(__name__)
CORS(app)

# Persistent MeTTa session and code history
metta_session = MeTTa()


@app.route('/run-metta', methods=['POST'])
def run_metta():
    global metta_session, code_history

    data = request.get_json()

    if not data or 'code' not in data or data.get("language") != "metta":
        return jsonify({"error": "Invalid input"}), 400

    new_code = data['code']


    try:
        # Generate unique session marker

        # Run code
        result = metta_session.run(new_code)

        # Convert result atoms to string
        result_strs = [str(atom).strip() for atom in result]

        formatted_result = '\n'.join(result_strs) + '\n'

        return jsonify({
            "result": formatted_result
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


@app.route('/reset-atomspace', methods=['POST'])
def reset_atomspace():
    global metta_session, code_history
    metta_session = MeTTa()
    code_history = []
    return jsonify({"message": "AtomSpace session reset."})


if __name__ == '__main__':
    app.run(debug=True)
