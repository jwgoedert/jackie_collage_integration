const vineContainer = document.getElementById("vine-container");
const vineLine = document.getElementById("vine-line");
const viewWidth = window.innerWidth;
const viewHeight = window.innerHeight;
const svgNamespace = "http://www.w3.org/2000/svg";

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
          imgElement.setAttribute("x", nodeX - 100); // Center horizontally
          imgElement.setAttribute("y", nodeY - 100); // Center vertically
          imgElement.setAttribute("width", "200");
          imgElement.setAttribute("height", "200");

          // Fallback if the image fails to load
          imgElement.onerror = () => {
            imgElement.setAttribute("href", "fallback-image.png"); // Use a placeholder image
          };

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

function normalizeName(name) {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}