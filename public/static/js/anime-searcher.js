class AnimeEpisodeSearcher {
  constructor() {
    this.baseUrl = "https://graphql.anilist.co";
    this.timeout = 15000; // Aumentado para 15 segundos
  }

  async searchEpisodes(animeId) {
    // Verificação rigorosa do ID
    if (!animeId || !/^\d+$/.test(animeId)) {
      throw new Error("ID do anime inválido. Deve ser um número.");
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const animeDetails = await this.fetchAnimeDetails(animeId, controller);
      clearTimeout(timeoutId);

      if (!animeDetails) {
        throw new Error("Nenhum dado retornado da API");
      }

      // Simulação mais realista de episódios
      const episodes = this.simulateEpisodes(animeDetails);
      
      return {
        ...animeDetails,
        episodes
      };
    } catch (error) {
      console.error("Erro detalhado no searchEpisodes:", {
        error: error.message,
        animeId,
        stack: error.stack
      });
      throw error;
    }
  }

  async fetchAnimeDetails(animeId, controller) {
    // Query GraphQL otimizada
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          title {
            romaji
            english
            native
          }
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
          coverImage {
            large
            extraLarge
          }
          bannerImage
          studios {
            nodes {
              name
              isAnimationStudio
            }
          }
          format
          nextAiringEpisode {
            episode
            timeUntilAiring
          }
        }
      }
    `;

    const variables = { id: parseInt(animeId) };

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        signal: controller?.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ query, variables })
      });

      // Tratamento completo de erros HTTP
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = null;
        }
        
        const statusMessages = {
          400: "Requisição inválida",
          404: "Anime não encontrado",
          429: "Muitas requisições - tente novamente mais tarde",
          500: "Erro interno do servidor"
        };
        
        const message = errorData?.errors?.[0]?.message || 
                       statusMessages[response.status] || 
                       `Erro na API: ${response.status}`;
        
        throw new Error(message);
      }

      const { data, errors } = await response.json();
      
      if (errors) {
        throw new Error(errors.map(e => e.message).join('; '));
      }
      
      if (!data?.Media) {
        throw new Error("Estrutura de dados inesperada da API");
      }
      
      return data.Media;
    } catch (error) {
      console.error('Erro detalhado no fetchAnimeDetails:', {
        error: error.message,
        animeId,
        query,
        variables
      });
      throw error;
    }
  }

  simulateEpisodes(anime) {
    if (!anime) return [];
    
    // Limite máximo de episódios para simulação
    const maxEpisodes = 24;
    const episodeCount = Math.min(anime.episodes || 12, maxEpisodes);
    
    // Fontes de episódios simuladas
    const sources = [
      { site: "AnimeFire", quality: "HD" },
      { site: "AnimeOnline", quality: "FullHD" },
      { site: "AnimeFlux", quality: "1080p" }
    ];

    return Array.from({ length: episodeCount }, (_, i) => {
      const episodeNum = i + 1;
      return {
        number: episodeNum,
        title: `Episódio ${episodeNum}`,
        thumbnail: anime.coverImage?.large || '/static/images/default-episode.jpg',
        sources: sources.map(src => ({
          ...src,
          url: `https://${src.site.toLowerCase()}.com/watch/${anime.id}/episode-${episodeNum}`
        }))
      };
    });
  }
}