// =========================================================================
// MAIN.JS - ARQUITECTURA MULTI-PAGE (Soporta index.html y portfolio.html)
// =========================================================================

// --- VARIABLES GLOBALES DE ESTADO ---
let currentState = 0; // 0: Mesa | 1: Flotando | 2: Conectada
let isCoolingDown = false; // Para la ruleta

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. FUNCIONES GLOBALES (Corren en ambas páginas)
    initMouseTrail();

    // 2. DETECTAR EN QUÉ PÁGINA ESTAMOS
    const isBioPage = document.getElementById('intro-layer') !== null;
    const isPortfolioPage = document.getElementById('mainContent') !== null;

    if (isBioPage) {
        initBioLogic();
    }

    if (isPortfolioPage) {
        initPortfolioLogic();
    }
});


// =========================================================================
// LÓGICA DE LA BIO (index.html)
// =========================================================================
function initBioLogic() {
    // --- 1. TRANSICIÓN A PORTFOLIO (TV OFF) ---
    const startVirtualBtn = document.getElementById('start-virtual-btn');
    const introLayer = document.getElementById('intro-layer');

    if (startVirtualBtn && introLayer) {
        startVirtualBtn.addEventListener('click', () => {
            startVirtualBtn.textContent = "INICIANDO...";
            
            // Efecto de tele apagándose
            introLayer.classList.add('crt-shutdown-effect');

            // Esperar que termine la animación y cambiar de HTML
            setTimeout(() => {
                window.location.href = 'portfolio.html';
            }, 550); 
        });
    }

    // --- 2. SISTEMA DE CLIMA, HORA Y CONTADOR ---
    updateTime();
    setInterval(updateTime, 1000);
    initWeatherSystem();
    initVisitorCounter();

    // --- 3. ANIMACIÓN DE NUBES SCROLL ---
    const heavenSection = document.querySelector('#heaven-trigger');
    if (heavenSection) {
        const observerOptions = { root: null, threshold: 0.3, rootMargin: "0px" };
        const heavenObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target.querySelector('.hidden-card');
                    if(card) card.classList.add('reveal');
                } else {
                    const card = entry.target.querySelector('.hidden-card');
                    if(card) card.classList.remove('reveal');
                }
            });
        }, observerOptions);
        heavenObserver.observe(heavenSection);
    }
}


// =========================================================================
// LÓGICA DEL PORTFOLIO 3D (portfolio.html)
// =========================================================================
function initPortfolioLogic() {
    const splash = document.getElementById('splash');
    const main = document.getElementById('mainContent');
    const crtLayer = document.querySelector('.crt-container');
    const cardEl = document.getElementById('card');
    const bigTitle = document.getElementById('bigTitle');
    
    // --- 1. SECUENCIA DE ARRANQUE (Apertura de Splash) ---
    if (splash && main) {
        // Aseguramos que el fondo y el monitor curvo estén listos detrás del splash
        main.style.display = 'block';
        if(crtLayer) crtLayer.style.display = 'block'; 

        // Simular carga de sistema
        quickLoad().then(() => {
            // AQUÍ ESTÁ EL EFECTO: Abre los paneles desde el centro
            splash.classList.add('splash-end'); 

            setTimeout(() => {
                splash.style.display = 'none'; // Matamos el div del splash
                showCard(); // Cae la tarjeta 3D
            }, 800);
        });
    }

    // --- 2. FÍSICAS E INTERACCIÓN DE LA TARJETA ---
    if (cardEl) {
        const slideSnd = document.getElementById('slideSound');
        const liftSnd = document.getElementById('liftSound');

        // Levantar tarjeta (Click)
        cardEl.addEventListener('click', () => {
            if (currentState === 0) {
                const cx = (window.innerWidth - cardEl.offsetWidth) / 2;
                const cy = (window.innerHeight - cardEl.offsetHeight) / 2;
                
                cardEl.style.transition = 'all .5s ease-out';
                cardEl.style.left = cx + 'px';
                cardEl.style.top = cy + 'px';
                cardEl.style.transform = 'rotate(0deg) scale(1.3)';
                
                cardEl.classList.add('floating');
                if(bigTitle) {
                    bigTitle.classList.remove('hidden');
                    bigTitle.classList.add('visible');
                }
                
                currentState = 1;
                if(liftSnd) liftSnd.play().catch(()=>{});
            }
        });

        // Soltar tarjeta (Doble Click)
        cardEl.addEventListener('dblclick', () => {
            if (currentState === 1) { 
                const x = Math.random() * (window.innerWidth - cardEl.offsetWidth);
                const y = Math.random() * (window.innerHeight - cardEl.offsetHeight);
                
                cardEl.style.transition = 'all .4s ease-in';
                cardEl.style.left = x + 'px';
                cardEl.style.top = y + 'px';
                cardEl.style.transform = `rotate(${Math.random() * 360}deg) scale(0.8)`;
                
                cardEl.classList.remove('floating');
                if(bigTitle) {
                    bigTitle.classList.remove('visible');
                    bigTitle.classList.add('hidden');
                }
                
                currentState = 0;
                if(slideSnd) { slideSnd.currentTime=0; slideSnd.play().catch(()=>{}); }
            }
        });

        // Parallax con el Mouse
        document.addEventListener('mousemove', (e) => {
            if (currentState === 1) {
                const midX = window.innerWidth / 2;
                const midY = window.innerHeight / 2;
                const rotateY = ((e.clientX - midX) / midX) * 20; 
                const rotateX = ((e.clientY - midY) / midY) * -20; 
                cardEl.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.3)`;
            }
        });
    }

    // --- 3. SISTEMA DE HOLOGRAMA (Conectar / Desconectar) ---
    const connectBtn = document.getElementById('connect-btn');
    const disconnectBtn = document.getElementById('disconnect-btn');
    const hologramDeck = document.getElementById('hologram-deck');
    const hologramScreen = document.querySelector('.hologram-screen');
    const videoLayer = document.getElementById('video-layer');
    const transVideo = document.getElementById('transition-video');
    const navBtns = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.holo-view');

    if (connectBtn && hologramDeck) {
        connectBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            if (currentState === 1) {
                // Ocultar tarjeta e iniciar video
                if(cardEl) cardEl.style.display = 'none'; 
                if(bigTitle) {
                    bigTitle.classList.remove('visible');
                    bigTitle.classList.add('hidden');
                }
                
                if (videoLayer && transVideo) {
                    videoLayer.classList.remove('hidden');
                    transVideo.currentTime = 0;
                    transVideo.volume = 1.0;
                    transVideo.play().catch(err => console.error("Error video:", err));
                    
                    transVideo.onended = () => {
                        videoLayer.classList.add('hidden');
                        cardEl.style.transform = '';
                        cardEl.classList.remove('floating');
                        cardEl.classList.add('docked');
                        
                        hologramDeck.classList.remove('hidden');
                        hologramScreen.classList.remove('tv-closing');
                        hologramDeck.classList.add('active');
                    };
                }
                currentState = 2;
                
                // Reset de menús al verde por defecto
                navBtns.forEach(btn => btn.classList.remove('active'));
                const homeBtnRef = document.querySelector('.nav-btn[data-target="home"]');
                if(homeBtnRef) homeBtnRef.classList.add('active');

                views.forEach(v => { v.classList.add('hidden'); v.classList.remove('active'); });
                const homeView = document.getElementById('view-home');
                if(homeView) {
                    homeView.classList.remove('hidden');
                    setTimeout(() => homeView.classList.add('active'), 50);
                }
                hologramScreen.classList.remove('theme-dev', 'theme-games', 'theme-music', 'theme-design');
            }
        });
    }

    if (disconnectBtn) {
        disconnectBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            hologramDeck.classList.remove('active'); 
            hologramScreen.classList.add('tv-closing'); 
            
            setTimeout(() => {
                hologramDeck.classList.add('hidden'); 
                if(cardEl) {
                    cardEl.style.display = 'block';
                    cardEl.classList.remove('docked');
                    cardEl.classList.add('floating'); 
                }
                if(bigTitle) {
                    bigTitle.classList.remove('hidden');
                    bigTitle.classList.add('visible');
                }
                currentState = 1; 
            }, 550); 
        });
    }

    // --- 4. NAVEGACIÓN Y CARRUSEL ---
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const targetId = btn.dataset.target; 
            views.forEach(view => {
                view.classList.add('hidden');
                view.classList.remove('active');
            });
            
            const targetView = document.getElementById(`view-${targetId}`);
            if(targetView) {
                targetView.classList.remove('hidden');
                targetView.classList.add('active');
            }
            
            if(hologramScreen) {
                hologramScreen.classList.remove('theme-dev', 'theme-games', 'theme-music', 'theme-design');
                if (btn.dataset.theme) hologramScreen.classList.add(btn.dataset.theme);
            }

            if (targetId === 'dev') {
                document.querySelectorAll('.ascii-bar').forEach(bar => {
                    bar.style.setProperty('--w', bar.dataset.width);
                });
            }
        });
    });

    // --- LÓGICA DEL CARRUSEL 3D (ACORDEÓN + DRAG) ---
    const carousel = document.getElementById('design-carousel');
    const scene = document.querySelector('.carousel-scene');
    
    if (carousel && scene) {
        const cells = document.querySelectorAll('.carousel-cell');
        let selectedIndex = 0;
        
        function rotateCarousel() {
            // 1. CERRAR ACORDEONES AL GIRAR
            cells.forEach(c => c.classList.remove('active'));
            
            // NUEVO: BAJAR LA ESCENA AL GIRAR
            scene.classList.remove('shifted'); 

            // 2. Matemática de giro estándar
            const angle = 360 / cells.length;
            const radius = Math.round( (210 / 2) / Math.tan( Math.PI / cells.length ) );
            cells.forEach((cell, i) => { 
                cell.style.zIndex = ''; 
                cell.style.transform = `rotateY(${i * angle}deg) translateZ(${radius}px)`; 
            });
            carousel.style.transform = `translateZ(-${radius}px) rotateY(${selectedIndex * -angle}deg)`;
        }
        
        
        // --- Lógica de Click para Acordeón ---
        cells.forEach(cell => {
            const trigger = cell.querySelector('.design-card-trigger');
            trigger.addEventListener('click', (e) => {
                e.stopPropagation(); 

                const isActive = cell.classList.contains('active');
                
                // Cerramos todas
                cells.forEach(c => c.classList.remove('active'));

                if (!isActive) {
                   // Si estaba cerrada, la abrimos y SUBIMOS LA ESCENA
                   cell.classList.add('active');
                   scene.classList.add('shifted');
                } else {
                   // Si ya estaba abierta y la clickeamos, la cerramos y BAJAMOS LA ESCENA
                   scene.classList.remove('shifted');
                }
            });
        });

        // --- Botones y Drag (Igual que antes) ---
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        if(prevBtn) prevBtn.addEventListener('click', () => { selectedIndex--; rotateCarousel(); });
        if(nextBtn) nextBtn.addEventListener('click', () => { selectedIndex++; rotateCarousel(); });
        
        rotateCarousel(); // Inicializar

        let startX = 0; let isDragging = false;
        scene.addEventListener('dragstart', (e) => e.preventDefault());
        scene.addEventListener('pointerdown', (e) => { isDragging = true; startX = e.clientX; scene.style.cursor = 'grabbing'; });
        window.addEventListener('pointerup', (e) => {
            if (!isDragging) return;
            isDragging = false; scene.style.cursor = 'grab';
            const diffX = e.clientX - startX;
            if (diffX < -40) { selectedIndex++; rotateCarousel(); } 
            else if (diffX > 40) { selectedIndex--; rotateCarousel(); }
        });
        window.addEventListener('pointercancel', () => { isDragging = false; scene.style.cursor = 'grab'; });
    }

    


    // --- LÓGICA DEL REPRODUCTOR DE MÚSICA ---
    const trackItems = document.querySelectorAll('.track-item');
    const vinylCover = document.querySelector('.vinyl-cover');
    const nowPlayingText = document.querySelector('.now-playing-info p'); 
    const audioPlayer = document.getElementById('holo-audio-player');

    if (trackItems.length > 0) {
        trackItems.forEach(track => {
            // 1. Click en la fila (Expande el acordeón)
            const trackMain = track.querySelector('.track-main');
            trackMain.addEventListener('click', function() {
                trackItems.forEach(t => t.classList.remove('active'));
                track.classList.add('active');
                
                const newCover = track.getAttribute('data-cover');
                const trackNum = track.querySelector('.track-num').innerText;
                const trackName = track.querySelector('.track-name').innerText;
                
                if(vinylCover && nowPlayingText) {
                    vinylCover.style.opacity = 0;
                    nowPlayingText.style.opacity = 0;
                    setTimeout(() => {
                        if (newCover) vinylCover.src = newCover;
                        nowPlayingText.innerText = `TRACK: ${trackNum} // "${trackName.toUpperCase()}"`;
                        vinylCover.style.opacity = 0.8; 
                        nowPlayingText.style.opacity = 0.7; 
                    }, 200);
                }
            });

            // 2. Click en el botón de PLAY (Audio real)
            const playBtn = track.querySelector('.play-mini-btn');
            playBtn.addEventListener('click', function(e) {
                e.stopPropagation(); // Evita que el click abra/cierre el acordeón accidentalmente
                
                const audioSrc = this.getAttribute('data-audio');
                if(!audioSrc || !audioPlayer) return;

                // Resetear todos los íconos a Play
                document.querySelectorAll('.play-mini-btn').forEach(btn => btn.innerText = '▶');

                // Si es la misma canción que ya está sonando, pausarla
                if (audioPlayer.src.includes(audioSrc) && !audioPlayer.paused) {
                    audioPlayer.pause();
                    this.innerText = '▶';
                } else {
                    // Si es una nueva o estaba en pausa, darle Play
                    audioPlayer.src = audioSrc;
                    audioPlayer.play();
                    this.innerText = '⏸'; // Símbolo de Pausa
                }
            });
        });
    }
}

// --- FUNCIONES DE APOYO PORTFOLIO ---
function quickLoad() {
    const transVideo = document.getElementById('transition-video');
    if (transVideo) {
        transVideo.preload = "auto";
        transVideo.load();
    }
    return new Promise(r => setTimeout(r, 2000));
}

function showCard() {
    const cardEl = document.getElementById('card');
    const slideSnd = document.getElementById('slideSound');
    if (!cardEl) return;
    
    const x = Math.random() * (window.innerWidth - cardEl.offsetWidth);
    cardEl.style.left = x + 'px';
    cardEl.style.top = '-' + cardEl.offsetHeight + 'px';
    
    if(slideSnd) slideSnd.play().catch(()=>{});
    
    setTimeout(()=>{
        const cx = (window.innerWidth - cardEl.offsetWidth)/2;
        const cy = (window.innerHeight - cardEl.offsetHeight)/2;
        cardEl.style.left = cx + 'px';
        cardEl.style.top = cy + 'px';
        cardEl.style.transform = `rotate(${Math.random()*360}deg) scale(1)`;
    }, 1000);
}


// =========================================================================
// FUNCIONES GLOBALES Y DE LA BIO (Ruleta, Clima, Cursor)
// =========================================================================

function initMouseTrail() {
    const cursorImages = {
        default: 'assets/img/cursors/Normal\ Select.cur',
        pointer: 'assets/img/cursors/Link\ Select.cur',
        text:    'assets/img/cursors/Text\ Select.cur'
    };
    let throttleTimer = false;

    document.addEventListener('mousemove', (e) => {
        if(throttleTimer) return;
        throttleTimer = true;
        setTimeout(() => throttleTimer = false, 25);

        const hoveredElement = e.target;
        let currentCursor = cursorImages.default;

        if (hoveredElement.matches('a, button, .folder-trigger, .nav-btn, .social-sidebar a') || 
            hoveredElement.closest('a') || hoveredElement.closest('button')) {
            currentCursor = cursorImages.pointer;
        } else if (hoveredElement.matches('input, textarea, p, span')) {
             currentCursor = cursorImages.text; 
        }

        const trail = document.createElement('div');
        trail.className = 'mouse-trail';
        trail.style.backgroundImage = `url('${currentCursor}')`;
        trail.style.left = (e.pageX - 2) + 'px';
        trail.style.top = (e.pageY - 2) + 'px';
        document.body.appendChild(trail);

        setTimeout(() => trail.classList.add('fade-out'), 20);
        setTimeout(() => trail.remove(), 600); 
    });
}

// Favoritos
window.toggleFavorites = function() {
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

// Reloj
function updateTime() {
    const now = new Date();
    const timeSpan = document.getElementById('live-time');
    const dateSpan = document.getElementById('live-date');
    if(timeSpan) timeSpan.innerText = now.toLocaleTimeString('es-AR', { hour12: false });
    if(dateSpan) dateSpan.innerText = now.toLocaleDateString('es-AR');
}

// Clima
async function initWeatherSystem() {
    const citySpan = document.getElementById('weather-city');
    try {
        const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
        if (!response.ok) throw new Error('Error IP');
        const locationData = await response.json();
        if(citySpan) citySpan.innerText = locationData.city.toUpperCase();
        fetchWeather(locationData.latitude, locationData.longitude);
    } catch (error) {
        if(citySpan) citySpan.innerText = "ROSARIO";
        fetchWeather(-32.94, -60.63);
    }
}

async function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=sunrise,sunset&timezone=auto`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const weather = data.current_weather;
        
        const tempEl = document.getElementById('weather-temp');
        const iconEl = document.getElementById('weather-icon');
        const widget = document.getElementById('aero-widget');

        if (!tempEl || !iconEl || !widget) return;

        tempEl.innerText = `${Math.round(weather.temperature)}°C`;
        const code = weather.weathercode;
        const isDay = weather.is_day; 
        let condition = "", weatherClass = "";

        if (code <= 3) { condition = isDay ? "☀️" : "🌙"; weatherClass = isDay ? "weather-sunny" : "weather-night"; } 
        else if (code >= 51 && code <= 99) { condition = "🌧️"; weatherClass = "weather-rainy"; } 
        else if (code >= 45 && code <= 48) { condition = "🌫️"; weatherClass = "weather-rainy"; } 
        else { condition = "☁️"; weatherClass = ""; }

        iconEl.innerText = condition;
        widget.classList.remove('weather-sunny', 'weather-rainy', 'weather-night');
        if(weatherClass) widget.classList.add(weatherClass);
    } catch (error) { console.error(error); }
}

// Contador
function initVisitorCounter() {
    const counterElement = document.getElementById('hit-counter');
    if (!counterElement) return;

    let visits = localStorage.getItem('laureano_site_hits');
    if (!visits) {
        visits = Math.floor(Math.random() * (5000000 - 14000 + 1) + 14000);
    } else {
        visits = parseInt(visits) + 1;
    }
    localStorage.setItem('laureano_site_hits', visits);
    counterElement.innerText = visits.toString().padStart(10, '0');
}

// RULETA DEL CAOS
const chaosContent = [
    { type: 'game', title: 'DOOM (Dos.Zone)', platform: 'all', src: 'https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Foriginal%2F2022%2F10%2F12%2Fdoom.jsdos' },
    { type: 'game', title: 'WOLFENSTEIN 3D', src: 'https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Foriginal%2F2022%2F10%2F12%2Fwolfenstein-3d.jsdos', platform: 'all' },
    { type: 'game', title: 'RESIDENT EVIL 2 (1996), LEON DISC', platform: 'desktop', src: 'https://www.retrogames.cc/embed/42943-resident-evil-2-dual-shock-ver-disc-1-leon.html' },
    { type: 'game', title: 'SILENT HILL (PS1)', platform: 'desktop', src: 'https://www.retrogames.cc/embed/41684-silent-hill.html' },
    { type: 'game', title: 'PRINCE OF PERSIA', platform: 'desktop', src: 'https://dos.zone/player/?bundleUrl=https%3A%2F%2Fcdn.dos.zone%2Foriginal%2F2022%2F10%2F12%2Fprince-of-persia.jsdos' },
    { type: 'game', title: 'CRASH BANDICOOT', platform: 'desktop', src: 'https://www.retrogames.cc/embed/40784-crash-bandicoot.html' },
    { type: 'game', title: 'SONIC THE HEDGEHOG', platform: 'desktop', src: 'https://www.retrogames.cc/embed/30899-sonic-the-hedgehog-usa-europe.html' },
    { type: 'game', title: '2048 CLASSIC', src: 'https://play2048.co/', platform: 'mobile' },
    { type: 'game', title: 'HEXTRIS', src: 'https://hextris.io/', platform: 'mobile' },
    { type: 'game', title: 'CHROME DINO', src: 'https://chromedino.com/', platform: 'mobile' },
    { type: 'game', title: 'FLAPPY BIRD', src: 'https://flappy-bird.io/', platform: 'mobile' },
    { type: 'game', title: 'COOKIE CLICKER', src: 'https://orteil.dashnet.org/cookieclicker/', platform: 'mobile' },
    { type: 'game', title: 'LITTLE ALCHEMY 2', src: 'https://littlealchemy2.com/', platform: 'mobile' },
    { type: 'game', title: 'GEOMETRY DASH (Scratch)', src: 'https://scratch.mit.edu/projects/105500895/embed', platform: 'mobile' },
    { type: 'game', title: 'PAPI JUMP', src: 'https://www.addictinggames.com/embed/html5-games/23635', platform: 'mobile' },
    { type: 'video', title: 'RICK ROLL', src: 'https://www.youtube.com/embed/xvFZjo5PgG0', platform: 'all' },
    { type: 'video', title: 'NYAN CAT', src: 'https://www.youtube.com/embed/wZZ7oFKsKzY', platform: 'all' },
    { type: 'bsod', title: 'FATAL ERROR', html: '', platform: 'all' },
    { type: 'image', title: 'YOU ARE AN IDIOT', html: '<div style="text-align:center;"><img src="https://media.tenor.com/262I3J7JAt0AAAAM/you-are-an-idiot-smile.gif" style="width:100%;"></div>', platform: 'all' },
    { type: 'game', title: 'SYSTEM UPDATE...', src: 'https://fakeupdate.net/win98/', platform: 'all' },
    { type: 'image', title: 'FBI SEIZURE', html: `<div style="background:black; color:white; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; font-family:Arial, sans-serif;"><img src="https://upload.wikimedia.org/wikipedia/commons/d/da/Seal_of_the_Federal_Bureau_of_Investigation.png" style="width:150px; margin-bottom:20px;"><h1 style="color:red; text-transform:uppercase; font-size:2rem;">This Domain Has Been Seized</h1><p style="max-width:80%; margin:20px auto;">by the Federal Bureau of Investigation pursuant to a seizure warrant issued by the United States District Court.</p><p style="color:gray; font-size:0.8rem;">IP LOGGED: 192.168.0.1 (Don't worry, it's a joke)</p></div>`, platform: 'all' },
    { type: 'game', title: 'THE MATRIX', src: 'https://screensaver.online/matrix/', platform: 'all' },
];

window.spinRoulette = function() {
    if(isCoolingDown) return;
    const isMobile = window.innerWidth <= 768;
    const playableContent = chaosContent.filter(item => {
        if (item.platform === 'all') return true;
        if (isMobile && item.platform === 'mobile') return true;
        if (!isMobile && item.platform === 'desktop') return true;
        return false;
    });

    const listToUse = playableContent.length > 0 ? playableContent : chaosContent;
    const btn = document.getElementById('lucky-btn');
    const status = document.getElementById('lucky-status');
    
    isCoolingDown = true;
    if(btn) btn.disabled = true;
    if(status) status.innerText = "LOADING RANDOM ASSETS...";

    const randomItem = listToUse[Math.floor(Math.random() * listToUse.length)];

    if (randomItem.type === 'bsod') {
        window.triggerBSOD();
        setTimeout(() => {
            isCoolingDown = false;
            if(btn) btn.disabled = false;
            if(status) status.innerText = "";
        }, 1000);
        return; 
    }

    const modal = document.getElementById('chaos-modal');
    const modalTitle = document.getElementById('chaos-title');
    const modalBody = document.getElementById('chaos-content');
    
    if(modal && modalTitle && modalBody) {
        modalTitle.innerText = randomItem.title;
        modal.style.display = 'flex'; 
        document.documentElement.classList.add('no-scroll');
        document.body.classList.add('no-scroll');

        setTimeout(() => {
            if (randomItem.type === 'game' || randomItem.type === 'video') {
                modalBody.innerHTML = `<iframe src="${randomItem.src}" frameborder="0" allowfullscreen allow="autoplay; encrypted-media" style="width:100%; height:100%;"></iframe>`;
            } else {
                modalBody.innerHTML = randomItem.html;
            }
            setTimeout(() => {
                isCoolingDown = false;
                btn.disabled = false;
                status.innerText = "";
            }, 3000);
        }, 100);
    }
}

window.closeChaos = function() {
    const modal = document.getElementById('chaos-modal');
    const modalBody = document.getElementById('chaos-content');
    if(modal) modal.style.display = 'none';
    if(modalBody) modalBody.innerHTML = ''; 
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
}

window.triggerBSOD = function() {
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