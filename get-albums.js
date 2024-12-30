function showAlbumsPage() {
  // Hide all other content
  document.getElementById("default-content").style.display = "none";
  document.getElementById("recommendation-content").style.display = "none";
  document.getElementById("artists-content").style.display = "none";

  // Show the albums content
  const albumsContent = document.getElementById("album-content");
  if (albumsContent) {
    albumsContent.style.display = "block";
  }

  // Fetch and display albums
  fetch("./data/albums.json")
    .then((response) => response.json())
    .then((data) => {
      displayAlbums(data, 4); // Default to 4 columns
    })
    .catch((error) => console.error("Error fetching albums:", error));
}

function displayAlbums(data, columns) {
  const albumList = document.getElementById("album-list");
  if (albumList) {
    albumList.innerHTML = ""; // Clear previous content
    data.forEach((artistData) => {
      artistData.albums.forEach((album) => {
        const albumElement = document.createElement("div");
        albumElement.className = "album-card";
        albumElement.innerHTML = `
          <h3>${album.title}</h3>
          <span>${artistData.artist}</span>
        `;
        albumElement.addEventListener("click", () =>
          showAlbumDetails(album, artistData.artist)
        );
        albumList.appendChild(albumElement);
      });
    });

    // Add styles dynamically
    const albumCards = document.querySelectorAll(".album-card");
    albumCards.forEach((card) => {
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

    const albumListStyle = albumList.style;
    albumListStyle.display = "grid";
    albumListStyle.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    albumListStyle.gap = "10px";
  }
}

function showAlbumDetails(album, artist) {
  const albumList = document.getElementById("album-list");
  albumList.innerHTML = ""; // Clear previous content

  const albumDetails = document.createElement("div");
  albumDetails.className = "album-details";
  albumDetails.innerHTML = `
                <h2>${album.title}</h2>
                <h3>${artist}</h3>
                <div class="spacer"></div>
                <ul>
                        ${album.tracks
                          .map((track) => `<li>${track}</li>`)
                          .join("")}
                </ul>
                <button onclick="showAlbumsPage()">Back to Albums</button>
        `;
  albumList.appendChild(albumDetails);

  // Add styles dynamically
  albumDetails.style.backgroundColor = "#f2efea"; // Apple's white
  albumDetails.style.padding = "20px";
  albumDetails.style.borderRadius = "5px";
  albumDetails.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";
  albumDetails.style.textAlign = "center";
  albumDetails.style.color = "#000000"; // Black text
  albumDetails.style.maxWidth = "600px";
  albumDetails.style.margin = "20px auto";

  const spacer = albumDetails.querySelector(".spacer");
  spacer.style.height = "20px";

  const ul = albumDetails.querySelector("ul");
  ul.style.listStyleType = "none";
  ul.style.padding = "0";

  const liElements = ul.querySelectorAll("li");
  liElements.forEach((li) => {
    li.style.padding = "5px 0";
    li.style.borderBottom = "1px solid #ddd";
  });

  const button = albumDetails.querySelector("button");
  button.style.marginTop = "20px";
  button.style.padding = "10px 20px";
  button.style.border = "none";
  button.style.borderRadius = "5px";
  button.style.backgroundColor = "#007bff";
  button.style.color = "#ffffff";
  button.style.cursor = "pointer";
  button.style.transition = "background-color 0.3s ease";
  button.addEventListener("mouseover", () => {
    button.style.backgroundColor = "#0056b3";
  });
  button.addEventListener("mouseout", () => {
    button.style.backgroundColor = "#007bff";
  });
}

// Add event listener to the albumsPage element after DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("albumsPage")
    .addEventListener("click", showAlbumsPage);
});
