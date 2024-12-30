function createRipple(event) {
  const logo = event.currentTarget;
  const circle = document.createElement("span");
  const diameter = Math.max(logo.clientWidth, logo.clientHeight);
  const radius = diameter / 2;

  const rect = logo.getBoundingClientRect();

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - rect.left - radius}px`;
  circle.style.top = `${event.clientY - rect.top - radius}px`;
  circle.classList.add("ripple");

  const ripple = logo.getElementsByClassName("ripple")[0];
  if (ripple) {
    ripple.remove();
  }

  logo.appendChild(circle);

  const recommenderDiv = document.getElementById("recommendation-content");
  if (recommenderDiv) {
    recommenderDiv.style.display = "none";
  }

  const defaultPage = document.getElementById("default-content");
  if (defaultPage) {
    defaultPage.style.display = "block";
  }

  const artistsDiv = document.getElementById("artists-content");
  if (artistsDiv) {
    artistsDiv.style.display = "none";
  }

  const albumDiv = document.getElementById("album-content");
  if (albumDiv) {
    albumDiv.style.display = "none";
  }
}
