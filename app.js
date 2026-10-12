const API_KEY = '19a3b510019cd9d12cbbec7810e80f9c'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';
const LANGUAGE = 'es-ES';

const seriesGrid    = document.getElementById('series-grid');
const loadingDiv    = document.getElementById('loading');
const errorDiv      = document.getElementById('error');
const errorMessage  = document.getElementById('error-message');
const resultsTitle  = document.getElementById('results-title');
const resultsCount  = document.getElementById('results-count');
const searchInput   = document.getElementById('search');
const clearBtn      = document.getElementById('clear-search');
const retryBtn      = document.getElementById('retry-btn');
const themeToggle   = document.getElementById('theme-toggle');
const modal         = document.getElementById('serie-modal');
const modalBody     = document.getElementById('modal-body');
const modalClose    = document.getElementById('modal-close');
const modalOverlay  = document.getElementById('modal-overlay');


// ============================================================================
// UTILIDADES DE UI (DADO - no modificar)
// ============================================================================
const mostrarLoading = () => {
    loadingDiv.style.display = 'flex';
    errorDiv.style.display = 'none';
    seriesGrid.innerHTML = '';
};

const ocultarLoading = () => {
    loadingDiv.style.display = 'none';
};

const mostrarError = (mensaje) => {
    ocultarLoading();
    errorMessage.textContent = mensaje;
    errorDiv.style.display = 'flex';
    seriesGrid.innerHTML = '';
};


// ============================================================================
// DARK MODE (DADO - no modificar)
// ============================================================================
const aplicarTema = (tema) => {
    document.documentElement.setAttribute('data-theme', tema);
    themeToggle.textContent = tema === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', tema);
};

const cargarTema = () => {
    const guardado = localStorage.getItem('theme');
    const preferido = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    aplicarTema(guardado || preferido);
};

themeToggle.addEventListener('click', () => {
    const actual = document.documentElement.getAttribute('data-theme');
    aplicarTema(actual === 'dark' ? 'light' : 'dark');
});

cargarTema();


// ############################################################################
// #                                                                          #
// #                          TU CÓDIGO AQUÍ                    #
// #                                                                          #
// ############################################################################

// 1. Carga Inicial

async function cargarPopulares() {
    mostrarLoading();

    try {
        const respuesta = await fetch(
            `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=${LANGUAGE}`
        );

        if (respuesta.status === 401) {
            throw new Error('Api key invalida');
        }

        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status}`);
        }

        const datos = await respuesta.json();

        resultsTitle.textContent = 'Series Populares';
        resultsCount.textContent =
            `${datos.results.length} series encontradas`;

       renderizarSeries(datos.results);

        ocultarLoading();
    } catch (error) {
        if (error.name === 'AbortError') return;

        if (
            error.message.includes('401') ||
            error.message === 'Api key invalida'
        ) {
            mostrarError('Api key invalida');
        } else if (error instanceof TypeError) {
            mostrarError('Error de conexión');
        } else {
            mostrarError(error.message);
        }
    }
}

cargarPopulares();

//2. Tarjeta de Serie

function renderizarSeries(series) {
    seriesGrid.innerHTML = '';

    series.forEach((serie) => {
        const tarjeta = document.createElement('article');
        tarjeta.className = 'serie-card';

        const poster = document.createElement('div');
        poster.className = 'serie-card__poster';

        if (serie.poster_path) {
            const imagen = document.createElement('img');

            imagen.className = 'serie-card__image';
            imagen.src = `${IMAGE_URL}${serie.poster_path}`;
            imagen.alt = `Póster de ${serie.name}`;
            imagen.loading = 'lazy';

            poster.appendChild(imagen);
        } else {
            poster.textContent = 'Imagen no disponible';
        }

        const rating = document.createElement('span');
        rating.className = 'serie-card__rating';
        rating.textContent =
            `⭐ ${Number(serie.vote_average || 0).toFixed(1)}`;

        poster.appendChild(rating);

        const contenido = document.createElement('div');
        contenido.className = 'serie-card__content';

        const titulo = document.createElement('h3');
        titulo.className = 'serie-card__title';
        titulo.textContent = serie.name || 'Sin título';

        const anio = document.createElement('p');
        anio.className = 'serie-card__year';
        anio.textContent = serie.first_air_date
            ? `Año: ${serie.first_air_date.substring(0, 4)}`
            : 'Año desconocido';

        contenido.append(titulo, anio);
        tarjeta.append(poster, contenido);

        seriesGrid.appendChild(tarjeta);
    });
}


// 3. Busqueda

async function buscarSeries(texto) {
    const consulta = texto.trim();

    if (!consulta) {
        await cargarPopulares();
        return;
    }

    mostrarLoading();

    try {
        const query = encodeURIComponent(consulta);

        const respuesta = await fetch(
            `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${query}&language=es-ES`
        );

        if (respuesta.status === 401) {
            throw new Error('Api key invalida');
        }

        if (!respuesta.ok) {
            throw new Error(`Error HTTP ${respuesta.status}`);
        }

        const datos = await respuesta.json();

        resultsTitle.textContent = `Resultados para "${consulta}"`;
        resultsCount.textContent =
            `${datos.results.length} series encontradas`;

        renderizarSeries(datos.results);

        ocultarLoading();
    } catch (error) {
        if (error instanceof TypeError) {
            mostrarError('Error de conexión');
        } else {
            mostrarError(error.message);
        }
    }
}

let temporizadorBusqueda;

searchInput.addEventListener('input', () => {
    clearTimeout(temporizadorBusqueda);

    const texto = searchInput.value.trim();

    if (!texto) {
        cargarPopulares();
        return;
    }

    temporizadorBusqueda = setTimeout(() => {
        buscarSeries(texto);
    }, 400);
});

clearBtn.addEventListener('click', () => {
    clearTimeout(temporizadorBusqueda);

    searchInput.value = '';
    cargarPopulares();
});