document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  const animeList = document.querySelector('.anime-list');
  const loadMoreButton = document.getElementById('load-more');
  let currentPage = 1;
  let currentQuery = '';
  let hasMoreResults = false;

  // Configuração inicial
  loadMoreButton.style.display = 'none';
  showWelcomeMessage();

  function showWelcomeMessage() {
    animeList.innerHTML = `
      <div class="welcome-message">
        <i class="fas fa-search"></i>
        <p>Busque por animes como "Naruto", "Attack on Titan" ou "Demon Slayer"</p>
      </div>
    `;
  }

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
                    extraLarge
                    color
                  }
                  description(asHtml: false)
                  episodes
                  genres
                  averageScore
                  bannerImage
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
      animeList.innerHTML = `
        <div class="no-results">
          <i class="fas fa-frown"></i>
          <p>Nenhum anime encontrado para "${currentQuery}"</p>
        </div>
      `;
      loadMoreButton.style.display = 'none';
      return;
    }

    animes.forEach(anime => {
      const animeItem = document.createElement('div');
      animeItem.className = 'anime-card';
      
      // Card do anime com imagem
      animeItem.innerHTML = `
        <div class="anime-card-inner">
          <div class="anime-image-container">
            <img src="${anime.coverImage.large || anime.coverImage.extraLarge}" 
                 alt="${anime.title.romaji || anime.title.english || anime.title.native}"
                 class="anime-image">
            <div class="anime-score ${getScoreColor(anime.averageScore)}">
              ${anime.averageScore || 'N/A'}
            </div>
          </div>
          <div class="anime-info">
            <h3 class="anime-title">${anime.title.romaji || anime.title.english || anime.title.native}</h3>
            <div class="anime-meta">
              <span class="anime-episodes">
                <i class="fas fa-play-circle"></i> ${anime.episodes || '?'} episódios
              </span>
              <span class="anime-genres">
                ${anime.genres?.slice(0, 3).join(' · ') || 'Gênero desconhecido'}
              </span>
            </div>
            <p class="anime-description">
              ${anime.description ? truncateDescription(anime.description) : 'Descrição não disponível.'}
            </p>
            <a href="/anime-details?id=${anime.id}" class="details-button">
              Ver detalhes <i class="fas fa-chevron-right"></i>
            </a>
          </div>
        </div>
      `;
      
      animeList.appendChild(animeItem);
    });
  }

  function getScoreColor(score) {
    if (!score) return 'no-score';
    if (score >= 80) return 'high-score';
    if (score >= 60) return 'medium-score';
    return 'low-score';
  }

  function truncateDescription(text) {
    const cleanText = text.replace(/<[^>]*>/g, '');
    return cleanText.length > 150 ? cleanText.substring(0, 150) + '...' : cleanText;
  }

  async function performSearch(query, page = 1) {
    if (!query.trim()) {
      showWelcomeMessage();
      return;
    }

    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.innerHTML = '<div class="spinner"></div><p>Buscando animes...</p>';
    animeList.innerHTML = '';
    animeList.appendChild(loading);

    try {
      const { animes, pageInfo } = await searchAnimes(query, page);
      currentQuery = query;
      currentPage = page;
      hasMoreResults = pageInfo.hasNextPage;
      
      loading.remove();
      displayAnimes(animes, page === 1);
      loadMoreButton.style.display = hasMoreResults ? 'block' : 'none';
    } catch (error) {
      loading.remove();
      animeList.innerHTML = `
        <div class="error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Erro na busca: ${error.message}</p>
        </div>
      `;
    }
  }

  // Event Listeners
  searchButton.addEventListener('click', () => performSearch(searchInput.value.trim()));
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch(searchInput.value.trim());
  });
  loadMoreButton.addEventListener('click', () => performSearch(currentQuery, currentPage + 1));

  // Foco inicial no campo de busca
  searchInput.focus();
});