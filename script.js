document.addEventListener("DOMContentLoaded", () => {
    const vineContainer = document.getElementById("vine-line");
    const modal = document.getElementById("modal");
    const modalContent = {
        title: document.getElementById("modal-title"),
        dateLocation: document.getElementById("modal-date-location"),
        description: document.getElementById("modal-description"),
        gallery: document.getElementById("gallery"),
        related: document.getElementById("related-projects"),
    };

    // Fetch project data
    fetch("data/projects.json")
        .then((response) => response.json())
        .then((projects) => {
            projects.forEach((project, index) => {
                // Create flower
                const flower = document.createElement("div");
                flower.className = "flower";
                flower.style.left = `${index * 200}px`; // Spread flowers horizontally
                console.log(project);
                flower.style.backgroundImage = `url(${project.images[0]})`;
                vineContainer.appendChild(flower);

                // Add hover and click events
                flower.addEventListener("click", () => openModal(project));
            });
        });

    // Open modal
    function openModal(project) {
        modal.classList.remove("hidden");
        modalContent.title.textContent = project.title;
        modalContent.dateLocation.textContent = `${project.year}, ${project.location}`;
        modalContent.description.textContent = project.description;

        // Gallery
        modalContent.gallery.innerHTML = "";
        project.images.forEach((src) => {
            const img = document.createElement("img");
            img.src = src;
            img.style.width = "100px";
            img.style.margin = "5px";
            modalContent.gallery.appendChild(img);
        });

        // Related Projects
        modalContent.related.innerHTML = "";
        project.related.forEach((relatedProject) => {
            const li = document.createElement("li");
            li.textContent = relatedProject;
            modalContent.related.appendChild(li);
        });
    }

    // Close modal
    document.getElementById("modal-close").addEventListener("click", () => {
        modal.classList.add("hidden");
    });
});