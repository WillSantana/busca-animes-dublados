from flask import Flask, render_template, request, send_from_directory
import os

app = Flask(__name__, static_folder='static', static_url_path='/static')  # Garante que os arquivos estáticos sejam servidos corretamente

@app.route('/')
def index():
    return render_template('animes.html')

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