// Funções auxiliares
function showLoading() {
  const container = document.getElementById('anime-details');
  if (!container) return;
  
  container.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Carregando detalhes do anime...</p>
    </div>
  `;
}

function showError(message, type = 'error') {
  const container = document.getElementById('anime-details');
  if (!container) return;
  
  const errorClass = type === 'warning' ? 'warning' : 'error';
  container.innerHTML = `
    <div class="${errorClass}">
      <i class="fas fa-${type === 'warning' ? 'exclamation-triangle' : 'times-circle'}"></i>
      <p>${message}</p>
      <button class="retry-button">
        <i class="fas fa-sync-alt"></i> Tentar novamente
      </button>
      <a href="/" class="back-link">
        <i class="fas fa-arrow-left"></i> Voltar à página inicial
      </a>
    </div>
  `;

  // Configurar botão de tentar novamente
  const retryBtn = container.querySelector('.retry-button');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => loadAnimeData());
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
  return statusMap[status] || status || 'Desconhecido';
}

function formatDate(date) {
  if (!date || !date.year) return 'Não especificada';
  return `${date.day || '??'}/${date.month || '??'}/${date.year}`;
}

function renderEpisodes(episodes) {
  if (!episodes || episodes.length === 0) {
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
            <img src="${ep.thumbnail || '/static/images/default-episode.jpg'}" 
                 alt="Episódio ${ep.number}"
                 onerror="this.src='/static/images/default-episode.jpg'">
            <span class="episode-number">Ep. ${ep.number}</span>
          </div>
          <div class="episode-info">
            <h4>${ep.title || `Episódio ${ep.number}`}</h4>
            <div class="episode-sources">
              ${ep.sources.map(src => `
                <a href="${src.url}" target="_blank" class="source-btn ${src.quality.toLowerCase()}">
                  ${src.site} <span class="quality">${src.quality}</span>
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
  const container = document.getElementById('anime-details');
  if (!container || !anime) return;

  // Debug: Verificar dados recebidos
  console.log('Dados do anime recebidos:', anime);

  container.innerHTML = `
    <!-- Banner do Anime -->
    <div class="anime-banner-container">
      <div class="anime-banner">
        <img src="${anime.bannerImage || anime.coverImage?.extraLarge || '/static/images/default-banner.jpg'}" 
             alt="Banner do anime"
             onerror="this.src='/static/images/default-banner.jpg'">
      </div>
    </div>

    <!-- Informações do Anime -->
    <div class="anime-info">
      <h2 id="anime-title">${anime.title?.romaji || anime.title?.english || anime.title?.native || 'Anime Desconhecido'}</h2>
      
      <!-- Metadados -->
      <div class="anime-meta" id="anime-meta">
        ${anime.averageScore ? `<div class="meta-item"><i class="fas fa-star"></i> ${anime.averageScore} Pontuação</div>` : ''}
        ${anime.episodes ? `<div class="meta-item"><i class="fas fa-play"></i> ${anime.episodes} Episódios</div>` : ''}
        ${anime.status ? `<div class="meta-item"><i class="fas fa-info-circle"></i> ${formatStatus(anime.status)}</div>` : ''}
      </div>
      
      <!-- Sinopse -->
      <div class="detail-section">
        <h3 class="section-title"><i class="fas fa-book-open"></i> Sinopse</h3>
        <p id="anime-synopsis">${anime.description ? anime.description.replace(/<[^>]*>/g, '') : 'Descrição não disponível.'}</p>
      </div>
      
      <!-- Detalhes -->
      <div class="detail-section">
        <h3 class="section-title"><i class="fas fa-info-circle"></i> Detalhes</h3>
        <div class="details-grid" id="anime-details-grid">
          ${anime.startDate ? `
          <div class="detail-item">
            <h4><i class="fas fa-calendar-day"></i> Estreia</h4>
            <p>${formatDate(anime.startDate)}</p>
          </div>` : ''}
          
          ${anime.format ? `
          <div class="detail-item">
            <h4><i class="fas fa-film"></i> Formato</h4>
            <p>${anime.format}</p>
          </div>` : ''}
          
          ${anime.studios?.nodes?.length ? `
          <div class="detail-item">
            <h4><i class="fas fa-building"></i> Estúdio</h4>
            <p>${anime.studios.nodes.map(s => s.name).join(', ')}</p>
          </div>` : ''}
          
          ${anime.genres?.length ? `
          <div class="detail-item">
            <h4><i class="fas fa-tags"></i> Gêneros</h4>
            <p>${anime.genres.slice(0, 5).join(', ')}</p>
          </div>` : ''}
        </div>
      </div>
      
      <!-- Episódios -->
      <div class="detail-section">
        <h3 class="section-title"><i class="fas fa-play-circle"></i> Episódios</h3>
        <div class="episodes-container" id="anime-episodes">
          ${renderEpisodes(anime.episodes || [])}
        </div>
      </div>
    </div>

    <!-- Botão de Voltar -->
    <a href="/" class="bottom-back-button">
      <i class="fas fa-arrow-left"></i> Voltar para a Página Inicial
    </a>
  `;
}

// Função principal de carregamento
async function loadAnimeData() {
  // Obter ID da URL como fallback
  const urlParams = new URLSearchParams(window.location.search);
  const animeId = window.animeId || urlParams.get('id');
  
  console.log('ID do anime:', animeId); // Debug

  if (!animeId) {
    showError('ID do anime não especificado.');
    return;
  }

  const container = document.getElementById('anime-details');
  if (!container) {
    console.error('Container de detalhes não encontrado');
    return;
  }

  showLoading();

  try {
    if (typeof AnimeEpisodeSearcher === 'undefined') {
      throw new Error('Sistema de busca não disponível');
    }
    
    const searcher = new AnimeEpisodeSearcher();
    const data = await searcher.searchEpisodes(animeId);
    
    if (!data || !data.title) {
      throw new Error('Dados inválidos recebidos da API');
    }
    
    displayAnimeDetails(data);
  } catch (error) {
    console.error('Erro ao carregar anime:', error);
    showError(`Falha ao carregar: ${error.message}`);
  }
}

// Iniciar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Adicionar pequeno delay para garantir tudo está carregado
  setTimeout(loadAnimeData, 100);
});