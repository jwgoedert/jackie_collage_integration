const basePath = "data/collages_compiled";

export function openModal(project, projects, projectsByParent) {
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalDateLocation = document.getElementById("modal-date-location");
  const modalParentVine = document.getElementById("modal-parent-vine");
  const modalDescription = document.getElementById("modal-description");
  const gallery = document.getElementById("gallery");
  const relatedProjects = document.getElementById("related-projects");

  modalTitle.textContent = project.Name;
  modalDateLocation.textContent = `${project.Date || "Unknown"} - ${project.Locations || "Unknown"}`;
  modalParentVine.textContent = project.ParentVine;
  modalDescription.textContent = project.Description || "No description available.";

  // Populate gallery
  gallery.innerHTML = "";
  for (let i = 0; i < 7; i++) {
    const img = document.createElement("img");
    const imgFileName = `${project.Date} ${normalizeName(project.Name)}_collage-${i}.png`;
    img.src = `${basePath}/${project.Date} ${normalizeName(project.Name)}_collage/${imgFileName}`;
    img.alt = `${project.Name} Layer ${i}`;
    img.onerror = () => (img.style.display = "none");
    gallery.appendChild(img);
  }

  // Populate related projects
  relatedProjects.innerHTML = "";
  if (projectsByParent && projectsByParent[project.ParentVine]) {
    projectsByParent[project.ParentVine].forEach(p => {
      const li = document.createElement("li");
      li.textContent = p.Name;
      li.style.cursor = "pointer";
      if (p.Name === project.Name) {
        li.style.fontWeight = "bold";
        li.style.color = "blue"; // Highlight the current project
      } else {
        li.addEventListener("click", () => openModal(p, projects, projectsByParent));
      }
      relatedProjects.appendChild(li);
    });
  } else {
    console.error(`No related projects found for parent vine: ${project.ParentVine}`);
  }

  modal.classList.remove("hidden");
}

document.getElementById("modal-close").addEventListener("click", () => {
  document.getElementById("modal").classList.add("hidden");
});

export function normalizeName(name) {
  return name.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}
