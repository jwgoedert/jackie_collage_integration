// DOM Elements and Constants
const vineContainer = document.getElementById("vine-container");
const vineLine = document.getElementById("vine-line");
const modal = document.getElementById("modal");
const svgNamespace = "http://www.w3.org/2000/svg";
const viewWidth = window.innerWidth;
const viewHeight = window.innerHeight;
const basePath = "data/collages_compiled";
const nodeSize = 300;

// Fetch Projects from API
async function fetchProjects() {
  const API_URL = "http://137.184.181.147:1337/api/projects/group-by-year";
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const data = await response.json();
    console.log("API Response Data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
}

// Initialize the Application
async function init() {
  try {
    const projects = await fetchProjects();
    renderProjects(projects);
  } catch (error) {
    console.error("Failed to initialize:", error);
  }
}

// Render Projects
function renderProjects(projects) {
  console.log("Rendering vine...", projects);
  const vineData = transformProjects(projects);

  setVineContainerWidth(vineData);
  const svgElement = createSvgContainer();
  renderProjectNodes(svgElement, vineData);
  renderVinePaths(svgElement, vineData);

  console.log("Vine rendering complete.");
}

// Transform API Response
function transformProjects(projects) {
  const vineData = {};
  Object.entries(projects).forEach(([year, data]) => {
    vineData[year] = { yearIndex: data.yearIndex || 0 };
    data.forEach(project => {
      if (!vineData[year][project["ParentVine"]]) {
        vineData[year][project["ParentVine"]] = [];
      }
      vineData[year][project["ParentVine"]].push(project);
    });
  });

  Object.keys(vineData).forEach((year, index) => {
    vineData[year].yearIndex = index;
  });
  console.log("Transformed Vine Data:", vineData);
  return vineData;
}

// Set Container Width
function setVineContainerWidth(vineData) {
  const vineLength = Object.keys(vineData).length;
  vineContainer.style.width = `${vineLength * 100}vw`;
}

// Create SVG Container
function createSvgContainer() {
  let svgElement = document.getElementById("vine-svg");
  if (svgElement) return svgElement;

  svgElement = document.createElementNS(svgNamespace, "svg");
  svgElement.setAttribute("width", "100%");
  svgElement.setAttribute("height", `${viewHeight}px`);
  svgElement.style.position = "absolute";
  svgElement.id = "vine-svg";

  vineLine.appendChild(svgElement);
  return svgElement;
}

// Render Project Nodes
function renderProjectNodes(svgElement, vineData) {
  Object.entries(vineData).forEach(([year, yearData]) => {
    const yearIndex = yearData.yearIndex;
    Object.entries(yearData).forEach(([parentVine, projects], parentIndex) => {
      if (parentVine !== "yearIndex") {
        const nodeY = calculateNodeY(parentIndex, yearData);
        projects.forEach((project, index) => {
          const nodeX = calculateNodeX(index, yearIndex, projects.length);
          const imagePath = `${basePath}/${project.Date} ${normalizeName(project.Name)}_collage/${project.Date} ${normalizeName(project.Name)}_collage-0.png`;

          const imgElement = createImageNode(imagePath, nodeX, nodeY, project, vineData);
          svgElement.appendChild(imgElement);
        });
      }
    });
  });
}

// Render Vine Paths
function renderVinePaths(svgElement, vineData) {
  const greenColors = ["#004d00", "#006600", "#008000", "#009900"];
  let globalParentVineCoords = {};

  Object.entries(vineData).forEach(([year, yearData]) => {
    const yearIndex = yearData.yearIndex;
    Object.entries(yearData).forEach(([parentVine, projects], parentIndex) => {
      if (parentVine !== "yearIndex") {
        const nodeY = calculateNodeY(parentIndex, yearData);

        projects.forEach((project, index) => {
          const nodeX = calculateNodeX(index, yearIndex, projects.length);
          if (globalParentVineCoords[parentVine]) {
            drawBezierCurve(
              globalParentVineCoords[parentVine].x,
              globalParentVineCoords[parentVine].y,
              nodeX,
              nodeY,
              greenColors[parentIndex % greenColors.length],
              2,
              svgElement
            );
          }
          globalParentVineCoords[parentVine] = { x: nodeX, y: nodeY };
        });
      }
    });
  });
}

// Create Individual Image Node
function createImageNode(imagePath, x, y, project, projects) {
  const imgElement = document.createElementNS(svgNamespace, "image");
  imgElement.setAttribute("href", imagePath);
  imgElement.setAttribute("x", x - nodeSize / 2);
  imgElement.setAttribute("y", y - nodeSize / 2);
  imgElement.setAttribute("width", nodeSize);
  imgElement.setAttribute("height", nodeSize);

  imgElement.onerror = () => imgElement.setAttribute("href", "/data/fallback-image.svg");
  imgElement.addEventListener("mouseover", () => imgElement.setAttribute("opacity", "0.8"));
  imgElement.addEventListener("mouseout", () => imgElement.setAttribute("opacity", "1"));
  imgElement.addEventListener("click", () => openModal(project, projects));

  return imgElement;
}

// Calculate Node Positions
function calculateNodeX(index, yearIndex, totalProjects) {
  return (index + 1) * (viewWidth / totalProjects) + yearIndex * viewWidth;
}

function calculateNodeY(parentIndex, yearData) {
  const heightDivisor = Object.keys(yearData).length + 1;
  return (parentIndex + 1) * (viewHeight / heightDivisor);
}

// Draw Bézier Curve
function drawBezierCurve(x1, y1, x2, y2, stroke, strokeWidth, appendToElement) {
  const path = document.createElementNS(svgNamespace, "path");
  const controlX1 = x1 + (x2 - x1) / 3;
  const controlX2 = x1 + (2 * (x2 - x1)) / 3;

  path.setAttribute("d", `M ${x1} ${y1} C ${controlX1} ${y1}, ${controlX2} ${y2}, ${x2} ${y2}`);
  path.setAttribute("stroke", stroke);
  path.setAttribute("stroke-width", strokeWidth);
  path.setAttribute("fill", "none");
  appendToElement.appendChild(path);
}

function openModal(project, projects) {
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalDateLocation = document.getElementById("modal-date-location");
  const modalParentVine = document.getElementById("modal-parent-vine");
  const modalDescription = document.getElementById("modal-description");
  const gallery = document.getElementById("gallery");
  const relatedProjects = document.getElementById("related-projects");

  modalTitle.textContent = project.Name;
  modalDateLocation.textContent = `${project.Date || "Unknown"} - ${project.Locations || "Unknown"}`;
  modalParentVine.textContent = project.ParentVine;
  modalDescription.textContent = project.Description || "No description available.";

  // Populate gallery
  gallery.innerHTML = "";
  for (let i = 0; i < 7; i++) {
    const img = document.createElement("img");
    const imgFileName = `${project.Date} ${normalizeName(project.Name)}_collage-${i}.png`;
    img.src = `${basePath}/${project.Date} ${normalizeName(project.Name)}_collage/${imgFileName}`;
    img.alt = `${project.Name} Layer ${i}`;
    img.onerror = () => (img.style.display = "none");
    gallery.appendChild(img);
  }

  // Populate related projects
  relatedProjects.innerHTML = "";
  const year = project.Date;
  const parentVine = project.ParentVine;

  if (projects[year] && projects[year][parentVine]) {
    const parentVineProjects = projects[year][parentVine];
    parentVineProjects.forEach(p => {
      const li = document.createElement("li");
      li.textContent = p.Name;
      li.style.cursor = "pointer";
      if (p.Name === project.Name) {
        li.style.fontWeight = "bold";
        li.style.color = "blue"; // Highlight the current project
      } else {
        li.addEventListener("click", () => openModal(p, projects));
      }
      relatedProjects.appendChild(li);
    });
  } else {
    console.error(`No related projects found for year: ${year}, parent vine: ${parentVine}`);
  }

  modal.classList.remove("hidden");
}

document.getElementById("modal-close").addEventListener("click", () => {
  document.getElementById("modal").classList.add("hidden");
});

document.getElementById("modal-close").addEventListener("click", () => modal.classList.add("hidden"));

// Normalize Project Name
function normalizeName(name) {
  return name.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

// Start the application
init();