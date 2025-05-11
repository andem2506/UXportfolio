

AOS.init({
    once: true,
    duration: 700,
    offset: 80
  });
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // --- Custom Cursor (assuming GSAP is loaded) ---
  const customCursor = document.getElementById("custom-cursor");
  const cursorFollower = document.getElementById("cursor-follower");


  if (!isTouchDevice) {
      document.body.style.cursor = 'none';
  } else {
    if(customCursor) customCursor.style.display = 'none';
    if(cursorFollower) cursorFollower.style.display = 'none';
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
                projectCards.forEach((card) => {
                    card.classList.remove('active');
                });
                document.getElementById(project).classList.add('active');
                gsap.to(document.getElementById(project), { opacity: 1, duration: 0.3 });
                activeProject = project;

                // Remove active class from all list items and add to the current one
                hoverableElements.forEach(item => item.classList.remove('active'));
                listItem.classList.add('active');
            }
        });

        // Initial animation
        gsap.fromTo(listItem, { opacity: 0, x: -20 }, {
            opacity: 1,
            x: 0,
            duration: 0.5,
            delay: 0.2 + index * 0.1,
            ease: 'easeOut',
        });
    });

    // ScrollTrigger
    gsap.utils.toArray('.project-display-window').forEach((card, index) => {
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

              // Remove active class from all list items and add to the current one
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

              // Remove active class from all list items and add to the current one
              hoverableElements.forEach(item => item.classList.remove('active'));
              item.classList.add('active');
            }
          });
        },
        // markers: true, // For debugging
      });
    });
  }

  // --- Background Animation (Canvas) ---
  const canvas = document.getElementById('background-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const gridSize = 30;
    const linesColor = 'rgba(0, 0, 0, 0.15)';
    const stiffness = 0.08;
    const damping = 0.8;
    let points = [];
    let columns, rows;
    class Point {
        constructor(x, y) {
            this.x = x; this.y = y; this.baseX = x; this.baseY = y;
            this.vx = 0; this.vy = 0;
            this.interactionRadius = 180;
            this.forceFactor = 8;
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
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        columns = Math.ceil(canvas.width / gridSize) + 1;
        rows = Math.ceil(canvas.height / gridSize) + 1;
        points = [];
        for (let i = 0; i < columns; i++) {
            points[i] = [];
            for (let j = 0; j < rows; j++) {
                points[i][j] = new Point(i * gridSize, j * gridSize);
            }
        }
    }
    function drawGrid() {
        if (!ctx) return;
        ctx.strokeStyle = linesColor;
        ctx.lineWidth = 0.15;
        for (let i = 0; i < columns - 1; i++) {
            for (let j = 0; j < rows - 1; j++) {
                if (points[i] && points[i][j] && points[i + 1] && points[i + 1][j] && points[i + 1][j + 1] && points[i][j + 1]) {
                    const p1 = points[i][j],
                        p2 = points[i + 1][j],
                        p3 = points[i + 1][j + 1],
                        p4 = points[i][j + 1];
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
    function animateCanvas() {
        if (!ctx || !canvas) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateGrid();
        drawGrid();
        animationFrameId = requestAnimationFrame(animateCanvas);
    }

    function initCanvasAnimation() {
        if (!canvas) return;
        createGrid();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animateCanvas();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCanvasAnimation);
    } else {
        initCanvasAnimation();
    }

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (canvas) initCanvasAnimation();
        }, 100);
    });
  }

  document.getElementById("scrollButton").addEventListener("click", function (e) {
    e.preventDefault();  // Prevent default anchor behavior

    // Get the section position
    const section = document.getElementById("moreprojects");
    const offset = 100; // Adjust this value to control the scroll offset

    // Scroll to the section with an offset
    window.scrollTo({
        top: section.offsetTop - offset, // Adjust position by offset
        behavior: "smooth" // Smooth scroll
    });
});
let scrollTimeout;
  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    const scrollStep = e.deltaY * 0.01; // lower = smoother
    let start = window.scrollY;
    let end = start + scrollStep;
    let current = 0;
    const duration = 300;
    const step = () => {
      current += 20;
      const progress = current / duration;
      if (progress < 1) {
        window.scrollTo(0, start + (end - start) * easeOutCubic(progress));
        scrollTimeout = requestAnimationFrame(step);
      } else {
        window.scrollTo(0, end);
      }
    };
    cancelAnimationFrame(scrollTimeout);
    step();
  }, { passive: false });

  function easeOutCubic(t) {
    return (--t) * t * t + 1;
  }