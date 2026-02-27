// API helper function
async function api(url, options = {}) {
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }
  const res = await fetch(url, config);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

// Toast notification system
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  // Trigger animation
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Update cart count badge in header
async function updateCartCount() {
  try {
    const { items } = await api('/api/cart');
    const badge = document.getElementById('cart-count');
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  } catch (e) {
    // Not logged in, hide badge
    const badge = document.getElementById('cart-count');
    if (badge) badge.style.display = 'none';
  }
}

// Check auth state and update header
async function checkAuth() {
  try {
    const { user } = await api('/api/auth/me');
    const authLinks = document.getElementById('auth-links');
    const userMenu = document.getElementById('user-menu');
    if (user && authLinks && userMenu) {
      authLinks.style.display = 'none';
      userMenu.style.display = 'flex';
      const userName = document.getElementById('user-name');
      if (userName) userName.textContent = user.name;
    }
    return user;
  } catch (e) {
    return null;
  }
}

// Logout handler
async function logout() {
  try {
    await api('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// Format price
function formatPrice(price) {
  return '$' + Number(price).toFixed(2);
}

// Product image error handler - show placeholder
function handleImageError(img) {
  img.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" fill="%23ddd"><rect width="300" height="300" fill="%23f0f0f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23999">No Image</text></svg>');
}

// Initialize on every page
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  updateCartCount();

  // Attach logout handler
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
});
