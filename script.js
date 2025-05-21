// AOS initialization
AOS.init({
  once: true,
  duration: 700,
  offset: 80
});

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// --- Custom Cursor ---
const customCursor = document.getElementById("custom-cursor");
const cursorFollower = document.getElementById("cursor-follower");

if (!isTouchDevice) {
  document.body.style.cursor = 'none';
} else {
  if (customCursor) customCursor.style.display = 'none';
  if (cursorFollower) cursorFollower.style.display = 'none';
}

let mouseX = 0;
let mouseY = 0;

if (!isTouchDevice && typeof gsap !== 'undefined') {
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.to(customCursor, { x: mouseX, y: mouseY, duration: 0.08, ease: "power1.out" });
    gsap.to(cursorFollower, { x: mouseX, y: mouseY, duration: 0.3, ease: "power2.out" });
  });

  document.addEventListener("mouseenter", () => {
    if (customCursor) customCursor.classList.add("active");
  });
  document.addEventListener("mouseleave", () => {
    if (customCursor) customCursor.classList.remove("active");
  });
  document.addEventListener("click", () => {
    if (customCursor) {
      gsap.fromTo(customCursor, { scale: 1.4 }, { scale: 1, duration: 0.2, ease: "elastic.out(1, 0.3)" });
    }
  });

  const hoverableElements = document.querySelectorAll('#project-list li');
  const projectCards = document.querySelectorAll('.project-display-window');
  let activeProject = 'project1';

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

// --- Background Animation (Canvas) ---
// Background Canvas Animation (Dotted Grid)
const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d');

let dots = []; // Array to store dot objects
const dotRadius = 1.5; // Radius of each dot
const dotSpacing = 40; // Spacing between dots
const maxDistance = 150; // Max distance for dots to connect to cursor
const maxOpacity = 0.6; // Max opacity for dots

// Function to resize canvas to fill the window
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initDots(); // Reinitialize dots on resize
}

// Function to initialize dots
function initDots() {
  dots = []; // Clear existing dots
  for (let x = 0; x < canvas.width; x += dotSpacing) {
    for (let y = 0; y < canvas.height; y += dotSpacing) {
      dots.push({
        x: x + (Math.random() - 0.5) * (dotSpacing / 2), // Add slight random offset
        y: y + (Math.random() - 0.5) * (dotSpacing / 2),
        opacity: 0, // Initial opacity
        vx: (Math.random() - 0.5) * 0.1, // Small random velocity for subtle movement
        vy: (Math.random() - 0.5) * 0.1,
      });
    }
  }
}

// Mouse position tracking
let mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// Animation loop
function animateDots() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

  dots.forEach(dot => {
    // Update dot position with subtle movement
    dot.x += dot.vx;
    dot.y += dot.vy;

    // Bounce off edges
    if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
    if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;

    // Calculate distance to mouse
    const dist = Math.sqrt(Math.pow(dot.x - mouse.x, 2) + Math.pow(dot.y - mouse.y, 2));

    // Adjust opacity based on distance to mouse
    if (dist < maxDistance) {
      dot.opacity = maxOpacity * (1 - dist / maxDistance);
    } else {
      dot.opacity = 0; // Fade out if too far
    }

    // Draw dot
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(99, 102, 241, ${dot.opacity})`; // Indigo color with dynamic opacity
    ctx.fill();
  });

  requestAnimationFrame(animateDots); // Loop animation
}

// Event listeners
window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', () => {
  resizeCanvas(); // Initial resize and dot setup
  animateDots(); // Start animation
});
// Scroll to #moreprojects manually with offset
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


// Correct scroll with sticky header offset
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('a[href^=\"#\"]').forEach(anchor => {
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
