const STATUS_COLORS = {
  pending: '#F59E0B',
  processing: '#4F46E5',
  shipped: '#3B82F6',
  delivered: '#10B981',
};

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function renderOrders(orders) {
  const ordersContainer = document.getElementById('orders-list');
  const emptyState = document.getElementById('empty-orders');

  if (!orders.length) {
    if (ordersContainer) ordersContainer.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (ordersContainer) ordersContainer.style.display = 'block';

  ordersContainer.innerHTML = orders.map(order => `
    <div class="order-card" data-order-id="${order.id}">
      <div class="order-header">
        <div class="order-info">
          <h3>Order #${order.id}</h3>
          <p class="order-date">${formatDate(order.created_at)}</p>
        </div>
        <div class="order-meta">
          <span class="order-status" style="background-color: ${STATUS_COLORS[order.status] || '#6B7280'}">
            ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          <span class="order-total">${formatPrice(order.total)}</span>
        </div>
      </div>
      <div class="order-actions">
        <button class="btn btn-secondary view-details-btn" data-order-id="${order.id}">View Details</button>
      </div>
      <div class="order-details" id="order-details-${order.id}" style="display: none;">
        <div class="order-details-loading">Loading...</div>
      </div>
    </div>
  `).join('');
}

async function toggleOrderDetails(orderId) {
  const detailsEl = document.getElementById(`order-details-${orderId}`);
  if (!detailsEl) return;

  if (detailsEl.style.display === 'block') {
    detailsEl.style.display = 'none';
    return;
  }

  detailsEl.style.display = 'block';

  // Only fetch if not already loaded
  if (detailsEl.querySelector('.order-details-loading')) {
    try {
      const { order } = await api(`/api/orders/${orderId}`);
      detailsEl.innerHTML = `
        <table class="order-items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${formatPrice(item.price)}</td>
                <td>${formatPrice(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } catch (e) {
      detailsEl.innerHTML = '<p class="error">Failed to load order details.</p>';
      showToast(e.message, 'error');
    }
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // Check auth
  const user = await checkAuth();
  if (!user) {
    window.location.href = '/login.html';
    return;
  }

  // Fetch orders
  try {
    const { orders } = await api('/api/orders');
    renderOrders(orders);
  } catch (e) {
    showToast(e.message, 'error');
  }

  // Event delegation for view details buttons
  const ordersContainer = document.getElementById('orders-list');
  if (ordersContainer) {
    ordersContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.view-details-btn');
      if (btn) {
        toggleOrderDetails(btn.dataset.orderId);
      }
    });
  }
});
