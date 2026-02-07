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


const navBtns = document.querySelectorAll('.nav-btn');
const views = document.querySelectorAll('.holo-view');
//const hologramScreen = document.querySelector('.hologram-screen'); // Para cambiarle la clase


const videoLayer = document.getElementById('video-layer');
const transVideo = document.getElementById('transition-video');


// ——— LÓGICA DE INTRODUCCIÓN (Intro -> Portfolio) ———

const introLayer = document.getElementById('intro-layer');
const startVirtualBtn = document.getElementById('start-virtual-btn');
const splashScreen = document.getElementById('splash-screen'); // Tu pantalla negra actual
const crtLayer = document.querySelector('.crt-container');


// AL CARGAR LA PÁGINA
// Aseguramos que el Splash y el Portfolio estén ocultos visualmente (o detrás)
// Nota: Si usas z-index 9999 en el intro, ya los tapa, pero esto es por seguridad.
if(splashScreen) splashScreen.style.display = 'none';

startVirtualBtn.addEventListener('click', () => {
    // 1. Animación salida Intro
    startVirtualBtn.textContent = "INICIANDO...";
    introLayer.style.opacity = '0';

    setTimeout(() => {
        // 2. Ocultar Intro
        introLayer.style.display = 'none';
        
        // 3. Mostrar Splash Screen
        if(splashScreen) {
            splashScreen.style.display = 'flex';
            
            // 4. ENCENDER EL EFECTO CRT (Aquí está la magia)
            if(crtLayer) crtLayer.style.display = 'block'; 

            setTimeout(() => {
                splashScreen.style.opacity = '1';
            }, 50);
        }
        iniciarSistema();
    }, 800); // Tiempo de la transición
});







/* ——— EFECTO TEXT SCRAMBLE / DECODER ——— */
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________'; // Caracteres "basura"
    this.update = this.update.bind(this);
  }
  
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => this.resolve = resolve);
    
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40); // Velocidad de inicio
      const end = start + Math.floor(Math.random() * 40); // Duración
      this.queue.push({ from, to, start, end });
    }
    
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  
  update() {
    let output = '';
    let complete = 0;
    
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        // Envolvemos el caracter random en un span para darle color verde matrix si queremos
        output += `<span class="dud">${char}</span>`; 
      } else {
        output += from;
      }
    }
    
    this.el.innerHTML = output;
    
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}





// ——— LÓGICA DE ESTADOS ———
// 0: Mesa (Tirada) | 1: Flotando (Esperando) | 2: Conectada (Holograma)
let currentState = 0;

// 0. Carga rápida - solo esperar el tiempo mínimo
function quickLoad() {
  transVideo.preload = "auto";
  transVideo.load(); // Fuerza al navegador a empezar a bajarlo ya
  return new Promise(r => setTimeout(r, 2000)); // exactamente 2 segundos
}

// 1. Splash -> main
// 1. DEFINIR LA FUNCIÓN DE INICIO (No ejecutarla aún)
function iniciarSistema() {
  quickLoad().then(()=>{
    // Ahora sí, arrancamos el splash
    splash.classList.add('splash-end');

    setTimeout(()=>{
      splash.style.display='none';
      main.style.display='block';

      // Encendemos el efecto CRT si existe
      if(crtLayer) crtLayer.style.display = 'block'; 

      showCard(); // Tiramos la tarjeta
    },800);
  });
}

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
    cardEl.style.transform = 'rotate(0deg) scale(1.3)';
    
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
    // 1. OCULTAR TODO LO INTERACTIVO INMEDIATAMENTE
    // Ocultamos la tarjeta CSS para que no se vea doble (la del video toma el control)
    cardEl.style.display = 'none'; 
    bigTitle.classList.remove('visible');
    bigTitle.classList.add('hidden');
    
    // 2. MOSTRAR Y REPRODUCIR VIDEO
    videoLayer.classList.remove('hidden');
    transVideo.currentTime = 0;
    transVideo.volume = 1.0; // Asegurar volumen
    transVideo.play().catch(e => console.error("Error al reproducir video:", e));
    
    transVideo.onended = () => {
        // Ocultar video
        videoLayer.classList.add('hidden');


    // 1. Físicas
        cardEl.style.transform = '';
        cardEl.classList.remove('floating');
        cardEl.classList.add('docked');
    
    // 3. Mostrar Holograma
        hologramDeck.classList.remove('hidden');
        hologramScreen.classList.remove('tv-closing');
        hologramDeck.classList.add('active');
    //setTimeout(() => {
    //    hologramDeck.classList.add('active');
    //}, 10);
    };
    
    currentState = 2;
    if(slideSnd) { slideSnd.currentTime=0; slideSnd.play().catch(e => {}); }

    // 4. Efecto de texto del header
    // Asegúrate de que 'fx' esté definido arriba en tu código como vimos antes
    if(typeof fx !== 'undefined') {
        fx.setText('LAUREANO DIEZ // SYSTEM');
    }

    // ——— RESET MANUAL (A PRUEBA DE FALLOS) ———
    
    // A. Visual de Botones: Apagar todos, prender Home
    navBtns.forEach(btn => btn.classList.remove('active'));
    const homeBtnRef = document.querySelector('.nav-btn[data-target="home"]');
    if(homeBtnRef) homeBtnRef.classList.add('active');

    // B. Vistas: Ocultar todas, mostrar Home
    views.forEach(v => {
        v.classList.add('hidden');
        v.classList.remove('active');
    });
    const homeView = document.getElementById('view-home');
    if(homeView) {
        homeView.classList.remove('hidden');
        // Pequeño timeout para permitir que el navegador procese el cambio de display antes de la opacidad
        setTimeout(() => homeView.classList.add('active'), 50);
    }

    // C. Tema de Color: Limpiar clases para volver al verde default (:root)
    hologramScreen.classList.remove('theme-dev', 'theme-games', 'theme-music', 'theme-design');
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
    cardEl.style.display = 'block';
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


document.addEventListener('mousemove', (e) => {
  // Solo si está flotando
  if (currentState === 1) {
    const x = e.clientX;
    const y = e.clientY;
    
    // Centro de la pantalla
    const midX = window.innerWidth / 2;
    const midY = window.innerHeight / 2;
    
    // Calcular distancia del mouse al centro (valores pequeños, ej: -15 a +15 grados)
    const rotateY = ((x - midX) / midX) * 20; // Rota en eje Y según posición X
    const rotateX = ((y - midY) / midY) * -20; // Rota en eje X inverso
    
    // Aplicar transformación SUAVE
    // Nota: Mantenemos el scale(1.2) que ya tenía al flotar
    cardEl.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.3)`;
  }
});





navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // 1. Manejo visual de botones (Active state)
    navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // 2. Mostrar la vista correspondiente
    const targetId = btn.dataset.target; // "dev", "games", etc.
    
    views.forEach(view => {
      view.classList.add('hidden');
      view.classList.remove('active');
    });
    
    const targetView = document.getElementById(`view-${targetId}`);
    if(targetView) {
      targetView.classList.remove('hidden');
      targetView.classList.add('active');
    }
    
    // 3. CAMBIO DE TEMA DE COLOR (La magia)
    // Primero borramos cualquier tema anterior
    hologramScreen.classList.remove('theme-dev', 'theme-games', 'theme-music', 'theme-design');
    
    // Si el botón tiene un tema definido, lo agregamos
    const themeClass = btn.dataset.theme;
    if (themeClass) {
      hologramScreen.classList.add(themeClass);
    }
    
    // Opcional: Sonido de "click" de interfaz
    // playUiClick();
  });
});


// Activar barras de skill al entrar
function animateSkills() {
  document.querySelectorAll('.ascii-bar').forEach(bar => {
    const width = bar.dataset.width;
    bar.style.setProperty('--w', width);
  });
}

// Llamar a esta función cuando se haga click en el botón DEV
document.querySelector('.nav-btn[data-target="dev"]').addEventListener('click', animateSkills);




// ——— CARRUSEL 3D (DISEÑO) ———
const carousel = document.getElementById('design-carousel');
const cells = document.querySelectorAll('.carousel-cell');
const cellCount = cells.length;
let selectedIndex = 0;

function rotateCarousel() {
  // Calculamos el ángulo: 360 grados / cantidad de items
  const angle = 360 / cellCount;
  // Calculamos la distancia Z (Radio) para que no se amontonen
  // Formula: radio = (ancho / 2) / tan(angulo / 2)
  const radius = Math.round( (210 / 2) / Math.tan( Math.PI / cellCount ) );
  
  // 1. Posicionar las celdas en círculo (solo se hace una vez o al redimensionar)
  cells.forEach((cell, i) => {
    cell.style.transform = `rotateY(${i * angle}deg) translateZ(${radius}px)`;
  });

  // 2. Rotar el contenedor principal
  // Multiplicamos el índice actual por el ángulo negativo para girar
  const currentAngle = selectedIndex * -angle;
  carousel.style.transform = `translateZ(-${radius}px) rotateY(${currentAngle}deg)`;
}

// Botones
document.getElementById('prev-btn').addEventListener('click', () => {
  selectedIndex--;
  rotateCarousel();
});

document.getElementById('next-btn').addEventListener('click', () => {
  selectedIndex++;
  rotateCarousel();
});

// Inicializar al cargar
// (Opcional: llamar a esto también cuando se abre la sección Diseño)
rotateCarousel();




// ——— ANIMACIÓN SCROLL DE LA TARJETA ———

// 1. Configuramos el vigilante
const observerOptions = {
    root: null, // viewport
    threshold: 0.3, // Dispara cuando el 30% del elemento es visible
    rootMargin: "0px"
};

const heavenObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Cuando la sección entra en pantalla:
            const card = entry.target.querySelector('.hidden-card');
            if(card) card.classList.add('reveal');
            
            // Opcional: Dejar de observar una vez que ya salió (para que no se repita)
            // observer.unobserve(entry.target); 
        } else {
            // Opcional: Si quieres que se esconda de nuevo al subir (efecto yo-yo)
            const card = entry.target.querySelector('.hidden-card');
            if(card) card.classList.remove('reveal');
        }
    });
}, observerOptions);

// 2. Le decimos qué vigilar
const heavenSection = document.querySelector('#heaven-trigger');
if(heavenSection) {
    heavenObserver.observe(heavenSection);
}