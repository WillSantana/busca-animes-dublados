// static/js/anime-searcher.js
class AnimeEpisodeSearcher {
    constructor() {
      this.cacheDuration = 3600000; // 1 hora de cache
    }
  
    async searchEpisodes(animeId, animeTitle) {
      try {
        const cached = this.checkCache(animeId);
        if (cached) return cached;
  
        const [animeDetails, episodes] = await Promise.all([
          this.fetchAnimeDetails(animeId),
          this.findEpisodesOnline(animeTitle)
        ]);
  
        const result = { ...animeDetails, episodes };
        this.updateCache(animeId, result);
        return result;
      } catch (error) {
        console.error('Erro na busca:', error);
        return this.fallbackSearch(animeId);
      }
    }
  
    async fetchAnimeDetails(animeId) {
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
                externalLinks {
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
          variables: { id: parseInt(animeId) }
        })
      });
  
      if (!response.ok) throw new Error('Erro na API do AniList');
      return (await response.json()).data.Media;
    }
  
    async findEpisodesOnline(animeTitle) {
      try {
        const sources = await Promise.all([
          this.searchAnimeFire(animeTitle),
          this.searchAnimeOnline(animeTitle),
          this.searchAnimeFlix(animeTitle)
        ]);
        return this.organizeEpisodes(sources.flat());
      } catch (error) {
        console.error('Erro na busca online:', error);
        return [];
      }
    }
  
    async searchAnimeFire(title) {
      // Simulação de busca - implemente com API real ou scraping
      return Array.from({ length: 12 }, (_, i) => ({
        number: i + 1,
        title: `Episódio ${i + 1}`,
        sources: [{
          site: 'AnimeFire',
          url: `https://animefire.net/${encodeURIComponent(title)}/${i + 1}`,
          quality: 'HD'
        }]
      }));
    }
  
    async searchAnimeOnline(title) {
      return Array.from({ length: 12 }, (_, i) => ({
        number: i + 1,
        title: `Episódio ${i + 1}`,
        sources: [{
          site: 'AnimeOnline',
          url: `https://animeonline.ninja/${encodeURIComponent(title)}/episodio-${i + 1}`,
          quality: 'FullHD'
        }]
      }));
    }
  
    async searchAnimeFlix(title) {
      return Array.from({ length: 12 }, (_, i) => ({
        number: i + 1,
        title: `Episódio ${i + 1}`,
        sources: [{
          site: 'AnimeFlix',
          url: `https://animeflix.tv/watch/${encodeURIComponent(title)}-episode-${i + 1}`,
          quality: '1080p'
        }]
      }));
    }
  
    organizeEpisodes(episodes) {
      const episodeMap = new Map();
      
      episodes.forEach(ep => {
        if (!episodeMap.has(ep.number)) {
          episodeMap.set(ep.number, {
            number: ep.number,
            title: ep.title,
            sources: []
          });
        }
        episodeMap.get(ep.number).sources.push(...ep.sources);
      });
      
      return Array.from(episodeMap.values())
        .sort((a, b) => a.number - b.number);
    }
  
    checkCache(key) {
      const cached = localStorage.getItem(`episodes_${key}`);
      if (cached) {
        const { timestamp, data } = JSON.parse(cached);
        if (Date.now() - timestamp < this.cacheDuration) return data;
      }
      return null;
    }
  
    updateCache(key, data) {
      localStorage.setItem(`episodes_${key}`, JSON.stringify({
        timestamp: Date.now(),
        data
      }));
    }
  
    async fallbackSearch(animeId) {
      const details = await this.fetchAnimeDetails(animeId);
      return { ...details, episodes: [] };
    }
  }