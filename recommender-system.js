// Function to calculate cosine similarity
function cosineSimilarity(user1, user2) {
  const genres1 = user1.genres;
  const genres2 = user2.genres;

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let genre in genres1) {
    dotProduct += genres1[genre] * genres2[genre];
    magnitude1 += genres1[genre] * genres1[genre];
    magnitude2 += genres2[genre] * genres2[genre];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  if (magnitude1 === 0 || magnitude2 === 0) {
    return 0;
  }

  return dotProduct / (magnitude1 * magnitude2);
}

// Define the input user
const inputUser = {
  name: "InputUser",
  genres: {
    rock: 3,
    pop: 4,
    jazz: 5,
    "hip-hop": 2,
    hardcore: 1,
  },
};

// Load users.json file
fetch("users.json")
  .then((response) => response.json())
  .then((users) => {
    // Calculate cosine similarity between inputUser and all other users
    users.forEach((user) => {
      console.log(
        `Cosine Similarity between ${inputUser.name} and ${user.name}:`,
        cosineSimilarity(inputUser, user)
      );
    });
  })
  .catch((error) => console.error("Error loading users.json:", error));
