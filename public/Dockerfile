# Use a imagem oficial do Node.js
FROM node:18

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copie os arquivos de dependência
COPY package.json package-lock.json ./

# Instale as dependências
RUN npm install

# Copie o restante dos arquivos do projeto
COPY . .

# Exponha a porta que o servidor vai usar
EXPOSE 3000

# Comando para rodar o servidor
CMD ["node", "start"]
