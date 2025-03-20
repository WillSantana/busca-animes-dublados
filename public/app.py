from flask import Flask, render_template

app = Flask(__name__, static_folder='static', template_folder='templates')

@app.route('/')
def index():
    return render_template('animes.html')

@app.route('/animes')
def show_animes():
    return render_template('animes.html')

if __name__ == '__main__':
    app.run(port=5000, debug=True)