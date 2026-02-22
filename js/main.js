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
const splashScreen = document.getElementById('splash'); // Tu pantalla negra actual
const crtLayer = document.querySelector('.crt-container');


// AL CARGAR LA PÁGINA
// Aseguramos que el Splash y el Portfolio estén ocultos visualmente (o detrás)
// Nota: Si usas z-index 9999 en el intro, ya los tapa, pero esto es por seguridad.
if(splash) splash.style.display = 'none';

startVirtualBtn.addEventListener('click', () => {
    // 1. Texto de cargando
    startVirtualBtn.textContent = "INICIANDO...";
    
    // 2. APLICAR EFECTO DE TV APAGÁNDOSE
    introLayer.classList.add('crt-shutdown-effect');

    // 3. Esperar que termine la animación (550ms según tu CSS)
    setTimeout(() => {
        // Ocultar Intro
        introLayer.style.display = 'none';
        
        // Mostrar Splash
        if(splash) {
            splash.style.display = 'flex';
            
            // ENCENDER EL EFECTO CRT GLOBAl (Líneas y Glow)
            if(crtLayer) crtLayer.style.display = 'block'; 

            setTimeout(() => {
                splash.style.opacity = '1';
            }, 50);
        }
        
        // Iniciar el sistema 3D
        iniciarSistema();
    }, 800); 
});



function toggleFavorites() {
    const favBtn = document.getElementById('fav-toggle-btn');
    const favContent = document.getElementById('fav-content');

    if (!favBtn || !favContent) return;

    favContent.classList.toggle('open');
    
    favBtn.classList.toggle('active');

    if (favContent.classList.contains('open')) {
        favBtn.innerHTML = '<span class="folder-icon">📂</span> [ CERRAR CARPETA ]';
    } else {
        favBtn.innerHTML = '<span class="folder-icon">📁</span> [ CLICK PARA VER MIS FAVORITOS ]';
    }
}



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


// Configuración: Rutas a tus imágenes
    const cursorImages = {
        default: 'assets/img/cursors/Normal\ Select.cur',
        pointer: 'assets/img/cursors/Link\ Select.cur',
        text:    'assets/img/cursors/Text\ Select.cur'
    };

    let throttleTimer = false;

    document.addEventListener('mousemove', (e) => {
        if(throttleTimer) return;
        throttleTimer = true;
        setTimeout(() => throttleTimer = false, 25); // 25ms = rastro suave

        // 1. Detectar qué hay debajo del mouse para elegir la imagen
        const hoveredElement = e.target;
        
        // Lógica de detección automática
        let currentCursor = cursorImages.default; // Por defecto flecha

        // Si es un elemento interactivo (Links, Botones, Carpeta) -> Manito
        if (hoveredElement.matches('a, button, .folder-trigger, .nav-btn, .social-sidebar a') || 
            hoveredElement.closest('a') || 
            hoveredElement.closest('button')) {
            currentCursor = cursorImages.pointer;
        } 
        // Si es texto seleccionable -> Texto
        else if (hoveredElement.matches('input, textarea, p, span')) {
             // Opcional: solo si quieres rastro de texto en párrafos
             currentCursor = cursorImages.text; 
        }

        // 2. Crear el fantasma
        const trail = document.createElement('div');
        trail.className = 'mouse-trail';
        
        // Aplicar la imagen correcta
        trail.style.backgroundImage = `url('${currentCursor}')`;
        
        // Posicionar (ajusta los restas -px para centrar la punta del cursor)
        trail.style.left = (e.pageX - 2) + 'px';
        trail.style.top = (e.pageY - 2) + 'px';

        document.body.appendChild(trail);

        // 3. Animación de salida (El efecto Echo)
        // Hacemos que dure un poco más para que se note la "cola"
        setTimeout(() => {
            trail.classList.add('fade-out');
        }, 20);

        setTimeout(() => {
            trail.remove();
        }, 600); 
    });



    // --- SISTEMA DE CLIMA Y HORA ---
document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    setInterval(updateTime, 1000);
    
    // Iniciamos el sistema
    initWeatherSystem();
});

function updateTime() {
    const now = new Date();
    const timeSpan = document.getElementById('live-time');
    
    if(timeSpan) {
        timeSpan.innerText = now.toLocaleTimeString('es-AR', { hour12: false });
    }
    
    const dateSpan = document.getElementById('live-date');
    if(dateSpan) {
        dateSpan.innerText = now.toLocaleDateString('es-AR');
    }
}

async function initWeatherSystem() {
    const citySpan = document.getElementById('weather-city');
    
    try {
        // 1. Usamos geojs.io (Menos probable que sea bloqueado por AdBlockers)
        const locationData = await getLocationFromIP();
        console.log("Ubicación detectada:", locationData.city);
        
        // Actualizamos nombre de ciudad
        if(citySpan) citySpan.innerText = locationData.city.toUpperCase();
        
        // Pedimos clima
        fetchWeather(locationData.latitude, locationData.longitude);
        
    } catch (error) {
        console.warn("Falló la geolocalización, usando default (Rosario).", error);
        
        // FALLBACK: Si falla, ponemos Rosario manual
        if(citySpan) citySpan.innerText = "ROSARIO";
        fetchWeather(-32.94, -60.63);
    }
}

async function getLocationFromIP() {
    // API alternativa mucho más amigable con bloqueadores
    const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
    if (!response.ok) throw new Error('Error al obtener IP');
    return await response.json();
}

async function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=sunrise,sunset&timezone=auto`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const weather = data.current_weather;
        
        // ELEMENTOS
        const tempEl = document.getElementById('weather-temp');
        const iconEl = document.getElementById('weather-icon');
        const widget = document.getElementById('aero-widget'); // El widget flotante

        if (!tempEl || !iconEl || !widget) return;

        // 1. Temperatura
        tempEl.innerText = `${Math.round(weather.temperature)}°C`;
        
        // 2. Estado del Clima
        const code = weather.weathercode;
        const isDay = weather.is_day; 
        
        let condition = "";
        let weatherClass = "";

        // Mapeo WMO
        if (code <= 3) {
            condition = isDay ? "☀️" : "🌙"; // Icono más minimalista si pones la ciudad
            weatherClass = isDay ? "weather-sunny" : "weather-night";
        } else if (code >= 51 && code <= 99) {
            condition = "🌧️";
            weatherClass = "weather-rainy";
        } else if (code >= 45 && code <= 48) {
             condition = "🌫️";
             weatherClass = "weather-rainy"; 
        } else {
            condition = "☁️";
            weatherClass = ""; 
        }

        iconEl.innerText = condition;

        // 3. Efectos Visuales (Aura)
        widget.classList.remove('weather-sunny', 'weather-rainy', 'weather-night');
        if(weatherClass) {
            widget.classList.add(weatherClass);
        }

    } catch (error) {
        console.error("Error clima:", error);
    }
}



const chaosContent = [
    // --- JUEGOS CLÁSICOS (DOS & PS1) ---
    {
        type: 'game',
        title: 'DOOM (Dos.Zone)',
        platform: 'all',
        src: 'https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Foriginal%2F2022%2F10%2F12%2Fdoom.jsdos' 
    },
    {
        type: 'game',
        title: 'WOLFENSTEIN 3D',
        src: 'https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Foriginal%2F2022%2F10%2F12%2Fwolfenstein-3d.jsdos',
        platform: 'all'
    },
    {
        type: 'game',
        title: 'RESIDENT EVIL 2 (1996), LEON DISC',
        platform: 'desktop',
        src: 'https://www.retrogames.cc/embed/42943-resident-evil-2-dual-shock-ver-disc-1-leon.html' 
    },
    {
        type: 'game',
        title: 'SILENT HILL (PS1)',
        platform: 'desktop',
        src: 'https://www.retrogames.cc/embed/41684-silent-hill.html'
    },
    {
        type: 'game',
        title: 'PRINCE OF PERSIA',
        platform: 'desktop',
        src: 'https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Foriginal%2F2022%2F10%2F12%2Fprince-of-persia.jsdos'
    },
    {
        type: 'game',
        title: 'CRASH BANDICOOT',
        platform: 'desktop',
        src: 'https://www.retrogames.cc/embed/40784-crash-bandicoot.html'
    },
    {
        type: 'game',
        title: 'SONIC THE HEDGEHOG',
        platform: 'desktop',
        src: 'https://www.retrogames.cc/embed/30899-sonic-the-hedgehog-usa-europe.html'
    },
    
    {
        type: 'game',
        title: '2048 CLASSIC',
        src: 'https://play2048.co/',
        platform: 'mobile' // SOLO MÓVIL
    },
    {
        type: 'game',
        title: 'HEXTRIS',
        src: 'https://hextris.io/', 
        platform: 'mobile'
    },
    {
        type: 'game',
        title: 'CHROME DINO',
        src: 'https://chromedino.com/',
        platform: 'mobile'
    },
    {
        type: 'game',
        title: 'FLAPPY BIRD',
        src: 'https://flappy-bird.io/',
        platform: 'mobile'
    },
    {
        type: 'game',
        title: 'COOKIE CLICKER',
        src: 'https://orteil.dashnet.org/cookieclicker/',
        platform: 'mobile' 
    },
    {
        type: 'game',
        title: 'LITTLE ALCHEMY 2',
        src: 'https://littlealchemy2.com/', 
        platform: 'mobile'
    },
    {
        type: 'game',
        title: 'GEOMETRY DASH (Scratch)',
        src: 'https://scratch.mit.edu/projects/105500895/embed',
        platform: 'mobile'
    },
    {
        type: 'game',
        title: 'PAPI JUMP',
        src: 'https://www.addictinggames.com/embed/html5-games/23635', 
        platform: 'mobile'
    },


    // --- VIDEOS ---
    {
        type: 'video',
        title: 'RICK ROLL',
        src: 'https://www.youtube.com/embed/xvFZjo5PgG0',
        platform: 'all' // AMBOS
    },
    {
        type: 'video',
        title: 'NYAN CAT',
        src: 'https://www.youtube.com/embed/wZZ7oFKsKzY',
        platform: 'all'
    },
    
    // --- BROMAS ---
    {
        type: 'bsod', 
        title: 'FATAL ERROR',
        html: '',
        platform: 'all'
    },
    {
        type: 'image',
        title: 'YOU ARE AN IDIOT',
        html: '<div style="text-align:center;"><img src="https://media.tenor.com/262I3J7JAt0AAAAM/you-are-an-idiot-smile.gif" style="width:100%;"></div>',
        platform: 'all'
    },
    {
        type: 'game',
        title: 'SYSTEM UPDATE...',

        src: 'https://fakeupdate.net/win98/', 
        platform: 'all'
    },
    {
        type: 'image', 
        title: 'FBI SEIZURE',
        html: `
            <div style="background:black; color:white; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; font-family:Arial, sans-serif;">
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/da/Seal_of_the_Federal_Bureau_of_Investigation.png" style="width:150px; margin-bottom:20px;">
                <h1 style="color:red; text-transform:uppercase; font-size:2rem;">This Domain Has Been Seized</h1>
                <p style="max-width:80%; margin:20px auto;">by the Federal Bureau of Investigation pursuant to a seizure warrant issued by the United States District Court.</p>
                <p style="color:gray; font-size:0.8rem;">IP LOGGED: 192.168.0.1 (Don't worry, it's a joke)</p>
            </div>
        `,
        platform: 'all'
    },
    {
        type: 'game',
        title: 'THE MATRIX',
        src: 'https://screensaver.online/matrix/',
        platform: 'all'
    },
];

let isCoolingDown = false;

// --- FUNCIÓN PARA ABRIR ---
function spinRoulette() {
    if(isCoolingDown) return;

    // 1. DETECTAR SI ES MÓVIL (Menos de 768px de ancho)
    const isMobile = window.innerWidth <= 768;

    // 2. FILTRAR LA LISTA SEGÚN EL DISPOSITIVO
    const playableContent = chaosContent.filter(item => {
        if (item.platform === 'all') return true;       // Sirve para todos
        if (isMobile && item.platform === 'mobile') return true; // Solo móvil
        if (!isMobile && item.platform === 'desktop') return true; // Solo PC
        return false;
    });

    // Seguridad: Si por alguna razón la lista queda vacía (raro), usar la completa
    const listToUse = playableContent.length > 0 ? playableContent : chaosContent;

    // --- A PARTIR DE ACÁ ES IGUAL QUE ANTES ---
    
    const btn = document.getElementById('lucky-btn');
    const status = document.getElementById('lucky-status');
    
    isCoolingDown = true;
    btn.disabled = true;
    if(status) status.innerText = "LOADING RANDOM ASSETS...";

    // Elegir contenido aleatorio DE LA LISTA FILTRADA
    const randomItem = listToUse[Math.floor(Math.random() * listToUse.length)];

    // CASO BSOD
    if (randomItem.type === 'bsod') {
        triggerBSOD();
        setTimeout(() => {
            isCoolingDown = false;
            btn.disabled = false;
            if(status) status.innerText = "";
        }, 1000);
        return; 
    }

    // Modal
    const modal = document.getElementById('chaos-modal');
    const modalTitle = document.getElementById('chaos-title');
    const modalBody = document.getElementById('chaos-content');
    
    modalTitle.innerText = randomItem.title;
    modal.style.display = 'flex'; 

    // Bloquear Scroll
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');

    // Inyectar
    setTimeout(() => {
        if (randomItem.type === 'game' || randomItem.type === 'video') {
            modalBody.innerHTML = `<iframe src="${randomItem.src}" frameborder="0" allowfullscreen allow="autoplay; encrypted-media" style="width:100%; height:100%;"></iframe>`;
        } else {
            modalBody.innerHTML = randomItem.html;
        }
        
        setTimeout(() => {
            isCoolingDown = false;
            btn.disabled = false;
            if(status) status.innerText = "";
        }, 3000);
    }, 100);
}

// --- FUNCIÓN PARA CERRAR (¡AQUÍ ESTÁ LA QUE FALTABA!) ---
function closeChaos() {
    console.log("Cerrando ventana del caos..."); // Debug
    
    const modal = document.getElementById('chaos-modal');
    const modalBody = document.getElementById('chaos-content');
    
    // 1. Ocultar modal
    modal.style.display = 'none';
    
    // 2. IMPORTANTE: Vaciar contenido para matar sonidos/juegos
    modalBody.innerHTML = ''; 

    // 3. --- NUEVO: DESBLOQUEAR SCROLL ---
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
}

// --- FUNCIÓN BSOD (PANTALLA AZUL) ---
function triggerBSOD() {
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');

    const bsod = document.createElement('div');
    bsod.id = 'bsod-overlay';
    bsod.innerHTML = `
        <div class="bsod-text">
            <p>A problem has been detected and windows has been shut down to prevent damage to your computer.</p>
            <br>
            <p>DRIVER_IRQL_NOT_LESS_OR_EQUAL</p>
            <br>
            <p>If this is the first time you've seen this stop error screen, restart your computer.</p>
            <br>
            <p>Technical information:</p>
            <p>*** STOP: 0x000000D1 (DOOM_ERROR_404)</p>
            <br>
            <p class="blink">PRESS ANY KEY TO CONTINUE...</p>
        </div>
    `;
    document.body.appendChild(bsod);

    const killBSOD = () => {
        bsod.remove();
        document.documentElement.classList.remove('no-scroll');
        document.body.classList.remove('no-scroll');
        document.removeEventListener('keydown', killBSOD);
        document.removeEventListener('click', killBSOD);
    };

    setTimeout(() => {
        document.addEventListener('keydown', killBSOD);
        document.addEventListener('click', killBSOD);
    }, 500);
}


document.addEventListener('DOMContentLoaded', () => {
    initVisitorCounter();
});

function initVisitorCounter() {
    const counterElement = document.getElementById('hit-counter');
    if (!counterElement) return;

    // 1. Verificar si ya tenemos un conteo guardado
    let visits = localStorage.getItem('laureano_site_hits');

    if (!visits) {
        // Primera vez: Generar un número fake alto (entre 14000 y 50000)
        visits = Math.floor(Math.random() * (5000000 - 14000 + 1) + 14000);
    } else {
        // Ya visitó: Convertir a número y sumar 1
        visits = parseInt(visits) + 1;
    }

    // 2. Guardar el nuevo número
    localStorage.setItem('laureano_site_hits', visits);

    // 3. Formatear con ceros a la izquierda (Ej: 014832)
    // padStart(6, '0') asegura que siempre tenga 6 dígitos
    const formattedVisits = visits.toString().padStart(10, '0');

    // 4. Mostrar en pantalla
    counterElement.innerText = formattedVisits;
}




// --- FUNCIONES DE VIEWPORT ---
function forceDesktopView() {
    // Fija el ancho virtual a 900px (o el ancho donde tu intro se vea perfecta en PC)
    document.getElementById('myViewport').setAttribute('content', 'width=900');
}

function restoreMobileView() {
    // Devuelve el comportamiento normal responsivo para el Portfolio
    document.getElementById('myViewport').setAttribute('content', 'width=device-width, initial-scale=1.0');
}




// ——— SISTEMA DE ESCALADO MÓVIL (OPCIÓN 2: ZOOM) ———

function applyDesktopZoom() {
    const container = document.querySelector('.intro-container');
    if (!container) return;

    // Solo afectamos si la capa de intro está visible
    if (document.getElementById('intro-layer').style.display === 'none') return;

    const screenWidth = window.innerWidth;
    const targetWidth = 850; // Ancho base ideal para tu diseño de PC

    if (screenWidth < targetWidth) {
        // En celular: Forzamos el ancho de PC y encogemos visualmente
        const zoomFactor = screenWidth / targetWidth;
        container.style.width = targetWidth + 'px';
        container.style.zoom = zoomFactor;
    } else {
        // En PC: Restauramos la normalidad
        container.style.width = '100%';
        container.style.zoom = 1;
    }
}

// Ejecutar cuando se redimensiona o gira la pantalla
window.addEventListener('resize', applyDesktopZoom);

// Agregar la llamada inicial dentro del DOMContentLoaded que ya tienes
document.addEventListener('DOMContentLoaded', () => {
    applyDesktopZoom(); // <-- Agrega esta línea en tu DOMContentLoaded principal
    
    initVisitorCounter();
    updateTime();
    setInterval(updateTime, 1000);
    initWeatherSystem();
});