console.log('Iniciando aplicación...');

// Limpiar el mensaje de carga
const statusEl = document.getElementById('loading-status');
if (statusEl) {
  statusEl.textContent = 'Módulos cargados, iniciando React...';
}

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log('Módulos importados correctamente');

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('No se encontró el elemento root');
  }
  
  console.log('Creando root de React...');
  const root = createRoot(rootElement);
  
  console.log('Renderizando aplicación...');
  root.render(<App />);
  
  console.log('Aplicación renderizada correctamente');
  
  // Limpiar mensaje de carga
  if (statusEl) {
    statusEl.textContent = '';
  }
} catch (error) {
  console.error('Error al renderizar la aplicación:', error);
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui; flex-direction: column; padding: 20px;">
        <h1 style="color: red; margin-bottom: 20px;">Error al cargar la aplicación</h1>
        <p style="color: #666; margin-bottom: 10px;">${error instanceof Error ? error.message : 'Error desconocido'}</p>
        <p style="color: #999; font-size: 12px; margin-bottom: 20px;">Revisa la consola para más detalles</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Recargar
        </button>
      </div>
    `;
  }
}
