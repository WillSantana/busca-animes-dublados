document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const animeList = document.querySelector(".anime-list");

  // Cache para traduções
  const translationCache = {};

  // Função de tradução melhorada
  async function translateText(text, targetLanguage = 'pt') {
    // Não traduzir textos vazios ou muito longos
    if (!text || text.length > 100) return text;
    
    // Verifica no cache primeiro
    const cacheKey = `${text}_${targetLanguage}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }

    try {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLanguage}`
      );
      
      if (response.status === 429) {
        console.warn('Limite de traduções atingido - usando texto original');
        return text;
      }
      
      const data = await response.json();
      const translated = data.responseData?.translatedText || text;
      
      // Armazena no cache
      translationCache[cacheKey] = translated;
      return translated;
    } catch (error) {
      console.error('Erro na tradução:', error);
      return text;
    }
  }

  // Função para buscar animes com tratamento de erros melhorado
  async function searchAnimes(query) {
    try {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
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
                    extraLarge
                  }
                  bannerImage
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
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.Page?.media || [];
    } catch (error) {
      console.error("Erro ao buscar animes:", error);
      showError("Erro ao carregar animes. Tente novamente mais tarde.");
      return [];
    }
  }

  // Função para mostrar erros
  function showError(message) {
    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.innerHTML = `
      <p>${message}</p>
      <button onclick="this.parentElement.remove()">Fechar</button>
    `;
    animeList.parentElement.prepend(errorElement);
  }

  // Função para limpar e truncar texto
  function processDescription(description) {
    if (!description) return "Descrição não disponível.";
    
    // Remove tags HTML e limita a 200 caracteres
    const cleanText = description
      .replace(/<[^>]*>?/gm, '')
      .replace(/\n/g, ' ')
      .substring(0, 200);
    
    return cleanText + (description.length > 200 ? '...' : '');
  }

  // Função para criar um item de anime
  function createAnimeItem(anime) {
    const animeItem = document.createElement("div");
    animeItem.classList.add("anime-item");

    animeItem.innerHTML = `
      <img src="${anime.coverImage.large}" 
           alt="${anime.title.romaji}" 
           class="anime-cover">
      <h3 class="anime-title">${anime.title.romaji || anime.title.english || anime.title.native}</h3>
      <div class="description-container">
        <p class="anime-description">${processDescription(anime.description)}</p>
        <button class="read-more-button">Leia mais</button>
      </div>
    `;

    // Configura eventos
    const cover = animeItem.querySelector('.anime-cover');
    const desc = animeItem.querySelector('.anime-description');
    const button = animeItem.querySelector('.read-more-button');

    cover.addEventListener("click", () => {
      window.open(`/anime-details?id=${anime.id}`, '_blank');
    });

    // Mostrar/ocultar descrição completa
    button.addEventListener("click", () => {
      desc.classList.toggle("expanded");
      button.textContent = desc.classList.contains("expanded") 
        ? "Mostrar menos" 
        : "Leia mais";
    });

    // Oculta o botão se a descrição for curta
    if (anime.description && anime.description.length <= 200) {
      button.style.display = 'none';
    }

    return animeItem;
  }

  // Função para atualizar a lista de animes
  async function updateAnimeList(animes) {
    animeList.innerHTML = "";

    if (!animes || animes.length === 0) {
      animeList.innerHTML = "<p class='no-results'>Nenhum anime encontrado.</p>";
      return;
    }

    // Adiciona cada anime à lista
    for (const anime of animes) {
      const animeItem = createAnimeItem(anime);
      animeList.appendChild(animeItem);

      // Traduz apenas o título (não traduz a descrição)
      try {
        const titleElement = animeItem.querySelector('.anime-title');
        titleElement.textContent = await translateText(titleElement.textContent);
      } catch (error) {
        console.error("Erro na tradução do título:", error);
      }
    }
  }

  // Evento de busca
  searchButton.addEventListener("click", async () => {
    const query = searchInput.value.trim();
    if (query) {
      searchButton.disabled = true;
      searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
      
      try {
        const animes = await searchAnimes(query);
        await updateAnimeList(animes);
      } finally {
        searchButton.disabled = false;
        searchButton.innerHTML = '<i class="fas fa-search"></i> Buscar';
      }
    } else {
      showError("Por favor, insira um termo de busca.");
    }
  });

  // Busca ao pressionar Enter
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      searchButton.click();
    }
  });
});