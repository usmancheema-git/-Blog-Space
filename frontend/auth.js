import { apiFetch, setSession, clearSession, getSession } from './api.js';

function renderRegister() {
  return `
    <div class="card">
      <h2 class="card-title">Create Account</h2>
      <form id="registerForm" class="form">
        <div class="form-group">
          <label>Username</label>
          <input id="reg-username" name="username" type="text" placeholder="your_username" required />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input id="reg-email" name="email" type="email" placeholder="you@example.com" required />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input id="reg-password" name="password" type="password" placeholder="••••••••" required />
        </div>
        <div class="form-group">
          <label>Avatar (Required)</label>
          <input id="reg-avatar" name="avatar" type="file" accept="image/*" required />
        </div>
        <div class="form-group">
          <label>Cover Image (Optional)</label>
          <input id="reg-cover" name="coverImage" type="file" accept="image/*" />
        </div>
        <button type="submit" class="btn btn-primary">Register</button>
      </form>
      <p class="form-footer">Already have an account? <a href="#login">Login</a></p>
    </div>
  `;
}

function renderLogin() {
  const session = getSession();
  return `
    <div class="card">
      <h2 class="card-title">Welcome Back</h2>
      ${session ? `<div class="alert alert-info">Logged in as <strong>${session.username}</strong> &nbsp;<button class="btn btn-sm btn-danger" id="logoutBtn">Logout</button></div>` : ''}
      <form id="loginForm" class="form">
        <div class="form-group">
          <label>Username</label>
          <input id="log-username" type="text" placeholder="your_username" required />
        </div>
        <div class="form-group">
          <label>Password</label>
          <input id="log-password" type="password" placeholder="••••••••" required />
        </div>
        <button type="submit" class="btn btn-primary">Login</button>
      </form>
      <p class="form-footer">No account? <a href="#register">Register</a></p>
    </div>
  `;
}

function bindRegister() {
  document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const form = document.getElementById('registerForm');
    const formData = new FormData(form);

    showToast('Registering...', 'info');
    const { ok, data } = await apiFetch('POST', '/users/auth/register', formData);
    showToast(data.msg || (ok ? 'Registration Successful' : 'Registration failed'), ok ? 'success' : 'error');
  });
}

function bindLogin() {
  document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('log-username').value.trim();
    const password = document.getElementById('log-password').value.trim();
    showToast('Logging in...', 'info');
    const { ok, data } = await apiFetch('POST', '/users/auth/login', { username, password });
    if (ok) {
      // Store everything (username, accessToken, refreshToken)
      setSession({ 
        username: data.user?.username || username, 
        accessToken: data.accessToken,
        refreshToken: data.refreshToken 
      });
      showToast('Login Successful', 'success');
      setTimeout(() => { window.location.hash = '#new-article'; }, 800);
    } else {
      showToast(data.msg || 'Login failed', 'error');
    }
  });

  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    showToast('Logging out...', 'info');
    // Call the backend to invalidate the session
    const { ok } = await apiFetch('GET', '/users/auth/logout');
    
    // Always clear session locally regardless of server response for better UX
    clearSession();
    showToast('Logged out successfully', 'success');
    setTimeout(() => { window.location.hash = '#home'; }, 500);
  });
}

export { renderRegister, renderLogin, bindRegister, bindLogin };
