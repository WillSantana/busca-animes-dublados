from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('animes.html')

@app.route('/anime-details')
def anime_details():
    anime_id = request.args.get('id')  # Captura o parâmetro 'id' da URL
    return render_template('anime-details.html', anime_id=anime_id)

if __name__ == '__main__':
    app.run(debug=True)