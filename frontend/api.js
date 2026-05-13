const API_BASE = import.meta.env?.VITE_API_URL || 'https://blog-scpace-gold.vercel.app/';

async function apiFetch(method, path, body = null) {
    const session = getSession();
    const isFormData = body instanceof FormData;
    const headers = {
        ...(session?.accessToken && { 'Authorization': `Bearer ${session.accessToken}` })
    };
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }

    const options = {
        method,
        headers,
    };
    if (body) options.body = isFormData ? body : JSON.stringify(body);
    const res = await fetch(`${API_BASE}${path}`, options);
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
}

function getSession() {
    try { return JSON.parse(localStorage.getItem('blogUser')) || null; } catch { return null; }
}

function setSession(userData) {
    localStorage.setItem('blogUser', JSON.stringify(userData));
}

function clearSession() {
    localStorage.removeItem('blogUser');
}

export { apiFetch, getSession, setSession, clearSession };
