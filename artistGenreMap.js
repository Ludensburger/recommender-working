// Example artist-to-genre mapping (you can add more artists and genres here)
const artistGenreMap = {
  Skrillex: ["EDM", "Dubstep"],
  CalvinHarris: ["EDM", "House"],
  DavidGuetta: ["EDM", "House"],
  Kraftwerk: ["Electronic", "Krautrock"],
  MyChemicalRomance: ["Emo", "Alternative Rock"],
  BobDylan: ["Folk Rock", "Rock"],
  Disclosure: ["House", "Garage"],
  MuddyWaters: ["Blues"],
  DollyParton: ["Country", "Bluegrass"],
  PeterTosh: ["Reggae"],
  MarvinGaye: ["Soul", "R&B"],
  JohnLeeHooker: ["Blues"],
  WillieNelson: ["Country", "Outlaw Country"],
  Deadmau5: ["EDM", "Progressive House"],
  JimmyCliff: ["Reggae"],
  OtisRedding: ["Soul", "R&B"],
  EdSheeran: ["Pop", "Singer-Songwriter"],
  Radiohead: ["Alternative Rock", "Experimental"],
  BrianEno: ["Ambient", "Electronic"],
  Burzum: ["Black Metal"],
  AlisonKrauss: ["Bluegrass", "Country"],
};

// Function to get a user's genre vector based on their preferences
function getUserGenreVector(user, allGenres) {
  return allGenres.map((genre) => user.genres[genre] || 0);
}

// Function to get all possible genres from all users
function getAllGenres(users) {
  const genres = new Set();
  users.forEach((user) => {
    Object.keys(user.genres).forEach((genre) => genres.add(genre));
  });
  return Array.from(genres);
}

// Cosine similarity function with genre weighting
function cosineSimilarity(vecA, vecB, weights) {
  const dotProduct = vecA.reduce(
    (acc, val, idx) => acc + val * vecB[idx] * weights[idx],
    0
  );
  const magnitudeA = Math.sqrt(
    vecA.reduce((acc, val, idx) => acc + val * val * weights[idx], 0)
  );
  const magnitudeB = Math.sqrt(
    vecB.reduce((acc, val, idx) => acc + val * val * weights[idx], 0)
  );
  return dotProduct / (magnitudeA * magnitudeB);
}

// Function to find similar users based on genre preference
function findSimilarUsers(newUserGenres, users, allGenres) {
  const newUserVector = allGenres.map((genre) => newUserGenres[genre] || 0);
  const weights = allGenres.map((genre) => (newUserGenres[genre] ? 10 : 1)); // Heavier weight for selected genres
  return users
    .map((user) => {
      const userVector = getUserGenreVector(user, allGenres);
      const similarity = cosineSimilarity(newUserVector, userVector, weights);
      return { user, similarity };
    })
    .sort((a, b) => b.similarity - a.similarity);
}

// Function to recommend artists based on genre selection and similar users
function recommendArtists(newUserGenres, users, k = 5) {
  const allGenres = getAllGenres(users);
  const similarUsers = findSimilarUsers(newUserGenres, users, allGenres).slice(
    0,
    k
  );

  const artistScores = {};
  similarUsers.forEach(({ user, similarity }) => {
    user.artists.forEach((artist) => {
      if (!artistScores[artist]) {
        artistScores[artist] = 0;
      }
      artistScores[artist] += similarity;
    });
  });

  const selectedGenres = Object.keys(newUserGenres);
  const filteredArtistScores = Object.entries(artistScores).filter(
    ([artist, score]) => {
      const artistGenres = artistGenreMap[artist] || [];
      // Only consider artists whose genres match the selected genres
      return artistGenres.some((genre) => selectedGenres.includes(genre));
    }
  );

  return filteredArtistScores
    .sort((a, b) => b[1] - a[1])
    .map(([artist]) => artist);
}

// Expose the recommendArtists function to the global scope
window.recommendArtists = recommendArtists;
