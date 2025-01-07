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
  renderProjectNodes(setVineNodeData(projects));

  // console.log('yearCount', getYearCount(projects));
  // console.log('sortProjects', sortProjects(projects));
  // console.log('vineNodeData', setVineNodeData(projects));
  console.log('parentVines', groupByParentVine(projects));
  console.log('uniqueParentVineCountByYear', getUniqueParentVineCountByYear(projects));
}

function setVineContainerWidth(projects) {
  let vineLength = [...new Set(projects.map(p => Math.floor(p.Date || 0)))].sort().length;
  vineContainer.style.width = `${vineLength * 100 || 1}vw`;
}

function setVineNodeData(projects) {
  // make compound object with year containing parentVine objects with projects
  // {year: {parentVine: [projects]}, yearIndex: index}
  const vineData = projects.reduce((vineData, project) => {
    if (!vineData[project.Date]) vineData[project.Date] = {};
    if (!vineData[project.Date][project["Parent Vine"]]) vineData[project.Date][project["Parent Vine"]] = [];
    vineData[project.Date][project["Parent Vine"]].push(project);
    return vineData;
  }, {});
  // Add numeric index by year
  const years = Object.keys(vineData).sort();
  years.forEach((year, index) => {
    vineData[year].yearIndex = index;
  });

  return vineData;
}


function groupByParentVine(projects) {
  return projects.reduce((groups, project) => {
    if (!groups[project["Parent Vine"]]) groups[project["Parent Vine"]] = [];
    groups[project["Parent Vine"]].push(project);
    return groups;
  }, {});
}

// Need verify this is correct
function getUniqueParentVineCountByYear(projects) {
  return projects.reduce((vines, project) => {
    if (!vines[project.Date]) vines[project.Date] = new Set();
    vines[project.Date].add(project["Parent Vine"]);
    return vines;
  }, {});
}


function renderProjectNodes(projects) {
  const nodeSvg = document.createElementNS(svgNamespace, "svg");
  nodeSvg.style.position = "absolute";
  nodeSvg.style.width = "100%";
  nodeSvg.style.height = viewHeight; // Adjust height as needed
  nodeSvg.style.top = "0"; // Ensure it stays at the top
  nodeSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  nodeSvg.id = "node-svg";

  if (document.getElementById("node-svg")) {
    return;
  }

  const greenColors = [
    "#004d00", "#006600", "#008000", "#009900", "#00b300", "#00cc00", "#00e600", "#00ff00", "#1aff1a"
  ];

  Object.keys(projects).forEach(year => {
    let yearIndex = projects[year].yearIndex;
    let parentVineCoords = {}; // Store the last node coordinates for each parent vine

    Object.keys(projects[year]).forEach((parentVine, parentIndex) => {
      if (parentVine !== 'yearIndex') {
        let widthDivisor = projects[year][parentVine].length + 1;
        let widthMultiplier = viewWidth / widthDivisor;
        let heightDivisor = Object.keys(projects[year]).length;
        let heightMultiplier = viewHeight / heightDivisor;
        let nodeY = (parentIndex + 1) * heightMultiplier;

        projects[year][parentVine].forEach((project, index) => {
          const nodeX = (index + 1) * widthMultiplier + yearIndex * viewWidth;

          // Draw ellipse for the project node
          drawEllipse(nodeX, nodeY, 50, greenColors[parentIndex % greenColors.length], nodeSvg);

          // Connect nodes within the same Parent Vine
          if (parentVineCoords[parentVine]) {
            drawLine(
              parentVineCoords[parentVine].x,
              parentVineCoords[parentVine].y,
              nodeX,
              nodeY,
              "green",
              2,
              nodeSvg
            );
          }

          // Update the last known coordinates for this parent vine
          parentVineCoords[parentVine] = { x: nodeX, y: nodeY };
        });
      }
    });
  });

  vineLine.appendChild(nodeSvg);
}

function drawEllipse(xPos, yPos, radius, fill, appendToElement) {
  const ellipse = document.createElementNS(svgNamespace, "ellipse");
  ellipse.setAttribute("cx", xPos); // Center horizontally
  ellipse.setAttribute("cy", yPos); // Center vertically
  ellipse.setAttribute("rx", radius); // Horizontal radius
  ellipse.setAttribute("ry", radius); // Vertical radius
  ellipse.setAttribute("fill", fill); // Fill color
  ellipse.setAttribute("fill-opacity", ".75"); // Fill color
  // Add the ellipse to the SVG
  appendToElement.appendChild(ellipse);
}
function drawLine(x1, y1, x2, y2, stroke, strokeWidth, appendToElement) {
  const line = document.createElementNS(svgNamespace, "line");
  line.setAttribute("x1", x1); // Start at the left edge
  line.setAttribute("y1", y1); // Vertical midpoint of the SVG
  line.setAttribute("x2", x2); // End at the right edge
  line.setAttribute("y2", y2); // Same vertical position
  line.setAttribute("stroke", stroke);
  line.setAttribute("stroke-width", strokeWidth);
  // Add the line to the SVG
  appendToElement.appendChild(line);
}
