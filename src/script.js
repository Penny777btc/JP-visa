/* ═══════════════════════════════════════════
   JP-Visa Knowledge Base — Interactive Logic
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initSearch();
  initScrollSpy();
  initBackToTop();
});

/* ── Sidebar toggle (mobile) ── */
function initSidebar() {
  const toggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (!toggle) return;

  const close = () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  };

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  });
  overlay.addEventListener('click', close);

  // Close sidebar when clicking a nav link (mobile)
  sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
}

/* ── Search / filter ── */
function initSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;

  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => applySearch(input.value.trim()), 200);
  });
}

function applySearch(query) {
  // Remove previous highlights
  document.querySelectorAll('.highlight').forEach(el => {
    const parent = el.parentNode;
    parent.replaceChild(document.createTextNode(el.textContent), el);
    parent.normalize();
  });

  const sections = document.querySelectorAll('.section');

  if (!query) {
    sections.forEach(s => s.style.display = '');
    return;
  }

  const q = query.toLowerCase();

  sections.forEach(section => {
    const text = section.textContent.toLowerCase();
    if (text.includes(q)) {
      section.style.display = '';
      highlightText(section, query);
    } else {
      section.style.display = 'none';
    }
  });
}

function highlightText(root, query) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');

  nodes.forEach(node => {
    if (!regex.test(node.textContent)) return;
    if (node.parentElement.closest('.highlight, input, script, style')) return;
    const frag = document.createDocumentFragment();
    node.textContent.split(regex).forEach(part => {
      if (regex.test(part)) {
        const mark = document.createElement('span');
        mark.className = 'highlight';
        mark.textContent = part;
        frag.appendChild(mark);
      } else {
        frag.appendChild(document.createTextNode(part));
      }
      regex.lastIndex = 0;
    });
    node.parentNode.replaceChild(frag, node);
  });
}

/* ── Scroll spy for active nav ── */
function initScrollSpy() {
  const navLinks = document.querySelectorAll('.nav-item a');
  const sections = [];

  navLinks.forEach(link => {
    const id = link.getAttribute('href')?.replace('#', '');
    if (id) {
      const el = document.getElementById(id);
      if (el) sections.push({ id, el, link });
    }
  });

  if (!sections.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const match = sections.find(s => s.el === entry.target);
        if (match) match.link.classList.add('active');
      }
    });
  }, { rootMargin: '-80px 0px -60% 0px', threshold: 0 });

  sections.forEach(s => observer.observe(s.el));
}

/* ── Back to top button ── */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
