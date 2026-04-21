/** @type {Record<string, number>} */
const lastHeartbeat = {};
const heartbeatSpeedMS = 120000;

function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str));
}

/** @returns {string|null} */
function getCurrentEnvironmentId() {
    const hostname = location.hostname;
    if (hostname === 'script.google.com') return 'gas';
    if (hostname === 'drive.google.com') return 'gdrive';
    if (hostname === 'colab.research.google.com') return 'gcolab';
    if (hostname === 'sites.google.com') return 'gsites';
    if (hostname === 'docs.google.com') {
        const path = location.pathname;
        if (path.startsWith('/document')) return 'gdocs';
        if (path.startsWith('/spreadsheets')) return 'gsheets';
        if (path.startsWith('/presentation')) return 'gslides';
        if (path.startsWith('/forms')) return 'gforms';
    }
    return null;
}

/** @returns {{file: string, project: string, language: string, editor: string, category: string}} */
function getEnvironmentInfo() {
    const hostname = location.hostname;

    if (hostname === 'script.google.com') {
        const selectedItem = document.querySelector('div[role="treeitem"][aria-selected="true"]');
        return {
            file: selectedItem ? selectedItem.innerText.split('\n')[0].trim() : 'script.gs',
            project: document.title.split(' – ')[0] || 'App Script Project',
            language: 'Google Apps Script',
            editor: 'Google Apps Script',
            category: 'coding',
        };
    }

    if (hostname === 'docs.google.com') {
        const path = location.pathname;
        const title = document.title || 'Untitled';
        if (path.startsWith('/document')) {
            return { file: title, project: title, language: 'Markdown', editor: 'Google Docs', category: 'writing docs' };
        }
        if (path.startsWith('/spreadsheets')) {
            return { file: title, project: title, language: 'Google Sheets', editor: 'Google Sheets', category: 'coding' };
        }
        if (path.startsWith('/presentation')) {
            return { file: title, project: title, language: 'Google Slides', editor: 'Google Slides', category: 'designing' };
        }
        if (path.startsWith('/forms')) {
            return { file: title, project: title, language: 'Google Forms', editor: 'Google Forms', category: 'coding' };
        }
    }

    if (hostname === 'drive.google.com') {
        const breadcrumb = document.querySelector('[data-tooltip][aria-label]:last-of-type')
            ?? document.querySelector('.a-s-tb-Pd-Bg-oi')
            ?? document.querySelector('[aria-label="Breadcrumbs"] [role="listitem"]:last-child');
        const folderName = breadcrumb?.textContent?.trim()
            || (document.title.split(' - ')[0]?.trim())
            || 'Drive';
        return { file: folderName, project: 'Google Drive', language: 'Google Drive', editor: 'Google Drive', category: 'browsing' };
    }

    if (hostname === 'colab.research.google.com') {
        return { file: document.title || 'notebook.ipynb', project: document.title || 'Colab Notebook', language: 'Python', editor: 'Google Colab', category: 'coding' };
    }

    if (hostname === 'sites.google.com') {
        return { file: document.title || 'site', project: document.title || 'Google Sites', language: 'Google Sites', editor: 'Google Sites', category: 'designing' };
    }

    return { file: document.title || 'unknown', project: document.title || 'unknown', language: 'unknown', editor: 'unknown', category: 'coding' };
}

async function sendHeartbeat() {
    const now = Date.now();
    const envId = getCurrentEnvironmentId();
    if (!envId) return;
    if (now - (lastHeartbeat[envId] ?? 0) < heartbeatSpeedMS) return;

    chrome.storage.sync.get(['wakaKey', 'hostname', 'enabledEnvironments', 'trackingEnabled'], async (data) => {
        if (data.trackingEnabled === false) return;

        const apiKey = data.wakaKey;
        const machineName = data.hostname || 'Browser Google IDE';
        /** @type {string[]} */
        const enabledEnvironments = data.enabledEnvironments ?? ['gas'];

        if (!enabledEnvironments.includes(envId)) return;

        if (!apiKey) {
            console.warn('Gwaka: API key not found. Add it in the extension options.');
            return;
        }

        const { file, project, language, editor, category } = getEnvironmentInfo();
        const os = getOSString();
        const userAgent = `wakatime/24.0.0 (${os}) ${editor}/1.0 google-apps-script-wakatime/1.0.0`;

        try {
            const response = await fetch('https://wakatime.com/api/v1/users/current/heartbeats', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${b64EncodeUnicode(apiKey)}`,
                    'Content-Type': 'application/json',
                    'X-Machine-Name': machineName,
                },
                body: JSON.stringify({
                    entity: file,
                    type: 'file',
                    project: project,
                    category: category,
                    time: now / 1000,
                    language: language,
                    editor: editor,
                    plugin: 'google-apps-script-wakatime/1.0.0',
                    user_agent: userAgent,
                }),
            });

            if (response.ok) {
                lastHeartbeat[envId] = now;
                console.log(`Gwaka: Heartbeat sent successfully (${project})`);
            } else {
                console.error('Gwaka: Error in response', response.status);
            }
        } catch (error) {
            console.error('Gwaka: Connection error', error);
        }
    });
}

document.addEventListener('keydown', () => {
    sendHeartbeat();
});

sendHeartbeat();
