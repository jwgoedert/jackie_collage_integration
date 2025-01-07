const vineContainer = document.getElementById("vine-container");
const vineLine = document.getElementById("vine-line");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalDateLocation = document.getElementById("modal-date-location");
const modalParentVine = document.getElementById("modal-parent-vine");
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
  // Get all parent vines to reference for below color mapping
  const parentVines = projects.reduce((vines, project) => {
    if (!vines.includes(project["Parent Vine"])) vines.push(project["Parent Vine"]);
    return vines;
  }, []);
  console.log('parentVines', parentVines);

  // Define green colors for each parent vine from parentVines array
  const parentVineColors = parentVines.reduce((colors, vine) => {
    const vineNumber = parseInt(vine.match(/\d+/), 10) || 0;
    const hue = 120; // Green hue
    const lightness = 30 + (vineNumber * 10) % 50; // Vary lightness between 30% and 80%
    colors[vine] = `hsl(${hue}, 50%, ${lightness}%)`;
    return colors;
  }, {});
  console.log('parentVineColors', parentVineColors);

  // Plug in specific colors for next iteration
  // const parentVineColors = {
  //   "1-Main Vine": "#006400",
  //   "2- Main Vine - Herman's House": "#acd8a7",
  //   "3-Third Vine": "#32CD32",
  // };

  years = [...new Set(projects.map(p => Math.floor(p.Date || 0)))].sort();

  years.forEach(year => {
    const yearSection = document.createElement("div");
    yearSection.classList.add("year-section");

    const parentGroups = groupByParentVine(projects.filter(p => Math.floor(p.Date) === year));

    Object.keys(parentGroups).forEach(parentVine => {
      const parentDiv = document.createElement("div");
      parentDiv.classList.add("parent-vine");
      parentDiv.style.border = `10px solid ${parentVineColors[parentVine] || "#ccc"}`;

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

  // Calculate the total width of the projects
  const totalWidth = Array.from(document.querySelectorAll(".year-section"))
    .reduce((width, section) => width + section.scrollWidth, 0);

  vineSvg.setAttribute("width", totalWidth);
  vineSvg.setAttribute("height", vineContainer.scrollHeight);
  vineLine.appendChild(vineSvg);

  document.querySelectorAll(".parent-vine").forEach(parentDiv => {
    const projects = parentDiv.querySelectorAll(".project");

    projects.forEach((project, index) => {
      console.log('project', project);
      if (index < projects.length - 1) {
        const nextProject = projects[index + 1];
        const startX = project.offsetLeft + project.offsetWidth / 2;
        const startY = project.offsetTop + project.offsetHeight / 2;
        const endX = nextProject.offsetLeft + nextProject.offsetWidth / 2;
        const endY = nextProject.offsetTop + nextProject.offsetHeight / 2;
        console.log('startX', startX, 'startY', startY, 'endX', endX, 'endY', endY);
        console.log('project', project, 'nextProject', nextProject);
        console.log('project', project.offsetLeft, project.offsetWidth, project.offsetTop, project.offsetHeight, 'nextProject', nextProject);
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        // const d = `M ${startX},${startY} C ${startX + 100},${startY} ${endX - 100},${endY} ${endX},${endY}`;
        const d = `M ${startX},${startY} C ${startX + 100},${startY} ${endX - 100},${endY} ${endX},${endY}`;
        path.setAttribute("d", d);
        path.setAttribute("stroke", "green");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("fill", "none");

        vineSvg.appendChild(path);
      }
    });
  });
}

// Call drawVines after rendering projects
fetch("data/projects.json")
  .then(response => response.json())
  .then(projects => {
    renderProjects(projects);
    drawVines(); // Ensure drawVines is called after projects are rendered
  })
  .catch(err => console.error("Error fetching JSON:", err));

function normalizeName(name) {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function openModal(project, folderPath) {
  modalTitle.textContent = project.Name;
  modalDateLocation.textContent = `${project.Date || "Unknown"} - ${project["Location(s)"] || "Unknown"
    }`;
  modalParentVine.textContent = project["Parent Vine"] || "Other";
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