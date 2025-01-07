const vineContainer = document.getElementById("vine-container");
const vineLine = document.getElementById("vine-line");
const viewWidth = window.innerWidth;
const viewHeight = window.innerHeight;
const svgNamespace = "http://www.w3.org/2000/svg";
let nodeSize = 300;

const basePath = "data/converted_collages";
let years = [];
let currentYearIndex = 0;

fetch("data/projects.json")
  .then(response => response.json())
  .then(projects => renderProjects(projects))
  .catch(err => console.error("Error fetching JSON:", err));

function renderProjects(projects) {
  setVineContainerWidth(projects);

  // Step 1: Render the SVG container and paths
  const svgElement = renderVineSvg(setVineNodeData(projects));

  // Step 2: Render the project nodes (collages/images)
  renderProjectNodes(svgElement, setVineNodeData(projects));

  console.log("Vine rendering complete.");
}

function setVineContainerWidth(projects) {
  let vineLength = [...new Set(projects.map(p => Math.floor(p.Date || 0)))].sort().length;
  vineContainer.style.width = `${vineLength * 100 || 1}vw`;
}

function setVineNodeData(projects) {
  const vineData = projects.reduce((vineData, project) => {
    if (!vineData[project.Date]) vineData[project.Date] = {};
    if (!vineData[project.Date][project["Parent Vine"]]) vineData[project.Date][project["Parent Vine"]] = [];
    vineData[project.Date][project["Parent Vine"]].push(project);
    return vineData;
  }, {});
  
  const years = Object.keys(vineData).sort();
  years.forEach((year, index) => {
    vineData[year].yearIndex = index;
  });

  return vineData;
}

function renderVineSvg(vineData) {
  const svgElement = document.createElementNS(svgNamespace, "svg");
  svgElement.setAttribute("width", "100%");
  svgElement.setAttribute("height", `${viewHeight}px`);
  svgElement.style.position = "absolute";
  svgElement.style.top = "0";
  svgElement.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svgElement.id = "vine-svg";

  if (document.getElementById("vine-svg")) {
    return document.getElementById("vine-svg");
  }

  const greenColors = [
    "#004d00", "#006600", "#008000", "#009900", "#00b300", "#00cc00", "#00e600", "#00ff00", "#1aff1a"
  ];

  let globalParentVineCoords = {};

  Object.keys(vineData).forEach(year => {
    let yearIndex = vineData[year].yearIndex;

    Object.keys(vineData[year]).forEach((parentVine, parentIndex) => {
      if (parentVine !== "yearIndex") {
        let heightDivisor = Object.keys(vineData[year]).length;
        let heightMultiplier = viewHeight / heightDivisor;
        let nodeY = (parentIndex + 1) * heightMultiplier;

        vineData[year][parentVine].forEach((project, index) => {
          const nodeX = (index + 1) * (viewWidth / vineData[year][parentVine].length) + yearIndex * viewWidth;

          // Draw Bézier curve for connecting vines
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

          // Update the global coordinates for this parent vine
          globalParentVineCoords[parentVine] = { x: nodeX, y: nodeY };
        });
      }
    });
  });

  vineLine.appendChild(svgElement);
  return svgElement;
}

function renderProjectNodes(svgElement, vineData) {
  Object.keys(vineData).forEach(year => {
    let yearIndex = vineData[year].yearIndex;

    Object.keys(vineData[year]).forEach((parentVine, parentIndex) => {
      if (parentVine !== "yearIndex") {
        let heightDivisor = Object.keys(vineData[year]).length;
        let heightMultiplier = viewHeight / heightDivisor;
        let nodeY = (parentIndex + 1) * heightMultiplier;

        vineData[year][parentVine].forEach((project, index) => {
          const nodeX = (index + 1) * (viewWidth / vineData[year][parentVine].length) + yearIndex * viewWidth;

          // Attempt to load the collage for the node
          const imagePath = `${basePath}/${project.Date} ${normalizeName(project.Name)}_collage/${project.Date} ${normalizeName(project.Name)}_collage-0.png`;

          const imgElement = document.createElementNS(svgNamespace, "image");
          imgElement.setAttribute("href", imagePath);
          imgElement.setAttribute("x", nodeX - (nodeSize/2)); // Center horizontally
          imgElement.setAttribute("y", nodeY - (nodeSize/2)); // Center vertically
          imgElement.setAttribute("width", nodeSize);
          imgElement.setAttribute("height", nodeSize);

          // Fallback if the image fails to load
          imgElement.onerror = () => {
            imgElement.setAttribute("href", "/data/fallback-image.svg"); // Use a placeholder image
          };

          // Add hover effect
          imgElement.addEventListener("mouseover", () => {
            imgElement.setAttribute("opacity", "0.8");
          });
          imgElement.addEventListener("mouseout", () => {
            imgElement.setAttribute("opacity", "1");
          });

          // Add click handler to open modal
          imgElement.addEventListener("click", () => openModal(project));

          svgElement.appendChild(imgElement);
        });
      }
    });
  });
}

function drawBezierCurve(x1, y1, x2, y2, stroke, strokeWidth, appendToElement) {
  const path = document.createElementNS(svgNamespace, "path");

  // Control points for a smooth curve
  const controlX1 = x1 + (x2 - x1) / 3;
  const controlY1 = y1;
  const controlX2 = x1 + (2 * (x2 - x1)) / 3;
  const controlY2 = y2;

  const pathData = `M ${x1} ${y1} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${x2} ${y2}`;
  path.setAttribute("d", pathData);
  path.setAttribute("stroke", stroke);
  path.setAttribute("stroke-width", strokeWidth);
  path.setAttribute("fill", "none");

  appendToElement.appendChild(path);
}

function openModal(project) {
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalDateLocation = document.getElementById("modal-date-location");
  const modalParentVine = document.getElementById("modal-parent-vine");
  const modalDescription = document.getElementById("modal-description");
  const gallery = document.getElementById("gallery");
  const relatedProjects = document.getElementById("related-projects");

  modalTitle.textContent = project.Name;
  modalDateLocation.textContent = `${project.Date || "Unknown"} - ${project["Location(s)"] || "Unknown"}`;
  modalParentVine.textContent = project["Parent Vine"];
  modalDescription.textContent = project.Description || "No description available.";

  gallery.innerHTML = "";
  relatedProjects.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const img = document.createElement("img");
    let imgFileName = `${project.Date} ${normalizeName(project.Name)}_collage-${i}.png`;
    img.src = `${basePath}/${project.Date} ${normalizeName(project.Name)}_collage/${imgFileName}`;
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

document.getElementById("modal-close").addEventListener("click", () => {
  document.getElementById("modal").classList.add("hidden");
});

function normalizeName(name) {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}