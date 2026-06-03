/**
 * NexusYield DeFi Protocol — script.js
 * ─────────────────────────────────────
 * Features:
 *  1. Sticky nav shadow on scroll
 *  2. Mobile hamburger menu toggle
 *  3. Smooth scroll for anchor links
 *  4. Scroll-reveal for feature cards
 *  5. Animated stat counters
 *  6. Connect Wallet simulation (toast)
 *  7. Deposit button toast feedback
 *  8. Pool table sort by column
 *  9. Live ticker data simulation (random drift)
 */

'use strict';

/* ─── Utility ─────────────────────────────────────────── */

/**
 * Show a toast notification.
 * @param {string} message
 * @param {number} duration  ms before auto-hide (default 3000)
 */
function showToast(message, duration = 3000) {
  // Reuse existing toast element or create one
  let toast = document.getElementById('ny-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ny-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/* ─── 1. Sticky nav shadow ────────────────────────────── */
function initStickyNav() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initialise on load
}

/* ─── 2. Mobile hamburger ─────────────────────────────── */
function initHamburger() {
  const nav       = document.querySelector('nav');
  const navLinks  = document.querySelector('.nav-links');
  if (!nav || !navLinks) return;

  // Create hamburger button if it doesn't already exist in HTML
  let btn = nav.querySelector('.hamburger');
  if (!btn) {
    btn = document.createElement('button');
    btn.className   = 'hamburger';
    btn.setAttribute('aria-label', 'Toggle navigation');
    btn.innerHTML   = '<span></span><span></span><span></span>';
    nav.appendChild(btn);
  }

  btn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);

    // Animate bars into X
    const bars = btn.querySelectorAll('span');
    if (isOpen) {
      bars[0].style.transform = 'translateY(7px) rotate(45deg)';
      bars[1].style.opacity   = '0';
      bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      bars[0].style.transform = '';
      bars[1].style.opacity   = '';
      bars[2].style.transform = '';
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      navLinks.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    }
  });
}

/* ─── 3. Smooth scroll for anchor links ──────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ─── 4. Scroll-reveal for feature cards ─────────────── */
function initScrollReveal() {
  const cards = document.querySelectorAll('.feature-card');
  if (!cards.length) return;

  if (!('IntersectionObserver' in window)) {
    // Fallback: just show everything
    cards.forEach((c) => c.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // Stagger delay based on card index within its row
          const delay = (Array.from(cards).indexOf(entry.target) % 3) * 100;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  cards.forEach((card) => observer.observe(card));
}

/* ─── 5. Animated stat counters ──────────────────────── */
function initStatCounters() {
  const statValues = document.querySelectorAll('.stat-value');
  if (!statValues.length) return;

  /**
   * Animate a numeric value from 0 to its target.
   * Supports values like "$1.47B", "47.2%", "84,291", "✓ 4/4".
   */
  function animateCounter(el) {
    const original = el.textContent.trim();

    // Extract numeric portion and surrounding decoration
    const match = original.match(/^([^0-9]*)([0-9,]+\.?[0-9]*)([^0-9]*)$/);
    if (!match) return; // e.g. "✓ 4/4" — skip

    const prefix = match[1];
    const target = parseFloat(match[2].replace(/,/g, ''));
    const suffix = match[3];
    const isInt  = !match[2].includes('.');
    const decimals = isInt ? 0 : (match[2].split('.')[1] || '').length;

    const duration = 1200; // ms
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease     = 1 - Math.pow(1 - progress, 3);
      const current  = target * ease;

      let display;
      if (isInt) {
        display = Math.round(current).toLocaleString();
      } else {
        display = current.toFixed(decimals);
      }

      el.textContent = prefix + display + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = original; // restore exact original
      }
    }

    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) {
    statValues.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  statValues.forEach((el) => observer.observe(el));
}

/* ─── 6. Connect Wallet simulation ───────────────────── */
function initConnectWallet() {
  const buttons = document.querySelectorAll('.nav-cta, .btn-primary');
  buttons.forEach((btn) => {
    if (
      btn.textContent.toLowerCase().includes('connect') ||
      btn.textContent.toLowerCase().includes('wallet') ||
      btn.textContent.toLowerCase().includes('earning')
    ) {
      btn.addEventListener('click', () => {
        showToast('🔗 Connecting to wallet… (demo mode)', 2500);
        setTimeout(() => {
          showToast('✅ Wallet connected: 0x4a3B…c91F', 3500);
        }, 2600);
      });
    }
  });
}

/* ─── 7. Deposit button feedback ─────────────────────── */
function initDepositButtons() {
  document.querySelectorAll('.deposit-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      // Find the pool name from the same row
      const row  = btn.closest('tr');
      const pair = row ? row.querySelector('.pool-pair') : null;
      const name = pair ? pair.textContent.trim().split('\n')[0].trim() : 'pool';
      showToast(`💰 Deposit into ${name} initiated (demo mode)`);
    });
  });
}

/* ─── 8. Pool table sort ──────────────────────────────── */
function initTableSort() {
  const table = document.querySelector('.pool-table');
  if (!table) return;

  const headers = table.querySelectorAll('th');
  // Column indices to sort (0=pool name, 1=TVL, 2=APY, 3=Volume, 4=Fee)
  const sortableIndices = [0, 1, 2, 3, 4];

  let lastSortCol = -1;
  let ascending   = true;

  headers.forEach((th, colIndex) => {
    if (!sortableIndices.includes(colIndex)) return;

    th.style.cursor = 'pointer';
    th.title = 'Click to sort';

    th.addEventListener('click', () => {
      ascending = lastSortCol === colIndex ? !ascending : true;
      lastSortCol = colIndex;

      // Update indicator
      headers.forEach((h) => {
        h.textContent = h.textContent.replace(/ [▲▼]$/, '');
      });
      th.textContent += ascending ? ' ▲' : ' ▼';

      sortTable(table, colIndex, ascending);
    });
  });
}

/**
 * Sort a table body by a given column index.
 * @param {HTMLTableElement} table
 * @param {number}           colIndex
 * @param {boolean}          ascending
 */
function sortTable(table, colIndex, ascending) {
  const tbody = table.querySelector('tbody');
  const rows  = Array.from(tbody.querySelectorAll('tr'));

  rows.sort((a, b) => {
    const aText = getCellValue(a, colIndex);
    const bText = getCellValue(b, colIndex);
    const aNum  = parseFloat(aText.replace(/[^0-9.]/g, ''));
    const bNum  = parseFloat(bText.replace(/[^0-9.]/g, ''));

    if (!isNaN(aNum) && !isNaN(bNum)) {
      return ascending ? aNum - bNum : bNum - aNum;
    }
    return ascending
      ? aText.localeCompare(bText)
      : bText.localeCompare(aText);
  });

  rows.forEach((row) => tbody.appendChild(row));
}

function getCellValue(row, index) {
  const cell = row.cells[index];
  return cell ? cell.textContent.trim() : '';
}

/* ─── 9. Live ticker simulation ──────────────────────── */
function initLiveTicker() {
  // Map of pair → base value
  const assets = {
    'ETH/USDC': { value: 2.34,  sign: '+' },
    'BTC/USDC': { value: 1.87,  sign: '+' },
    'SOL/USDC': { value: -0.54, sign: '-' },
    'MATIC/ETH':{ value: 3.12,  sign: '+' },
    'BNB/USDC': { value: 0.93,  sign: '+' },
  };

  const items = document.querySelectorAll('.ticker-item');

  function updateTicker() {
    items.forEach((item) => {
      const text = item.textContent;
      for (const [pair, data] of Object.entries(assets)) {
        if (text.startsWith(pair)) {
          // Small random drift ±0.2
          data.value += (Math.random() - 0.5) * 0.2;
          const abs  = Math.abs(data.value).toFixed(2);
          const up   = data.value >= 0;
          const span = item.querySelector('.up, .down');
          if (span) {
            span.textContent = `${up ? '▲' : '▼'} ${up ? '+' : '-'}${abs}%`;
            span.className   = up ? 'up' : 'down';
          }
        }
      }
    });
  }

  // Update every 4 seconds
  setInterval(updateTicker, 4000);
}

/* ─── Bootstrap ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initStickyNav();
  initHamburger();
  initSmoothScroll();
  initScrollReveal();
  initStatCounters();
  initConnectWallet();
  initDepositButtons();
  initTableSort();
  initLiveTicker();

  console.log('%cNexusYield DeFi Protocol loaded ✓', 'color:#00f5c4;font-weight:bold;');
});
