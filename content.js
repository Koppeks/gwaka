let lastHeartbeat = 0;

function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str));
}

async function sendHeartbeat() {

    const now = Date.now();
    if (now - lastHeartbeat < 120000) return;

    chrome.storage.sync.get('wakaKey', async (data) => {
        const apiKey = data.wakaKey;

        if (!apiKey) {
            console.warn("WakaTime GAS: API key not found. Add it in the extension options.");
            return;
        }

        let currentFile = "script.gs"; // Default file name
        const selectedItem = document.querySelector('div[role="treeitem"][aria-selected="true"]');
        if (selectedItem) {
            currentFile = selectedItem.innerText.split('\n')[0].trim();
        }

        const proyectName = document.title.split(' – ')[0] || "App Script Project"; // Find project name 

        try {
            const response = await fetch("https://wakatime.com/api/v1/users/current/heartbeats", {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${b64EncodeUnicode(apiKey)}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "entity": currentFile,
                    "type": "file",
                    "project": proyectName,
                    "plugin": "App Script",
                    "time": now / 1000
                })
            });

            if (response.ok) {
                lastHeartbeat = now;
                console.log(`WakaTime: Heartbeat sent successfully (${proyectName})`);
            } else {
                console.error("WakaTime: Error in response", response.status);
            }
        } catch (error) {
            console.error("WakaTime: Connection error", error);
        }
    });
}

document.addEventListener('keydown', () => {
    sendHeartbeat();
}); // Each 2 minutes we send heartbeat to wakatime

sendHeartbeat();