let allArtists = [];
let allUsers = [];

function showArtistsPage() {
  document.getElementById("default-content").style.display = "none";
  document.getElementById("recommendation-content").style.display = "none";
  document.getElementById("artists-content").style.display = "block";
}

function showRecommendationForm() {
  document.getElementById("default-content").style.display = "none";
  document.getElementById("artists-content").style.display = "none";
  document.getElementById("recommendation-content").style.display = "block";
}

async function fetchArtists() {
  const userFiles = [
    "./data/users1.json",
    "./data/users2.json",
    // "./data/users3.json",
    // "./data/users4.json",
    // "./data/users5.json",
  ];

  try {
    allUsers = await loadUserFiles(userFiles);
    allArtists = [...new Set(allUsers.flatMap((user) => user.artists))].sort();
    displayArtists(allArtists, 8); // Default to 8 columns
  } catch (error) {
    console.error("Error fetching artists:", error);
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

function displayArtists(artists, columns) {
  const artistList = document.getElementById("artist-list");
  artistList.innerHTML = artists
    .map((artist) => `<div class="artist-card">${artist}</div>`)
    .join("");

  // Add styles dynamically
  const artistCards = document.querySelectorAll(".artist-card");
  artistCards.forEach((card) => {
    card.style.backgroundColor = "#f2efea"; // Apple's white
    card.style.padding = "10px";
    card.style.borderRadius = "5px";
    card.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
    card.style.textAlign = "center";
    card.style.color = "#000000"; // Black text
    card.style.transition = "box-shadow 0.3s ease";
    card.addEventListener("mouseover", () => {
      card.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.2)";
    });
    card.addEventListener("mouseout", () => {
      card.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
    });
  });

  const artistListStyle = document.getElementById("artist-list").style;
  artistListStyle.display = "grid";
  artistListStyle.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  artistListStyle.gap = "10px";
}

function filterArtistsByGenre() {
  const genre = document.getElementById("genre-filter").value;
  if (genre === "all") {
    displayArtists(allArtists, 8);
  } else {
    const filteredArtists = allUsers
      .filter((user) => Object.keys(user.genres).includes(genre))
      .flatMap((user) => user.artists)
      .filter((artist, index, self) => self.indexOf(artist) === index)
      .sort();
    displayArtists(filteredArtists, 8);
  }
}

const genreFilter = document.getElementById("genre-filter");
genreFilter.style.width = "auto";
genreFilter.style.padding = "10px";
genreFilter.style.marginBottom = "10px";
genreFilter.style.borderRadius = "5px";
genreFilter.style.border = "1px solid #ccc";
genreFilter.style.backgroundColor = "#f2efea"; // Apple's white
genreFilter.style.color = "#000000"; // Black text
genreFilter.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
genreFilter.style.transition = "box-shadow 0.3s ease";
genreFilter.addEventListener("mouseover", () => {
  genreFilter.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.2)";
});
genreFilter.addEventListener("mouseout", () => {
  genreFilter.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
});

document.addEventListener("DOMContentLoaded", fetchArtists);
