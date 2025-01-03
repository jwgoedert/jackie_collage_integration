const vineContainer = document.getElementById("vine-container");
const vineLine = document.getElementById("vine-line");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalDateLocation = document.getElementById("modal-date-location");
const modalDescription = document.getElementById("modal-description");
const gallery = document.getElementById("gallery");
const relatedProjects = document.getElementById("related-projects");
const modalClose = document.getElementById("modal-close");
const navLeft = document.getElementById("nav-left");
const navRight = document.getElementById("nav-right");
const yearDisplay = document.createElement("div");
yearDisplay.id = "year-display";
document.body.appendChild(yearDisplay);

const basePath = "data/converted_collages";
let years = [];
let currentYearIndex = 0;

// Fetch and render projects
fetch("data/projects.json")
  .then(response => response.json())
  .then(projects => renderProjects(projects))
  .catch(err => console.error("Error fetching JSON:", err));

function renderProjects(projects) {
  const parentVineColors = {
    "1-Main Vine": "#006400",
    "2-Second Vine": "#228B22",
    "3-Third Vine": "#32CD32",
  };

  years = [...new Set(projects.map(p => Math.floor(p.Date || 0)))].sort();

  years.forEach(year => {
    const yearSection = document.createElement("div");
    yearSection.classList.add("year-section");

    const parentGroups = groupByParentVine(projects.filter(p => Math.floor(p.Date) === year));

    Object.keys(parentGroups).forEach(parentVine => {
      const parentDiv = document.createElement("div");
      parentDiv.classList.add("parent-vine");
      parentDiv.style.border = `2px solid ${parentVineColors[parentVine] || "#ccc"}`;

      parentGroups[parentVine].forEach(project => {
        const projectDiv = document.createElement("div");
        projectDiv.classList.add("project");

        const image = document.createElement("img");
        const normalizedName = normalizeName(project.Name);
        const folderPath = `${basePath}/${year} ${normalizedName}_collage`;
        image.src = `${folderPath}/${year} ${normalizedName}_collage-0.png`;
        image.alt = project.Name;

        projectDiv.appendChild(image);
        parentDiv.appendChild(projectDiv);

        projectDiv.addEventListener("click", () => openModal(project, folderPath));
      });

      yearSection.appendChild(parentDiv);
    });

    vineLine.appendChild(yearSection);
  });

  updateYearDisplay(); // Set initial year display
  drawVines(); // Draw SVG vines after rendering projects
}

function groupByParentVine(projects) {
  return projects.reduce((groups, project) => {
    const vine = project["Parent Vine"] || "Other";
    if (!groups[vine]) groups[vine] = [];
    groups[vine].push(project);
    return groups;
  }, {});
}

function drawVines() {
  const vineSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  vineSvg.classList.add("vine-svg");
  vineLine.appendChild(vineSvg);

  document.querySelectorAll(".parent-vine").forEach(parentDiv => {
    const projects = parentDiv.querySelectorAll(".project");

    projects.forEach((project, index) => {
      if (index < projects.length - 1) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        const rect1 = project.getBoundingClientRect();
        const rect2 = projects[index + 1].getBoundingClientRect();

        line.setAttribute("x1", rect1.x + rect1.width / 2);
        line.setAttribute("y1", rect1.y + rect1.height / 2);
        line.setAttribute("x2", rect2.x + rect2.width / 2);
        line.setAttribute("y2", rect2.y + rect2.height / 2);
        line.setAttribute("stroke", "#228B22");
        line.setAttribute("stroke-width", "2");

        vineSvg.appendChild(line);
      }
    });
  });
}

function normalizeName(name) {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function openModal(project, folderPath) {
  modalTitle.textContent = project.Name;
  modalDateLocation.textContent = `${project.Date || "Unknown"} - ${
    project["Location(s)"] || "Unknown"
  }`;
  modalDescription.textContent = project.Description || "No description available.";

  gallery.innerHTML = "";
  relatedProjects.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const img = document.createElement("img");
    img.src = `${folderPath}/layer-${i}.png`;
    img.alt = `${project.Name} Layer ${i}`;
    img.onerror = () => (img.style.display = "none");
    gallery.appendChild(img);
  }

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

navLeft.addEventListener("click", () => navigate("left"));
navRight.addEventListener("click", () => navigate("right"));

vineContainer.addEventListener("scroll", () => {
  const sections = document.querySelectorAll(".year-section");
  sections.forEach((section, index) => {
    const rect = section.getBoundingClientRect();
    if (rect.left >= 0 && rect.right <= window.innerWidth) {
      currentYearIndex = index;
      updateYearDisplay();
    }
  });
});

function updateYearDisplay() {
  yearDisplay.textContent = years[currentYearIndex];
  yearDisplay.style.opacity = 0; // Fade out effect
  setTimeout(() => {
    yearDisplay.style.opacity = 1; // Fade in effect
  }, 200);
}

function navigate(direction) {
  if (
    (direction === "left" && currentYearIndex > 0) ||
    (direction === "right" && currentYearIndex < years.length - 1)
  ) {
    currentYearIndex += direction === "left" ? -1 : 1;
    scrollToYear(currentYearIndex);
    updateYearDisplay();
  }
}

function scrollToYear(index) {
  const yearSection = document.querySelectorAll(".year-section")[index];
  if (yearSection) {
    vineContainer.scrollTo({
      left: yearSection.offsetLeft,
      behavior: "smooth",
    });
  }
}