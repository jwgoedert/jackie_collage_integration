let vineLength = 0;
const vineContainer = document.getElementById("vine-container");

const basePath = "data/converted_collages";
let years = [];
let currentYearIndex = 0;

// Fetch and render projects
fetch("data/projects.json")
  .then((response) => response.json())
  .then((projects) => {
    vineLength = getYearCount(projects);
    setVineContainerWidth();
    years = getSortedYears(projects);
    const vineData = setVineNodeData(projects);
    renderVines(vineData);
    renderProjectNodes(projects);
  })
  .catch((err) => console.error("Error fetching JSON:", err));

// Utility to get unique years sorted
function getSortedYears(projects) {
  return [...new Set(projects.map((p) => Math.floor(p.Date || 0)))].sort();
}

// Calculate vine container width
function setVineContainerWidth() {
  vineContainer.style.width = `${vineLength * 100}vw`;
}

// Generate structured vine data by year and parent vine
function setVineNodeData(projects) {
  return projects.reduce((vineData, project) => {
    const year = Math.floor(project.Date);
    if (!vineData[year]) vineData[year] = {};
    if (!vineData[year][project["Parent Vine"]]) {
      vineData[year][project["Parent Vine"]] = [];
    }
    vineData[year][project["Parent Vine"]].push(project);
    return vineData;
  }, {});
}

// Render vines as SVG paths
function renderVines(vineData) {
  const svgNamespace = "http://www.w3.org/2000/svg";

  years.forEach((year, yearIndex) => {
    const yearProjects = vineData[year];
    if (!yearProjects) return;

    Object.entries(yearProjects).forEach(([parentVine, projects], parentIndex) => {
      const vineSvg = document.createElementNS(svgNamespace, "svg");
      vineSvg.classList.add("vine-svg");
      vineSvg.style.position = "absolute";
      vineSvg.style.width = "100%";
      vineSvg.style.height = "100%";
      vineSvg.setAttribute("viewBox", `0 0 ${vineContainer.offsetWidth} ${vineContainer.offsetHeight}`);
      vineSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");

      const path = document.createElementNS(svgNamespace, "path");
      path.setAttribute("fill", "none");
      path.setAttribute(
        "stroke",
        `hsl(${(parentIndex / Object.keys(yearProjects).length) * 360}, 100%, 50%)`
      );
      path.setAttribute("stroke-width", "2");

      let pathData = "";
      projects.forEach((project, projectIndex) => {
        const position = calculateNodePosition({
          yearIndex,
          parentIndex,
          totalParents: Object.keys(yearProjects).length,
          nodeIndex: projectIndex,
          totalNodes: projects.length,
        });

        if (projectIndex === 0) {
          pathData += `M ${position.x} ${position.y} `;
        } else {
          const prevPosition = calculateNodePosition({
            yearIndex,
            parentIndex,
            totalParents: Object.keys(yearProjects).length,
            nodeIndex: projectIndex - 1,
            totalNodes: projects.length,
          });

          const controlPointX = (prevPosition.x + position.x) / 2;
          pathData += `Q ${controlPointX},${prevPosition.y} ${position.x},${position.y} `;
        }
      });

      if (!pathData) {
        console.error("Path data generation issue:", {
          year,
          parentVine,
          projects,
          pathData,
        });
      }

      path.setAttribute("d", pathData.trim());
      vineSvg.appendChild(path);
      vineContainer.appendChild(vineSvg);
    });
  });
}

// Calculate position for each project node
function calculateNodePosition({ yearIndex, parentIndex, totalParents, nodeIndex, totalNodes }) {
  const containerWidth = vineContainer.offsetWidth;
  const containerHeight = vineContainer.offsetHeight;

  const x =
    (yearIndex * containerWidth) / vineLength + (nodeIndex / totalNodes) * (containerWidth / vineLength);
  const y = (containerHeight / (totalParents + 1)) * (parentIndex + 1);

  return { x, y };
}

// Render project nodes
function renderProjectNodes(projects) {
  projects.forEach((project) => {
    const projectNode = document.createElement("div");
    projectNode.classList.add("project-node");
    projectNode.style.position = "absolute";
    const yearIndex = years.indexOf(Math.floor(project.Date));

    if (yearIndex === -1) {
      console.error(`Year index not found for project:`, project);
      return;
    }

    const position = calculateNodePosition({
      yearIndex,
      parentIndex: 0, // Assuming base vine for now
      totalParents: 1, // Assuming base vine for now
      nodeIndex: 0, // Adjusted in full data setup
      totalNodes: 1, // Adjusted in full data setup
    });

    projectNode.style.left = `${position.x}px`;
    projectNode.style.top = `${position.y}px`;

    const img = document.createElement("img");
    img.src = `${basePath}/${Math.floor(project.Date)} ${project.Name}_collage/layer-0.png`;
    img.alt = project.Name;
    projectNode.appendChild(img);

    vineContainer.appendChild(projectNode);
  });
}

// Helper to count years
function getYearCount(projects) {
  return [...new Set(projects.map((p) => Math.floor(p.Date || 0)))].length;
}