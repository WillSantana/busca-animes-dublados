// Configurações globais
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// Elementos do DOM
const animeDetailsContainer = document.getElementById('anime-details');
const retryButton = document.querySelector('.retry-button');
const loadMoreButton = document.querySelector('.load-more-button');

// Estado da aplicação
let currentAnimeId = null;
let retryCount = 0;

// Funções auxiliares
function showLoading() {
  if (!animeDetailsContainer) return;
  
  animeDetailsContainer.innerHTML = `
    <div class="loading-container">
      <div class="spinner">
        <div class="double-bounce1"></div>
        <div class="double-bounce2"></div>
      </div>
      <p class="loading-text">Carregando detalhes do anime...</p>
    </div>
  `;
}

function showError(message, isRetryable = true) {
  if (!animeDetailsContainer) return;
  
  animeDetailsContainer.innerHTML = `
    <div class="error-container">
      <i class="fas fa-exclamation-triangle"></i>
      <h3 class="error-title">Ocorreu um erro</h3>
      <p class="error-message">${message}</p>
      ${isRetryable ? `
        <button class="retry-btn">
          <i class="fas fa-sync-alt"></i> Tentar novamente
        </button>
      ` : ''}
    </div>
  `;

  if (isRetryable) {
    const retryBtn = animeDetailsContainer.querySelector('.retry-btn');
    retryBtn?.addEventListener('click', () => {
      if (currentAnimeId) loadAnimeData(currentAnimeId);
    });
  }
}

function formatStatus(status) {
  const statusMap = {
    'FINISHED': 'Completo',
    'RELEASING': 'Em lançamento',
    'NOT_YET_RELEASED': 'Não lançado',
    'CANCELLED': 'Cancelado',
    'HIATUS': 'Em hiato'
  };
  return statusMap[status] || status;
}

function formatDate(date) {
  if (!date?.year) return 'Não especificada';
  const day = date.day ? date.day.toString().padStart(2, '0') : '??';
  const month = date.month ? date.month.toString().padStart(2, '0') : '??';
  return `${day}/${month}/${date.year}`;
}

function renderEpisodes(episodes = []) {
  if (!episodes.length) {
    return `
      <div class="no-episodes">
        <i class="fas fa-info-circle"></i>
        <p>Nenhum episódio disponível no momento.</p>
      </div>
    `;
  }

  return `
    <div class="episodes-grid">
      ${episodes.map(ep => `
        <div class="episode-card">
          <div class="episode-thumbnail">
            <img src="${ep.thumbnail}" 
                 alt="Episódio ${ep.number}"
                 loading="lazy"
                 onerror="this.src='/static/images/default-episode.jpg'">
            <span class="episode-number">Ep. ${ep.number}</span>
          </div>
          <div class="episode-info">
            <h4 class="episode-title">${ep.title || `Episódio ${ep.number}`}</h4>
            <div class="episode-sources">
              ${ep.sources.map(src => `
                <a href="${src.url}" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   class="source-btn ${src.quality.toLowerCase()}">
                  <span class="source-site">${src.site}</span>
                  <span class="source-quality">${src.quality}</span>
                </a>
              `).join('')}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function displayAnimeDetails(anime) {
  if (!animeDetailsContainer || !anime) return;

  try {
    animeDetailsContainer.innerHTML = `
      <div class="anime-content">
        <!-- Banner -->
        <div class="anime-banner-container">
          <div class="anime-banner">
            <img src="${anime.bannerImage || anime.coverImage?.extraLarge || '/static/images/default-banner.jpg'}" 
                 alt="Banner do anime"
                 loading="lazy"
                 onerror="this.src='/static/images/default-banner.jpg'">
          </div>
        </div>

        <!-- Informações principais -->
        <div class="anime-main-info">
          <h1 class="anime-title">
            ${anime.title?.romaji || anime.title?.english || anime.title?.native || 'Anime Desconhecido'}
          </h1>
          
          <div class="anime-meta">
            ${anime.averageScore ? `
              <div class="meta-item score">
                <i class="fas fa-star"></i>
                <span>${anime.averageScore}/100</span>
              </div>
            ` : ''}
            
            ${anime.status ? `
              <div class="meta-item status">
                <i class="fas fa-info-circle"></i>
                <span>${formatStatus(anime.status)}</span>
              </div>
            ` : ''}
            
            ${anime.episodes ? `
              <div class="meta-item episodes">
                <i class="fas fa-play"></i>
                <span>${anime.episodes} episódios</span>
              </div>
            ` : ''}
          </div>
          
          ${anime.studios?.nodes?.filter(s => s.isAnimationStudio)?.length ? `
            <div class="anime-studios">
              <span class="studios-label">Estúdio:</span>
              ${anime.studios.nodes
                .filter(studio => studio.isAnimationStudio)
                .map(studio => studio.name)
                .join(', ')}
            </div>
          ` : ''}
        </div>

        <!-- Sinopse -->
        <div class="anime-description-section">
          <h2 class="section-title">Sinopse</h2>
          <div class="anime-description">
            ${anime.description ? 
              anime.description.replace(/<[^>]*>/g, '') : 
              'Descrição não disponível.'}
          </div>
        </div>

        <!-- Detalhes adicionais -->
        <div class="anime-details-section">
          <h2 class="section-title">Detalhes</h2>
          <div class="details-grid">
            ${anime.startDate ? `
              <div class="detail-item">
                <span class="detail-label">
                  <i class="fas fa-calendar-day"></i> Estreia:
                </span>
                <span class="detail-value">${formatDate(anime.startDate)}</span>
              </div>
            ` : ''}
            
            ${anime.format ? `
              <div class="detail-item">
                <span class="detail-label">
                  <i class="fas fa-film"></i> Formato:
                </span>
                <span class="detail-value">${anime.format}</span>
              </div>
            ` : ''}
            
            ${anime.genres?.length ? `
              <div class="detail-item">
                <span class="detail-label">
                  <i class="fas fa-tags"></i> Gêneros:
                </span>
                <span class="detail-value">${anime.genres.join(', ')}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Episódios -->
        <div class="episodes-section">
          <h2 class="section-title">Episódios</h2>
          ${renderEpisodes(anime.episodes)}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Erro ao renderizar detalhes:', error);
    showError('Erro ao exibir os detalhes do anime', false);
  }
}

async function loadAnimeData(animeId) {
  try {
    // Validar ID
    if (!animeId || !/^\d+$/.test(animeId)) {
      showError('ID do anime inválido', false);
      return;
    }

    currentAnimeId = animeId;
    showLoading();

    if (typeof AnimeEpisodeSearcher === 'undefined') {
      throw new Error('Sistema de busca não disponível');
    }
    
    const searcher = new AnimeEpisodeSearcher();
    const data = await searcher.searchEpisodes(animeId);
    
    if (!data?.title) {
      throw new Error('Dados do anime incompletos');
    }
    
    displayAnimeDetails(data);
    retryCount = 0; // Resetar contador de tentativas
  } catch (error) {
    console.error('Erro no loadAnimeData:', error);
    
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      setTimeout(() => loadAnimeData(currentAnimeId), RETRY_DELAY);
      showError(`${error.message} (Tentativa ${retryCount}/${MAX_RETRIES})`, true);
    } else {
      showError('Não foi possível carregar os dados. Por favor, recarregue a página.', false);
    }
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const animeId = urlParams.get('id');
  
  if (animeId) {
    loadAnimeData(animeId);
  } else {
    showError('Nenhum ID de anime especificado na URL', false);
  }
});

// Configurar botões
retryButton?.addEventListener('click', () => {
  if (currentAnimeId) loadAnimeData(currentAnimeId);
});

loadMoreButton?.addEventListener('click', () => {
  // Implementar lógica para carregar mais episódios se necessário
});