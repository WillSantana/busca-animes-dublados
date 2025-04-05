from flask import Flask, render_template, request, send_from_directory
import os

app = Flask(__name__, static_folder='static', static_url_path='/static')  # Garante que os arquivos estáticos sejam servidos corretamente

@app.route('/')
def index():
    return render_template('animes.html')

# Rota para detalhes do anime
@app.route('/anime-details')
def anime_details():
    anime_id = request.args.get('id')  # Captura o parâmetro 'id' da URL
    return render_template('anime-details.html', anime_id=anime_id)

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
'favicon.ico', mimetype='image/vnd.microsoft.icon')

if __name__ == '__main__':
    app.run(debug=True)


@app.route('/anime/<int:anime_id>')
def anime_details(anime_id):
    return render_template('anime-details.html', anime_id=anime_id)

# API para buscar animes (exemplo)
@app.route('/api/animes')
def api_animes():
    # Aqui você pode conectar com um banco de dados ou API externa
    animes = [{"id": 1, "title": "Naruto"}, {"id": 2, "title": "One Piece"}]
    return jsonify(animes)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)