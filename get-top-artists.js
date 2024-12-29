document.addEventListener("DOMContentLoaded", async () => {
  console.log("Getting Top Artists");

  const userFiles = [
    "./data/users1.json",
    "./data/users2.json",
    "./data/users3.json",
    "./data/users4.json",
    "./data/users5.json",
  ];

  try {
    const allUsers = await loadUserFiles(userFiles);

    if (allUsers.length === 0) {
      throw new Error("No user data available - all files failed to load");
    }

    console.log(
      `Loaded ${allUsers.length} users from ${userFiles.length} files`
    );

    const artistCount = new Map();

    allUsers.forEach((user) => {
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
