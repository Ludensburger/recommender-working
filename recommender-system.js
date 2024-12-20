// Function to calculate cosine similarity
function cosineSimilarity(user1, user2) {
  const genres1 = user1.genres;
  const genres2 = user2.genres;

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let genre in genres1) {
    if (genres2[genre]) {
      // Only compare genres that both users have
      dotProduct += genres1[genre] * genres2[genre];
      magnitude1 += genres1[genre] * genres1[genre];
      magnitude2 += genres2[genre] * genres2[genre];
    }
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (magnitude1 * magnitude2);
}

// Function to get all possible genres
function getAllGenres(users) {
  const genres = new Set();
  users.forEach((user) => {
    Object.keys(user.genres).forEach((genre) => genres.add(genre));
  });
  return Array.from(genres);
}

// Function to find similar users
function findSimilarUsers(newUserGenres, users, allGenres) {
  const newUserVector = allGenres.map((genre) => newUserGenres[genre] || 0);
  return users
    .map((user) => {
      const userVector = allGenres.map((genre) => user.genres[genre] || 0);
      const similarity = cosineSimilarity(
        { genres: newUserGenres },
        { genres: user.genres }
      );
      // console.log(`Similarity with user ${user.name}: ${similarity}`); // Debugging line
      return { user, similarity };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5); // Get top 3 similar users
}

// Function to recommend genres
function recommendGenres(newUserGenres, users) {
  const allGenres = getAllGenres(users);
  console.log("All genres:", allGenres); // Debugging line to check the genres

  const similarUsers = findSimilarUsers(newUserGenres, users, allGenres);

  console.log(
    "Similar users:",
    similarUsers.map(({ user, similarity }) => ({
      name: user.name,
      similarity: similarity.toFixed(2),
      genres: user.genres,
    }))
  ); // Debugging line to check the similar users and their genres

  const recommendedGenres = new Set(); // To store unique genres
  const inputUserGenres = new Set(Object.keys(newUserGenres));

  similarUsers.forEach(({ user }) => {
    Object.keys(user.genres).forEach((genre) => {
      // If the genre is not in the input user's genres and it's not already recommended
      if (!inputUserGenres.has(genre) && !recommendedGenres.has(genre)) {
        console.log(`Adding genre: ${genre}`); // Debugging line to check which genre is being added
        recommendedGenres.add(genre);
      }
    });
  });

  // Convert Set to Array and return top 5 genres
  return Array.from(recommendedGenres).slice(0, 5);
}

// Fetch users.json and apply the recommendation system
fetch("users1.json")
  .then((response) => response.json())
  .then((users) => {
    const inputUserGenres = {
      rock: 3,
      metal: 4,
      jazz: 1,
      "hip-hop": 2,
      hardcore: 5,
    };

    const recommendedGenres = recommendGenres(inputUserGenres, users);
    console.log("Recommended genres:", recommendedGenres); // Check recommended genres
  })
  .catch((error) => console.error("Error loading users.json:", error));
