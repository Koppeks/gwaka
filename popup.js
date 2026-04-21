/** @type {Array<{id: string, label: string, badge: string}>} */
const ENVIRONMENTS = [
  { id: 'gas',     label: 'Google Apps Script', badge: 'script.google.com' },
  { id: 'gdocs',   label: 'Google Docs',         badge: 'docs.google.com' },
  { id: 'gsheets', label: 'Google Sheets',       badge: 'docs.google.com' },
  { id: 'gslides', label: 'Google Slides',       badge: 'docs.google.com' },
  { id: 'gforms',  label: 'Google Forms',        badge: 'docs.google.com' },
  { id: 'gdrive',  label: 'Google Drive',        badge: 'drive.google.com' },
  { id: 'gcolab',  label: 'Google Colab',        badge: 'colab.research.google.com' },
  { id: 'gsites',  label: 'Google Sites',        badge: 'sites.google.com' },
];

const input = document.getElementById('apiKey');
const hostnameInput = document.getElementById('hostname');
const btn = document.getElementById('saveBtn');
const msg = document.getElementById('msg');
const dot = document.getElementById('dot');
const mainView = document.getElementById('mainView');
const settingsView = document.getElementById('settingsView');
const settingsBtn = document.getElementById('settingsBtn');
const backBtn = document.getElementById('backBtn');
const envList = document.getElementById('envList');
const enabledToggle = document.getElementById('enabledToggle');

/** @param {boolean} hasKey @param {boolean} tracking */
function updateStatus(hasKey, tracking) {
  dot.classList.toggle('status-active', hasKey && tracking);
  if (!tracking) {
    msg.style.color = '#888';
    msg.textContent = 'Tracking paused';
  } else if (hasKey) {
    msg.style.color = '#27ae60';
    msg.textContent = 'Connected to Gwaka';
  } else {
    msg.style.color = '#888';
    msg.textContent = '';
  }
}

chrome.storage.sync.get(['wakaKey', 'hostname', 'trackingEnabled'], (data) => {
  if (data.wakaKey) input.value = data.wakaKey;
  hostnameInput.value = data.hostname || 'Browser Google IDE';
  enabledToggle.checked = data.trackingEnabled !== false;
  updateStatus(!!data.wakaKey, data.trackingEnabled !== false);
});

enabledToggle.addEventListener('change', () => {
  const tracking = enabledToggle.checked;
  chrome.storage.sync.set({ trackingEnabled: tracking });
  updateStatus(!!input.value.trim(), tracking);
});

btn.addEventListener('click', () => {
  const newKey = input.value.trim();
  const newHostname = hostnameInput.value.trim() || 'Browser Google IDE';

  if (newKey) {
    chrome.storage.sync.set({ wakaKey: newKey, hostname: newHostname, trackingEnabled: true }, () => {
      enabledToggle.checked = true;
      msg.style.color = '#27ae60';
      msg.textContent = 'Successfully saved!';
      setTimeout(() => updateStatus(true, true), 2000);
    });
  } else {
    msg.style.color = 'red';
    msg.textContent = 'Please enter an API key';
  }
});

settingsBtn.addEventListener('click', () => {
  mainView.classList.add('hidden');
  settingsView.classList.remove('hidden');
  renderEnvList();
});

backBtn.addEventListener('click', () => {
  settingsView.classList.add('hidden');
  mainView.classList.remove('hidden');
});

function renderEnvList() {
  chrome.storage.sync.get(['enabledEnvironments'], (data) => {
    /** @type {string[]} */
    const enabledIds = data.enabledEnvironments ?? ['gas'];
    envList.innerHTML = '';
    ENVIRONMENTS.forEach(({ id, label, badge }) => {
      const item = document.createElement('label');
      item.className = 'env-item';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = enabledIds.includes(id);
      checkbox.addEventListener('change', () => saveEnvChange(id, checkbox.checked));

      const labelEl = document.createElement('span');
      labelEl.className = 'env-label';
      labelEl.textContent = label;

      const badgeEl = document.createElement('span');
      badgeEl.className = 'env-badge';
      badgeEl.textContent = badge;

      item.appendChild(checkbox);
      item.appendChild(labelEl);
      item.appendChild(badgeEl);
      envList.appendChild(item);
    });
  });
}

/**
 * @param {string} id
 * @param {boolean} enabled
 */
function saveEnvChange(id, enabled) {
  chrome.storage.sync.get(['enabledEnvironments'], (data) => {
    /** @type {string[]} */
    const current = data.enabledEnvironments ?? ['gas'];
    const updated = enabled
      ? [...new Set([...current, id])]
      : current.filter((e) => e !== id);
    chrome.storage.sync.set({ enabledEnvironments: updated });
  });
}
