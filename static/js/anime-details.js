document.addEventListener('DOMContentLoaded', async () => {
    const animeId = new URLSearchParams(window.location.search).get('id');
    
    if (!animeId) {
        showError("ID do anime não especificado");
        return;
    }

    try {
        const anime = await fetchAnimeDetails(animeId);
        renderAnimeDetails(anime);
    } catch (error) {
        console.error('Erro:', error);
        showError(error.message);
    }
});

async function fetchAnimeDetails(animeId) {
    const query = `
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
                }
                bannerImage
                description(asHtml: false)
                episodes
                genres
                averageScore
                status
                startDate {
                    year
                }
                studios(isMain: true) {
                    nodes {
                        name
                    }
                }
            }
        }
    `;

    const variables = { id: parseInt(animeId) };

    const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
        throw new Error('Erro ao buscar dados do anime');
    }

    const data = await response.json();
    return data.data.Media;
}

function renderAnimeDetails(anime) {
    const container = document.getElementById('anime-details');
    container.innerHTML = `
        <div class="anime-banner-container">
            <img src="${anime.bannerImage || anime.coverImage.extraLarge || anime.coverImage.large}" 
                 alt="${anime.title.romaji}" 
                 class="anime-banner"
                 onerror="this.onerror=null;this.src='/static/images/default-banner.jpg'">
        </div>
        
        <div class="anime-info">
            <h1>${anime.title.romaji || anime.title.english || anime.title.native}</h1>
            
            <div class="metadata">
                ${anime.averageScore ? `<div class="score">⭐ ${anime.averageScore}/100</div>` : ''}
                ${anime.episodes ? `<div class="episodes">📺 ${anime.episodes} episódios</div>` : ''}
                ${anime.status ? `<div class="status">${formatStatus(anime.status)}</div>` : ''}
                ${anime.startDate?.year ? `<div class="year">📅 ${anime.startDate.year}</div>` : ''}
                ${anime.studios?.nodes?.[0]?.name ? `<div class="studio">🏢 ${anime.studios.nodes[0].name}</div>` : ''}
                ${anime.genres?.length ? `<div class="genres">🏷️ ${anime.genres.join(', ')}</div>` : ''}
            </div>
            
            <div class="description">
                ${anime.description || 'Descrição não disponível.'}
            </div>
        </div>
    `;
}

function formatStatus(status) {
    const statusMap = {
        'FINISHED': 'Concluído',
        'RELEASING': 'Em lançamento',
        'NOT_YET_RELEASED': 'Não lançado',
        'CANCELLED': 'Cancelado',
        'HIATUS': 'Em hiato'
    };
    return statusMap[status] || status;
}

function showError(message) {
    document.getElementById('anime-details').innerHTML = `
        <div class="error-message">
            <h2>Erro ao carregar</h2>
            <p>${message}</p>
            <a href="/">Voltar à página inicial</a>
        </div>
    `;
}