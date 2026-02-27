document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
      }

      try {
        await api('/api/auth/login', {
          method: 'POST',
          body: { email, password },
        });
        showToast('Logged in successfully!');
        const redirect = sessionStorage.getItem('redirect') || '/';
        sessionStorage.removeItem('redirect');
        window.location.href = redirect;
      } catch (e) {
        showToast(e.message, 'error');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;

      if (!name || !email || !password || !confirmPassword) {
        showToast('Please fill in all fields', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
      }

      try {
        await api('/api/auth/register', {
          method: 'POST',
          body: { name, email, password },
        });
        showToast('Account created successfully!');
        window.location.href = '/';
      } catch (e) {
        showToast(e.message, 'error');
      }
    });
  }
});
