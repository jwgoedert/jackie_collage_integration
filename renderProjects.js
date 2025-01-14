import { transformProjects } from './transformProjects.js';
import { setVineContainerWidth, createSvgContainer, renderProjectNodes, renderVinePaths } from './svgUtils.js';

export function renderProjects(projects, projectsByParent) {
  console.log("Rendering vine...", projects);
  const vineData = transformProjects(projects);

  setVineContainerWidth(vineData);
  const svgElement = createSvgContainer();
  renderProjectNodes(svgElement, vineData);
  renderVinePaths(svgElement, vineData);

  console.log("Vine rendering complete.");
}
