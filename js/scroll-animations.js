document.addEventListener("DOMContentLoaded", function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ========================
  // REVEAL ON SCROLL (IntersectionObserver)
  // ========================
  const revealElements = document.querySelectorAll(".reveal-left, .reveal-right");

  if (reduceMotion) {
    revealElements.forEach(el => el.classList.add("reveal-active"));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-active");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ========================
  // HAMBURGER MENU
  // ========================
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");
  const navItems = document.querySelectorAll(".nav-links a");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      const isActive = hamburger.classList.toggle("active");
      navLinks.classList.toggle("active");
      hamburger.setAttribute("aria-expanded", isActive);
    });

    navItems.forEach(item => {
      item.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navLinks.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });

    // Close on escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navLinks.classList.contains("active")) {
        hamburger.classList.remove("active");
        navLinks.classList.remove("active");
        hamburger.setAttribute("aria-expanded", "false");
        hamburger.focus();
      }
    });
  }

  // ========================
  // COUNTER ANIMATION (IntersectionObserver)
  // ========================
  const counters = document.querySelectorAll("[data-target]");

  if (counters.length > 0 && !reduceMotion) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.getAttribute("data-target"), 10);
          const prefix = counter.getAttribute("data-prefix") || "";
          const suffix = counter.getAttribute("data-suffix") || "";
          const duration = 1500;
          const startTime = performance.now();

          function updateCount(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            const current = Math.floor(target * eased);
            counter.textContent = prefix + current.toLocaleString() + suffix;

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              counter.textContent = prefix + target.toLocaleString() + suffix;
            }
          }

          requestAnimationFrame(updateCount);
          observer.unobserve(counter);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    counters.forEach(counter => counterObserver.observe(counter));
  } else if (reduceMotion) {
    counters.forEach(counter => {
      const target = counter.getAttribute("data-target");
      const prefix = counter.getAttribute("data-prefix") || "";
      const suffix = counter.getAttribute("data-suffix") || "";
      counter.textContent = prefix + target + suffix;
    });
  }

  // ========================
  // SMOOTH SCROLL FOR ANCHORS
  // ========================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = document.querySelector(".navbar")?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({ top: targetPosition, behavior: reduceMotion ? "auto" : "smooth" });
      }
    });
  });

  // ========================
  // LOAD PROJECTS FROM JSON
  // ========================
  async function loadProjects() {
    const grid = document.getElementById("projects-grid");
    if (!grid) return;

    try {
      // Try relative path first, then absolute
      const response = await fetch("projects.json", { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const projects = await response.json();

      grid.innerHTML = projects.map(project => `
        <article class="project-card">
          <div class="project-image">
            <img loading="lazy" src="${project.image}" alt="${project.name}" width="400" height="225">
          </div>
          <div class="project-info">
            <h3>${project.name}</h3>
            <p>${project.description}</p>
            <div class="project-tags">
              ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}
            </div>
            ${project.url ? `<a href="${project.url}" target="_blank" rel="noopener noreferrer" class="project-btn">Ver proyecto</a>` : ""}
          </div>
        </article>
      `).join("");

      console.log(`[Projects] Loaded ${projects.length} projects`);
    } catch (error) {
      console.error("Error loading projects:", error);
      grid.innerHTML = '<p style="color: #8B949E; text-align: center; grid-column: 1/-1;">No se pudieron cargar los proyectos.</p>';
    }
  }

  loadProjects();
});