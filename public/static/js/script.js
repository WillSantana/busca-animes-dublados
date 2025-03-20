document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  const genreFilter = document.getElementById('genre');
  const formatFilter = document.getElementById('format');
  const animeList = document.querySelector('.anime-list');
  const loadMoreButton = document.getElementById('load-more');

  let currentPage = 1;

  // Função para buscar animes na API
  async function searchAnimes(query, genre, format, page = 1) {
    try {
      console.log('Fazendo requisição à API...');
      console.log('Parâmetros da busca:', { query, genre, format, page });

      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query ($search: String, $genre: String, $format: MediaFormat, $page: Int) {
              Page(page: $page, perPage: 10) {
                media(search: $search, genre: $genre, format: $format, type: ANIME, isAdult: false) {
                  id
                  title {
                    romaji
                    english
                    native
                  }
                  description
                  coverImage {
                    large
                  }
                  genres
                  format
                }
              }
            }
          `,
          variables: {
            search: query,
            genre: genre || null,
            format: format || null,
            page: page
          }
        }),
      });

      console.log('Resposta recebida:', response);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Dados recebidos:', data);

      if (data.data && data.data.Page && data.data.Page.media) {
          console.log("Media array length:", data.data.Page.media.length);
          return data.data.Page.media;
      } else {
          console.error('Dados inválidos recebidos da API:', data);
          return [];
      }

    } catch (error) {
      console.error('Error fetching animes:', error);
      return [];
    }
  }

  // Função para atualizar a lista de animes
  function updateAnimeList(animes) {
    console.log('Atualizando lista de animes:', animes);
    animeList.innerHTML = '';

    if (animes.length === 0) {
      animeList.innerHTML = '<p>Nenhum anime encontrado.</p>';
      return;
    }

    animes.forEach(anime => {
      const animeItem = document.createElement('div');
      animeItem.classList.add('anime-item');

      const animeCover = document.createElement('img');
      animeCover.src = anime.coverImage.large;
      animeCover.alt = anime.title.romaji;
      animeCover.onerror = () => {
          console.error("Erro ao carregar imagem:", anime.coverImage.large);
          animeCover.src = 'caminho/para/imagem/de/fallback.jpg'; // Substitua pelo caminho da sua imagem de fallback
      };

      const animeName = document.createElement('h3');
      animeName.textContent = anime.title.romaji;

      const animeDescription = document.createElement('p');
      animeDescription.textContent = anime.description;

      animeItem.appendChild(animeCover);
      animeItem.appendChild(animeName);
      animeItem.appendChild(animeDescription);
      animeList.appendChild(animeItem);
    });
  }

  // Função para carregar mais animes
  async function loadMoreAnimes() {
    currentPage++;
    console.log('Carregando mais animes... Página:', currentPage);
    const animes = await searchAnimes(searchInput.value, genreFilter.value, formatFilter.value, currentPage);
    updateAnimeList(animes);
  }

  // Eventos
  searchButton.addEventListener('click', async () => {
    console.log('Botão de busca clicado');
    currentPage = 1;
    const animes = await searchAnimes(searchInput.value, genreFilter.value, formatFilter.value, currentPage);
    updateAnimeList(animes);
  });

  loadMoreButton.addEventListener('click', loadMoreAnimes);
});