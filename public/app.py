from flask import Flask, jsonify, render_template, request, send_from_directory
import os

app = Flask(__name__, static_folder='static', static_url_path='/static')

# Página inicial
@app.route('/')
def index():
    return render_template('animes.html')

# Página de detalhes (carregada via ?id=...)
@app.route('/anime-details')
def anime_details_page():
    anime_id = request.args.get('id')
    return render_template('anime-details.html', anime_id=anime_id)

# Outra rota de detalhes (caso queira acessar por /anime/ID)
@app.route('/anime/<int:anime_id>')
def anime_details_by_id(anime_id):
    return render_template('anime-details.html', anime_id=anime_id)

# Favicon
@app.route('/favicon.ico')
def favicon():
    return send_from_directory(
        os.path.join(app.root_path, 'static'),
        'favicon.ico',
        mimetype='image/vnd.microsoft.icon'
    )

# API simulada para buscar animes
@app.route('/api/animes')
def api_animes():
    animes = [
        {"id": 1, "title": "Naruto"},
        {"id": 2, "title": "One Piece"}
    ]
    return jsonify(animes)

# Inicialização do servidor
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
