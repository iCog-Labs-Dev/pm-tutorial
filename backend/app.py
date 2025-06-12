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
        session_id = str(int(time.time() * 1000))
        marker_atom = f"({session_id})"
        marker_code = f"!(println! {marker_atom})\n"
      
        
        # Combine history and marker
        full_code =  marker_code + new_code

        # Run code
        result = metta_session.run(full_code)

        # Convert result atoms to string
        result_strs = [str(atom).strip() for atom in result]

        # Find marker index
        marker_index = next(
            (i for i, atom in enumerate(result_strs) if atom == marker_atom),
            None
        )

        # Extract only the result below the marker
        if marker_index is not None:
            snippet_result = result_strs[marker_index + 1:]
        else:
            snippet_result = result_strs  # fallback

        formatted_result = '\n'.join(snippet_result) + '\n'

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
