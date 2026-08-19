const ENTITY_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
};

const ENTITY_REGEX = /[&<>"'/]/g;

export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.replace(ENTITY_REGEX, (char) => ENTITY_MAP[char] || '');
}

export function sanitizeUrl(url) {
  if (typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return '';
}

export function isValidApiKey(key) {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  return trimmed.length >= 16 && trimmed.length <= 128 && /^[a-zA-Z0-9]+$/.test(trimmed);
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle(fn, limit = 1000) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

export function formatCurrency(value, currency = 'INR') {
  if (value === null || value === undefined) return 'N/A';
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `₹${value.toFixed(2)}`;
  }
}

export function formatNumber(value) {
  if (value === null || value === undefined) return 'N/A';
  if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
  if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
  return value.toLocaleString('en-IN');
}

export function formatPercent(value) {
  if (value === null || value === undefined) return 'N/A';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function getRelativeTime(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function getLocalStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeLocalStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
