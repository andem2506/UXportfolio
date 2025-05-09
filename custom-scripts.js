// custom-scripts.js

AOS.init({ once: true, duration: 600, offset: 50 });

// --- Custom Cursor ---
const customCursor = document.getElementById("custom-cursor");
const cursorFollower = document.getElementById("cursor-follower");

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (!isTouchDevice) {
    document.body.style.cursor = 'none';
} else {
    if(customCursor) customCursor.style.display = 'none';
    if(cursorFollower) cursorFollower.style.display = 'none';
}

let mouseX = 0;
let mouseY = 0;

if (!isTouchDevice) {
  document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      gsap.to(customCursor, {
          x: mouseX,
          y: mouseY,
          duration: 0.08,
          ease: "power1.out"
      });

      gsap.to(cursorFollower, {
          x: mouseX,
          y: mouseY,
          duration: 0.3,
          ease: "power2.out"
      });
  });

  document.addEventListener("mouseenter", () => {
      if(customCursor) customCursor.classList.add("active");
  });

  document.addEventListener("mouseleave", () => {
      if(customCursor) customCursor.classList.remove("active");
  });

  document.addEventListener("click", () => {
      if (customCursor) {
          gsap.fromTo(customCursor,
              { scale: 1.4 },
              {
                  scale: 1,
                  duration: 0.2,
                  ease: "elastic.out(1, 0.3)"
              }
          );
      }
  });

  const hoverableElements = document.querySelectorAll('a, button, [class*="hover:"]');
  hoverableElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
          if (customCursor) {
              gsap.to(customCursor, {
                  scale: 1.5,
                  backgroundColor: 'rgba(150, 150, 255, 0.9)',
                  duration: 0.2
              });
          }
      });
      el.addEventListener('mouseleave', () => {
           if (customCursor) {
              gsap.to(customCursor, {
                  scale: 1,
                  backgroundColor: 'rgba(100, 100, 255, 0.7)',
                  duration: 0.2
              });
          }
      });
  });
}

// --- Background Animation (Canvas) ---
const canvas = document.getElementById('background-canvas');
const ctx = canvas.getContext('2d');

const gridSize = 30;
const linesColor = 'rgba(0, 0, 0, 0.1)';
const stiffness = 0.1;
const damping = 0.75;
let points = [];
let columns, rows;

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.vx = 0;
        this.vy = 0;
        this.interactionRadius = 180;
        this.forceFactor = 10;
    }

    update() {
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.interactionRadius && !isTouchDevice) {
            const force = (this.interactionRadius - distance) / this.interactionRadius;
            const angle = Math.atan2(dy, dx);

            this.vx += Math.cos(angle) * force * this.forceFactor;
            this.vy += Math.sin(angle) * force * this.forceFactor;
        }

        const dxSpring = this.x - this.baseX;
        const dySpring = this.y - this.baseY;
        this.vx += -dxSpring * stiffness;
        this.vy += -dySpring * stiffness;

        this.x += this.vx;
        this.y += this.vy;
        this.vx *= damping;
        this.vy *= damping;
    }
}

function createGrid() {
    if (!canvas) return; // Ensure canvas exists
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.ceil(canvas.width / gridSize) + 1;
    rows = Math.ceil(canvas.height / gridSize) + 1;
    points = [];

    for (let i = 0; i < columns; i++) {
        points[i] = [];
        for (let j = 0; j < rows; j++) {
            const x = i * gridSize;
            const y = j * gridSize;
            points[i][j] = new Point(x, y);
        }
    }
}

function drawGrid() {
    if (!ctx) return; // Ensure context exists
    ctx.strokeStyle = linesColor;
    ctx.lineWidth = 0.2;

    for (let i = 0; i < columns - 1; i++) {
        for (let j = 0; j < rows - 1; j++) {
            if (points[i] && points[i][j] && points[i+1] && points[i+1][j] && points[i+1][j+1] && points[i][j+1]) {
                const p1 = points[i][j];
                const p2 = points[i + 1][j];
                const p3 = points[i + 1][j + 1];
                const p4 = points[i][j + 1];

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.lineTo(p3.x, p3.y);
                ctx.lineTo(p4.x, p4.y);
                ctx.closePath();
                ctx.stroke();
            }
        }
    }
}

function updateGrid() {
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            if (points[i] && points[i][j]) {
               points[i][j].update();
            }
        }
    }
}

let animationFrameId = null;
function animate() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateGrid();
    drawGrid();
    animationFrameId = requestAnimationFrame(animate);
}

function initCanvasAnimation() {
    if (!canvas) return; // Don't run if canvas isn't found
    createGrid();
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    animate();
}

// Ensure DOM is ready before trying to get elements like 'background-canvas'
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCanvasAnimation);
} else {
    initCanvasAnimation(); // DOMContentLoaded has already fired
}


let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Re-initialize canvas animation only if canvas exists
        if (document.getElementById('background-canvas')) {
            initCanvasAnimation();
        }
    }, 100);
});