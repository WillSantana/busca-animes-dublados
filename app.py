from flask import Flask, render_template, request, send_from_directory
from werkzeug.exceptions import NotFound

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('animes.html')

@app.route('/anime-details')
def anime_details():
    anime_id = request.args.get('id')
    if not anime_id or not anime_id.isdigit():
        return render_template('error.html', message="ID inválido"), 400
    return render_template('anime-details.html', anime_id=anime_id)

@app.route('/static/<path:filename>')
def serve_static(filename):
    try:
        return send_from_directory('static', filename)
    except NotFound:
        return "Recurso não encontrado", 404
    
@app.route('/static/css/styles.css')
def serve_css():
    response = send_from_directory('static/css', 'styles.css')
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate'
    return response

if __name__ == '__main__':
    app.run(debug=True, port=5000)