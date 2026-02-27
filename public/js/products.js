let currentCategory = '';

function renderProducts(products) {
  const grid = document.getElementById('products-grid');
  if (!products.length) {
    grid.innerHTML = '<p class="no-results">No products found.</p>';
    return;
  }
  grid.innerHTML = products.map(product => `
    <div class="product-card" onclick="window.location.href='/product.html?id=${product.id}'">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" onerror="handleImageError(this)">
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">${formatPrice(product.price)}</p>
        <button class="btn btn-primary btn-add-cart" onclick="event.stopPropagation(); addToCart(${product.id})">Add to Cart</button>
      </div>
    </div>
  `).join('');
}

async function fetchProducts(category = '', search = '') {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = '<p class="loading">Loading products...</p>';
  try {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    const query = params.toString();
    const url = '/api/products' + (query ? '?' + query : '');
    const { products } = await api(url);
    renderProducts(products);
  } catch (e) {
    grid.innerHTML = '<p class="error">Failed to load products.</p>';
    showToast(e.message, 'error');
  }
}

async function addToCart(productId) {
  try {
    await api('/api/cart', {
      method: 'POST',
      body: { productId, quantity: 1 },
    });
    showToast('Added to cart!');
    updateCartCount();
  } catch (e) {
    if (e.message.toLowerCase().includes('log in') || e.message.toLowerCase().includes('unauthorized') || e.message.toLowerCase().includes('auth')) {
      window.location.href = '/login.html';
    } else {
      showToast(e.message, 'error');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();

  // Category filter buttons
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category || '';
      fetchProducts(currentCategory);
    });
  });

  // Hero "Shop Now" button - smooth scroll to products
  const shopNowBtn = document.getElementById('shop-now-btn');
  if (shopNowBtn) {
    shopNowBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const productsSection = document.getElementById('products-section');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Search functionality
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchProducts(currentCategory, searchInput.value.trim());
      }, 300);
    });
  }
});
