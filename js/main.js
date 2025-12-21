// DOM refs
const splash      = document.getElementById('splash');
const main        = document.getElementById('mainContent');
const cardEl      = document.getElementById('card');
const slideSnd    = document.getElementById('slideSound');
const liftSnd     = document.getElementById('liftSound');
const stickyBanner = document.getElementById('stickyBanner');
const menuSection = document.getElementById('menuSection');
const backToTop   = document.getElementById('backToTop');

const connectBtn    = document.getElementById('connect-btn');
const hologramDeck  = document.getElementById('hologram-deck');
const disconnectBtn = document.getElementById('disconnect-btn');

const bigTitle = document.getElementById('bigTitle');
const hologramScreen = document.querySelector('.hologram-screen'); // Para animar la pantalla específica

// ——— LÓGICA DE ESTADOS ———
// 0: Mesa (Tirada) | 1: Flotando (Esperando) | 2: Conectada (Holograma)
let currentState = 0;

// 0. Carga rápida - solo esperar el tiempo mínimo
function quickLoad() {
  return new Promise(r => setTimeout(r, 2000)); // exactamente 2 segundos
}

// 1. Splash -> main
quickLoad().then(()=>{
  splash.classList.add('splash-end');
  setTimeout(()=>{
    splash.style.display='none';
    main.style.display='block';
    showCard();
  },800);
});

// 2. showCard anima tarjeta
function showCard(){
  const x = Math.random()*(window.innerWidth-cardEl.offsetWidth);
  cardEl.style.left=x+'px';
  cardEl.style.top='-'+cardEl.offsetHeight+'px';
  
  // Intentar reproducir sonido, pero no bloquear si no está listo
  slideSnd.play().catch(() => console.log('Sonido no disponible aún'));
  
  setTimeout(()=>{
    const cx=(window.innerWidth-cardEl.offsetWidth)/2;
    const cy=(window.innerHeight-cardEl.offsetHeight)/2;
    const ang=Math.random()*360;
    cardEl.style.left=cx+'px';
    cardEl.style.top=cy+'px';
    cardEl.style.transform=`rotate(${ang}deg) scale(1)`;
  },1000);
}

cardEl.addEventListener('click', () => {
  if (currentState === 0) {
    const cx = (window.innerWidth - cardEl.offsetWidth) / 2;
    const cy = (window.innerHeight - cardEl.offsetHeight) / 2;
    
    // Tarjeta al centro
    cardEl.style.transition = 'all .5s ease-out';
    cardEl.style.left = cx + 'px';
    cardEl.style.top = cy + 'px';
    cardEl.style.transform = 'rotate(0deg) scale(1.2)';
    
    cardEl.classList.add('floating');
    
    // MOSTRAR TÍTULO
    bigTitle.classList.remove('hidden');
    bigTitle.classList.add('visible');
    
    currentState = 1;
    if(liftSnd) liftSnd.play().catch(e => {});
  }
});

// 2. DOBLE CLICK: SOLTAR (Solo si no está conectado)
cardEl.addEventListener('dblclick', () => {
  if (currentState === 1) { 
    const x = Math.random() * (window.innerWidth - cardEl.offsetWidth);
    const y = Math.random() * (window.innerHeight - cardEl.offsetHeight);
    
    cardEl.style.transition = 'all .4s ease-in';
    cardEl.style.left = x + 'px';
    cardEl.style.top = y + 'px';
    cardEl.style.transform = `rotate(${Math.random() * 360}deg) scale(0.8)`;
    
    cardEl.classList.remove('floating');
    
    // OCULTAR TÍTULO
    bigTitle.classList.remove('visible');
    bigTitle.classList.add('hidden');
    
    currentState = 0;
    if(slideSnd) { slideSnd.currentTime=0; slideSnd.play().catch(e => {}); }
  }
});

// 3. CONECTAR (Docking)
connectBtn.addEventListener('click', (e) => {
  e.stopPropagation(); 
  
  if (currentState === 1) {
    cardEl.classList.remove('floating');
    cardEl.classList.add('docked');
    
    // OCULTAR TÍTULO (Para limpiar la vista del holograma)
    bigTitle.classList.remove('visible');
    bigTitle.classList.add('hidden');
    
    // Mostrar Holograma
    hologramDeck.classList.remove('hidden');
    hologramScreen.classList.remove('tv-closing'); // Asegurarnos que no tenga la animación de cierre
    
    setTimeout(() => {
        hologramDeck.classList.add('active');
    }, 10);
    
    currentState = 2;
    if(slideSnd) { slideSnd.currentTime=0; slideSnd.play().catch(e => {}); }
  }
});

// 4. DESCONECTAR (Volver a Flotar)
disconnectBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  
  // A. Efecto TV OFF
  hologramDeck.classList.remove('active'); // Quita la clase activa normal
  hologramScreen.classList.add('tv-closing'); // Añade animación de cierre
  
  // B. Esperar animación (400ms)
  setTimeout(() => {
    // Ocultar contenedor del deck
    hologramDeck.classList.add('hidden'); 
    
    // C. Retorno de la Tarjeta al ESTADO FLOTANTE (Centro)
    cardEl.classList.remove('docked');
    cardEl.classList.add('floating'); // Esto reactiva el botón "Connect" y la sombra
    
    // Asegurar posición central (por si acaso CSS docked la movió)
    // Como quitamos .docked, volverá a usar las coordenadas left/top que definimos en el paso 1
    // que siguen siendo el centro de la pantalla.
    
    // D. Reaparecer TÍTULO
    bigTitle.classList.remove('hidden');
    bigTitle.classList.add('visible');
    
    currentState = 1; // Volvemos al estado 1
    
    // AUDIO
    // Sería genial un sonido de "power down" aquí
    if(slideSnd) { slideSnd.currentTime=0; slideSnd.play().catch(e => {}); }
    
  }, 550); // Mismo tiempo que dura la animación CSS
});

// 8. Flecha volver arriba
function initBackToTop() {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  });
}

// Inicializar funcionalidades cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  initScrollObserver();
  initMenuListeners();
  initScrollHandler();
  initBackToTop();

  // Estado inicial: sin scroll y sin contenido bajo
  document.body.classList.add('scroll-disabled');
});
