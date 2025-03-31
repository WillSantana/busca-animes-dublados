// static/js/anime-details.js
document.addEventListener('DOMContentLoaded', async () => {
  const animeId = window.animeId;
  const animeDetailsContainer = document.getElementById('anime-details');
  
  if (!animeId) {
    showError('ID do anime não especificado.');
    return;
  }

  showLoading();

  try {
    const searcher = new AnimeEpisodeSearcher();
    const { episodes, ...anime } = await searcher.searchEpisodes(animeId, document.title);
    displayAnimeDetails(anime, episodes);
  } catch (error) {
    console.error('Erro ao carregar anime:', error);
    showError(`Erro ao carregar detalhes do anime: ${error.message}`);
  }

  function showLoading() {
    animeDetailsContainer.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>Carregando detalhes do anime...</p>
      </div>
    `;
  }

  function showError(message) {
    animeDetailsContainer.innerHTML = `
      <div class="error">
        <p>${message}</p>
        <a href="/" class="back-link">Voltar à página inicial</a>
      </div>
    `;
  }

  function displayAnimeDetails(anime, episodes = []) {
    const description = anime.description ? anime.description.replace(/<[^>]*>/g, '') : 'Descrição não disponível.';
    const startDate = anime.startDate ? `${anime.startDate.day || '??'}/${anime.startDate.month || '??'}/${anime.startDate.year || '????'}` : 'Não especificada';
    const studios = anime.studios?.nodes?.map(s => s.name).join(', ') || 'Não especificado';
    
    animeDetailsContainer.innerHTML = `
      <div class="anime-banner" style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${anime.bannerImage || anime.coverImage.extraLarge}')"></div>
      
      <div class="anime-info">
        <h2>${anime.title.romaji || anime.title.english || anime.title.native}</h2>
        
        <div class="anime-meta">
          <span class="score">⭐ ${anime.averageScore || 'N/A'}/100</span>
          <span class="episodes">📺 ${anime.episodes || 'N/A'} episódios</span>
          <span class="status">${anime.status || 'Status desconhecido'}</span>
        </div>
        
        <div class="anime-description">
          <h3>Sinopse</h3>
          <p>${description}</p>
        </div>
        
        <div class="anime-details-grid">
          <div class="detail-item">
            <h4>Data de Início</h4>
            <p>${startDate}</p>
          </div>
          
          <div class="detail-item">
            <h4>Gêneros</h4>
            <p>${anime.genres?.join(', ') || 'N/A'}</p>
          </div>
          
          <div class="detail-item">
            <h4>Estúdio</h4>
            <p>${studios}</p>
          </div>
        </div>
        
        ${renderEpisodesSection(episodes)}
        ${renderRelatedAnime(anime.relations)}
      </div>
    `;
  }

  function renderEpisodesSection(episodes) {
    if (!episodes || episodes.length === 0) return '';
    
    return `
      <div class="episodes-section">
        <h3>Episódios Disponíveis</h3>
        <div class="episodes-list">
          ${episodes.map(ep => `
            <div class="episode-card">
              <h4>Episódio ${ep.number}${ep.title ? `: ${ep.title}` : ''}</h4>
              <div class="sources">
                ${ep.sources.map(src => `
                  <a href="${src.url}" target="_blank" rel="noopener noreferrer" class="source">
                    <span class="site">${src.site}</span>
                    <span class="quality">${src.quality}</span>
                  </a>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderRelatedAnime(relations) {
    if (!relations || relations.edges.length === 0) return '';
    
    const related = relations.edges
      .filter(rel => rel.node.type === 'ANIME')
      .slice(0, 5);
    
    if (related.length === 0) return '';
    
    return `
      <div class="related-section">
        <h3>Relacionados</h3>
        <div class="related-list">
          ${related.map(rel => `
            <a href="/anime-details?id=${rel.node.id}" class="related-item">
              ${rel.node.title.romaji}
              <span class="relation-type">${formatRelationType(rel.relationType)}</span>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }

  function formatRelationType(type) {
    const types = {
      'PREQUEL': 'Prequela',
      'SEQUEL': 'Sequela',
      'PARENT': 'Original',
      'SIDE_STORY': 'História Paralela',
      'CHARACTER': 'Mesmos Personagens',
      'SUMMARY': 'Resumo',
      'ALTERNATIVE': 'Versão Alternativa',
      'OTHER': 'Outro'
    };
    return types[type] || type;
  }
});