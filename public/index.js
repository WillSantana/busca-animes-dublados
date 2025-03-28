const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Configura o diretório de arquivos estáticos
app.use(express.static(path.join(__dirname, 'static')));

// Rota principal para servir o arquivo animes.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'animes.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
