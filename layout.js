let vineLength = 0;
const vineContainer = document.getElementById("vine-container");
const vineLine = document.querySelector("vine-line");
const viewWidth = window.innerWidth;
const viewHeight = window.innerHeight;

const basePath = "data/converted_collages";
let years = [];
let currentYearIndex = 0;

fetch("data/projects.json")
  .then(response => response.json())
  .then(projects => renderProjects(projects))
  .catch(err => console.error("Error fetching JSON:", err));


function renderProjects(projects) {
  vineLength = getYearCount(projects);
  setVineContainerWidth();
  drawHorizontalLine();

  console.log('yearCount', getYearCount(projects));
  console.log('sortProjects', sortProjects(projects));
  console.log('vineNodeData', setVineNodeData(projects));
  renderProjectNodes(setVineNodeData(projects));
  console.log('parentVines', groupByParentVine(projects));
  console.log('vineCountByYear', getVineCountByYear(projects));
  console.log('uniqueParentVineCountByYear', getUniqueParentVineCountByYear(projects));
}

function sortProjects(projects) {
  return projects.sort((a, b) => a.Date - b.Date);
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



function getYearCount(projects) {
  return [...new Set(projects.map(p => Math.floor(p.Date || 0)))].sort().length;
}

function groupByParentVine(projects) {
  return projects.reduce((groups, project) => {
    if (!groups[project["Parent Vine"]]) groups[project["Parent Vine"]] = [];
    groups[project["Parent Vine"]].push(project);

    return groups;
  }, {});
}
function getVineCountByYear(projects) {
  return projects.reduce((vines, project) => {
    if (!vines[project.Date]) vines[project.Date] = 0;
    // vines[project.Date][{project}];
    vines[project.Date]++;
    return vines;
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

function setVineContainerWidth() {
  console.log('setting vineLength', vineLength);
  vineContainer.style.width = `${vineLength * 100 || 1}vw`;
}

function renderVineLine() {
  const vineLine = document.createElement("div");
  vineLine.classList.add("vine-line");
  vineContainer.appendChild(vineLine);
}

function renderVine(parentVine) {
  const vine = document.createElement("div");
  vine.classList.add("vine");
  // add svg line here with bezier curves between ellipses for each project node by Year and parent node
  const vineSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  vineSvg.classList.add("vine-svg");
  // vineSvg.setAttribute("width", totalWidth);

}
function calculateNodePosition(nodeObject) {
  // calculate node position based on year and parent vine
  // return {x, y}  for SVG node
  // x = yearIndex * 100vw + parentVine[array.length] * arrayIndex
  // y = viewHeight / numberOfVines  
  const yearIndex = years.indexOf(nodeObject.Date);
  const x = nodeObject.Date * 100;
  const parentVineIndex = Object.keys(nodeObject.parentVines).indexOf(nodeObject["Parent Vine"]);
  const y = (vineContainer.clientHeight / Object.keys(nodeObject.parentVines).length) * parentVineIndex;
  return { x, y };

}

function renderProjectNodes(projects) {
  const svgNamespace = "http://www.w3.org/2000/svg";
  const nodeSvg = document.createElementNS(svgNamespace, "svg");
  nodeSvg.style.position = "absolute";
  nodeSvg.style.width = "100%";
  nodeSvg.style.height = viewHeight; // Adjust height as needed
  nodeSvg.style.top = "0"; // Ensure it stays at the top
  // nodeSvg.setAttribute("viewBox", `0 0 ${window.innerWidth} 100`);
  nodeSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  nodeSvg.id = "node-svg"; // Add an ID to prevent duplicates

  // Check if the SVG already exists to avoid duplication
  if (document.getElementById("node-svg")) {
    return;
  }


  Object.keys(projects).forEach(year => {
    Object.keys(projects[year]).forEach((parentVine, parentIndex) => {
      //set variable to yearIndex
      let yearIndex = projects[year].yearIndex;
      if (parentVine !== 'yearIndex') {
        let widthDivisor = Object.keys(projects[year][parentVine]).length + 1;
        let widthMultiplier = viewWidth / widthDivisor;
        let heightDivisor = Object.keys(projects[year]).length;// do not have to add 1 since there is an object for yearIndex
        let heightMultiplier = viewHeight / heightDivisor;
        console.log('widthDivisor', widthDivisor, 'widthMultiplier', widthMultiplier, 'heightMultiplier', heightMultiplier, 'viewHeight', viewHeight, 'heightDivisor', heightDivisor);
        let nodeY = (parentIndex + 1)  * heightMultiplier;
        console.log('nodeY', nodeY);
        projects[year][parentVine].forEach((project, index) => {
          console.log('project-rendered', project);
          const nodeX = (index + 1) * widthMultiplier + yearIndex * viewWidth;
          // drawEllipse(nodeX, nodeY, 10 * (index +1), "#056608", nodeSvg);
          drawEllipse(nodeX, nodeY, 50, "#056608", nodeSvg);
          // drawEllipse(nodeX, nodeY + heightMultiplier, 50, "#52C755", nodeSvg);

          // console.log('project from render node', project);
        });
      }
    });
    const vineContainer = document.getElementById("vine-container");
    vineContainer.appendChild(nodeSvg);
  });
}


function drawEllipse(xPos, yPos, radius, fill, appendToElement) {
  const svgNamespace = "http://www.w3.org/2000/svg";

  const ellipse = document.createElementNS(svgNamespace, "ellipse");
  ellipse.setAttribute("cx", xPos); // Center horizontally
  ellipse.setAttribute("cy", yPos); // Center vertically
  ellipse.setAttribute("rx", radius); // Horizontal radius
  ellipse.setAttribute("ry", radius); // Vertical radius
  ellipse.setAttribute("fill", fill); // Fill color
  ellipse.setAttribute("fill-opacity", ".25"); // Fill color
  // Add the ellipse to the SVG
  appendToElement.appendChild(ellipse);
}
function drawHorizontalLine() {
  const svgNamespace = "http://www.w3.org/2000/svg";

  // Create the SVG element
  const vineSvg = document.createElementNS(svgNamespace, "svg");
  vineSvg.style.position = "absolute";
  vineSvg.style.width = "100%";
  vineSvg.style.height = "500"; // Adjust height as needed
  vineSvg.style.top = "0"; // Ensure it stays at the top
  // vineSvg.setAttribute("viewBox", `0 0 ${window.innerWidth} 100`);
  vineSvg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  vineSvg.id = "horizontal-line-svg"; // Add an ID to prevent duplicates

  // Check if the SVG already exists to avoid duplication
  if (document.getElementById("horizontal-line-svg")) {
    return;
  }

  // Create the line element
  const line = document.createElementNS(svgNamespace, "line");
  line.setAttribute("x1", "0"); // Start at the left edge
  line.setAttribute("y1", "50"); // Vertical midpoint of the SVG
  line.setAttribute("x2", "48720"); // End at the right edge
  // line.setAttribute("x2", `${window.innerWidth}`); // End at the right edge
  line.setAttribute("y2", "450"); // Same vertical position
  line.setAttribute("stroke", "black");
  line.setAttribute("stroke-width", "2");
  // Create the ellipse element
  drawEllipse("10%","10%","50","#056608", vineSvg);
  // Add the line to the SVG
  vineSvg.appendChild(line);

  // Append the SVG to the container
  const vineContainer = document.getElementById("vine-container");
  vineContainer.appendChild(vineSvg);

  // Ensure it adjusts on window resize
  window.addEventListener("resize", () => {
    // vineSvg.setAttribute("viewBox", `0 0 ${window.innerWidth} 100`);
    line.setAttribute("x2", `${window.innerWidth}`);
  });
}

// Call the function to draw the line
drawHorizontalLine();