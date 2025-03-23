document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  const animeList = document.querySelector('.anime-list');

  // Função para traduzir texto usando MyMemory
  async function translateText(text, targetLanguage = 'pt') {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLanguage}`;
      const response = await fetch(url);
      const data = await response.json();
      return data.responseData.translatedText;
    } catch (error) {
      console.error('Erro ao traduzir texto:', error);
      return text; // Retorna o texto original em caso de erro
    }
  }

  // Função para buscar animes na API do AniList
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
            search: query,
          },
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
  async function updateAnimeList(animes) {
    animeList.innerHTML = '';

    if (animes.length === 0) {
      animeList.innerHTML = '<p>Nenhum anime encontrado.</p>';
      return;
    }

    for (const anime of animes) {
      const animeItem = document.createElement('div');
      animeItem.classList.add('anime-item');

      const animeCover = document.createElement('img');
      animeCover.src = anime.coverImage.large;
      animeCover.alt = anime.title.romaji;

      // Adiciona evento de clique no banner
      animeCover.addEventListener('click', () => {
        window.location.href = `/anime-details?id=${anime.id}`;
      });

      const animeName = document.createElement('h3');
      animeName.textContent = anime.title.romaji || anime.title.english || anime.title.native;

      const animeDescription = document.createElement('p');
      animeDescription.textContent = anime.description || 'Descrição não disponível.';

      const readMoreButton = document.createElement('button');
      readMoreButton.textContent = 'Leia mais';
      readMoreButton.classList.add('read-more-button');

      // Adiciona evento para expandir/recolher o texto
      readMoreButton.addEventListener('click', () => {
        animeDescription.classList.toggle('expanded');
        readMoreButton.textContent = animeDescription.classList.contains('expanded') ? 'Mostrar menos' : 'Leia mais';
      });

      animeItem.appendChild(animeCover);
      animeItem.appendChild(animeName);
      animeItem.appendChild(animeDescription);
      animeItem.appendChild(readMoreButton);
      animeList.appendChild(animeItem);

      // Traduzir o título e a descrição após exibir o conteúdo original
      translateText(animeName.textContent)
        .then(translatedTitle => {
          animeName.textContent = translatedTitle;
        })
        .catch(error => {
          console.error('Erro ao traduzir título:', error);
        });

      translateText(animeDescription.textContent)
        .then(translatedDescription => {
          animeDescription.textContent = translatedDescription;
        })
        .catch(error => {
          console.error('Erro ao traduzir descrição:', error);
        });
    }
  }

  // Evento de clique no botão de busca
  searchButton.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (query) {
      const animes = await searchAnimes(query);
      await updateAnimeList(animes);
    } else {
      alert('Por favor, insira um termo de busca.');
    }
  });
});