document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  const animeList = document.querySelector('.anime-list');

  // Função para buscar animes na API
  async function searchAnimes(query) {
    try {
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query ($search: String) {
              Page(page: 1, perPage: 10) {
                media(search: $search, type: ANIME, isAdult: false) {
                  id
                  title {
                    romaji
                    english
                    native
                  }
                  coverImage {
                    large
                  }
                  description
                }
              }
            }
          `,
          variables: {
            search: query
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Erro na requisição');
      }

      const data = await response.json();
      return data.data.Page.media;
    } catch (error) {
      console.error('Erro ao buscar animes:', error);
      return [];
    }
  }

  // Função para atualizar a lista de animes
  function updateAnimeList(animes) {
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

      const animeName = document.createElement('h3');
      animeName.textContent = anime.title.romaji || anime.title.english || anime.title.native;

      const animeDescription = document.createElement('p');
      animeDescription.textContent = anime.description || 'Descrição não disponível.';

      animeItem.appendChild(animeCover);
      animeItem.appendChild(animeName);
      animeItem.appendChild(animeDescription);
      animeList.appendChild(animeItem);
    });
  }

  // Evento de clique no botão de busca
  searchButton.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (query) {
      const animes = await searchAnimes(query);
      updateAnimeList(animes);
    } else {
      alert('Por favor, insira um termo de busca.');
    }
  });
});