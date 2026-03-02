// Función para guardar la configuración
const saveOptions = () => {
  const key = document.getElementById('apiKey').value;

  chrome.storage.sync.set(
    { wakaKey: key },
    () => {
      // Actualizar estado para avisar al usuario
      const status = document.getElementById('status');
      status.textContent = 'Key stored successfully!';
      console.log('API Key stored in chrome.storage');
      
      setTimeout(() => {
        status.textContent = '';
      }, 2000);
    }
  );
};

// Función para recuperar la clave actual al abrir la página
const restoreOptions = () => {
  chrome.storage.sync.get(
    { wakaKey: '' },
    (items) => {
      document.getElementById('apiKey').value = items.wakaKey;
    }
  );
};

// Eventos
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);