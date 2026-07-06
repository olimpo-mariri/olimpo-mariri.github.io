// Estado Inicial de la Aplicación
let appData = {
    settings: {
        heroTitle: "Bienvenido al club de deportes más querido",
        heroSubtitle: "Fruto de un amor por sí mismos y por nuestro compañero de vida.",
        heroBg: "https://i.imgur.com/DVZpbuJ.png",
        rutasTitle: "Actividades",
        rutasSubtitle: "Cada paso nos forja.",
        mapamundiTitle: "olIMpo se va de viaje",
        mapamundiSubtitle: "\"and the goal is to one day travel the world beside my world\"",
        productosTitle: "Productos",
        productosSubtitle: "Creaciones únicas que definen nuestro estilo de vida."
    },
    visitedCountries: [],
    rutas: [
        {
            id: "rut-1",
            title: "Unirun",
            date: "01/03/2026",
            tag: "Correr",
            desc: "Nuestra primera carrera juntos, con la que empezamos a dejar marca.",
            gpx: "rutas/unirun.gpx",
            visible: true,
            stats: [
                { label: "Distancia", value: "5.06", unit: "km", visible: true },
                { label: "Desnivel", value: "0", unit: "m", visible: false },
                { label: "Tiempo", value: "31", unit: "min", visible: true },
                { label: "Ritmo", value: "6:07", unit: "min/km", visible: true }
            ]
        }
    ],
    productos: [
        {
            id: "prod-1",
            name: "Dominó olIMpo",
            desc: "Hecho a mano con amor y delicadeza.",
            status: "available",
            images: ["https://images.unsplash.com/photo-1606503153255-59d8b8b82176?auto=format&fit=crop&w=600&q=80"],
            visible: true
        },
        {
            id: "prod-2",
            name: "Camisetas olIMpo",
            desc: "Camisetas únicas para un club único.",
            status: "upcoming",
            images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80"],
            visible: true
        },
        {
            id: "prod-3",
            name: "Baraja de Cartas",
            desc: "Juego de cartas personalizado con palos de nuestra historia.",
            status: "upcoming",
            images: ["https://images.unsplash.com/photo-1501003878151-d3cb87799705?auto=format&fit=crop&w=600&q=80"],
            visible: true
        }
    ]
};

let isEditorMode = false;
let hasUnsavedChanges = false;
let sortableRutas = null;
let sortableProductos = null;
const JSONBIN_URL = "https://api.jsonbin.io/v3/b/6a03a756250b1311c33f74c6";
let SECRET_KEY = localStorage.getItem('olimpo_api_key') || "";

// Protección contra cierre accidental de pestaña si hay cambios
window.addEventListener('beforeunload', (e) => {
    if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Requerido para navegadores modernos
    }
});

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
    // Renderizado inmediato (0 milisegundos) con caché local
    renderApp();
    setupEditorControls();
    setupEditableTitles();

    // Consulta en segundo plano
    loadFromCloud().then(() => {
        // Re-renderizado silencioso con datos frescos de la nube
        renderApp();
    });
});

async function loadFromCloud() {
    if (JSONBIN_URL.includes("AQUI_TU_BIN_ID")) return;
    try {
        const response = await fetch(`${JSONBIN_URL}/latest`, { cache: 'no-store' });
        if (response.ok) {
            const data = await response.json();
            if (data.record && data.record.rutas) {
                appData = data.record;
            }
        }
    } catch (e) {
        console.warn("Usando datos locales por defecto.");
    }
}

window.saveToCloud = async function () {
    if (JSONBIN_URL.includes("AQUI_TU_BIN_ID")) {
        alert("Primero debes configurar tu URL de JSONBin en app.js.");
        return;
    }

    if (!SECRET_KEY) {
        SECRET_KEY = prompt("Introduce tu Contraseña Secreta (Master Key) para guardar. \n(Solo te la pedirá esta vez, se quedará guardada en tu navegador):");
        if (!SECRET_KEY) return;
        localStorage.setItem('olimpo_api_key', SECRET_KEY);
    }

    try {
        const response = await fetch(JSONBIN_URL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': SECRET_KEY
            },
            body: JSON.stringify(appData)
        });
        if (response.ok) {
            hasUnsavedChanges = false;
            alert("¡Cambios guardados en la nube exitosamente!");
        } else {
            alert("Error al guardar. Comprueba tu clave secreta. Te la volveremos a pedir la próxima vez.");
            SECRET_KEY = "";
            localStorage.removeItem('olimpo_api_key');
        }
    } catch (e) {
        alert("Error de conexión: " + e.message);
    }
}

// --- RENDERIZADO VISUAL ---
function renderApp() {
    try { renderSettings(); } catch (e) { console.error("Error en renderSettings:", e); }
    try { renderMapamundi(); } catch (e) { console.error("Error en renderMapamundi:", e); }
    try { renderRutas(); } catch (e) { console.error("Error en renderRutas:", e); }
    try { renderProductos(); } catch (e) { console.error("Error en renderProductos:", e); }

    if (isEditorMode) {
        document.body.classList.add('editor-active');
        try { enableTitleEditing(true); } catch (e) { }
    } else {
        document.body.classList.remove('editor-active');
        try { enableTitleEditing(false); } catch (e) { }
    }
}

function renderSettings() {
    if (!appData.settings) return;
    const heroSec = document.getElementById('hero-section');
    document.getElementById('hero-title').innerHTML = appData.settings.heroTitle || "Bienvenido al club de deportes más querido";
    document.getElementById('hero-subtitle').innerHTML = appData.settings.heroSubtitle || "Fruto de un amor por sí mismos y por nuestro compañero de vida.";
    if (appData.settings.heroBg) {
        heroSec.style.backgroundImage = `linear-gradient(rgba(248, 249, 250, 0.8), rgba(248, 249, 250, 0.8)), url('${appData.settings.heroBg}')`;
    }
    heroSec.style.backgroundPosition = 'center';
    heroSec.style.backgroundSize = 'cover';

    document.getElementById('rutas-title').innerHTML = appData.settings.rutasTitle || "Actividades";
    document.getElementById('rutas-subtitle').innerHTML = appData.settings.rutasSubtitle || "Cada paso nos forja.";
    const navRutas = document.getElementById('nav-rutas');
    if (navRutas) navRutas.textContent = document.getElementById('rutas-title').textContent;

    document.getElementById('productos-title').innerHTML = appData.settings.productosTitle || "Productos";
    document.getElementById('productos-subtitle').innerHTML = appData.settings.productosSubtitle || "Creaciones únicas que definen nuestro estilo de vida.";
    const navProductos = document.getElementById('nav-productos');
    if (navProductos) navProductos.textContent = document.getElementById('productos-title').textContent;

    const heroEditor = document.getElementById('hero-editor-container');
    if (heroEditor) {
        if (isEditorMode) {
            heroEditor.innerHTML = `<button onclick="openModal('settings')" class="btn" style="position:absolute; top:20px; right:20px; z-index:10; background:var(--c-surface); color:var(--c-navy);"><ion-icon name="image-outline"></ion-icon> Cambiar Fondo</button>`;
        } else {
            heroEditor.innerHTML = '';
        }
    }
}

function enableTitleEditing(enable) {
    const ids = ['hero-title', 'hero-subtitle', 'rutas-title', 'rutas-subtitle', 'productos-title', 'productos-subtitle', 'mapamundi-title', 'mapamundi-subtitle'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.contentEditable = enable;
            if (enable) {
                el.style.border = "2px dashed var(--c-navy)";
                el.style.padding = "5px";
                el.style.borderRadius = "4px";

                el.addEventListener('paste', function (e) {
                    e.preventDefault();
                    const text = (e.originalEvent || e).clipboardData.getData('text/plain');
                    document.execCommand('insertText', false, text);
                });
            } else {
                el.style.border = "none";
                el.style.padding = "0";

                const newEl = el.cloneNode(true);
                el.parentNode.replaceChild(newEl, el);

                setupEditableTitles();
            }
        }
    });
}

function setupEditableTitles() {
    const ids = [
        { id: 'hero-title', key: 'heroTitle' },
        { id: 'hero-subtitle', key: 'heroSubtitle' },
        { id: 'rutas-title', key: 'rutasTitle' },
        { id: 'rutas-subtitle', key: 'rutasSubtitle' },
        { id: 'productos-title', key: 'productosTitle' },
        { id: 'productos-subtitle', key: 'productosSubtitle' },
        { id: 'mapamundi-title', key: 'mapamundiTitle' },
        { id: 'mapamundi-subtitle', key: 'mapamundiSubtitle' }
    ];
    ids.forEach(obj => {
        const el = document.getElementById(obj.id);
        if (el) {
            let initialHtml = '';
            el.addEventListener('focus', (e) => {
                initialHtml = e.target.innerHTML;
            });

            el.addEventListener('blur', (e) => {
                if (isEditorMode && appData.settings) {
                    if (initialHtml !== e.target.innerHTML) {
                        appData.settings[obj.key] = e.target.innerHTML;
                        hasUnsavedChanges = true;

                        if (obj.key === 'rutasTitle') {
                            const navEl = document.getElementById('nav-rutas');
                            if (navEl) navEl.textContent = e.target.textContent;
                        }
                        if (obj.key === 'productosTitle') {
                            const navEl = document.getElementById('nav-productos');
                            if (navEl) navEl.textContent = e.target.textContent;
                        }
                        if (obj.key === 'mapamundiTitle') {
                            const navEl = document.getElementById('nav-mapamundi');
                            if (navEl) navEl.textContent = e.target.textContent;
                        }
                    }
                }
            });
        }
    });
}


function renderRutas() {
    const container = document.getElementById('rutas-container');
    if (!container) return;
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    appData.rutas.forEach(ruta => {
        if (!ruta.visible && !isEditorMode) return;

        const div = document.createElement('div');
        div.className = `route-card ${!ruta.visible ? 'hidden-item' : ''}`;
        div.setAttribute('data-id', ruta.id);

        let editorHtml = '';
        if (isEditorMode) {
            editorHtml = `
                <div class="editor-controls absolute-top-right">
                    <button class="drag-handle" onclick="event.preventDefault();"><ion-icon name="menu"></ion-icon></button>
                    <button onclick="toggleVisibility('rutas', '${ruta.id}')"><ion-icon name="${ruta.visible ? 'eye-off' : 'eye'}"></ion-icon></button>
                    <button onclick="editItem('rutas', '${ruta.id}')"><ion-icon name="create"></ion-icon></button>
                    <button onclick="deleteItem('rutas', '${ruta.id}')" class="danger"><ion-icon name="trash"></ion-icon></button>
                </div>
            `;
        }

        let statsHtml = '';
        if (ruta.stats) {
            ruta.stats.forEach(stat => {
                if (stat.visible && stat.value) {
                    statsHtml += `
                        <div class="stat">
                            <span class="stat-value">${stat.value}</span>
                            <span class="stat-unit">${stat.unit}</span>
                            <span class="stat-label">${stat.label}</span>
                        </div>
                    `;
                }
            });
        }

        const images = ruta.images || [];
        const hasMultiple = images.length > 0;

        let carouselUI = '';
        if (hasMultiple) {
            carouselUI = `
                <button class="carousel-btn prev" onclick="nextImg('rutas', '${ruta.id}', -1, event)">&#10094;</button>
                <button class="carousel-btn next" onclick="nextImg('rutas', '${ruta.id}', 1, event)">&#10095;</button>
                <div class="carousel-dots">
                    <span class="dot active" id="dot-rutas-${ruta.id}-0"></span>
                    ${images.map((_, i) => `<span class="dot" id="dot-rutas-${ruta.id}-${i + 1}"></span>`).join('')}
                </div>
            `;
        }

        const imgsHtml = images.map((img, i) => {
            const isVid = img.match(/\.(mp4|webm|ogg)$/i);
            if (isVid) {
                return `<video src="${img}" class="carousel-img" id="img-rutas-${ruta.id}-${i + 1}" preload="metadata" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; z-index:2; object-fit:cover;" autoplay loop muted playsinline onclick="this.muted = !this.muted;"></video>`;
            }
            return `<img src="${img}" class="carousel-img" id="img-rutas-${ruta.id}-${i + 1}" loading="lazy" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; z-index:2; object-fit:cover;">`;
        }).join('');

        div.innerHTML = `
            <div class="route-media" id="media-rutas-${ruta.id}" data-idx="0" data-total="${images.length + 1}">
                <div id="map-${ruta.id}" class="route-map-container" data-gpx="${ruta.gpx}">
                    <div class="route-overlay" id="overlay-${ruta.id}">
                        <ion-icon name="map"></ion-icon>
                        <span id="text-${ruta.id}">Cargando trazado GPX...</span>
                    </div>
                </div>
                ${imgsHtml}
                ${carouselUI}
            </div>
            ${editorHtml}
            <div class="route-info">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 class="route-title" style="margin-bottom: 0;">${ruta.title}</h3>
                    ${ruta.date ? `<span class="route-date" style="font-size: 0.9rem; color: var(--c-text-muted); font-weight: 600;">${ruta.date}</span>` : ''}
                </div>
                <div class="route-tag" style="margin-top: 0.5rem;">${ruta.tag}</div>
                <div class="route-stats">
                    ${statsHtml}
                </div>
                <p class="route-desc cursive">${ruta.desc}</p>
            </div>
        `;
        fragment.appendChild(div);
    });

    if (isEditorMode) {
        const addBtn = document.createElement('div');
        addBtn.className = 'route-card add-new-btn-card';
        addBtn.onclick = () => openModal('rutas');
        addBtn.innerHTML = `
            <div style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;">
                <ion-icon name="add-circle-outline" style="font-size: 4rem; color: var(--c-navy);"></ion-icon>
                <h3 style="margin-top: 0.5rem; font-size: 1.5rem; color: var(--c-navy);">Añadir Actividad</h3>
            </div>`;
        fragment.appendChild(addBtn);
    }

    container.appendChild(fragment);
    initLeafletMaps();

    if (sortableRutas) { sortableRutas.destroy(); sortableRutas = null; }
    if (isEditorMode) {
        sortableRutas = Sortable.create(container, {
            handle: '.drag-handle',
            animation: 150,
            draggable: '.route-card:not(.add-new-btn-card)',
            onEnd: function (evt) {
                const order = sortableRutas.toArray().filter(id => id);
                appData.rutas.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
                hasUnsavedChanges = true;
                renderApp();
            }
        });
    }
}

function renderProductos() {
    const container = document.getElementById('productos-container');
    if (!container) return;
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    appData.productos.forEach(prod => {
        if (!prod.visible && !isEditorMode) return;

        const div = document.createElement('div');
        div.className = `product-card ${!prod.visible ? 'hidden-item' : ''}`;
        div.setAttribute('data-id', prod.id);

        let editorHtml = '';
        if (isEditorMode) {
            editorHtml = `
                <div class="editor-controls absolute-top-right">
                    <button class="drag-handle" onclick="event.preventDefault();"><ion-icon name="menu"></ion-icon></button>
                    <button onclick="toggleVisibility('productos', '${prod.id}')"><ion-icon name="${prod.visible ? 'eye-off' : 'eye'}"></ion-icon></button>
                    <button onclick="editItem('productos', '${prod.id}')"><ion-icon name="create"></ion-icon></button>
                    <button onclick="deleteItem('productos', '${prod.id}')" class="danger"><ion-icon name="trash"></ion-icon></button>
                </div>
            `;
        }

        let imgHtml = '';
        if (prod.images && prod.images.length > 0) {
            const hasMultiple = prod.images.length > 1;
            const mediaTags = prod.images.map((img, i) => {
                const isVid = img.match(/\.(mp4|webm|ogg)$/i);
                const displayStyle = i === 0 ? 'block' : 'none';
                if (isVid) {
                    return `<video src="${img}" class="carousel-img" id="img-${prod.id}-${i}" data-idx="${i}" preload="metadata" style="display:${displayStyle}; position:absolute; top:0; left:0; width:100%; height:100%; z-index:2; object-fit:cover;" autoplay loop muted playsinline onclick="this.muted = !this.muted;"></video>`;
                }
                // Las primeras fotos del carrusel se cargan normal (i === 0), las ocultas con lazy loading
                const lazyAttr = i === 0 ? '' : 'loading="lazy"';
                return `<img src="${img}" alt="${prod.name}" class="carousel-img" id="img-${prod.id}-${i}" data-idx="${i}" ${lazyAttr} style="display:${displayStyle}; position:absolute; top:0; left:0; width:100%; height:100%; z-index:2; object-fit:cover;">`;
            }).join('');

            imgHtml = `<div id="media-${prod.id}" data-idx="0" data-total="${prod.images.length}" style="position:relative; width:100%; height:100%;">${mediaTags}</div>`;
            if (hasMultiple) {
                imgHtml += `
                    <button class="carousel-btn prev" onclick="nextImg('productos', '${prod.id}', -1, event)">&#10094;</button>
                    <button class="carousel-btn next" onclick="nextImg('productos', '${prod.id}', 1, event)">&#10095;</button>
                    <div class="carousel-dots">
                        ${prod.images.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" id="dot-${prod.id}-${i}"></span>`).join('')}
                    </div>
                `;
            }
        }

        div.innerHTML = `
            <div class="product-img ${prod.status === 'upcoming' ? 'is-upcoming' : ''}">
                ${imgHtml}
                ${prod.status === 'upcoming' ? '<span class="product-badge upcoming">Próximamente</span>' : ''}
            </div>
            <div class="product-details">
                <h4>${prod.name}</h4>
                <p class="text-muted">${prod.desc}</p>
            </div>
            ${editorHtml}
        `;
        fragment.appendChild(div);
    });

    if (isEditorMode) {
        const addBtn = document.createElement('div');
        addBtn.className = 'product-card add-new-btn-card';
        addBtn.onclick = () => openModal('productos');
        addBtn.innerHTML = `
            <div style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%;">
                <ion-icon name="add-circle-outline" style="font-size: 4rem; color: var(--c-navy);"></ion-icon>
                <h3 style="margin-top: 0.5rem; font-size: 1.5rem; color: var(--c-navy);">Añadir Producto</h3>
            </div>`;
        fragment.appendChild(addBtn);
    }

    container.appendChild(fragment);

    if (sortableProductos) { sortableProductos.destroy(); sortableProductos = null; }
    if (isEditorMode) {
        sortableProductos = Sortable.create(container, {
            handle: '.drag-handle',
            animation: 150,
            draggable: '.product-card:not(.add-new-btn-card)',
            onEnd: function (evt) {
                const order = sortableProductos.toArray().filter(id => id);
                appData.productos.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
                hasUnsavedChanges = true;
                renderApp();
            }
        });
    }
}

// --- LOGICA DEL CARRUSEL ---
window.nextImg = function (type, itemId, step, event) {
    if (event) event.stopPropagation();

    if (type === 'productos') {
        const prod = appData.productos.find(p => p.id === itemId);
        if (!prod || prod.images.length <= 1) return;

        const mediaContainer = document.getElementById(`media-${itemId}`);
        if (!mediaContainer) return;
        let currentIdx = parseInt(mediaContainer.getAttribute('data-idx'));
        let newIdx = currentIdx + step;

        if (newIdx < 0) newIdx = prod.images.length - 1;
        if (newIdx >= prod.images.length) newIdx = 0;

        // Hide all
        prod.images.forEach((_, i) => {
            const el = document.getElementById(`img-${itemId}-${i}`);
            if (el) el.style.display = 'none';
            document.getElementById(`dot-${itemId}-${i}`).classList.remove('active');
        });

        // Show new
        const newEl = document.getElementById(`img-${itemId}-${newIdx}`);
        if (newEl) newEl.style.display = 'block';

        mediaContainer.setAttribute('data-idx', newIdx);
        const dotEl = document.getElementById(`dot-${itemId}-${newIdx}`);
        if (dotEl) dotEl.classList.add('active');
    } else if (type === 'rutas') {
        const ruta = appData.rutas.find(r => r.id === itemId);
        const images = ruta.images || [];
        const total = images.length + 1; // map is 0
        if (total <= 1) return;

        const mediaEl = document.getElementById(`media-rutas-${itemId}`);
        let currentIdx = parseInt(mediaEl.getAttribute('data-idx'));
        let newIdx = currentIdx + step;

        if (newIdx < 0) newIdx = total - 1;
        if (newIdx >= total) newIdx = 0;

        // Hide all
        document.getElementById(`map-${itemId}`).style.opacity = '0';
        document.getElementById(`map-${itemId}`).style.pointerEvents = 'none';
        images.forEach((_, i) => {
            const imgEl = document.getElementById(`img-rutas-${itemId}-${i + 1}`);
            if (imgEl) imgEl.style.display = 'none';
            document.getElementById(`dot-rutas-${itemId}-${i + 1}`).classList.remove('active');
        });
        document.getElementById(`dot-rutas-${itemId}-0`).classList.remove('active');

        // Show current
        if (newIdx === 0) {
            document.getElementById(`map-${itemId}`).style.opacity = '1';
            document.getElementById(`map-${itemId}`).style.pointerEvents = 'auto';
            // Invalidate size for leaflet map
            const mapObj = window.leafletMaps.find(m => m.getContainer().id === `map-${itemId}`);
            if (mapObj) mapObj.invalidateSize();
        } else {
            const imgEl = document.getElementById(`img-rutas-${itemId}-${newIdx}`);
            if (imgEl) imgEl.style.display = 'block';
        }

        document.getElementById(`dot-rutas-${itemId}-${newIdx}`).classList.add('active');
        mediaEl.setAttribute('data-idx', newIdx);
    }
}

// --- MAPAMUNDI ---
let worldMapInstance = null;

function renderMapamundi() {
    if (!appData.settings) return;

    document.getElementById('mapamundi-title').innerHTML = appData.settings.mapamundiTitle || "olIMpo se va de viaje";
    document.getElementById('mapamundi-subtitle').innerHTML = appData.settings.mapamundiSubtitle || "\"and the goal is one day travel the world beside my world\"";

    const navMapamundi = document.getElementById('nav-mapamundi');
    if (navMapamundi) navMapamundi.textContent = document.getElementById('mapamundi-title').textContent;



    if (!appData.visitedCountries) {
        appData.visitedCountries = [];
    }

    if (worldMapInstance) {
        // Ya está inicializado, actualizamos la capacidad de seleccionar basándonos en el modo editor
        worldMapInstance.params.regionsSelectable = isEditorMode;
        // Actualizamos los países seleccionados (por si han llegado nuevos de la nube)
        try {
            worldMapInstance.clearSelectedRegions();
            if (appData.visitedCountries.length > 0) {
                worldMapInstance.setSelected(appData.visitedCountries);
            }
        } catch (e) {
            console.warn("No se pudo actualizar regiones, recreando mapa...", e);
            document.getElementById('world-map').innerHTML = '';
            worldMapInstance = null;
            return renderMapamundi();
        }
        return;
    }

    const mapEl = document.getElementById('world-map');
    if (!mapEl) return;

    try {
        worldMapInstance = new jsVectorMap({
            selector: '#world-map',
            map: 'world',
            backgroundColor: 'transparent',
            zoomOnScroll: false,
            regionsSelectable: isEditorMode,
            regionsSelectableOne: false,
            regionStyle: {
                initial: {
                    fill: '#112c5a', // var(--c-navy)
                    fillOpacity: 1,
                    stroke: 'none',
                    strokeWidth: 0,
                    strokeOpacity: 1
                },
                hover: {
                    fillOpacity: 0.8,
                    cursor: 'pointer'
                },
                selected: {
                    fill: '#a6511f' // var(--c-orange)
                },
                selectedHover: {}
            },
            selectedRegions: appData.visitedCountries,
            onRegionClick: function (event, code) {
                if (!isEditorMode) {
                    event.preventDefault(); // Evita que se seleccione
                    return;
                }

                const index = appData.visitedCountries.indexOf(code);
                if (index > -1) {
                    appData.visitedCountries.splice(index, 1);
                } else {
                    appData.visitedCountries.push(code);
                }
                hasUnsavedChanges = true;
            }
        });
    } catch (e) {
        console.warn("Error inicializando Mapamundi:", e);
    }
}

// --- MAPAS LEAFLET ---
window.leafletMaps = window.leafletMaps || [];

function initLeafletMaps() {
    // Destruir mapas antiguos para evitar el error "Map container is already initialized"
    if (window.leafletMaps && window.leafletMaps.length > 0) {
        window.leafletMaps.forEach(map => {
            try { map.remove(); } catch (e) { }
        });
    }
    window.leafletMaps = [];

    const maps = document.querySelectorAll('.route-map-container');
    maps.forEach((mapEl) => {
        const gpxFile = mapEl.getAttribute('data-gpx');
        const mapId = mapEl.id;

        if (gpxFile && mapId) {
            try {
                const map = L.map(mapId, {
                    zoomControl: false, scrollWheelZoom: false, dragging: false, attributionControl: false
                });

                L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);

                new L.GPX(gpxFile, {
                    async: true,
                    marker_options: { startIconUrl: '', endIconUrl: '', shadowUrl: '' },
                    polyline_options: { color: '#a6511f', opacity: 0.8, weight: 4, lineCap: 'round' }
                }).on('loaded', function (e) {
                    map.fitBounds(e.target.getBounds());
                    const overlay = mapEl.querySelector('.route-overlay');
                    if (overlay) overlay.style.display = 'none';
                }).on('error', function (e) {
                    const textEl = mapEl.querySelector('span');
                    if (textEl) textEl.textContent = "Sin GPX (o error de carga local)";
                }).addTo(map);

                window.leafletMaps.push(map);
            } catch (e) {
                console.warn("Leaflet error:", e);
            }
        }
    });
}

// --- CONTROLES MODO EDITOR ---
function setupEditorControls() {
    const toggleBtn = document.getElementById('editor-toggle-btn');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (isEditorMode) {
            if (hasUnsavedChanges) {
                const wantToExit = confirm("Tienes cambios sin guardar. ¿Seguro que quieres salir del modo edición sin guardar en la nube?");
                if (!wantToExit) return;
            }
            isEditorMode = false;
        } else {
            isEditorMode = true;
        }

        toggleBtn.classList.toggle('active', isEditorMode);
        document.getElementById('cloud-save-container').style.display = isEditorMode ? 'inline-block' : 'none';
        renderApp();
    });
}

// --- ESTADO DEL MODAL ---
let currentModalType = null;
let currentEditId = null;

window.toggleVisibility = function (type, id) {
    const item = appData[type].find(i => i.id === id);
    if (item) {
        item.visible = !item.visible;
        hasUnsavedChanges = true;
        renderApp();
    }
}

window.deleteItem = function (type, id) {
    if (confirm('¿Seguro que quieres eliminar este elemento?')) {
        appData[type] = appData[type].filter(i => i.id !== id);
        hasUnsavedChanges = true;
        renderApp();
    }
}

window.editItem = function (type, id) {
    currentEditId = id;
    openModal(type, true);
}

window.openModal = function (type, isEdit = false) {
    currentModalType = type;
    if (!isEdit) currentEditId = null;

    let item = {};
    if (isEdit) {
        if (type === 'settings') {
            item = appData.settings;
        } else {
            item = appData[type].find(i => i.id === currentEditId) || {};
        }
    }

    const typeName = type === 'rutas' ? 'Actividad' : (type === 'productos' ? 'Producto' : type);
    document.getElementById('modal-title').textContent = isEdit ? `Editar ${typeName}` : `Añadir ${typeName}`;
    const modalBody = document.getElementById('modal-body');
    let formHtml = '';

    if (type === 'rutas') {
        // Asegurar que existan stats iniciales
        let stats = item.stats || [
            { label: "Distancia", value: "", unit: "km", visible: true },
            { label: "Desnivel", value: "", unit: "m", visible: true },
            { label: "Tiempo", value: "", unit: "h", visible: true },
            { label: "Ritmo", value: "", unit: "min/km", visible: false }
        ];

        let statsHtml = '';
        stats.forEach((s, i) => {
            statsHtml += `
                <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px; background:#f9f9f9; padding:10px; border-radius:5px;">
                    <input type="checkbox" id="stat-vis-${i}" ${s.visible ? 'checked' : ''} title="Mostrar">
                    <input type="text" id="stat-lbl-${i}" value="${s.label}" style="width:30%" placeholder="Etiqueta">
                    <input type="text" id="stat-val-${i}" value="${s.value}" style="width:40%" placeholder="Valor">
                    <input type="text" id="stat-unt-${i}" value="${s.unit}" style="width:20%" placeholder="Unidad">
                    <button class="danger" onclick="this.parentElement.remove()" style="border:none; background:none; cursor:pointer;"><ion-icon name="trash"></ion-icon></button>
                </div>
            `;
        });

        formHtml = `
            <div style="margin-bottom: 10px;"><label>Título:</label><br><input type="text" id="ruta-title" style="width:100%; padding:8px;" value="${item.title || ''}"></div>
            <div style="margin-bottom: 10px; display:flex; gap:10px;">
                <div style="flex:2"><label>Deporte:</label><br><input type="text" id="ruta-tag" style="width:100%; padding:8px;" value="${item.tag || ''}"></div>
                <div style="flex:1"><label>Fecha (dd/mm/aaaa):</label><br><input type="text" id="ruta-date" style="width:100%; padding:8px;" placeholder="Ej: 19/11/2022" value="${item.date || ''}"></div>
            </div>
            <div style="margin-bottom: 10px;"><label>Descripción:</label><br><textarea id="ruta-desc" style="width:100%; padding:8px; min-height:80px;">${item.desc || ''}</textarea></div>
            <div style="margin-bottom: 10px;">
                <label>Archivo GPX de la Actividad:</label><br>
                <input type="text" id="ruta-gpx" style="width:100%; padding:8px;" value="${item.gpx || ''}" placeholder="Ej: rutas/mi_actividad.gpx">
                <small class="text-muted">Ej: rutas/mi_actividad.gpx (Debes arrastrar el archivo GPX a tu carpeta "rutas").</small>
            </div>
            <div style="margin-bottom: 10px;">
                <label>URLs de Imágenes (separadas por coma) (Opcional):</label><br>
                <textarea id="ruta-images" style="width:100%; padding:8px; min-height:60px;" placeholder="https://ejemplo.com/foto1.jpg, https://ejemplo.com/foto2.jpg">${item.images ? item.images.join(', ') : ''}</textarea>
                <small class="text-muted">Hay que subir las fotos a Imgur.com o Postimages.org y pega el enlace que acaba en \".jpg\" o parecido aquí.</small>
            </div>
            <hr style="margin: 20px 0; border: 0; border-top: 1px solid #eee;">
            <h4>Estadísticas</h4>
            <div id="stats-container">
                ${statsHtml}
            </div>
            <button onclick="addStatRow()" style="margin-bottom:15px; padding:5px 10px; cursor:pointer; background:var(--c-surface); border:1px solid var(--c-navy); border-radius:4px;">+ Añadir Estadística Personalizada</button>
            <div style="margin-bottom: 10px;"><label><input type="checkbox" id="ruta-visible" ${item.visible !== false ? 'checked' : ''}> Visible públicamente</label></div>
        `;
    } else if (type === 'productos') {
        formHtml = `
            <div style="margin-bottom: 10px;"><label>Nombre Completo:</label><br><input type="text" id="prod-name" style="width:100%; padding:8px;" value="${item.name || ''}"></div>
            <div style="margin-bottom: 10px;"><label>Descripción:</label><br><textarea id="prod-desc" style="width:100%; padding:8px; min-height:80px;">${item.desc || ''}</textarea></div>
            <div style="margin-bottom: 10px;"><label>Estado:</label><br>
                <select id="prod-status" style="width:100%; padding:8px;">
                    <option value="available" ${item.status === 'available' ? 'selected' : ''}>Disponible</option>
                    <option value="upcoming" ${item.status === 'upcoming' ? 'selected' : ''}>Próximamente</option>
                </select>
            </div>
            <div style="margin-bottom: 10px;"><label>URLs de Imágenes (separadas por coma):</label><br>
                <textarea id="prod-images" style="width:100%; padding:8px; min-height:80px;" placeholder="https://ejemplo.com/foto1.jpg, https://ejemplo.com/foto2.jpg">${item.images ? item.images.join(', ') : ''}</textarea>
                <small class="text-muted">Hay que subir las fotos a Imgur.com o Postimages.org y pega el enlace que acaba en \".jpg\" o parecido aquí.</small>
            </div>
            <div style="margin-bottom: 10px;"><label><input type="checkbox" id="prod-visible" ${item.visible !== false ? 'checked' : ''}> Visible públicamente</label></div>
        `;
    } else if (type === 'settings') {
        formHtml = `
            <div style="margin-bottom: 10px;">
                <label>URL de Imagen de Fondo (Portada):</label><br>
                <input type="text" id="set-heroBg" style="width:100%; padding:8px;" value="${item.heroBg || ''}">
                <small class="text-muted">Pega un enlace directo a la imagen. OJO: Debe terminar en .jpg, .png o similar. (Si usas Imgur, haz clic derecho en la foto y copia "Dirección de la imagen").</small>
            </div>
        `;
    }

    modalBody.innerHTML = formHtml;
    document.getElementById('editor-modal').classList.add('active');
}

window.addStatRow = function () {
    const container = document.getElementById('stats-container');
    const idx = container.children.length;
    const div = document.createElement('div');
    div.style = "display:flex; align-items:center; gap:10px; margin-bottom:10px; background:#f9f9f9; padding:10px; border-radius:5px;";
    div.innerHTML = `
        <input type="checkbox" id="stat-vis-${idx}" checked title="Mostrar">
        <input type="text" id="stat-lbl-${idx}" value="Nueva Stat" style="width:30%" placeholder="Etiqueta">
        <input type="text" id="stat-val-${idx}" value="" style="width:40%" placeholder="Valor">
        <input type="text" id="stat-unt-${idx}" value="" style="width:20%" placeholder="Unidad">
        <button class="danger" onclick="this.parentElement.remove()" style="border:none; background:none; cursor:pointer;"><ion-icon name="trash"></ion-icon></button>
    `;
    container.appendChild(div);
}

window.closeModal = function () {
    document.getElementById('editor-modal').classList.remove('active');
    currentModalType = null;
    currentEditId = null;
}

window.saveModal = function () {
    if (currentModalType === 'settings') {
        if (!appData.settings) appData.settings = {};
        appData.settings.heroBg = document.getElementById('set-heroBg').value;
        hasUnsavedChanges = true;
        closeModal();
        renderApp();
        return;
    }

    let newItem = {};
    if (currentModalType === 'rutas') {
        // Recoger stats dinámicas
        let stats = [];
        const container = document.getElementById('stats-container');
        if (container) {
            Array.from(container.children).forEach((row) => {
                const visEl = row.querySelector('input[type="checkbox"]');
                const inputs = row.querySelectorAll('input[type="text"]');
                if (visEl && inputs.length === 3) {
                    stats.push({
                        visible: visEl.checked,
                        label: inputs[0].value,
                        value: inputs[1].value,
                        unit: inputs[2].value
                    });
                }
            });
        }

        newItem = {
            id: currentEditId || 'rut-' + Date.now(),
            title: document.getElementById('ruta-title').value,
            date: document.getElementById('ruta-date').value,
            tag: document.getElementById('ruta-tag').value,
            desc: document.getElementById('ruta-desc').value,
            gpx: document.getElementById('ruta-gpx').value,
            images: document.getElementById('ruta-images').value.split(',').map(s => s.trim()).filter(s => s),
            visible: document.getElementById('ruta-visible').checked,
            stats: stats
        };
    } else if (currentModalType === 'productos') {
        let imgs = document.getElementById('prod-images').value.split(',').map(s => s.trim()).filter(s => s);
        if (imgs.length === 0) imgs = ["https://images.unsplash.com/photo-1606503153255-59d8b8b82176?auto=format&fit=crop&w=600&q=80"];
        newItem = {
            id: currentEditId || 'prod-' + Date.now(),
            name: document.getElementById('prod-name').value,
            desc: document.getElementById('prod-desc').value,
            status: document.getElementById('prod-status').value,
            images: imgs,
            visible: document.getElementById('prod-visible').checked
        };
    }

    if (currentEditId) {
        const idx = appData[currentModalType].findIndex(i => i.id === currentEditId);
        if (idx > -1) appData[currentModalType][idx] = newItem;
    } else {
        appData[currentModalType].push(newItem);
    }

    hasUnsavedChanges = true;
    closeModal();
    renderApp();
}

// --- LÓGICA DE HEADER DINÁMICO (MÓVIL) ---
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (!header) return;

    // Solo aplicar en móviles y si hemos bajado más de 200px
    if (window.innerWidth <= 768 && window.scrollY > 100) {
        header.classList.add('hide-links');
    } else {
        header.classList.remove('hide-links');
    }
});
