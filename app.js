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

       console.log('Series populares recibidas:', datos.results);

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