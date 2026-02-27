let cartItems = [];

function renderCart() {
  const cartContent = document.getElementById('cart-content');
  const emptyCart = document.getElementById('empty-cart');
  const cartItemsEl = document.getElementById('cart-items');

  if (!cartItems.length) {
    if (cartContent) cartContent.style.display = 'none';
    if (emptyCart) emptyCart.style.display = 'block';
    return;
  }

  if (cartContent) cartContent.style.display = 'flex';
  if (emptyCart) emptyCart.style.display = 'none';

  cartItemsEl.innerHTML = cartItems.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}" onerror="handleImageError(this)">
      </div>
      <div class="cart-item-details">
        <h3><a href="/product.html?id=${item.product_id}">${item.name}</a></h3>
        <p class="cart-item-price">${formatPrice(item.price)}</p>
      </div>
      <div class="cart-item-quantity">
        <button class="qty-btn qty-decrease" data-id="${item.id}">-</button>
        <input type="number" class="qty-input" value="${item.quantity}" min="1" max="${item.stock}" data-id="${item.id}">
        <button class="qty-btn qty-increase" data-id="${item.id}">+</button>
      </div>
      <div class="cart-item-subtotal">
        ${formatPrice(item.price * item.quantity)}
      </div>
      <button class="cart-item-remove" data-id="${item.id}">&times;</button>
    </div>
  `).join('');

  updateTotals();
}

function updateTotals() {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (totalEl) totalEl.textContent = formatPrice(subtotal);
}

async function fetchCart() {
  try {
    const { items } = await api('/api/cart');
    cartItems = items;
    renderCart();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

async function updateQuantity(id, quantity) {
  try {
    await api(`/api/cart/${id}`, {
      method: 'PUT',
      body: { quantity },
    });
    await fetchCart();
    updateCartCount();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

async function removeItem(id) {
  try {
    await api(`/api/cart/${id}`, { method: 'DELETE' });
    await fetchCart();
    updateCartCount();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchCart();

  // Event delegation for cart actions
  const cartItemsEl = document.getElementById('cart-items');
  if (cartItemsEl) {
    cartItemsEl.addEventListener('click', (e) => {
      const target = e.target;
      const id = target.dataset.id;

      if (target.classList.contains('qty-decrease')) {
        const item = cartItems.find(i => i.id == id);
        if (item && item.quantity > 1) {
          updateQuantity(id, item.quantity - 1);
        }
      } else if (target.classList.contains('qty-increase')) {
        const item = cartItems.find(i => i.id == id);
        if (item && item.quantity < item.stock) {
          updateQuantity(id, item.quantity + 1);
        }
      } else if (target.classList.contains('cart-item-remove')) {
        removeItem(id);
      }
    });

    cartItemsEl.addEventListener('change', (e) => {
      if (e.target.classList.contains('qty-input')) {
        const id = e.target.dataset.id;
        const item = cartItems.find(i => i.id == id);
        let val = parseInt(e.target.value) || 1;
        if (val < 1) val = 1;
        if (item && val > item.stock) val = item.stock;
        updateQuantity(id, val);
      }
    });
  }

  // Checkout button
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      window.location.href = '/checkout.html';
    });
  }
});
