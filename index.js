import { fetchProjectsByYear, fetchProjectsByParent } from './fetchProjects.js';
import { renderProjects } from './renderProjects.js';

// Initialize the Application
async function init() {
  try {
    const projectsByYear = await fetchProjectsByYear();
    window.projectsByParent = await fetchProjectsByParent();
    renderProjects(projectsByYear, window.projectsByParent);
  } catch (error) {
    console.error("Failed to initialize:", error);
  }
}

// Start the application
init();
