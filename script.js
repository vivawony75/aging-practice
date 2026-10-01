/**
 * 국립부경대학교 사회복지학전공 웹사이트
 * Modern Scrolling Landing Page Script
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Sticky Navigation & Scroll Spy
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const scrollTopBtn = document.getElementById('scroll-to-top');

  function handleScroll() {
    const scrollY = window.pageYOffset;

    // Header background toggle
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Scroll to Top button visibility
    if (scrollY > 400) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }

    // Scroll Spy active link
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 140;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Scroll to Top
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 2. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      if (navMenu.style.display === 'flex') {
        navMenu.style.display = 'none';
      } else {
        navMenu.style.display = 'flex';
        navMenu.style.flexDirection = 'column';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '100%';
        navMenu.style.left = '0';
        navMenu.style.width = '100%';
        navMenu.style.background = 'rgba(15, 23, 42, 0.98)';
        navMenu.style.padding = '20px 24px';
        navMenu.style.gap = '16px';
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          navMenu.style.display = 'none';
        }
      });
    });
  }

  // 3. Curriculum Tabs Switcher
  const curriculumTabs = document.querySelectorAll('.tabs-nav .tab-btn');
  const curriculumPanes = document.querySelectorAll('.curriculum-section .tab-content');

  curriculumTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      curriculumTabs.forEach(b => b.classList.remove('active'));
      curriculumPanes.forEach(pane => pane.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });

  // 4. Welfare Hub Tabs Switcher
  const hubTabs = document.querySelectorAll('.hub-tabs-nav .hub-tab-btn');
  const hubPanes = document.querySelectorAll('.hub-section .hub-content');

  hubTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      hubTabs.forEach(b => b.classList.remove('active'));
      hubPanes.forEach(pane => pane.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });

  // 5. Faculty Live Search Filter
  const facultyInput = document.getElementById('faculty-search');
  const facultyCards = document.querySelectorAll('#faculty-cards-container .faculty-card');

  if (facultyInput) {
    facultyInput.addEventListener('input', (e) => {
      const val = e.target.value.toLowerCase().trim();
      facultyCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
        if (text.includes(val) || keywords.includes(val)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // 6. Interactive 3D Arc Card Highlight on click
  const arcCards = document.querySelectorAll('.arc-card');
  arcCards.forEach(card => {
    card.addEventListener('click', () => {
      arcCards.forEach(c => c.classList.remove('active-center'));
      card.classList.add('active-center');
    });
  });

  // 7. Stats Number Counter Animation
  let animatedStats = false;
  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !animatedStats) {
        animatedStats = true;
        const statNums = document.querySelectorAll('.stat-num');
        statNums.forEach(el => {
          const target = parseInt(el.getAttribute('data-target'), 10);
          if (isNaN(target)) return;

          let current = 0;
          const step = Math.ceil(target / 40);
          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
              if (target === 90) el.textContent = '90%';
              else if (target === 30) el.textContent = '30+';
              else if (target === 160) el.textContent = '160h';
              else el.textContent = current;
            } else {
              el.textContent = current;
            }
          }, 30);
        });
      }
    }, { threshold: 0.3 });

    observer.observe(statsSection);
  }

});
