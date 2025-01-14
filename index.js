import { fetchProjectsByYear, fetchProjectsByParent } from './fetchProjects.js';
import { renderProjects } from './renderProjects.js';



let currentYearIndex = 0;
let years = [];

function updateYearDisplay() {
  const yearDisplay = document.getElementById("year-display");
  yearDisplay.textContent = years[currentYearIndex];
}

function navigate(direction) {
  if (direction === "left" && currentYearIndex > 0) {
    currentYearIndex--;
  } else if (direction === "right" && currentYearIndex < years.length - 1) {
    currentYearIndex++;
  }
  scrollToYear(currentYearIndex);
  updateYearDisplay();
}

function scrollToYear(index) {
  const yearSection = document.querySelectorAll(".year-section")[index];
  if (yearSection) {
    yearSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function handleIntersection(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const year = entry.target.id.replace("year-", "");
      currentYearIndex = years.indexOf(year);
      updateYearDisplay();
    }
  });
}
// Initialize the Application
async function init() {
  try {
    const projectsByYear = await fetchProjectsByYear();
    window.projectsByParent = await fetchProjectsByParent();
    renderProjects(projectsByYear, window.projectsByParent);

    // Year section
    // Initialize years array
    years = Object.keys(projectsByYear).sort();

    // Set initial year display
    updateYearDisplay();

    // Add event listeners for navigation buttons
    document.getElementById("nav-left").addEventListener("click", () => navigate("left"));
    document.getElementById("nav-right").addEventListener("click", () => navigate("right"));

    // Set up IntersectionObserver to update year display on scroll
    const observer = new IntersectionObserver(handleIntersection, {
      root: document.getElementById("vine-container"),
      threshold: 0.5
    });

    document.querySelectorAll(".year-section").forEach(section => {
      observer.observe(section);
    });

  } catch (error) {
    console.error("Failed to initialize:", error);
  }
}

// Start the application
init();
