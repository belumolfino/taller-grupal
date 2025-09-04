document.addEventListener('DOMContentLoaded', function () {
    const STORAGE_KEY = 'listadoItems';

    const input      = document.getElementById('item');        // Campo de texto donde escribís el nuevo ítem
    const contenedor = document.getElementById('contenedor');  // <ul> donde se pintan los ítems
    const botonAgregar = document.getElementById('agregar');
    const botonLimpiar = document.getElementById('limpiar');

   // Lee el array desde localStorage. Si no existe o está roto, devuelve [].
  function getItems() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      // Si el JSON está corrupto, “reseteamos” para evitar que rompa la app.
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  }

  // Guarda el array en localStorage.
  function saveItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  // Habilita/deshabilita controles según si hay ítems.
  function setUIState() {
    const hasItems = getItems().length > 0;
    botonLimpiar.disabled = !hasItems; // mejora UX
  }

  // Dibuja la lista completa en <ul id="contenedor">
  function renderList() {
    const items = getItems();
    // Limpiamos el contenedor antes de repintar
    contenedor.innerHTML = '';
    // Estado vacío: mostramos un mensaje
    if (items.length === 0) {
      const li = document.createElement('li');
      li.className = 'list-group-item text-muted text-center'; // centrado opcional
      li.textContent = 'No hay ítems.';
      contenedor.appendChild(li);
      setUIState();
      return;
    }

     // Si hay elementos: creamos cada <li> + botón "Eliminar"
    items.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';

      // Usamos textContent para evitar inyección (XSS) si el usuario escribe HTML
      li.textContent = item;

      // Botón eliminar individual
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-sm btn-outline-secondary';
      btn.textContent = 'Eliminar';

      // Al hacer click, filtramos el item por su índice y re-renderizamos
      btn.addEventListener('click', () => {
        const newItems = getItems().filter((_, i) => i !== index);
        saveItems(newItems);
        renderList();   // refresca la vista
      });

      li.appendChild(btn);
      contenedor.appendChild(li);
    });

    setUIState();
  }

  // Agrega el valor del input a la lista
  function addItem() {
    const value = input.value.trim();
    if (value === '') return;           // ignoramos cadenas vacías

    const items = getItems();
    items.push(value);                   // modelo simple: string por ítem
    saveItems(items);                    // persistimos
    renderList();                        // refrescamos la UI

    input.value = '';                    // limpiamos input
    input.focus();                       // UX: listo para seguir cargando
  }

  // Limpia todo el listado
  function clearAll() {
    localStorage.removeItem(STORAGE_KEY);
    renderList();
  }

  function init() {
    renderList();

    // Click en “Agregar”
    botonAgregar.addEventListener('click', addItem);

    // Enter en el input también agrega
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addItem();
    });

    // Click en “Limpiar” (con confirmación)
    botonLimpiar.addEventListener('click', () => {
      if (confirm('¿Eliminar todo el listado?')) clearAll();
    });
  }

  // Si el DOM todavía se está cargando, esperamos; si no, iniciamos ya.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
});
