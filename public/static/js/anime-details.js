document.addEventListener('DOMContentLoaded', () => {
  const animeDetailsContainer = document.getElementById('anime-details');
  
  // Verifica se o animeId foi passado corretamente
  if (!window.animeId) {
    animeDetailsContainer.innerHTML = `
      <div class="error-message">
        <p>Erro: ID do anime não especificado.</p>
        <a href="/" class="back-link">Voltar à página inicial</a>
      </div>
    `;
    return;
  }

  // Mostra loading enquanto busca os dados
  animeDetailsContainer.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Carregando detalhes do anime...</p>
    </div>
  `;

  fetchAnimeDetails(window.animeId);
});

async function fetchAnimeDetails(animeId) {
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
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
                extraLarge
                color
              }
              bannerImage
              description(asHtml: false)
              episodes
              genres
              averageScore
              status
              startDate {
                year
                month
                day
              }
              endDate {
                year
                month
                day
              }
              studios(isMain: true) {
                nodes {
                  name
                }
              }
              streamingEpisodes {
                title
                thumbnail
                url
                site
              }
              relations {
                edges {
                  relationType
                  node {
                    id
                    title {
                      romaji
                    }
                    type
                  }
                }
              }
            }
          }
        `,
        variables: {
          id: parseInt(animeId),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || !data.data.Media) {
      throw new Error('Dados do anime não encontrados');
    }

    displayAnimeDetails(data.data.Media);
  } catch (error) {
    console.error('Erro ao buscar detalhes do anime:', error);
    document.getElementById('anime-details').innerHTML = `
      <div class="error-message">
        <p>Erro ao carregar detalhes do anime: ${error.message}</p>
        <a href="/" class="back-link">Voltar à página inicial</a>
      </div>
    `;
  }
}

function displayAnimeDetails(anime) {
  const animeDetails = document.getElementById('anime-details');
  
  // Formata a descrição removendo tags HTML
  const description = anime.description 
    ? anime.description.replace(/<[^>]*>/g, '') 
    : 'Descrição não disponível.';
  
  // Formata a data de início
  const startDate = anime.startDate 
    ? `${anime.startDate.day || '??'}/${anime.startDate.month || '??'}/${anime.startDate.year || '????'}` 
    : 'Não especificada';
  
  // Formata os estúdios
  const studios = anime.studios?.nodes?.length > 0 
    ? anime.studios.nodes.map(studio => studio.name).join(', ') 
    : 'Não especificado';

  // Seção de Episódios
  let episodesHtml = '';
  if (anime.streamingEpisodes && anime.streamingEpisodes.length > 0) {
    episodesHtml = `
      <div class="episodes-section">
        <h3>Episódios Disponíveis</h3>
        <div class="episodes-list">
          ${anime.streamingEpisodes.map(ep => `
            <div class="episode-card">
              <a href="${ep.url}" target="_blank" rel="noopener noreferrer">
                <img src="${ep.thumbnail || anime.coverImage.large}" alt="${ep.title}">
                <div class="episode-info">
                  <h4>${ep.title || 'Episódio'}</h4>
                  <span class="site">${ep.site}</span>
                </div>
              </a>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else if (anime.episodes) {
    episodesHtml = `
      <div class="episodes-section">
        <h3>Episódios</h3>
        <p>Total de episódios: ${anime.episodes}</p>
      </div>
    `;
  }

  // Seção de Relacionados
  let relationsHtml = '';
  if (anime.relations && anime.relations.edges.length > 0) {
    const relatedAnimes = anime.relations.edges.filter(rel => rel.node.type === 'ANIME').slice(0, 5);
    if (relatedAnimes.length > 0) {
      relationsHtml = `
        <div class="related-section">
          <h3>Relacionados</h3>
          <div class="related-list">
            ${relatedAnimes.map(rel => `
              <a href="/anime-details?id=${rel.node.id}" class="related-item">
                ${rel.node.title.romaji}
                <span class="relation-type">${formatRelationType(rel.relationType)}</span>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  // Cria o HTML completo
  animeDetails.innerHTML = `
    <div class="anime-banner" style="background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${anime.bannerImage || anime.coverImage.extraLarge}')">
      <div class="banner-overlay"></div>
    </div>
    
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
      
      ${episodesHtml}
      ${relationsHtml}
    </div>
  `;
}

// Função auxiliar para formatar os tipos de relação
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