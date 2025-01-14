import { fetchProjectsByYear, fetchProjectsByParent } from './fetchProjects.js';
import { renderProjects } from './renderProjects.js';
import { openModal, normalizeName } from './modalUtils.js';

// DOM Elements and Constants
const vineContainer = document.getElementById("vine-container");
const vineLine = document.getElementById("vine-line");
const modal = document.getElementById("modal");
const svgNamespace = "http://www.w3.org/2000/svg";
const viewWidth = window.innerWidth;
const viewHeight = window.innerHeight;
const nodeSize = 300;

// Initialize the Application
async function init() {
  try {
    const projects = await fetchProjectsByYear();
    window.projectsByParent = await fetchProjectsByParent();
    renderProjects(projects, window.projectsByParent);
  } catch (error) {
    console.error("Failed to initialize:", error);
  }
}

document.getElementById("modal-close").addEventListener("click", () => {
  document.getElementById("modal").classList.add("hidden");
});

document.getElementById("modal-close").addEventListener("click", () => modal.classList.add("hidden"));

// Start the application
init();