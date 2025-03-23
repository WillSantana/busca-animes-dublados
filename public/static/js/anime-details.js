document.addEventListener('DOMContentLoaded', () => {
    const animeId = window.animeId; // Captura o animeId passado pelo Flask

    if (animeId) {
      fetchAnimeDetails(animeId);
    } else {
      document.getElementById('anime-details').innerHTML = '<p>Anime não encontrado.</p>';
    }
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
            id: parseInt(animeId),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Erro na requisição');
      }

      const data = await response.json();
      const anime = data.data.Media;
      displayAnimeDetails(anime);
    } catch (error) {
      console.error('Erro ao buscar detalhes do anime:', error);
      document.getElementById('anime-details').innerHTML = '<p>Erro ao carregar detalhes do anime.</p>';
    }
}

function displayAnimeDetails(anime) {
    const animeDetails = document.getElementById('anime-details');

    const animeBanner = document.createElement('div');
    animeBanner.classList.add('anime-banner');
    animeBanner.style.backgroundImage = `url(${anime.bannerImage || anime.coverImage.large})`;
    animeBanner.style.height = '300px';
    animeBanner.style.backgroundSize = 'cover';
    animeBanner.style.backgroundPosition = 'center';

    const animeInfo = document.createElement('div');
    animeInfo.classList.add('anime-info');

    const animeTitle = document.createElement('h2');
    animeTitle.textContent = anime.title.romaji || anime.title.english || anime.title.native;

    const animeDescription = document.createElement('p');
    animeDescription.textContent = anime.description || 'Descrição não disponível.';

    const animeEpisodes = document.createElement('p');
    animeEpisodes.textContent = `Episódios: ${anime.episodes || 'N/A'}`;

    const animeGenres = document.createElement('p');
    animeGenres.textContent = `Gêneros: ${anime.genres.join(', ') || 'N/A'}`;

    const animeScore = document.createElement('p');
    animeScore.textContent = `Pontuação Média: ${anime.averageScore || 'N/A'}`;

    animeInfo.appendChild(animeTitle);
    animeInfo.appendChild(animeDescription);
    animeInfo.appendChild(animeEpisodes);
    animeInfo.appendChild(animeGenres);
    animeInfo.appendChild(animeScore);

    animeDetails.appendChild(animeBanner);
    animeDetails.appendChild(animeInfo);
}