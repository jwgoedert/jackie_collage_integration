import { openModal, normalizeName } from './modalUtils.js';

const svgNamespace = "http://www.w3.org/2000/svg";
const viewWidth = window.innerWidth;
const viewHeight = window.innerHeight;
const nodeSize = 300;
const basePath = "data/collages_compiled";

export function setVineContainerWidth(vineData) {
    const vineContainer = document.getElementById("vine-container");
    const vineLine = document.getElementById("vine-line");
    const vineLength = Object.keys(vineData).length;
    vineContainer.style.width = `${vineLength * 100}vw`;

    //   set invisible divs the width of the screen for each year for scrolling
    Object.keys(vineData).forEach((year, yearIndex) => {
        const yearSection = document.createElement("div");
        yearSection.className = "year-section";
        yearSection.style.width = `${viewWidth}px`;
        yearSection.style.height = "100%";
        yearSection.id = `year-${year}`;
        const yearText = document.createElement("div");
        yearText.className = "year-text";
        yearText.innerText = year;
        yearText.style.position = "absolute";
        // yearText.style.fontSize = "20rem";
        yearSection.appendChild(yearText);
        vineLine.appendChild(yearSection);
        console.log(`Added year-section for year: ${year}, Index: ${yearIndex}`);

    });
}

export function createSvgContainer() {
    let svgElement = document.getElementById("vine-svg");
    if (svgElement) return svgElement;

    svgElement = document.createElementNS(svgNamespace, "svg");
    svgElement.setAttribute("width", "100%");
    svgElement.setAttribute("height", `${viewHeight}px`);
    svgElement.style.position = "absolute";
    svgElement.id = "vine-svg";

    // Create groups for vines and nodes
    // Group for vine paths
    const vineGroup = document.createElementNS(svgNamespace, "g");
    vineGroup.id = "vine-group"; 
    svgElement.appendChild(vineGroup);
    
    // Group for image nodes
    const nodeGroup = document.createElementNS(svgNamespace, "g");
    nodeGroup.id = "node-group"; 
    svgElement.appendChild(nodeGroup);

    document.getElementById("vine-line").appendChild(svgElement);

    return svgElement;
}

export function renderProjectNodes(svgElement, vineData) {
    const nodeGroup = document.getElementById("node-group");
    Object.entries(vineData).forEach(([year, yearData]) => {
        const yearIndex = yearData.yearIndex;
        Object.entries(yearData).forEach(([parentVine, projects], parentIndex) => {
            if (parentVine !== "yearIndex") {
                const nodeY = calculateNodeY(parentIndex, yearData);
                projects.forEach((project, index) => {
                    const nodeX = calculateNodeX(index, yearIndex, projects.length);
                    const imagePath = `${basePath}/${project.Date} ${normalizeName(project.Name)}_collage/${project.Date} ${normalizeName(project.Name)}_collage-0.png`;

                    const imgElement = createImageNode(imagePath, nodeX, nodeY, project, vineData);
                    nodeGroup.appendChild(imgElement);
                });
            }
        });
    });
}

export function renderVinePaths(svgElement, vineData) {
    const vineGroup = document.getElementById("vine-group");
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
                            vineGroup
                        );
                    }
                    globalParentVineCoords[parentVine] = { x: nodeX, y: nodeY };
                });
            }
        });
    });
}

function createImageNode(imagePath, x, y, project, projects) {
    const imgElement = document.createElementNS(svgNamespace, "image");
    imgElement.setAttribute("href", imagePath);
    imgElement.setAttribute("x", x - nodeSize / 2);
    imgElement.setAttribute("y", y - nodeSize / 2);
    imgElement.setAttribute("width", nodeSize);
    imgElement.setAttribute("height", nodeSize);

    imgElement.onerror = () => imgElement.setAttribute("href", "/data/fallback-image.svg");
    imgElement.addEventListener("mouseover", () => {
        imgElement.setAttribute("opacity", "0.8");
        const tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        tooltip.innerText = `${project.Name} (${project.Date})`;
        tooltip.style.position = "absolute";
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y - nodeSize / 2 - 20}px`;
        // tooltip.style.backgroundColor = "white";
        tooltip.style.padding = "5px";
        // tooltip.style.border = "1px solid black";
        tooltip.style.zIndex = "1000";
        document.body.appendChild(tooltip);

        imgElement.addEventListener("mouseout", () => {
            imgElement.setAttribute("opacity", "1");
            document.body.removeChild(tooltip);
        }, { once: true });
    });
    imgElement.addEventListener("mouseout", () => imgElement.setAttribute("opacity", "1"));
    imgElement.addEventListener("click", () => openModal(project, projects, window.projectsByParent));

    return imgElement;
}

function calculateNodeX(index, yearIndex, totalProjects) {
    return (index + 1) * (viewWidth / totalProjects) + yearIndex * viewWidth;
}

function calculateNodeY(parentIndex, yearData) {
    const heightDivisor = Object.keys(yearData).length + 1;
    return (parentIndex + 1) * (viewHeight / heightDivisor);
}

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
