let currentGenre = "";
let genreRatings = {};

function openModal(genre) {
  currentGenre = genre;
  document.getElementById("modal-genre").innerText = genre;
  document.getElementById("genre-slider").value = genreRatings[genre] || 0;
  document.getElementById("modal").style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function saveRating() {
  const rating = document.getElementById("genre-slider").value;
  genreRatings[currentGenre] = parseInt(rating);
  updateGenreCardColor(currentGenre, rating);
  closeModal();
}

function updateGenreCardColor(genre, rating) {
  const genreCard = document.querySelector(
    `.genre-card[data-genre="${genre}"]`
  );
  if (genreCard) {
    const tint = 255 - rating * 20; // Darker for higher ratings
    const lightness = 0.3 + rating * 0.07; // Darker for higher ratings
    genreCard.style.backgroundColor = `rgba(${tint}, 40, 255, ${lightness})`;
  } else {
    console.error(`Genre card for genre "${genre}" not found.`);
  }
}

async function getRecommendations() {
  const inputUserArtists = document
    .getElementById("artists")
    .value.split(",")
    .map((artist) => artist.trim())
    .filter((artist) => artist);

  const userFiles = [
    "./data/users1.json",
    "./data/users2.json",
    // "./data/users3.json",
    // "./data/users4.json",
    // "./data/users5.json",
  ];

  try {
    const allUsers = await loadUserFiles(userFiles);

    if (allUsers.length === 0) {
      throw new Error("No user data available - all files failed to load");
    }

    console.log(
      `Loaded ${allUsers.length} users from ${userFiles.length} files`
    );

    let recommendations = {};

    if (Object.values(genreRatings).some((rating) => rating > 0)) {
      const { recommendedGenres, similarUsers: similarUsersByGenres } =
        recommendGenres(genreRatings, allUsers);
      recommendations.recommendedGenres = recommendedGenres;
      recommendations.similarUsersByGenres = similarUsersByGenres;

      console.log("Similar users by genres:", similarUsersByGenres);
    }

    if (inputUserArtists.length > 0) {
      const { recommendedArtists, similarUsers: similarUsersByArtists } =
        recommendArtists(inputUserArtists, allUsers);
      recommendations.recommendedArtists = recommendedArtists;
      recommendations.similarUsersByArtists = similarUsersByArtists;

      console.log("Similar users by artists:", similarUsersByArtists);
    }

    displayResults(recommendations);
  } catch (error) {
    console.error("Recommendation system error:", error);
    alert("Could not generate recommendations. Please try again later.");
  }
}

async function loadUserFiles(filePaths) {
  const fetchPromises = filePaths.map(async (filePath) => {
    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`Failed to load ${filePath}`);
      return await response.json();
    } catch (error) {
      console.warn(`Error loading ${filePath}:`, error);
      return [];
    }
  });

  const results = await Promise.all(fetchPromises);
  return results.flat();
}

function displayResults(recommendations) {
  const recommendedGenresSection = document.getElementById(
    "recommended-genres-section"
  );
  const recommendedArtistsSection = document.getElementById(
    "recommended-artists-section"
  );

  if (recommendations.recommendedGenres) {
    recommendedGenresSection.style.display = "block";
    const recommendedGenresGrid = document.getElementById("recommended-genres");
    recommendedGenresGrid.innerHTML = recommendations.recommendedGenres
      .map(
        (genre) => `
      <div class="card">${genre}</div>
    `
      )
      .join("");
  } else {
    recommendedGenresSection.style.display = "none";
  }

  if (recommendations.recommendedArtists) {
    recommendedArtistsSection.style.display = "block";
    const recommendedArtistsGrid = document.getElementById(
      "recommended-artists"
    );
    recommendedArtistsGrid.innerHTML = recommendations.recommendedArtists
      .map(
        (artist) => `
      <div class="card">${artist}</div>
    `
      )
      .join("");
  } else {
    recommendedArtistsSection.style.display = "none";
  }

  document.getElementById("recommendation-content").style.display = "none";
  document.getElementById("default-content").style.display = "block";
}

function showRecommendationForm() {
  document.getElementById("default-content").style.display = "none";
  document.getElementById("recommendation-content").style.display = "block";
}

// Include the recommendation functions here

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
    }
    magnitude1 += genres1[genre] * genres1[genre];
  }

  for (let genre in genres2) {
    magnitude2 += genres2[genre] * genres2[genre];
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

// Function to find similar users based on genres
function findSimilarUsersByGenres(newUserGenres, users, allGenres) {
  const newUserVector = allGenres.map((genre) => newUserGenres[genre] || 0);
  return users
    .map((user) => {
      const userVector = allGenres.map((genre) => user.genres[genre] || 0);
      const similarity = cosineSimilarity(
        { genres: newUserVector },
        { genres: userVector }
      );
      return { user, similarity };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5); // Get top 5 similar users
}

// Function to recommend genres
function recommendGenres(newUserGenres, users) {
  const allGenres = getAllGenres(users);
  const similarUsers = findSimilarUsersByGenres(
    newUserGenres,
    users,
    allGenres
  );

  const recommendedGenres = new Set(); // To store unique genres
  const inputUserGenres = new Set(Object.keys(newUserGenres));

  similarUsers.forEach(({ user }) => {
    Object.keys(user.genres).forEach((genre) => {
      // If the genre is not in the input user's genres and it's not already recommended
      if (!inputUserGenres.has(genre) && !recommendedGenres.has(genre)) {
        recommendedGenres.add(genre);
      }
    });
  });

  // Convert Set to Array and return top 5 genres
  return {
    recommendedGenres: Array.from(recommendedGenres).slice(0, 5),
    similarUsers,
  };
}

// Function to get all possible artists
function getAllArtists(users) {
  const artists = new Set();
  users.forEach((user) => {
    user.artists.forEach((artist) => artists.add(artist));
  });
  return Array.from(artists);
}

// Function to find similar users based on artists
function findSimilarUsersByArtists(newUserArtists, users, allArtists) {
  const newUserVector = allArtists.map((artist) =>
    newUserArtists.includes(artist) ? 1 : 0
  );
  return users
    .map((user) => {
      const userVector = allArtists.map((artist) =>
        user.artists.includes(artist) ? 1 : 0
      );
      const similarity = cosineSimilarity(
        { genres: newUserVector },
        { genres: userVector }
      );
      return { user, similarity };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5); // Get top 5 similar users
}

// Function to recommend artists
function recommendArtists(newUserArtists, users) {
  const allArtists = getAllArtists(users);
  const similarUsers = findSimilarUsersByArtists(
    newUserArtists,
    users,
    allArtists
  );

  const recommendedArtists = new Set(); // To store unique artists
  const inputUserArtists = new Set(newUserArtists);

  similarUsers.forEach(({ user }) => {
    user.artists.forEach((artist) => {
      // If the artist is not in the input user's artists and it's not already recommended
      if (!inputUserArtists.has(artist) && !recommendedArtists.has(artist)) {
        recommendedArtists.add(artist);
      }
    });
  });

  // Convert Set to Array and return top 5 artists
  return {
    recommendedArtists: Array.from(recommendedArtists).slice(0, 5),
    similarUsers,
  };
}
