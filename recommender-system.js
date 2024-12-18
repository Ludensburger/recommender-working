function getUserGenreVector(user, allGenres) {
  return allGenres.map((genre) => user.genres[genre] || 0);
}

function getAllGenres(users) {
  const genres = new Set();
  users.forEach((user) => {
    Object.keys(user.genres).forEach((genre) => genres.add(genre));
  });
  return Array.from(genres);
}

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

function findSimilarUsers(newUserGenres, users, allGenres) {
  const newUserVector = allGenres.map((genre) => newUserGenres[genre] || 0);
  const weights = allGenres.map((genre) => (newUserGenres[genre] ? 10 : 1)); // Give more weight to selected genres
  return users
    .map((user) => {
      const userVector = getUserGenreVector(user, allGenres);
      const similarity = cosineSimilarity(newUserVector, userVector, weights);
      return { user, similarity };
    })
    .sort((a, b) => b.similarity - a.similarity);
}

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
      return users.some(
        (user) =>
          user.artists.includes(artist) &&
          Object.keys(user.genres).some((genre) =>
            selectedGenres.includes(genre)
          )
      );
    }
  );

  return filteredArtistScores
    .sort((a, b) => b[1] - a[1])
    .map(([artist]) => artist);
}

// Expose the recommendArtists function to the global scope
window.recommendArtists = recommendArtists;
