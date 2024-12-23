document.addEventListener("DOMContentLoaded", async () => {
  console.log("Getting Top Artists");

  try {
    const response = await fetch("users1.json");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const users = await response.json();
    console.log("Fetched users:", users); // Debugging statement

    const artistCount = new Map();

    users.forEach((user) => {
      user.artists.forEach((artist) => {
        artistCount.set(artist, (artistCount.get(artist) || 0) + 1);
      });
    });

    console.log("Artist count:", artistCount); // Debugging statement

    const topArtists = Array.from(artistCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([artist]) => artist);

    console.log("Top artists:", topArtists); // Debugging statement

    document.querySelector(".card1").textContent = topArtists[0] || "N/A";
    document.querySelector(".card2").textContent = topArtists[1] || "N/A";
    document.querySelector(".card3").textContent = topArtists[2] || "N/A";
    document.querySelector(".card4").textContent = topArtists[3] || "N/A";
    document.querySelector(".card5").textContent = topArtists[4] || "N/A";
  } catch (error) {
    console.error("Error fetching users:", error);
    document.querySelector(".card1").textContent = "Error";
    document.querySelector(".card2").textContent = "Error";
    document.querySelector(".card3").textContent = "Error";
    document.querySelector(".card4").textContent = "Error";
    document.querySelector(".card5").textContent = "Error";
  }
});
