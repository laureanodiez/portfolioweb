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


// LÓGICA DE LA BIO (index.html)
function initBioLogic() {
    // 0. MOTOR MSCHF SPLASH SCREEN (Efectos Aleatorios)
    const splashScreen = document.getElementById('mschf-splash');
    const mainBtn = document.getElementById('giant-aero-btn');
    const effectLayer = document.getElementById('effect-layer');
    
    if (splashScreen && mainBtn) {
        document.documentElement.style.overflow = 'hidden';
        let isTriggered = false;

        // Audios
        const playSound = (id) => { const audio = document.getElementById(id); if(audio) { audio.currentTime = 0; audio.play().catch(()=>{}); } }

        mainBtn.addEventListener('click', () => {
            if (isTriggered) return;
            isTriggered = true;

            const randomEffect = Math.floor(Math.random() * 4) + 1;
            console.log("💥 MSCHF Effect Triggered: " + randomEffect);

            switch (randomEffect) {
                
                case 1: // EL CD BARREDORA (CORTINILLA PERFECTA)
                    
                    playSound('sfx-cd');

                    const cd = document.createElement('img');
                    cd.src = 'assets/img/cd.png'; 
                    cd.className = 'retro-cd-wipe';
                    
                    // 1. Calculamos las matemáticas PRIMERO
                    const duration = 2000; 
                    let startTime = null;
                    const wH = window.innerHeight;
                    const wW = window.innerWidth;
                    
                    const cdWidth = Math.max(wW * 1.5, 800);
                    const radius = cdWidth / 2; 
                    
                    // Le sumamos 50px extra de margen de seguridad para esconderlo bien abajo
                    const startY = wH + radius + 50; 
                    const endY = -radius - 50; 

                    // 2. TRUCO CLAVE: Lo posicionamos fuera de la pantalla ANTES de inyectarlo
                    cd.style.top = startY + 'px';
                    cd.style.transform = `translate(-50%, -50%) rotate(0deg)`;
                    
                    // 3. Ahora sí, lo metemos al HTML (el usuario no va a ver ni un píxel)
                    document.body.appendChild(cd);

                    function animateWipe(timestamp) {
                        if (!startTime) startTime = timestamp;
                        let progress = (timestamp - startTime) / duration;
                        if (progress > 1) progress = 1;

                        let easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                        const currentY = startY + (endY - startY) * easeProgress;
                        const currentRotation = easeProgress * 720; 
                        
                        cd.style.top = currentY + 'px';
                        cd.style.transform = `translate(-50%, -50%) rotate(${currentRotation}deg)`;
                        
                        let bottomInset = wH - currentY; 
                        if (bottomInset < 0) bottomInset = 0; 
                        
                        splashScreen.style.clipPath = `inset(0 0 ${bottomInset}px 0)`;

                        if (progress < 1) {
                            requestAnimationFrame(animateWipe);
                        } else {
                            cd.remove();
                            endSplash();
                            splashScreen.style.clipPath = 'none'; 
                        }
                    }
                    
                    setTimeout(() => requestAnimationFrame(animateWipe), 400);
                    break;

                case 2: // INUNDACIÓN DE AGUA (PREMIUM FRUTIGER AERO)
                    // 1. El botón explota
                    playSound('sfx-pop');
                    mainBtn.classList.add('btn-explode');
                    
                    // 2. Creamos la masa de agua
                    const water = document.createElement('div');
                    water.className = 'frutiger-flood';
                    effectLayer.appendChild(water);
                    
                    // 3. Generador masivo de burbujas
                    // Dispara burbujas cada 30 milisegundos mientras sube el agua
                    let bubbleStorm = setInterval(() => {
                        let b = document.createElement('div');
                        b.className = 'flood-bubble';
                        b.style.left = (Math.random() * 100) + 'vw'; // Posición horizontal aleatoria
                        
                        // Tamaños de burbujas bien variados
                        let size = Math.random() * 40 + 10; 
                        b.style.width = size + 'px';
                        b.style.height = size + 'px';
                        
                        // Velocidades de subida aleatorias (entre 1.5 y 3 segundos)
                        b.style.animationDuration = (Math.random() * 1.5 + 1.5) + 's';
                        
                        water.appendChild(b);
                        
                        // Autodestrucción de la burbuja para no matar la memoria de la PC
                        setTimeout(() => b.remove(), 3000);
                    }, 30);

                    // 4. Iniciar la subida del agua con un micro-retraso
                    setTimeout(() => {
                        playSound('sfx-water');
                        water.style.height = '120vh'; // Sube más allá del techo
                    }, 200);

                    // 5. Limpieza final y transición a la bio
                    setTimeout(() => {
                        clearInterval(bubbleStorm); // Cortamos la fábrica de burbujas
                        splashScreen.style.opacity = '0'; // Fundido a tu página
                        
                        setTimeout(() => endSplash(), 800);
                    }, 1800); // Esperamos a que el agua tape todo antes de hacer el fundido
                    break;

                case 3: // VIRUS MSCHF (COBERTURA TOTAL Y REVELACIÓN)
                    
                    // 1. Ocultamos SOLO el botón gigante. 
                    mainBtn.style.visibility = 'hidden';
                    
                    const totalWindows = 350;
                    const windowsArray = [];
                    
                    let currentX = 0;
                    let currentY = 0;
                    
                    // 2. Ráfaga de ventanas (cada 15 milisegundos)
                    for (let i = 0; i < totalWindows; i++) {
                        setTimeout(() => {
                            
                            // Truco para cubrir toda la pantalla: 
                            // Si se sale de los bordes, o cada 12 ventanas, saltamos a una coordenada aleatoria
                            if (currentX > window.innerWidth - 320 || currentY > window.innerHeight - 140 || i % 12 === 0) {
                                currentX = Math.random() * (window.innerWidth - 300);
                                currentY = Math.random() * (window.innerHeight - 150);
                            }

                            let win = document.createElement('div');
                            win.className = 'aero-error-window';
                            win.style.left = currentX + 'px';
                            win.style.top = currentY + 'px';
                            win.style.zIndex = 100 + i; 
                            
                            win.innerHTML = `
                                <div class="aero-error-titlebar">
                                    <span class="aero-error-title">Windows - Fatal Application Exit</span>
                                    <div class="aero-error-close">X</div>
                                </div>
                                <div class="aero-error-content">
                                    <div class="aero-error-icon">❌</div>
                                    <div class="aero-error-text">SOULPAGE.exe has stopped working.<br>A fatal exception 0E has occurred.</div>
                                </div>
                            `;
                            
                            effectLayer.appendChild(win);
                            windowsArray.push(win); // Las enfilamos en orden de llegada

                            // Sonido (1 de cada 5 para que suene caótico pero no rompa los parlantes)
                            if (i % 20 === 0) {
                                let errorSfx = document.getElementById('sfx-error');
                                if(errorSfx) {
                                    let sfxClone = errorSfx.cloneNode();
                                    sfxClone.volume = 0.3;
                                    sfxClone.play().catch(()=>{});
                                }
                            }

                            // Desplazamiento diagonal típico de Windows
                            currentX += 30;
                            currentY += 30;

                        }, i * 2); // Ráfaga ultrarrápida
                    }

                    // Calculamos el tiempo exacto en el que termina de aparecer la ventana N° 150
                    let timeToFinishSpawning = totalWindows * 2;
                    
                    // 3. EL MOMENTO CLAVE (Cuando la pantalla está tapada)
                    setTimeout(() => {
                        
                        // AHORA SÍ quitamos el fondo blanco. 
                        // Como está todo tapado por ventanas de error, el usuario no lo nota.
                        splashScreen.style.background = 'transparent';
                        
                        // Dejamos el caos congelado en pantalla por casi un segundo (800ms)
                        setTimeout(() => {
                            
                            // 4. EFECTO REVELACIÓN (Las primeras en llegar, son las primeras en irse)
                            for (let j = 0; j < windowsArray.length; j++) {
                                setTimeout(() => {
                                    // Le agregamos un efectito: se achican un poquito al desvanecerse
                                    windowsArray[j].style.transition = 'opacity 0.15s, transform 0.15s';
                                    windowsArray[j].style.opacity = '0';
                                    windowsArray[j].style.transform = 'scale(0.8)';
                                    
                                    setTimeout(() => windowsArray[j].remove(), 150);
                                }, j * 3); // Se van borrando a la misma velocidad que aparecieron
                            }

                            // 5. Finalizamos cuando se borra la última
                            setTimeout(() => {
                                endSplash(); 
                            }, (windowsArray.length * 2) + 200);

                        }, 800); // Fin de la pausa dramática

                    }, timeToFinishSpawning); 
                    
                    break;

                case 4: // CRISTAL ROTO 3D CON BOTÓN ROMPIÉNDOSE (PREMIUM + MEJORA)
                    
                    // 1. Efecto de tensión antes de romperse
                    mainBtn.classList.add('crack-flash');
                    
                    setTimeout(() => {
                        playSound('sfx-shatter');
                        
                        // 2. Ocultar botón inmediatamente (dejamos de verlo)
                        mainBtn.style.visibility = 'hidden';
                        splashScreen.style.background = 'transparent';
                        splashScreen.style.perspective = '1000px'; 
                        
                        // Obtener posición y tamaño del botón para crear piezas centrales
                        const btnRect = mainBtn.getBoundingClientRect();
                        
                        // 3. Generar 12 trozos del botón centralmente y añadir animación al instante
                        for(let k=0; k<12; k++) {
                            let btnShard = document.createElement('div');
                            btnShard.className = 'btn-shard-premium'; // Nueva clase CSS naranja/blanca
                            btnShard.classList.add('shatter-fall'); // Añadir animación instantáneamente
                            
                            // Tamaño aproximado para cubrir el botón
                            let w = btnRect.width / 4; 
                            let h = btnRect.height / 3;
                            btnShard.style.width = (Math.random() * w * 0.5 + w * 0.75) + 'px'; // Variar tamaño
                            btnShard.style.height = (Math.random() * h * 0.5 + h * 0.75) + 'px';
                            
                            // Posicionar centralmente donde estaba el botón, con ligera variación
                            btnShard.style.left = (btnRect.left + (Math.random() * btnRect.width * 0.8 + btnRect.width * 0.1)) + 'px';
                            btnShard.style.top = (btnRect.top + (Math.random() * btnRect.height * 0.8 + btnRect.height * 0.1)) + 'px';
                            
                            // FÍSICAS 3D (Mismas variables CSS para trozos de botón)
                            btnShard.style.setProperty('--move-x', (Math.random() * 800 - 400) + 'px'); 
                            btnShard.style.setProperty('--move-z', (Math.random() * 600) + 'px'); 
                            btnShard.style.setProperty('--rot-x', (Math.random() * 1080 - 540) + 'deg'); 
                            btnShard.style.setProperty('--rot-y', (Math.random() * 1080 - 540) + 'deg'); 
                            btnShard.style.setProperty('--rot-z', (Math.random() * 720 - 360) + 'deg'); 
                            
                            effectLayer.appendChild(btnShard); 
                        }
                        
                        // 4. Generar 45 astillas de cristal (predominantemente periféricas for effect)
                        for(let i=0; i<45; i++) {
                            let shard = document.createElement('div');
                            shard.className = 'glass-shard-premium';
                            
                            let w = Math.random() * 300 + 100;
                            let h = Math.random() * 300 + 100;
                            shard.style.width = w + 'px';
                            shard.style.height = h + 'px';
                            
                            // Distribución aleatoria por la pantalla
                            shard.style.left = (Math.random() * 120 - 10) + 'vw';
                            shard.style.top = (Math.random() * 120 - 10) + 'vh';
                            
                            // Polígono irregular
                            let p1 = `${Math.random()*50}% 0%`; 
                            let p2 = `100% ${Math.random()*50}%`; 
                            let p3 = `${50 + Math.random()*50}% 100%`; 
                            let p4 = `0% ${50 + Math.random()*50}%`; 
                            shard.style.clipPath = `polygon(${p1}, ${p2}, ${p3}, ${p4})`;
                            
                            // Variables CSS 3D
                            shard.style.setProperty('--move-x', (Math.random() * 800 - 400) + 'px'); 
                            shard.style.setProperty('--move-z', (Math.random() * 600) + 'px'); 
                            shard.style.setProperty('--rot-x', (Math.random() * 1080 - 540) + 'deg'); 
                            shard.style.setProperty('--rot-y', (Math.random() * 1080 - 540) + 'deg'); 
                            shard.style.setProperty('--rot-z', (Math.random() * 720 - 360) + 'deg'); 
                            
                            effectLayer.appendChild(shard);
                            
                            // Caída diferida para astillas de cristal
                            setTimeout(() => {
                                shard.classList.add('shatter-fall');
                            }, Math.random() * 150);
                        }
                        
                        // 5. Esperamos a que todo se caiga y terminamos
                        setTimeout(() => endSplash(), 1500);

                    }, 100);
                    break;
            }
        });

        function endSplash() {
            splashScreen.style.display = 'none';
            document.documentElement.style.overflow = '';
            
            // 1. Control de Audio
            const bgm = document.getElementById('bgm-audio');
            const winampBtn = document.getElementById('winamp-play');
            
            if (bgm && bgm.paused) {
                bgm.volume = 0.5; 
                bgm.play().catch(e => console.log("Audio bloqueado:", e));
                
                if (winampBtn) {
                    winampBtn.innerText = "[ PAUSE BGM ]";
                    winampBtn.style.background = "#ffff00";
                }
            }

            const revealItems = document.querySelectorAll('.reveal-item');
            
            revealItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('is-visible');
                }, 100 + (index * 150)); 
            });
        }
    }


    initFrutigerAero();

    // --- 1. TRANSICIÓN A PORTFOLIO (TV OFF) ---
    const startVirtualBtn = document.getElementById('start-virtual-btn');
    const introLayer = document.getElementById('intro-layer');

    if (startVirtualBtn && introLayer) {
        startVirtualBtn.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            const bgm = document.getElementById('bgm-audio');
            if (bgm && !bgm.paused) {
                bgm.pause(); // Silencio inmediato
                
                // Por prolijidad, actualizamos el botón del Winamp a "Play"
                const winampBtn = document.getElementById('winamp-play');
                if (winampBtn) {
                    winampBtn.innerText = "[ PLAY BGM ]";
                    winampBtn.style.background = "#c0c0c0"; // Vuelve al gris
                }
            }

            startVirtualBtn.textContent = "INICIANDO...";
            startVirtualBtn.disabled = true; 
            startVirtualBtn.style.cursor = "wait";
            
            setTimeout(() => {
                
                introLayer.classList.add('crt-shutdown-effect');

                setTimeout(() => {
                    window.location.href = 'portfolio.html';
                }, 1750); 
                
            }, 1000); 
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
    const splashSfx = document.getElementById('splash-sfx');
    const ambientFloat = document.getElementById('ambient-floating');
    
    if (splash && main) {
        main.style.display = 'block';
        if(crtLayer) crtLayer.style.display = 'block'; 

        quickLoad().then(() => {
            splash.classList.add('splash-end'); 
            
            // Sonido mecánico/eléctrico al abrir los paneles
            if(splashSfx) splashSfx.play().catch(()=>{});

            setTimeout(() => {
                splash.style.display = 'none'; 
                showCard(); 
                
                // Arranca el ambiente zumbante de la tarjeta flotando
                if(ambientFloat) { 
                    ambientFloat.volume = 0.4; 
                    ambientFloat.play().catch(()=>{}); 
                }
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
    const ambientDocked = document.getElementById('ambient-docked');
    const disconnectSfx = document.getElementById('disconnect-sfx');

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

                        if (ambientDocked) { 
                            ambientDocked.currentTime = 0; 
                            ambientDocked.volume = 0.5; 
                            ambientDocked.play().catch(()=>{}); 
                        }
                    };
                }
                currentState = 2;

                if (ambientFloat) ambientFloat.pause();
                
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

            const player = document.getElementById('holo-audio-player');
            if (player && !player.paused) {
                player.pause();
                document.querySelectorAll('.play-mini-btn').forEach(btn => btn.innerText = '▶');
            }

            if (disconnectSfx) {
                disconnectSfx.currentTime = 0;
                disconnectSfx.play().catch(()=>{});
            }
            if (ambientDocked) ambientDocked.pause();
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
                if (ambientFloat) { 
                    ambientFloat.play().catch(()=>{}); 
                }
            }, 550); 
        });
    }

    // --- 4. NAVEGACIÓN Y CARRUSEL ---
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const targetId = btn.dataset.target; 
            if (targetId !== 'music') {
                const player = document.getElementById('holo-audio-player');
                if (player && !player.paused) {
                    player.pause();
                    document.querySelectorAll('.play-mini-btn').forEach(btn => btn.innerText = '▶');
                }
            }
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

    const swipeHint = document.getElementById('swipe-hint');
    const carouselArea = document.getElementById('design-carousel'); // Cambiá este ID por el del contenedor de tu modelo 3D

    if (swipeHint && carouselArea) {
        // Función para matar el cartel de una vez por todas
        const hideSwipeHint = () => {
            if (!swipeHint.classList.contains('fade-out')) {
                swipeHint.classList.add('fade-out');
                
                // Lo borramos del HTML después de 500ms (lo que dura la transición CSS) 
                // para que no quede ocupando memoria invisible.
                setTimeout(() => {
                    swipeHint.remove();
                }, 500);
            }
        };

        // Escuchamos si toca con el dedo o hace click con el mouse
        carouselArea.addEventListener('touchstart', hideSwipeHint, { once: true });
        carouselArea.addEventListener('mousedown', hideSwipeHint, { once: true });
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
                e.stopPropagation(); // Evita que el click accione el acordeón directamente...
                
                if (!track.classList.contains('active')) {
                    trackMain.click(); 
                }
                
                const audioSrc = this.getAttribute('data-audio');
                if(!audioSrc) return;

                let player = document.getElementById('holo-audio-player');
                if (!player) {
                    player = document.createElement('audio');
                    player.id = 'holo-audio-player';
                    document.body.appendChild(player);
                }

                // Resetear todos los íconos visualmente a Play
                document.querySelectorAll('.play-mini-btn').forEach(btn => btn.innerText = '▶');

                // Lógica de reproducción
                if (player.src.endsWith(audioSrc) && !player.paused) {
                    player.pause();
                    this.innerText = '▶';
                } else {
                    player.src = audioSrc;
                    player.play().catch(err => console.error("El navegador bloqueó el audio:", err));
                    this.innerText = '⏸'; 
                }
            });
        });
    }



    // --- SONIDOS UI DEL PORTFOLIO (HOVER Y CLICK) ---
    const uiHover = document.getElementById('ui-hover');
    const uiClick = document.getElementById('ui-click');
    
    // Seleccionamos la barra de nav, y TODOS los botones y links que existan adentro de las vistas del holograma
    const uiElements = document.querySelectorAll('.nav-btn, .holo-view button, .holo-view a, .track-main, .design-card-trigger, .folder-trigger');
    
    uiElements.forEach(el => {
        // Ignoramos el botón de desconectar porque ya le pusimos un sonido exclusivo más arriba
        if (el.id === 'disconnect-btn') return;

        el.addEventListener('mouseenter', () => {
            if(uiHover) { 
                uiHover.currentTime = 0; 
                uiHover.volume = 0.2; 
                uiHover.play().catch(()=>{}); 
            }
        });
        
        el.addEventListener('click', () => {
            if(uiClick) { 
                let clickClone = uiClick.cloneNode();
                clickClone.volume = 0.4;
                clickClone.play().catch(()=>{}); 
            }
        });
    });

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


// --- SISTEMA DE PESTAÑAS (SOULPAGE / SOULCARD) ---
window.switchTab = function(tabId) {
    const btnPage = document.getElementById('btn-soulpage');
    const btnCard = document.getElementById('btn-soulcard');
    
    // Seleccionamos todos los elementos de cada grupo
    const pageEls = document.querySelectorAll('.soulpage-only');
    const cardEls = document.querySelectorAll('.soulcard-only');

    if (tabId === 'soulpage') {
        // Activar botones
        btnPage.classList.add('active');
        btnCard.classList.remove('active');
        // Mostrar/Ocultar
        pageEls.forEach(el => el.style.display = ''); // Vuelve a su estado original (flex/block)
        cardEls.forEach(el => el.style.display = 'none');
    } else {
        // Activar botones
        btnCard.classList.add('active');
        btnPage.classList.remove('active');
        // Mostrar/Ocultar
        pageEls.forEach(el => el.style.display = 'none');
        cardEls.forEach(el => el.style.display = ''); 
    }
    const scrollContainer = document.getElementById('intro-layer');
    if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
};



// --- FUNCIONES FRUTIGER AERO & WEB 1.0 ---
function initFrutigerAero() {
    // 1. Efectos de Sonido en botones
    const hoverSfx = document.getElementById('hover-sfx');
    const clickSfx = document.getElementById('click-sfx');
    
    document.querySelectorAll('a, button, .folder-trigger, .aero-btn').forEach(el => {
        el.addEventListener('mouseenter', () => { 
            if(hoverSfx) { hoverSfx.currentTime = 0; hoverSfx.play().catch(()=>{}); } 
        });
        el.addEventListener('click', () => { 
            if(clickSfx) { clickSfx.currentTime = 0; clickSfx.play().catch(()=>{}); } 
        });
    });

    // 2. Generador de Burbujas Dinámico
    const glassLayer = document.querySelector('.aero-glass-overlay');
    if (glassLayer) {
        for(let i = 0; i < 12; i++) {
            let b = document.createElement('div');
            b.className = 'aero-bubble';
            b.style.left = Math.random() * 100 + 'vw';
            b.style.width = (Math.random() * 40 + 20) + 'px'; // Tamaños entre 20px y 60px
            b.style.height = b.style.width;
            b.style.animationDuration = (Math.random() * 6 + 6) + 's'; // Velocidad aleatoria
            b.style.animationDelay = Math.random() * 5 + 's';
            glassLayer.appendChild(b);
        }
    }

    // 5. GENERADOR DE BURBUJAS INTERACTIVO (AL HACER CLICK EN EL FONDO)
    const introLayer = document.getElementById('intro-layer');
    const bubbleSfx = document.getElementById('bubble-sfx');
    if (introLayer) {
        introLayer.addEventListener('click', (e) => {
            if (e.target.closest('.intro-content-wrapper') || e.target.closest('button') || e.target.closest('a')) {
                return; 
            }

            // --- REPRODUCIR SONIDO MULTIPLE ---
            if(bubbleSfx) {
                // Clonamos el nodo para que si hacés click rápido, suenen varias burbujas a la vez
                let sfxClone = bubbleSfx.cloneNode();
                sfxClone.volume = 0.6; // Ajustá el volumen acá (0.0 a 1.0)
                sfxClone.play().catch(e => console.log("Audio bloqueado por navegador", e));
            }

            const numBubbles = Math.floor(Math.random() * 3) + 2;
            for(let i = 0; i < numBubbles; i++) {
                let b = document.createElement('div');
                b.className = 'aero-bubble';
                let size = Math.random() * 25 + 10; 
                b.style.width = size + 'px'; b.style.height = size + 'px';
                let offsetX = (Math.random() * 40 - 20); let offsetY = (Math.random() * 40 - 20);
                b.style.left = (e.clientX - size/2 + offsetX) + 'px';
                let bottomPos = window.innerHeight - e.clientY;
                b.style.bottom = (bottomPos - size/2 + offsetY) + 'px';
                b.style.animationDuration = (Math.random() * 3 + 2) + 's'; 
                b.style.animationDelay = '0s'; 
                
                const glassLayer = document.querySelector('.aero-glass-overlay');
                if(glassLayer) glassLayer.appendChild(b);
                
                setTimeout(() => b.remove(), 5000); 
            }
        });
    }
}

// 4. Lógica del Mini Winamp BGM
window.toggleBGM = function() {
    const bgm = document.getElementById('bgm-audio');
    const btn = document.getElementById('winamp-play');
    if(!bgm || !btn) return;
    
    if(bgm.paused) {
        bgm.play();
        btn.innerText = "[ PAUSE BGM ]";
        btn.style.background = "#ffff00"; // Se ilumina
    } else {
        bgm.pause();
        btn.innerText = "[ PLAY BGM ]";
        btn.style.background = "#e0e0e0";
    }
}