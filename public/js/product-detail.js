let currentProduct = null;

async function loadProduct(id) {
  try {
    const { product } = await api(`/api/products/${id}`);
    currentProduct = product;

    document.getElementById('product-image').src = product.image;
    document.getElementById('product-image').alt = product.name;
    document.getElementById('product-image').onerror = function () { handleImageError(this); };
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-category').textContent = product.category;
    document.getElementById('product-price').textContent = formatPrice(product.price);
    document.getElementById('product-description').textContent = product.description;

    const stockEl = document.getElementById('product-stock');
    if (product.stock > 0) {
      stockEl.textContent = 'In Stock';
      stockEl.className = 'stock-status in-stock';
    } else {
      stockEl.textContent = 'Out of Stock';
      stockEl.className = 'stock-status out-of-stock';
    }

    // Update breadcrumb
    const breadcrumbName = document.getElementById('breadcrumb-name');
    if (breadcrumbName) {
      breadcrumbName.textContent = product.name;
    }

    // Set quantity max
    const qtyInput = document.getElementById('qty-input');
    if (qtyInput) {
      qtyInput.max = product.stock;
      qtyInput.value = 1;
    }

    // Disable add to cart if out of stock
    const addBtn = document.getElementById('add-to-cart-btn');
    if (addBtn && product.stock <= 0) {
      addBtn.disabled = true;
      addBtn.textContent = 'Out of Stock';
    }
  } catch (e) {
    showToast(e.message, 'error');
    document.querySelector('.product-detail').innerHTML = '<p class="error">Product not found.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) {
    window.location.href = '/';
    return;
  }

  loadProduct(id);

  // Quantity controls
  const qtyInput = document.getElementById('qty-input');
  const qtyDecrease = document.getElementById('qty-decrease');
  const qtyIncrease = document.getElementById('qty-increase');

  if (qtyDecrease) {
    qtyDecrease.addEventListener('click', () => {
      const current = parseInt(qtyInput.value) || 1;
      if (current > 1) qtyInput.value = current - 1;
    });
  }

  if (qtyIncrease) {
    qtyIncrease.addEventListener('click', () => {
      const current = parseInt(qtyInput.value) || 1;
      const max = currentProduct ? currentProduct.stock : 99;
      if (current < max) qtyInput.value = current + 1;
    });
  }

  if (qtyInput) {
    qtyInput.addEventListener('change', () => {
      let val = parseInt(qtyInput.value) || 1;
      const max = currentProduct ? currentProduct.stock : 99;
      if (val < 1) val = 1;
      if (val > max) val = max;
      qtyInput.value = val;
    });
  }

  // Add to cart
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', async () => {
      if (!currentProduct) return;
      const quantity = parseInt(qtyInput.value) || 1;
      try {
        await api('/api/cart', {
          method: 'POST',
          body: { productId: currentProduct.id, quantity },
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
    });
  }
});
