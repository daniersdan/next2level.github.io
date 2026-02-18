/* =============================================
   NEXT2LEVEL - Main JavaScript
   Vanilla JS - No dependencies
   ============================================= */

(function () {
  'use strict';

  /* ---- Particle System ---- */
  const canvas = document.getElementById('particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    let mouse = { x: null, y: null, radius: 150 };

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.baseOpacity = this.opacity;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (mouse.x !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= dx * force * 0.02;
            this.y -= dy * force * 0.02;
            this.opacity = this.baseOpacity + force * 0.4;
          } else {
            this.opacity += (this.baseOpacity - this.opacity) * 0.05;
          }
        }

        if (this.x < -10 || this.x > canvas.width + 10 ||
            this.y < -10 || this.y > canvas.height + 10) {
          this.reset();
          if (Math.random() > 0.5) {
            this.x = Math.random() > 0.5 ? -5 : canvas.width + 5;
          } else {
            this.y = Math.random() > 0.5 ? -5 : canvas.height + 5;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(14, 246, 204, ${this.opacity})`;
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    function connectParticles() {
      const maxDist = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(14, 246, 204, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      connectParticles();
      animationId = requestAnimationFrame(animateParticles);
    }

    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', function () {
      mouse.x = null;
      mouse.y = null;
    });

    window.addEventListener('resize', function () {
      resizeCanvas();
      initParticles();
    });

    resizeCanvas();
    initParticles();
    animateParticles();
  }

  /* ---- Navbar Scroll Effect ---- */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function handleNavScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  function highlightNavLink() {
    const scrollY = window.scrollY + 150;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', function () {
    handleNavScroll();
    highlightNavLink();
  }, { passive: true });

  /* ---- Mobile Menu ---- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
      document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    navLinks.forEach(link => {
      link.addEventListener('click', function () {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- Scroll Animations ---- */
  const animatedElements = document.querySelectorAll('[data-animate]');

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  animatedElements.forEach(el => observer.observe(el));

  /* ---- Counter Animation ---- */
  const counters = document.querySelectorAll('.stat-number[data-count]');

  const counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'));
        animateCounter(el, target);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  function animateCounter(element, target) {
    const duration = 2000;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.floor(target * ease);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = target;
      }
    }

    requestAnimationFrame(step);
  }

  /* ---- WhatsApp Form ---- */
  const form = document.getElementById('formulario');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = encodeURIComponent(document.getElementById('contact-name').value);
      const email = encodeURIComponent(document.getElementById('contact-email').value);
      const phone = encodeURIComponent(document.getElementById('phone').value);
      const message = encodeURIComponent(document.getElementById('contact-message').value);
      const company = encodeURIComponent(document.getElementById('company-name').value);
      const consent = document.getElementById('consent');

      if (!consent.checked) {
        consent.closest('.consent-group').style.animation = 'shake 0.5s ease';
        setTimeout(() => {
          consent.closest('.consent-group').style.animation = '';
        }, 500);
        return;
      }

      const phoneNumber = '573203765396';
      const whatsappURL =
        `https://wa.me/${phoneNumber}?text=` +
        `Nombre: ${name}%0A` +
        `Email: ${email}%0A` +
        `Teléfono: ${phone}%0A` +
        `Empresa: ${company}%0A` +
        `Mensaje: ${message}`;

      window.open(whatsappURL, '_blank');

      form.reset();

      showToast('Mensaje enviado correctamente');
    });
  }

  /* ---- Toast Notification ---- */
  function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 32px;
      background: rgba(14,246,204,0.15);
      border: 1px solid rgba(14,246,204,0.3);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      color: #0ef6cc;
      padding: 16px 28px;
      border-radius: 12px;
      font-size: 0.9rem;
      font-family: 'Inter', sans-serif;
      z-index: 10000;
      animation: fadeInUp 0.4s ease forwards;
      box-shadow: 0 8px 30px rgba(0,0,0,0.3);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /* ---- Smooth Scroll for Anchor Links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();
