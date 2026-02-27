document.addEventListener('DOMContentLoaded', async () => {
  // Check auth
  const user = await checkAuth();
  if (!user) {
    window.location.href = '/login.html';
    return;
  }

  // Fetch cart
  let items;
  try {
    const data = await api('/api/cart');
    items = data.items;
  } catch (e) {
    showToast(e.message, 'error');
    return;
  }

  if (!items || !items.length) {
    window.location.href = '/cart.html';
    return;
  }

  // Render order summary
  const summaryItems = document.getElementById('summary-items');
  const summaryTotal = document.getElementById('summary-total');
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (summaryItems) {
    summaryItems.innerHTML = items.map(item => `
      <div class="summary-item">
        <span class="summary-item-name">${item.name} &times; ${item.quantity}</span>
        <span class="summary-item-price">${formatPrice(item.price * item.quantity)}</span>
      </div>
    `).join('');
  }

  if (summaryTotal) {
    summaryTotal.textContent = formatPrice(total);
  }

  // Form submission
  const form = document.getElementById('checkout-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const fullName = document.getElementById('full-name').value.trim();
      const address = document.getElementById('address').value.trim();
      const city = document.getElementById('city').value.trim();
      const state = document.getElementById('state').value.trim();
      const zip = document.getElementById('zip').value.trim();
      const country = document.getElementById('country').value.trim();

      // Validate
      if (!fullName || !address || !city || !state || !zip || !country) {
        showToast('Please fill in all fields', 'error');
        return;
      }

      const shippingAddress = `${fullName}\n${address}\n${city}, ${state} ${zip}\n${country}`;

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Placing Order...';
      }

      try {
        await api('/api/orders', {
          method: 'POST',
          body: { shippingAddress },
        });
        showToast('Order placed successfully!');
        updateCartCount();
        setTimeout(() => {
          window.location.href = '/orders.html';
        }, 2000);
      } catch (e) {
        showToast(e.message, 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Place Order';
        }
      }
    });
  }
});
