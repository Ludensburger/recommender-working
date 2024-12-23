let currentGenre = '';
let genreRatings = {};

function openModal(genre) {
  currentGenre = genre;
  document.getElementById('modal-genre').innerText = genre;
  document.getElementById('genre-slider').value = genreRatings[genre] || 0;
  document.getElementById('modal').style.display = 'block';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

function saveRating() {
  const rating = document.getElementById('genre-slider').value;
  genreRatings[currentGenre] = parseInt(rating);
  updateGenreCardColor(currentGenre, rating);
  closeModal();
}

function updateGenreCardColor(genre, rating) {
  const genreCard = document.querySelector(`.genre-card[data-genre="${genre}"]`);
  const tint = 255 - (rating * 51); // Darker for higher ratings
  genreCard.style.backgroundColor = `rgb(${tint}, ${tint}, ${tint})`;
}

function getRecommendations() {
  const inputUserArtists = document.getElementById('artists').value.split(',').map(artist => artist.trim()).filter(artist => artist);

  fetch('users1.json')
    .then(response => response.json())
    .then(users => {
      let recommendations = {};

      if (Object.values(genreRatings).some(rating => rating > 0)) {
        const { recommendedGenres, similarUsers: similarUsersByGenres } = recommendGenres(genreRatings, users);
        recommendations.recommendedGenres = recommendedGenres;
        recommendations.similarUsersByGenres = similarUsersByGenres;
      }

      if (inputUserArtists.length > 0) {
        const { recommendedArtists, similarUsers: similarUsersByArtists } = recommendArtists(inputUserArtists, users);
        recommendations.recommendedArtists = recommendedArtists;
        recommendations.similarUsersByArtists = similarUsersByArtists;
      }

      displayResults(recommendations);
    })
    .catch(error => console.error('Error loading users.json:', error));
}

function displayResults(recommendations) {
  const resultsDiv = document.getElementById('results');
  let resultsHTML = `<h2>Recommendations</h2>`;

  const genresSection = recommendations.recommendedGenres ? `
    <div class="card">
      <h3>Recommended Genres:</h3>
      <div class="grid">
        ${recommendations.recommendedGenres.map(genre => `
          <div class="card">${genre}</div>
        `).join('')}
      </div>
    </div>
    <div class="card">
      <h3>Similar Users by Genres:</h3>
      <div class="grid">
        ${recommendations.similarUsersByGenres.map(({ user, similarity }) => `
          <div class="user-card">
            <strong>User:</strong> ${user.name}<br>
            <strong>Similarity:</strong> ${similarity.toFixed(2)}<br>
            <strong>Genres:</strong> ${JSON.stringify(user.genres)}
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  const artistsSection = recommendations.recommendedArtists ? `
    <div class="card">
      <h3>Recommended Artists:</h3>
      <div class="grid">
        ${recommendations.recommendedArtists.map(artist => `
          <div class="card">${artist}</div>
        `).join('')}
      </div>
    </div>
    <div class="card">
      <h3>Similar Users by Artists:</h3>
      <div class="grid">
        ${recommendations.similarUsersByArtists.map(({ user, similarity }) => `
          <div class="user-card">
            <strong>User:</strong> ${user.name}<br>
            <strong>Similarity:</strong> ${similarity.toFixed(2)}<br>
            <strong>Artists:</strong> ${user.artists.join(", ")}
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  resultsHTML += genresSection + artistsSection;
  resultsDiv.innerHTML = resultsHTML;
}



function showRecommendationForm() {
  document.getElementById('default-content').style.display = 'none';
  document.getElementById('recommendation-content').style.display = 'block';
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
  const similarUsers = findSimilarUsersByGenres(newUserGenres, users, allGenres);

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
    similarUsers
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
  const newUserVector = allArtists.map((artist) => newUserArtists.includes(artist) ? 1 : 0);
  return users
    .map((user) => {
      const userVector = allArtists.map((artist) => user.artists.includes(artist) ? 1 : 0);
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
  const similarUsers = findSimilarUsersByArtists(newUserArtists, users, allArtists);

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
    similarUsers
  };
}
