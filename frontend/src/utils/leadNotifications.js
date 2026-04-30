/**
 * Lead Browser Notifications — Superadmin Only
 * 
 * This module handles:
 * 1. Requesting browser notification permission (once, first time only)
 * 2. Polling leads API for new leads every 30 seconds
 * 3. Pushing a browser notification for every new lead
 * 
 * Usage: call startLeadNotifications() from AdminLayout when role === 'superadmin'
 *        call stopLeadNotifications() on logout / unmount
 */

import API_BASE_URL from '../config/api';

let pollInterval = null;
const POLL_INTERVAL_MS = 30_000; // 30 seconds
const STORAGE_KEY = 'leadNotif_lastSeenTimestamp';

/**
 * Request notification permission from the browser.
 * Only prompts if the user hasn't already granted/denied.
 * Returns true if permission is granted.
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('[LeadNotif] Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.info('[LeadNotif] Notification permission was previously denied');
    return false;
  }

  // permission === 'default' → ask the user
  try {
    const result = await Notification.requestPermission();
    return result === 'granted';
  } catch (e) {
    console.error('[LeadNotif] Error requesting permission:', e);
    return false;
  }
}

/**
 * Show a browser notification for a new lead.
 */
function showLeadNotification(lead) {
  if (Notification.permission !== 'granted') return;

  const title = `🔔 New Lead: ${lead.name}`;
  const body = [
    lead.company ? `Company: ${lead.company}` : '',
    lead.phone ? `Phone: ${lead.phone}` : '',
    lead.email ? `Email: ${lead.email}` : '',
    lead.requirements ? `"${lead.requirements.slice(0, 80)}${lead.requirements.length > 80 ? '…' : ''}"` : ''
  ].filter(Boolean).join('\n');

  try {
    const notification = new Notification(title, {
      body,
      icon: '/logo.svg',
      tag: `lead-${lead._id}`, // prevents duplicate notifications for same lead
      requireInteraction: false,
    });

    // Click → navigate to leads page
    notification.onclick = () => {
      window.focus();
      if (window.location.pathname !== '/admin/leads') {
        window.location.href = '/admin/leads';
      }
      notification.close();
    };

    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10_000);
  } catch (e) {
    console.error('[LeadNotif] Error showing notification:', e);
  }
}

/**
 * Fetch leads and show notifications for any created after lastSeenTimestamp.
 */
async function pollForNewLeads() {
  try {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    if (!token) return;

    const res = await fetch(`${API_BASE_URL}/leads?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return;

    const data = await res.json();
    const leads = data.leads || [];
    if (leads.length === 0) return;

    const lastSeen = localStorage.getItem(STORAGE_KEY);
    const lastSeenTime = lastSeen ? new Date(lastSeen).getTime() : 0;

    // Find leads created after last seen timestamp
    const newLeads = leads.filter(l => {
      const createdTime = new Date(l.createdAt).getTime();
      return createdTime > lastSeenTime;
    });

    // Show notification for each new lead (newest first, capped at 5 to avoid spam)
    const toNotify = newLeads.slice(0, 5);
    toNotify.forEach(lead => showLeadNotification(lead));

    // Update last seen to the newest lead's createdAt
    if (leads.length > 0) {
      const newestTime = leads[0].createdAt; // leads are sorted newest first from API
      localStorage.setItem(STORAGE_KEY, newestTime);
    }
  } catch (e) {
    console.error('[LeadNotif] Poll error:', e);
  }
}

/**
 * Start lead notification polling. 
 * Call this once when the superadmin is logged in.
 */
export function startLeadNotifications() {
  // Don't start if not superadmin
  const role = localStorage.getItem('adminRole');
  if (role !== 'superadmin') return;

  // Request permission (non-blocking, only prompts on first visit)
  requestNotificationPermission().then(granted => {
    if (!granted) {
      console.info('[LeadNotif] Permission not granted, skipping poll setup');
      return;
    }

    console.info('[LeadNotif] Permission granted, starting lead poll');

    // If no lastSeen stored yet, set it to "now" to avoid notifying old leads
    if (!localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    }

    // Clear any existing interval
    if (pollInterval) clearInterval(pollInterval);

    // Initial poll after a short delay (let the page settle)
    setTimeout(() => pollForNewLeads(), 3_000);

    // Then poll every 30 seconds
    pollInterval = setInterval(pollForNewLeads, POLL_INTERVAL_MS);
  });
}

/**
 * Stop lead notification polling.
 * Call on logout or component unmount.
 */
export function stopLeadNotifications() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}
