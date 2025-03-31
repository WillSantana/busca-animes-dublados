// static/js/script.js
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  const animeList = document.querySelector('.anime-list');
  const loadMoreButton = document.getElementById('load-more');
  let currentPage = 1;
  let currentQuery = '';
  let hasMoreResults = false;

  async function searchAnimes(query, page = 1) {
    try {
      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query ($search: String, $page: Int, $perPage: Int) {
              Page(page: $page, perPage: $perPage) {
                pageInfo {
                  total
                  currentPage
                  lastPage
                  hasNextPage
                }
                media(search: $search, type: ANIME, isAdult: false) {
                  id
                  title {
                    romaji
                    english
                    native
                  }
                  coverImage {
                    large
                    color
                  }
                  description(asHtml: false)
                  episodes
                  genres
                  averageScore
                }
              }
            }
          `,
          variables: {
            search: query,
            page: page,
            perPage: 10
          },
        }),
      });

      if (!response.ok) throw new Error('Erro na requisição');

      const data = await response.json();
      return {
        animes: data.data.Page.media,
        pageInfo: data.data.Page.pageInfo
      };
    } catch (error) {
      console.error('Erro ao buscar animes:', error);
      return { animes: [], pageInfo: {} };
    }
  }

  function displayAnimes(animes, clear = true) {
    if (clear) animeList.innerHTML = '';
    
    if (animes.length === 0 && clear) {
      animeList.innerHTML = '<p class="no-results">Nenhum anime encontrado.</p>';
      loadMoreButton.style.display = 'none';
      return;
    }

    animes.forEach(anime => {
      const animeItem = document.createElement('div');
      animeItem.className = 'anime-item';
      animeItem.innerHTML = `
        <a href="/anime-details?id=${anime.id}" class="anime-link">
          <div class="anime-cover" style="background-image: url('${anime.coverImage.large}')"></div>
          <h3>${anime.title.romaji || anime.title.english || anime.title.native}</h3>
          <div class="anime-meta">
            <span class="score">⭐ ${anime.averageScore || 'N/A'}</span>
            <span class="episodes">📺 ${anime.episodes || 'N/A'}</span>
          </div>
          <p class="anime-description">${anime.description ? anime.description.substring(0, 100) + '...' : 'Descrição não disponível.'}</p>
        </a>
      `;
      animeList.appendChild(animeItem);
    });
  }

  async function performSearch(query, page = 1) {
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.innerHTML = '<div class="spinner"></div>';
    animeList.appendChild(loading);

    const { animes, pageInfo } = await searchAnimes(query, page);
    currentQuery = query;
    currentPage = page;
    hasMoreResults = pageInfo.hasNextPage;
    
    loading.remove();
    displayAnimes(animes, page === 1);
    loadMoreButton.style.display = hasMoreResults ? 'block' : 'none';
  }

  searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) performSearch(query);
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) performSearch(query);
    }
  });

  loadMoreButton.addEventListener('click', () => {
    performSearch(currentQuery, currentPage + 1);
  });

  // Busca inicial vazia para mostrar alguns animes populares
  performSearch('');
});