class AnimeEpisodeSearcher {
  constructor() {
    this.baseUrl = "https://graphql.anilist.co";
    this.timeout = 10000;
    this.controller = new AbortController();
  }

  async searchEpisodes(animeId) {
    try {
      const animeDetails = await this.fetchAnimeDetails(animeId);
      const episodes = this.simulateEpisodes(animeDetails);
      
      return {
        ...animeDetails,
        episodes
      };
    } catch (error) {
      console.error("Error in searchEpisodes:", error);
      throw error;
    }
  }

  async fetchAnimeDetails(animeId) {
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
            }
          }
          format
        }
      }
    `;

    const variables = {
      id: parseInt(animeId)
    };

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        signal: this.controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.errors?.[0]?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message || "API error");
      }
      
      return data.data.Media;
    } catch (error) {
      console.error('Error fetching anime details:', {
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
    
    const episodes = [];
    const episodeCount = Math.min(anime.episodes || 12, 12);
    
    const sources = [
      { site: "AnimeFire", quality: "HD" },
      { site: "AnimeOnline", quality: "FullHD" },
      { site: "AnimeFlux", quality: "1080p" }
    ];

    for (let i = 1; i <= episodeCount; i++) {
      episodes.push({
        number: i,
        title: `Episódio ${i}`,
        thumbnail: anime.coverImage?.large || '',
        sources: sources.map(src => ({
          ...src,
          url: `https://${src.site.toLowerCase()}.com/watch/${anime.id}/episode-${i}`
        }))
      });
    }

    return episodes;
  }

  cancelRequests() {
    this.controller.abort();
    this.controller = new AbortController();
  }
}