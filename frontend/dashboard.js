import { apiFetch, getSession, clearSession } from './api.js';

function renderDashboard() {
  const session = getSession();
  if (!session?.accessToken) {
    return `
      <div class="card">
        <h2 class="card-title">🔒 Not Logged In</h2>
        <p class="muted">Please <a href="#login">login</a> first to access your dashboard.</p>
      </div>
    `;
  }

  return `
    <div class="page-header">
      <h2>My Dashboard</h2>
    </div>

    <div class="dashboard-grid">

      <!-- Current User Card -->
      <div class="card">
        <h2 class="card-title">👤 Current User</h2>
        <div id="currentUserInfo" class="result-box">
          <p class="muted">Loading your profile...</p>
        </div>
      </div>

     
      <!-- Update Bio -->
      <div class="card">
        <h2 class="card-title">📝 Update Bio / About</h2>
        <form id="updateAboutForm" class="form">
          <div class="form-group">
            <label>About You</label>
            <textarea id="update-about" placeholder="Tell us about yourself..." required></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Update Bio</button>
        </form>
        <div id="updateAboutResult" class="result-box"></div>
      </div>

      <!-- Delete Account -->
      <div class="card" style="border-color: rgba(220, 38, 38, 0.3);">
        <h2 class="card-title" style="background: none; color: var(--danger); -webkit-text-fill-color: var(--danger);">🚨 Danger Zone</h2>
        <p class="muted" style="margin-bottom: 20px;">Once you delete your account, there is no going back. Please be certain.</p>
        <button id="deleteAccountBtn" class="btn btn-danger" style="width: 100%;"> Delete My Account</button>
        <div id="deleteAccountResult" class="result-box"></div>
      </div>

    </div>
  `;
}

async function loadCurrentUser() {
  const el = document.getElementById('currentUserInfo');
  if (!el) return;

  const { ok, data } = await apiFetch('GET', '/users/current-user');

  if (!ok) {
    el.innerHTML = `<p class="error">${data.msg || 'Failed to fetch user'}</p>`;
    return;
  }

  const user = data.user;
  
  // Decide what to show for avatar: Cloudinary image OR first letter fallback
  const avatarHtml = user.avatar 
    ? `<img src="${user.avatar}" alt="${user.username}'s Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`
    : (user.username?.[0] || '?').toUpperCase();

  // Decide what to show for cover image
  const coverHtml = user.coverImage
    ? `<div class="user-cover" style="height: 120px; width: 100%; background-image: url('${user.coverImage}'); background-size: cover; background-position: center; border-radius: 8px 8px 0 0; margin-bottom: -40px;"></div>`
    : '';

  el.innerHTML = `
    <div class="user-profile-card" style="padding: 0; overflow: hidden; display: block;">
      ${coverHtml}
      <div style="padding: 24px; display: flex; align-items: flex-start; gap: 20px;">
        <div class="user-avatar" style="margin-bottom: 16px; position: relative; z-index: 1; border: 4px solid var(--surface-color);">${avatarHtml}</div>
        <div class="user-details" style="flex: 1;">
          <div class="user-detail-row">
            <span class="user-label">Username</span>
            <span class="user-value">${escHtml(user.username)}</span>
          </div>
          <div class="user-detail-row">
            <span class="user-label">Email</span>
            <span class="user-value">${escHtml(user.email)}</span>
          </div>
          <div class="user-detail-row">
            <span class="user-label">About</span>
            <span class="user-value">${user.about ? escHtml(user.about) : '<em class="muted">Not set</em>'}</span>
          </div>
          <div class="user-detail-row">
            <span class="user-label">Followers</span>
            <span class="badge">${user.followers?.length || 0}</span>
          </div>
          <div class="user-detail-row">
            <span class="user-label">Following</span>
            <span class="badge">${user.following?.length || 0}</span>
          </div>
          <div class="user-detail-row">
            <span class="user-label">Joined</span>
            <span class="user-value">${new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Pre-fill the update forms with current values
  const usernameInput = document.getElementById('update-username');
  const emailInput = document.getElementById('update-email');
  const aboutInput = document.getElementById('update-about');
  if (usernameInput) usernameInput.value = user.username || '';
  if (emailInput) emailInput.value = user.email || '';
  if (aboutInput) aboutInput.value = user.about || '';
}

function bindDashboard() {
  loadCurrentUser();

  document.getElementById('updateAccountForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('update-username').value.trim();
    const email = document.getElementById('update-email').value.trim();
    const el = document.getElementById('updateResult');

    if (!username || !email) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    showToast('Updating account...', 'info');

    const { ok, data } = await apiFetch('POST', '/users/update-account', { username, email });

    if (ok) {
      showToast('Account updated successfully!', 'success');
      el.innerHTML = `<p style="color: var(--success); margin-top: 12px;">✓ Account details updated</p>`;
      // Reload current user to reflect changes
      loadCurrentUser();
    } else {
      showToast(data.msg || 'Error updating account', 'error');
      el.innerHTML = `<p class="error" style="margin-top: 12px;">${escHtml(data.msg || 'Update failed')}</p>`;
    }
  });

  document.getElementById('updateAboutForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const about = document.getElementById('update-about').value.trim();
    const el = document.getElementById('updateAboutResult');
    
    // We get the current logged in user from session
    const session = getSession();
    if (!session || !session.username) return;

    if (!about) {
      showToast('Please provide about text', 'error');
      return;
    }

    showToast('Updating bio...', 'info');

    // The backend route is POST /users/:username
    const { ok, data } = await apiFetch('POST', `/users/${session.username}`, { about });

    if (ok) {
      showToast('Bio updated successfully!', 'success');
      el.innerHTML = `<p style="color: var(--success); margin-top: 12px;">✓ Bio updated</p>`;
      loadCurrentUser();
    } else {
      showToast(data.msg || 'Error updating bio', 'error');
      el.innerHTML = `<p class="error" style="margin-top: 12px;">${escHtml(data.msg || 'Update failed')}</p>`;
    }
  });

  document.getElementById('deleteAccountBtn')?.addEventListener('click', async () => {
    const confirmDelete = confirm("Are you ABSOLUTELY sure you want to delete your account? This action cannot be undone.");
    if (!confirmDelete) return;

    const session = getSession();
    if (!session) return;

    // You need a generic param for the URL since the backend route is `/:userId`
    // We will just pass the username or anything because the backend gets ID from req.user._id
    const fakeParam = session.username || "me";

    showToast('Deleting account...', 'info');
    const { ok, data } = await apiFetch('DELETE', `/users/${fakeParam}`);

    if (ok) {
      showToast('Account deleted successfully!', 'success');
      // Clear session and go home
      clearSession();
      setTimeout(() => { window.location.hash = '#home'; }, 1000);
    } else {
      showToast(data.msg || 'Failed to delete account', 'error');
      document.getElementById('deleteAccountResult').innerHTML = `<p class="error">${escHtml(data.msg || 'Delete failed')}</p>`;
    }
  });
}

function escHtml(str = '') {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export { renderDashboard, bindDashboard };
