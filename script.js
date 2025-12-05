// AOS initialization
AOS.init({
  once: true,
  duration: 700,
  offset: 80
});

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// --- REMOVE CUSTOM CURSOR ---
// (All custom cursor DOM, GSAP, and event listeners removed)

// --- REMOVE BACKGROUND CANVAS ANIMATION ---
// (All canvas drawing logic, mouse tracking, and animation loop removed)

// --- Project Hover Animation (kept as-is) ---
const hoverableElements = document.querySelectorAll('#project-list li');
const projectCards = document.querySelectorAll('.project-display-window');
let activeProject = 'project1';

if (typeof gsap !== 'undefined') {
  hoverableElements.forEach((listItem, index) => {
    listItem.addEventListener('mouseenter', () => {
      const project = listItem.dataset.project;
      if (project !== activeProject) {
        projectCards.forEach(card => card.classList.remove('active'));
        document.getElementById(project).classList.add('active');
        gsap.to(document.getElementById(project), { opacity: 1, duration: 0.3 });
        activeProject = project;

        hoverableElements.forEach(item => item.classList.remove('active'));
        listItem.classList.add('active');
      }
    });

    gsap.fromTo(listItem, { opacity: 0, x: -20 }, {
      opacity: 1,
      x: 0,
      duration: 0.5,
      delay: 0.2 + index * 0.1,
      ease: 'easeOut',
    });
  });

  // ScrollTrigger for project cards
  gsap.utils.toArray('.project-display-window').forEach((card) => {
    ScrollTrigger.create({
      trigger: card,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => {
        const project = card.id;
        hoverableElements.forEach(item => {
          if (item.dataset.project === project) {
            projectCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            gsap.to(card, { opacity: 1, duration: 0.3 });
            activeProject = project;

            hoverableElements.forEach(item => item.classList.remove('active'));
            item.classList.add('active');
          }
        });
      },
      onEnterBack: () => {
        const project = card.id;
        hoverableElements.forEach(item => {
          if (item.dataset.project === project) {
            projectCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            gsap.to(card, { opacity: 1, duration: 0.3 });
            activeProject = project;

            hoverableElements.forEach(item => item.classList.remove('active'));
            item.classList.add('active');
          }
        });
      }
    });
  });
}

// --- Scroll to #moreprojects with offset ---
const scrollBtn = document.getElementById("scrollButton");
if (scrollBtn) {
  scrollBtn.addEventListener("click", function (e) {
    e.preventDefault();
    const section = document.getElementById("moreprojects");
    const offset = 100;
    window.scrollTo({
      top: section.offsetTop - offset,
      behavior: "smooth"
    });
  });
}

// Correct scroll with header offset
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          const header = document.getElementById('header-placeholder');
          const yOffset = header ? -header.offsetHeight : -100;
          const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      });
    });
  }, 300);
});

// Modal logic (unchanged)
document.querySelectorAll('.openModal').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('modal').classList.remove('hidden');
  });
});

document.getElementById('closeModal').addEventListener('click', function() {
  document.getElementById('modal').classList.add('hidden');
});

window.addEventListener('click', function(e) {
  const modal = document.getElementById('modal');
  if (e.target === modal) {
    modal.classList.add('hidden');
  }
});
