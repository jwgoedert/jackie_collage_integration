const vineLine = document.getElementById("vine-line");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalDateLocation = document.getElementById("modal-date-location");
const modalDescription = document.getElementById("modal-description");
const gallery = document.getElementById("gallery");
const relatedProjects = document.getElementById("related-projects");
const modalClose = document.getElementById("modal-close");

// Navigation buttons
const navLeft = document.getElementById("nav-left");
const navRight = document.getElementById("nav-right");

// Base path for images
const basePath = "data/converted_collages";

// Fetch projects.json and render the vine line
fetch("data/projects.json")
  .then(response => response.json())
  .then(projects => renderProjects(projects))
  .catch(err => console.error("Error fetching JSON:", err));

function renderProjects(projects) {
  projects.forEach(project => {
    const year = Math.floor(project.Date || 0);
    const normalizedName = normalizeName(project.Name);
    const folderPath = `${basePath}/${year} ${normalizedName}_collage`;

    const projectDiv = document.createElement("div");
    projectDiv.classList.add("project");

    const image = document.createElement("img");
    image.src = `${folderPath}/${normalizedName}-0.png`; // Default to the first layer
    image.alt = project.Name;
    // image.onerror = () => (image.src = "assets/placeholder.png");

    const title = document.createElement("h3");
    title.textContent = project.Name;

    projectDiv.appendChild(image);
    projectDiv.appendChild(title);

    projectDiv.addEventListener("click", () => openModal(project, folderPath));
    vineLine.appendChild(projectDiv);
  });
}

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function openModal(project, folderPath) {
  modalTitle.textContent = project.Name;
  modalDateLocation.textContent = `${project.Date || "Unknown"} - ${
    project["Location(s)"] || "Unknown"
  }`;
  modalDescription.textContent = project.Description || "No description available.";

  // Clear gallery and related projects
  gallery.innerHTML = "";
  relatedProjects.innerHTML = "";

  // Add images to gallery
  for (let i = 0; i < 7; i++) {
    const img = document.createElement("img");
    img.src = `${folderPath}/layer-${i}.png`;
    img.alt = `${project.Name} Layer ${i}`;
    img.onerror = () => (img.style.display = "none"); // Hide if image not found
    gallery.appendChild(img);
  }

  // Add related projects
  project["Collaborators"].forEach(collaborator => {
    const li = document.createElement("li");
    li.textContent = collaborator;
    relatedProjects.appendChild(li);
  });

  modal.classList.remove("hidden");
}

modalClose.addEventListener("click", () => {
  modal.classList.add("hidden");
});

navLeft.addEventListener("click", () => {
  vineLine.scrollBy({ left: -300, behavior: "smooth" });
});

navRight.addEventListener("click", () => {
  vineLine.scrollBy({ left: 300, behavior: "smooth" });
});