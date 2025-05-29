# CORS patch for backend
def apply_cors_patch():
    from flask import Flask, current_app
    original_make_response = Flask.make_response
    
    def make_response_with_cors(self, rv):
        response = original_make_response(self, rv)
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
    
    Flask.make_response = make_response_with_cors
    print("🔒 CORS patch applied - allowing cross-origin requests")
