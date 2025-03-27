document.addEventListener('DOMContentLoaded', () => {
  // Garante que o código seja executado apenas após o carregamento completo do DOM (estrutura HTML).
  const animeId = window.animeId; // Captura o animeId passado pelo Flask. window.animeId é uma variável global definida no lado do servidor (Flask).

  if (animeId) {
    // Verifica se um animeId foi fornecido.
    fetchAnimeDetails(animeId); // Se sim, chama a função para buscar os detalhes do anime.
  } else {
    // Se animeId não foi fornecido, exibe uma mensagem de anime não encontrado.
    document.getElementById('anime-details').innerHTML = '<p>Anime não encontrado.</p>';
  }
});

async function fetchAnimeDetails(animeId) {
  // Função assíncrona para buscar os detalhes do anime usando a API GraphQL da AniList.
  try {
    const response = await fetch('https://graphql.anilist.co', {
      // Faz uma requisição POST para a API GraphQL.
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Define o tipo de conteúdo como JSON.
        'Accept': 'application/json', // Define o tipo de resposta esperado como JSON.
      },
      body: JSON.stringify({
        // Converte a consulta GraphQL em uma string JSON.
        query: `
          query ($id: Int) {
            Media(id: $id, type: ANIME) {
              id
              title {
                romaji
                english
                native
              }
              coverImage {
                large
              }
              bannerImage
              description
              episodes
              genres
              averageScore
            }
          }
        `,
        variables: {
          // Define as variáveis da consulta GraphQL.
          id: parseInt(animeId), // Converte o animeId para um inteiro.
        },
      }),
    });

    if (!response.ok) {
      // Verifica se a resposta da API foi bem-sucedida.
      throw new Error('Erro na requisição'); // Se não, lança um erro.
    }

    const data = await response.json(); // Converte a resposta JSON em um objeto JavaScript.
    const anime = data.data.Media; // Extrai os dados do anime da resposta.
    displayAnimeDetails(anime); // Chama a função para exibir os detalhes do anime na página.
  } catch (error) {
    // Captura e trata erros durante a requisição.
    console.error('Erro ao buscar detalhes do anime:', error);
    document.getElementById('anime-details').innerHTML = '<p>Erro ao carregar detalhes do anime.</p>'; // Exibe uma mensagem de erro na página.
  }
}

function displayAnimeDetails(anime) {
  // Função para exibir os detalhes do anime na página.
  const animeDetails = document.getElementById('anime-details'); // Obtém o elemento onde os detalhes serão exibidos.

  const animeBanner = document.createElement('div'); // Cria um elemento div para o banner do anime.
  animeBanner.classList.add('anime-banner'); // Adiciona uma classe CSS para estilização.
  animeBanner.style.backgroundImage = `url(${anime.bannerImage || anime.coverImage.large})`; // Define a imagem de fundo do banner (usa bannerImage se disponível, senão coverImage).
  animeBanner.style.height = '300px'; // Define a altura do banner.
  animeBanner.style.backgroundSize = 'cover'; // Garante que a imagem cubra todo o espaço do banner.
  animeBanner.style.backgroundPosition = 'center'; // Centraliza a imagem no banner.

  const animeInfo = document.createElement('div'); // Cria um elemento div para as informações do anime.
  animeInfo.classList.add('anime-info'); // Adiciona uma classe CSS para estilização.

  const animeTitle = document.createElement('h2'); // Cria um elemento h2 para o título do anime.
  animeTitle.textContent = anime.title.romaji || anime.title.english || anime.title.native; // Define o título do anime (usa romaji, english ou native, na ordem).

  const animeDescription = document.createElement('p'); // Cria um elemento p para a descrição do anime.
  animeDescription.textContent = anime.description || 'Descrição não disponível.'; // Define a descrição do anime ou uma mensagem padrão.

  const animeEpisodes = document.createElement('p'); // Cria um elemento p para o número de episódios.
  animeEpisodes.textContent = `Episódios: ${anime.episodes || 'N/A'}`; // Define o número de episódios ou 'N/A' se não disponível.

  const animeGenres = document.createElement('p'); // Cria um elemento p para os gêneros do anime.
  animeGenres.textContent = `Gêneros: ${anime.genres.join(', ') || 'N/A'}`; // Define os gêneros do anime ou 'N/A' se não disponíveis.

  const animeScore = document.createElement('p'); // Cria um elemento p para a pontuação média do anime.
  animeScore.textContent = `Pontuação Média: ${anime.averageScore || 'N/A'}`; // Define a pontuação média ou 'N/A' se não disponível.

  animeInfo.appendChild(animeTitle); // Adiciona o título ao container de informações.
  animeInfo.appendChild(animeDescription); // Adiciona a descrição ao container de informações.
  animeInfo.appendChild(animeEpisodes); // Adiciona o número de episódios ao container de informações.
  animeInfo.appendChild(animeGenres); // Adiciona os gêneros ao container de informações.
  animeInfo.appendChild(animeScore); // Adiciona a pontuação média ao container de informações.

  animeDetails.appendChild(animeBanner); // Adiciona o banner ao container principal.
  animeDetails.appendChild(animeInfo); // Adiciona o container de informações ao container principal.
}