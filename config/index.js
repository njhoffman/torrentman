const config = {
  url: 'https://piratebay.live/search',
  // url: 'https://thepiratebays.info/search',
  shellFilePath: '.data/',
  minSeeders: 5,
  fetchInterval: 1500,
  categories: {
    All: 0,
    Audio: 100,
    'Audio - Music': 101,
    'Audio - Audio Books': 102,
    'Audio - FLAC': 104,
    'Audio - Other': 199,
    Video: 200,
    'Video - Movies': 201,
    'Video - TV Shows': 205,
    'Video - HD Movies': 207,
    'Video - HD TV Shows': 208
  },
  urlSuffix: '99/0'
};

module.exports = config;
