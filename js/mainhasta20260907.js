// =========================================================================
// MAIN.JS - ARQUITECTURA MULTI-PAGE REFACTORIZADA (V1.0)
// =========================================================================

(function() {
    'use strict';

    // --- VARIABLES DE ESTADO ENCAPSULADAS ---
    let currentState = 0; // 0: Mesa | 1: Flotando | 2: Conectada
    let isCoolingDown = false; // Prevención de spam en la ruleta

    // --- INICIALIZADOR PRINCIPAL ---
    document.addEventListener('DOMContentLoaded', () => {
        initMouseTrail();

        const isBioPage = document.getElementById('intro-layer') !== null;
        const isPortfolioPage = document.getElementById('mainContent') !== null;

        if (isBioPage) initBioLogic();
        if (isPortfolioPage) initPortfolioLogic();
    });

    // =========================================================================
    // 1. LÓGICA DE LA SOULPAGE (BIO)
    // =========================================================================
    function initBioLogic() {
        const splashScreen = document.getElementById('mschf-splash');
        const mainBtn = document.getElementById('giant-aero-btn');
        const effectLayer = document.getElementById('effect-layer');
        
        // --- SISTEMA DE PERSISTENCIA DE SESIÓN (SKIP SPLASH) ---
        if (splashScreen && mainBtn) {
            const hasSeenSplash = sessionStorage.getItem('laureano_splash_seen');

            if (hasSeenSplash) {
                // El usuario ya vio el splash en esta sesión. Se omite.
                splashScreen.style.display = 'none';
                document.documentElement.style.overflow = '';
                triggerStaggeredReveal(false); // Revelar sin forzar audio
            } else {
                // Primera visita de la sesión. Se ejecuta el motor MSCHF.
                document.documentElement.style.overflow = 'hidden';
                let isTriggered = false;

                const playSound = (id) => { 
                    const audio = document.getElementById(id); 
                    if(audio) { audio.currentTime = 0; audio.play().catch(()=>{}); } 
                };

                mainBtn.addEventListener('click', () => {
                    if (isTriggered) return;
                    isTriggered = true;
                    
                    // Registrar que el splash fue visto
                    sessionStorage.setItem('laureano_splash_seen', 'true');

                    const randomEffect = Math.floor(Math.random() * 4) + 1;
                    console.log("💥 MSCHF Effect Triggered: " + randomEffect);

                    switch (randomEffect) {
                        case 1: // CD BARRIDO
                            playSound('sfx-cd');
                            const cd = document.createElement('img');
                            cd.src = 'assets/img/cd.png'; 
                            cd.className = 'retro-cd-wipe';
                            
                            const duration = 2000; 
                            let startTime = null;
                            const wH = window.innerHeight;
                            const wW = window.innerWidth;
                            const cdWidth = Math.max(wW * 1.5, 800);
                            const radius = cdWidth / 2; 
                            const startY = wH + radius + 50; 
                            const endY = -radius - 50; 

                            cd.style.top = startY + 'px';
                            cd.style.transform = `translate(-50%, -50%) rotate(0deg)`;
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
                                
                                let bottomInset = Math.max(0, wH - currentY); 
                                splashScreen.style.clipPath = `inset(0 0 ${bottomInset}px 0)`;

                                if (progress < 1) {
                                    requestAnimationFrame(animateWipe);
                                } else {
                                    cd.remove();
                                    splashScreen.style.display = 'none';
                                    splashScreen.style.clipPath = 'none'; 
                                    triggerStaggeredReveal(true);
                                }
                            }
                            setTimeout(() => requestAnimationFrame(animateWipe), 400);
                            break;

                        case 2: // INUNDACIÓN FRUTIGER
                            playSound('sfx-pop');
                            mainBtn.classList.add('btn-explode');
                            
                            const water = document.createElement('div');
                            water.className = 'frutiger-flood';
                            effectLayer.appendChild(water);
                            
                            let bubbleStorm = setInterval(() => {
                                let b = document.createElement('div');
                                b.className = 'flood-bubble';
                                b.style.left = (Math.random() * 100) + 'vw'; 
                                let size = Math.random() * 40 + 10; 
                                b.style.width = size + 'px';
                                b.style.height = size + 'px';
                                b.style.animationDuration = (Math.random() * 1.5 + 1.5) + 's';
                                water.appendChild(b);
                                setTimeout(() => b.remove(), 3000);
                            }, 30);

                            setTimeout(() => {
                                playSound('sfx-water');
                                water.style.height = '120vh'; 
                            }, 200);

                            setTimeout(() => {
                                clearInterval(bubbleStorm); 
                                splashScreen.style.opacity = '0'; 
                                setTimeout(() => {
                                    splashScreen.style.display = 'none';
                                    triggerStaggeredReveal(true);
                                }, 800);
                            }, 1800); 
                            break;

                        case 3: // VIRUS MSCHF (Arquitectura DOM Clonning)
                            mainBtn.style.visibility = 'hidden';
                            
                            const isMobileDevice = window.innerWidth <= 650;
                            const totalWindows = isMobileDevice ? 40 : 150; 
                            const windowsArray = [];
                            let currentX = 0, currentY = 0;

                            const winTemplate = document.createElement('div');
                            winTemplate.className = 'aero-error-window';
                            winTemplate.innerHTML = `
                                <div class="aero-error-titlebar">
                                    <span class="aero-error-title">Windows - Fatal Application Exit</span>
                                    <div class="aero-error-close">X</div>
                                </div>
                                <div class="aero-error-content">
                                    <div class="aero-error-icon">❌</div>
                                    <div class="aero-error-text">SOULPAGE.exe has stopped working.<br>A fatal exception 0E has occurred.</div>
                                </div>`;

                            const soundInterval = isMobileDevice ? 5 : 12;

                            for (let i = 0; i < totalWindows; i++) {
                                setTimeout(() => {
                                    if (currentX > window.innerWidth - 320 || currentY > window.innerHeight - 140 || i % 12 === 0) {
                                        currentX = Math.random() * (window.innerWidth - 300);
                                        currentY = Math.random() * (window.innerHeight - 150);
                                    }

                                    let win = winTemplate.cloneNode(true);
                                    win.style.left = currentX + 'px';
                                    win.style.top = currentY + 'px';
                                    win.style.zIndex = 100 + i; 
                                    
                                    effectLayer.appendChild(win);
                                    windowsArray.push(win);

                                    if (i % soundInterval === 0) {
                                        let errorSfx = document.getElementById('sfx-error');
                                        if(errorSfx) {
                                            let sfxClone = errorSfx.cloneNode();
                                            sfxClone.volume = 0.3;
                                            sfxClone.play().catch(()=>{});
                                        }
                                    }
                                    currentX += 30; currentY += 30;
                                }, i * 4); 
                            }

                            setTimeout(() => {
                                splashScreen.style.background = 'transparent';
                                setTimeout(() => {
                                    // 3. DESTRUCCIÓN EFICIENTE: Delegamos interpolación al CSS
                                    for (let j = 0; j < windowsArray.length; j++) {
                                        setTimeout(() => {
                                            windowsArray[j].classList.add('error-hide');
                                            setTimeout(() => windowsArray[j].remove(), 200);
                                        }, j * 5); 
                                    }
                                    setTimeout(() => {
                                        splashScreen.style.display = 'none';
                                        triggerStaggeredReveal(true);
                                    }, (windowsArray.length * 5) + 300);
                                }, 800); 
                            }, totalWindows * 4); 
                            break;
                        
                        case 4: // CRISTAL ROTO
                            mainBtn.classList.add('crack-flash');
                            setTimeout(() => {
                                playSound('sfx-shatter');
                                mainBtn.style.visibility = 'hidden';
                                splashScreen.style.background = 'transparent';
                                splashScreen.style.perspective = '1000px'; 
                                
                                const btnRect = mainBtn.getBoundingClientRect();
                                
                                for(let k=0; k<12; k++) {
                                    let btnShard = document.createElement('div');
                                    btnShard.className = 'btn-shard-premium shatter-fall'; 
                                    let w = btnRect.width / 4, h = btnRect.height / 3;
                                    btnShard.style.width = (Math.random() * w * 0.5 + w * 0.75) + 'px'; 
                                    btnShard.style.height = (Math.random() * h * 0.5 + h * 0.75) + 'px';
                                    btnShard.style.left = (btnRect.left + (Math.random() * btnRect.width * 0.8 + btnRect.width * 0.1)) + 'px';
                                    btnShard.style.top = (btnRect.top + (Math.random() * btnRect.height * 0.8 + btnRect.height * 0.1)) + 'px';
                                    btnShard.style.setProperty('--move-x', (Math.random() * 800 - 400) + 'px'); 
                                    btnShard.style.setProperty('--move-z', (Math.random() * 600) + 'px'); 
                                    btnShard.style.setProperty('--rot-x', (Math.random() * 1080 - 540) + 'deg'); 
                                    btnShard.style.setProperty('--rot-y', (Math.random() * 1080 - 540) + 'deg'); 
                                    btnShard.style.setProperty('--rot-z', (Math.random() * 720 - 360) + 'deg'); 
                                    effectLayer.appendChild(btnShard); 
                                }
                                
                                for(let i=0; i<45; i++) {
                                    let shard = document.createElement('div');
                                    shard.className = 'glass-shard-premium';
                                    shard.style.width = (Math.random() * 300 + 100) + 'px';
                                    shard.style.height = (Math.random() * 300 + 100) + 'px';
                                    shard.style.left = (Math.random() * 120 - 10) + 'vw';
                                    shard.style.top = (Math.random() * 120 - 10) + 'vh';
                                    let p1 = `${Math.random()*50}% 0%`, p2 = `100% ${Math.random()*50}%`, p3 = `${50 + Math.random()*50}% 100%`, p4 = `0% ${50 + Math.random()*50}%`; 
                                    shard.style.clipPath = `polygon(${p1}, ${p2}, ${p3}, ${p4})`;
                                    shard.style.setProperty('--move-x', (Math.random() * 800 - 400) + 'px'); 
                                    shard.style.setProperty('--move-z', (Math.random() * 600) + 'px'); 
                                    shard.style.setProperty('--rot-x', (Math.random() * 1080 - 540) + 'deg'); 
                                    shard.style.setProperty('--rot-y', (Math.random() * 1080 - 540) + 'deg'); 
                                    shard.style.setProperty('--rot-z', (Math.random() * 720 - 360) + 'deg'); 
                                    effectLayer.appendChild(shard);
                                    setTimeout(() => shard.classList.add('shatter-fall'), Math.random() * 150);
                                }
                                
                                setTimeout(() => {
                                    splashScreen.style.display = 'none';
                                    triggerStaggeredReveal(true);
                                }, 1500);
                            }, 100);
                            break;
                    }
                });
            }
        }

        function triggerStaggeredReveal(isFirstLoad) {
            document.documentElement.style.overflow = '';
            const bgm = document.getElementById('bgm-audio');
            const winampBtn = document.getElementById('winamp-play');
            
            // Sólo se reproduce audio automáticamente si el usuario interactuó con el splash
            if (isFirstLoad && bgm && bgm.paused) {
                bgm.volume = 0.5; 
                bgm.play().catch(e => console.warn("Audio bloqueado:", e));
                if (winampBtn) {
                    winampBtn.innerText = "[ PAUSE BGM ]";
                    winampBtn.style.background = "#ffff00";
                }
            } else if (!isFirstLoad && winampBtn) {
                // Estado pasivo si se omitió el splash
                winampBtn.innerText = "[ PLAY BGM ]";
                winampBtn.style.background = "#c0c0c0";
            }

            const revealItems = document.querySelectorAll('.reveal-item');
            revealItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('is-visible');
                }, 100 + (index * 150)); 
            });
        }

        initFrutigerAero();

        // --- TRANSICIÓN A PORTFOLIO (TV OFF) ---
        const startVirtualBtn = document.getElementById('start-virtual-btn');
        const introLayer = document.getElementById('intro-layer');

        if (startVirtualBtn && introLayer) {
            startVirtualBtn.addEventListener('click', (e) => {
                e.preventDefault(); 
                const bgm = document.getElementById('bgm-audio');
                if (bgm && !bgm.paused) {
                    bgm.pause(); 
                    const winampBtn = document.getElementById('winamp-play');
                    if (winampBtn) {
                        winampBtn.innerText = "[ PLAY BGM ]";
                        winampBtn.style.background = "#c0c0c0"; 
                    }
                }

                startVirtualBtn.textContent = "INICIANDO...";
                startVirtualBtn.disabled = true; 
                startVirtualBtn.style.cursor = "wait";
                
                setTimeout(() => {
                    introLayer.classList.add('crt-shutdown-effect');
                    setTimeout(() => window.location.href = 'portfolio.html', 1750); 
                }, 1000); 
            });
        }

        // --- MÓDULOS DE ESTADO ---
        updateTime();
        setInterval(updateTime, 1000);
        initWeatherSystem();
        initVisitorCounter();

        // --- ANIMACIÓN DE NUBES SCROLL ---
        const heavenSection = document.querySelector('#heaven-trigger');
        if (heavenSection) {
            const observerOptions = { root: null, threshold: 0.3, rootMargin: "0px" };
            const heavenObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const card = entry.target.querySelector('.hidden-card');
                    if(card) {
                        if (entry.isIntersecting) card.classList.add('reveal');
                        else card.classList.remove('reveal');
                    }
                });
            }, observerOptions);
            heavenObserver.observe(heavenSection);
        }
    }


    // =========================================================================
    // 2. LÓGICA DEL PORTFOLIO 3D (portfolio.html)
    // =========================================================================
    function initPortfolioLogic() {
        const splash = document.getElementById('splash');
        const main = document.getElementById('mainContent');
        const crtLayer = document.querySelector('.crt-container');
        const cardEl = document.getElementById('card');
        const bigTitle = document.getElementById('bigTitle');
        const splashSfx = document.getElementById('splash-sfx');
        const ambientFloat = document.getElementById('ambient-floating');
        
        // --- SECUENCIA DE ARRANQUE ---
        if (splash && main) {
            main.style.display = 'block';
            if(crtLayer) crtLayer.style.display = 'block'; 

            quickLoad().then(() => {
                splash.classList.add('splash-end'); 
                if(splashSfx) splashSfx.play().catch(()=>{});

                setTimeout(() => {
                    splash.style.display = 'none'; 
                    showCard(); 
                    if(ambientFloat) { 
                        ambientFloat.volume = 0.4; 
                        ambientFloat.play().catch(()=>{}); 
                    }
                }, 800);
            });
        }

        // --- FÍSICAS E INTERACCIÓN DE LA TARJETA ---
        if (cardEl) {
            const slideSnd = document.getElementById('slideSound');
            const liftSnd = document.getElementById('liftSound');

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

            document.addEventListener('mousemove', (e) => {
                if (currentState === 1) {
                    requestAnimationFrame(() => {
                        const midX = window.innerWidth / 2;
                        const midY = window.innerHeight / 2;
                        const rotateY = ((e.clientX - midX) / midX) * 20; 
                        const rotateX = ((e.clientY - midY) / midY) * -20; 
                        cardEl.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.3)`;
                    });
                }
            });
        }

        // --- SISTEMA DE HOLOGRAMA ---
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
                    if (ambientFloat) ambientFloat.play().catch(()=>{}); 
                }, 550); 
            });
        }

        // --- NAVEGACIÓN Y CARRUSEL ---
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

        const carousel = document.getElementById('design-carousel');
        const scene = document.querySelector('.carousel-scene');
        
        if (carousel && scene) {
            const cells = document.querySelectorAll('.carousel-cell');
            let selectedIndex = 0;
            
            function rotateCarousel() {
                cells.forEach(c => c.classList.remove('active'));
                scene.classList.remove('shifted'); 

                const angle = 360 / cells.length;
                const radius = Math.round( (210 / 2) / Math.tan( Math.PI / cells.length ) );
                cells.forEach((cell, i) => { 
                    cell.style.zIndex = ''; 
                    cell.style.transform = `rotateY(${i * angle}deg) translateZ(${radius}px)`; 
                });
                carousel.style.transform = `translateZ(-${radius}px) rotateY(${selectedIndex * -angle}deg)`;
            }
            
            cells.forEach(cell => {
                const trigger = cell.querySelector('.design-card-trigger');
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation(); 
                    const isActive = cell.classList.contains('active');
                    cells.forEach(c => c.classList.remove('active'));

                    if (!isActive) {
                       cell.classList.add('active');
                       scene.classList.add('shifted');
                    } else {
                       scene.classList.remove('shifted');
                    }
                });
            });

            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');
            if(prevBtn) prevBtn.addEventListener('click', () => { selectedIndex--; rotateCarousel(); });
            if(nextBtn) nextBtn.addEventListener('click', () => { selectedIndex++; rotateCarousel(); });
            
            rotateCarousel();

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
        if (swipeHint && carousel) {
            const hideSwipeHint = () => {
                if (!swipeHint.classList.contains('fade-out')) {
                    swipeHint.classList.add('fade-out');
                    setTimeout(() => swipeHint.remove(), 500);
                }
            };
            carousel.addEventListener('touchstart', hideSwipeHint, { once: true });
            carousel.addEventListener('mousedown', hideSwipeHint, { once: true });
        }

        // --- REPRODUCTOR DE MÚSICA ---
        const trackItems = document.querySelectorAll('.track-item');
        const vinylCover = document.querySelector('.vinyl-cover');
        const nowPlayingText = document.querySelector('.now-playing-info p'); 

        if (trackItems.length > 0) {
            trackItems.forEach(track => {
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

                const playBtn = track.querySelector('.play-mini-btn');
                playBtn.addEventListener('click', function(e) {
                    e.stopPropagation(); 
                    if (!track.classList.contains('active')) trackMain.click(); 
                    
                    const audioSrc = this.getAttribute('data-audio');
                    if(!audioSrc) return;

                    let player = document.getElementById('holo-audio-player');
                    if (!player) {
                        player = document.createElement('audio');
                        player.id = 'holo-audio-player';
                        document.body.appendChild(player);
                    }

                    document.querySelectorAll('.play-mini-btn').forEach(btn => btn.innerText = '▶');

                    if (player.src.endsWith(audioSrc) && !player.paused) {
                        player.pause();
                        this.innerText = '▶';
                    } else {
                        player.src = audioSrc;
                        player.play().catch(err => console.warn("Audio bloqueado:", err));
                        this.innerText = '⏸'; 
                    }
                });
            });
        }

        // --- SONIDOS UI PORTFOLIO ---
        const uiHover = document.getElementById('ui-hover');
        const uiClick = document.getElementById('ui-click');
        const uiElements = document.querySelectorAll('.nav-btn, .holo-view button, .holo-view a, .track-main, .design-card-trigger, .folder-trigger');
        
        uiElements.forEach(el => {
            if (el.id === 'disconnect-btn') return;
            el.addEventListener('mouseenter', () => {
                if(uiHover) { uiHover.currentTime = 0; uiHover.volume = 0.2; uiHover.play().catch(()=>{}); }
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
        
        cardEl.style.left = (Math.random() * (window.innerWidth - cardEl.offsetWidth)) + 'px';
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
    // 3. UTILIDADES GLOBALES (API PÚBLICA Y EFECTOS)
    // =========================================================================

    // Optimización rAF para la estela del ratón con Estados Dinámicos
    function initMouseTrail() {
        let isDrawing = false;
        let lastEvent = null;

        document.addEventListener('mousemove', (e) => {
            lastEvent = e;
            if (!isDrawing) {
                isDrawing = true;
                requestAnimationFrame(() => {
                    drawTrail(lastEvent);
                    isDrawing = false;
                });
            }
        });

        function drawTrail(e) {
            const hoveredElement = e.target;
            let cursorClass = 'trail-default'; 

            const computedCursor = window.getComputedStyle(hoveredElement).cursor;

            if (computedCursor.includes('pointer') || hoveredElement.closest('a, button, .folder-trigger, .nav-btn')) {
                cursorClass = 'trail-pointer'; 
            } 
            else if (computedCursor.includes('text') || hoveredElement.closest('.raw-content, p, h1, h2, h3, li')) {
                cursorClass = 'trail-text'; 
            }

            const trail = document.createElement('div');
            trail.className = 'mouse-trail ' + cursorClass;
            
            trail.style.left = (e.pageX - 2) + 'px';
            trail.style.top = (e.pageY - 2) + 'px';
            document.body.appendChild(trail);

            setTimeout(() => trail.classList.add('fade-out'), 20);
            setTimeout(() => trail.remove(), 600); 
        }
    }

    function updateTime() {
        const now = new Date();
        const timeSpan = document.getElementById('live-time');
        const dateSpan = document.getElementById('live-date');
        if(timeSpan) timeSpan.innerText = now.toLocaleTimeString('es-AR', { hour12: false });
        if(dateSpan) dateSpan.innerText = now.toLocaleDateString('es-AR');
    }

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
        } catch (error) { console.warn("API Clima inaccesible:", error); }
    }

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

    function initFrutigerAero() {
        const hoverSfx = document.getElementById('hover-sfx');
        const clickSfx = document.getElementById('click-sfx');
        
        // Sonidos UI (se mantienen intactos)
        document.querySelectorAll('a, button, .folder-trigger, .aero-btn').forEach(el => {
            el.addEventListener('mouseenter', () => { 
                if(hoverSfx) { hoverSfx.currentTime = 0; hoverSfx.play().catch(()=>{}); } 
            });
            el.addEventListener('click', () => { 
                if(clickSfx) { clickSfx.currentTime = 0; clickSfx.play().catch(()=>{}); } 
            });
        });

        const glassLayer = document.querySelector('.aero-glass-overlay');
        if (!glassLayer) return;

        // 1. BURBUJAS AMBIENTALES (Loop infinito, cero procesamiento JS)
        for(let i = 0; i < 12; i++) {
            let b = document.createElement('div');
            b.className = 'aero-bubble ambient-bubble';
            b.style.left = Math.random() * 100 + 'vw';
            b.style.width = (Math.random() * 40 + 20) + 'px';
            b.style.height = b.style.width;
            b.style.animationDuration = (Math.random() * 6 + 6) + 's'; 
            b.style.animationDelay = Math.random() * 5 + 's';
            glassLayer.appendChild(b);
        }

        // 2. PATRÓN OBJECT POOLING: Burbujas Interactivas (Click)
        const POOL_SIZE = 15; // Límite estricto de memoria (re-usables)
        const bubblePool = [];

        // Pre-construimos el escuadrón de burbujas en memoria una sola vez
        for(let i = 0; i < POOL_SIZE; i++) {
            let b = document.createElement('div');
            b.className = 'aero-bubble interactive-bubble';
            glassLayer.appendChild(b);
            
            // EVENTO NATIVO: Cuando la animación CSS termina, la burbuja se auto-recicla
            b.addEventListener('animationend', function() {
                this.classList.remove('animate-bubble');
                this.style.opacity = '0'; // Forzamos invisibilidad visual
                const poolItem = bubblePool.find(item => item.el === this);
                if (poolItem) poolItem.active = false; // Marcada como "lista para usar"
            });

            bubblePool.push({ el: b, active: false });
        }

        // 3. EL DISPARADOR (Reciclaje en tiempo real)
        const introLayer = document.getElementById('intro-layer');
        const bubbleSfx = document.getElementById('bubble-sfx');
        
        if (introLayer) {
            introLayer.addEventListener('click', (e) => {
                // Prevenimos clics en cajas de texto o botones
                if (e.target.closest('.intro-content-wrapper') || e.target.closest('button') || e.target.closest('a')) return; 

                if(bubbleSfx) {
                    let sfxClone = bubbleSfx.cloneNode();
                    sfxClone.volume = 0.6; 
                    sfxClone.play().catch(()=>{});
                }

                const numBubbles = Math.floor(Math.random() * 3) + 2;
                let spawned = 0;

                // Escaneamos la "piscina" buscando burbujas desocupadas
                for (let i = 0; i < bubblePool.length; i++) {
                    if (!bubblePool[i].active) {
                        let poolItem = bubblePool[i];
                        poolItem.active = true;
                        let b = poolItem.el;

                        let size = Math.random() * 25 + 10; 
                        let offsetX = (Math.random() * 40 - 20); 
                        let offsetY = (Math.random() * 40 - 20);
                        
                        // Posicionamos matemáticamente
                        b.style.width = size + 'px'; 
                        b.style.height = size + 'px';
                        b.style.left = (e.clientX - size/2 + offsetX) + 'px';
                        b.style.bottom = (window.innerHeight - e.clientY - size/2 + offsetY) + 'px';
                        b.style.animationDuration = (Math.random() * 3 + 2) + 's'; 

                        // TRUCO DE INGENIERÍA: Forzar 'Reflow' para reiniciar la animación CSS
                        b.classList.remove('animate-bubble');
                        void b.offsetWidth; // El navegador lee esto y recalcula la geometría en el acto
                        
                        // Disparamos la burbuja
                        b.style.opacity = '1';
                        b.classList.add('animate-bubble');

                        spawned++;
                        if (spawned >= numBubbles) break; // Detener bucle al alcanzar el límite requerido
                    }
                }
            });
        }
    }

    // =========================================================================
    // 4. EXPOSICIÓN DE APIS (Llamadas desde el HTML inline)
    // =========================================================================

    window.toggleFavorites = function() {
        const favBtn = document.getElementById('fav-toggle-btn');
        const favContent = document.getElementById('fav-content');
        if (!favBtn || !favContent) return;

        favContent.classList.toggle('open');
        favBtn.classList.toggle('active');
        const isOpen = favContent.classList.contains('open');
        favBtn.innerHTML = isOpen ? '<span class="folder-icon">📂</span> [ CERRAR CARPETA ]' : '<span class="folder-icon">📁</span> [ CLICK PARA VER MIS FAVORITOS ]';
        favBtn.setAttribute('aria-expanded', isOpen);
    };

    window.switchTab = function(tabId) {
        const btnPage = document.getElementById('btn-soulpage');
        const btnCard = document.getElementById('btn-soulcard');
        const pageEls = document.querySelectorAll('.soulpage-only');
        const cardEls = document.querySelectorAll('.soulcard-only');

        if (tabId === 'soulpage') {
            btnPage.classList.add('active'); btnPage.setAttribute('aria-selected', 'true');
            btnCard.classList.remove('active'); btnCard.setAttribute('aria-selected', 'false');
            pageEls.forEach(el => el.style.display = ''); 
            cardEls.forEach(el => el.style.display = 'none');
        } else {
            btnCard.classList.add('active'); btnCard.setAttribute('aria-selected', 'true');
            btnPage.classList.remove('active'); btnPage.setAttribute('aria-selected', 'false');
            pageEls.forEach(el => el.style.display = 'none');
            cardEls.forEach(el => el.style.display = ''); 
        }
        const scrollContainer = document.getElementById('intro-layer');
        if (scrollContainer) scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.toggleBGM = function() {
        const bgm = document.getElementById('bgm-audio');
        const btn = document.getElementById('winamp-play');
        if(!bgm || !btn) return;
        
        if(bgm.paused) {
            bgm.play().catch(e => console.warn("Interacción requerida", e));
            btn.innerText = "[ PAUSE BGM ]";
            btn.style.background = "#ffff00"; 
        } else {
            bgm.pause();
            btn.innerText = "[ PLAY BGM ]";
            btn.style.background = "#e0e0e0";
        }
    };

const chaosContent = [
        { type: 'game', title: 'DOOM (1993)', platform: 'all', src: 'https://archive.org/details/doom_20221019' },
        { type: 'game', title: 'WOLFENSTEIN 3D', src: 'https://archive.org/embed/msdos_Wolfenstein_3D_1992', platform: 'all' },
        { type: 'game', title: 'PRINCE OF PERSIA', platform: 'desktop', src: 'https://archive.org/embed/msdos_Prince_of_Persia_1990' },        
        { type: 'game', title: 'RESIDENT EVIL 2 (1996), LEON DISC', platform: 'desktop', src: 'https://www.retrogames.cc/embed/42943-resident-evil-2-dual-shock-ver-disc-1-leon.html' },
        { type: 'game', title: 'SILENT HILL (PS1)', platform: 'desktop', src: 'https://www.retrogames.cc/embed/41684-silent-hill.html' },
        { type: 'game', title: 'CRASH BANDICOOT', platform: 'desktop', src: 'https://www.retrogames.cc/embed/40784-crash-bandicoot.html' },
        { type: 'game', title: 'SONIC THE HEDGEHOG', platform: 'desktop', src: 'https://www.retrogames.cc/embed/30899-sonic-the-hedgehog-usa-europe.html' },
        { type: 'game', title: '2048 CLASSIC', src: 'https://gabrielecirulli.github.io/2048/', platform: 'mobile' }, // Repo original del autor
        { type: 'game', title: 'SPACE CADET PINBALL', src: 'https://alula.github.io/SpaceCadetPinball/', platform: 'desktop' }, // Reemplazo de Cookie Clicker
        { type: 'game', title: 'MINESWEEPER', src: 'https://minesweeperonline.com/', platform: 'all' }, // Reemplazo de Geometry Dash
        { type: 'game', title: 'FLOPPY BIRD', src: 'https://nebezb.com/floppybird/', platform: 'mobile' }, // Reemplazo de Flappy Bird (Clon seguro)
        { type: 'game', title: 'HEXTRIS', src: 'https://hextris.io/', platform: 'mobile' },
        { type: 'game', title: 'CHROME DINO', src: 'https://chromedino.com/', platform: 'mobile' },
        { type: 'game', title: 'LITTLE ALCHEMY 2', src: 'https://littlealchemy2.com/', platform: 'mobile' },
        { type: 'video', title: 'NOT A RICK ROLL', src: 'https://top-shows.netlify.app/', platform: 'all' },
        { type: 'video', title: 'NYAN CAT', src: 'https://www.youtube.com/embed/QH2-TGUlwu4?autoplay=1', platform: 'all' }, 
        { type: 'game', title: 'THE MATRIX', src: 'https://matrixscreensaver.online/', platform: 'all' },
        { type: 'bsod', title: 'FATAL ERROR', html: '', platform: 'all' },

        // 1. FAKE UPDATE RECONSTRUIDO
        { 
            type: 'image', 
            title: 'SYSTEM UPDATE...', 
            platform: 'all',
            html: `
            <div style="background:#000; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff; font-family:'Courier New', monospace; text-align:center;">
                <h2 style="color:#00ff00;">CONFIGURANDO ACTUALIZACIONES</h2>
                <p style="margin: 15px 0; font-size:1.2rem;">23% completado.</p>
                <p style="color:#888;">No apague el equipo.</p>
                <div style="margin-top:30px; width:80%; max-width:300px; height:20px; border:2px solid #888; padding:2px; box-sizing:border-box;">
                    <div style="width:23%; height:100%; background:#00ff00; animation: fakeLoad 10s infinite;"></div>
                </div>
            </div>
            <style>@keyframes fakeLoad { 0% {width: 23%;} 50% {width: 29%;} 100% {width: 23%;} }</style>
            ` 
        },

        // 2. FBI SEIZURE RECONSTRUIDO
        { 
            type: 'image', 
            title: 'FBI SEIZURE', 
            platform: 'all',
            html: `
            <div style="background:#fff; color:#000; width:100%; height:100%; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; font-family:'Times New Roman', serif; padding: 20px; box-sizing:border-box;">
                <div style="border: 6px solid #800000; padding: 20px; max-width: 90%; background: #fffbfb;">
                    <h1 style="color:#800000; font-size: clamp(2rem, 5vw, 3.5rem); margin: 0; border-bottom: 3px solid #800000; padding-bottom: 10px;">THIS DOMAIN HAS BEEN SEIZED</h1>
                    <h3 style="margin-top: 20px; color:#333;">as part of a coordinated law enforcement action by</h3>
                    <h2 style="font-size: clamp(1.5rem, 4vw, 2.5rem); margin:10px 0;">The Federal Bureau of Investigation</h2>
                    <p style="font-size: 0.9rem; color: #555; margin-top: 30px; border-top: 1px solid #ccc; padding-top:10px;">Pursuant to a seizure warrant issued by the United States District Court.</p>
                </div>
            </div>` 
        },

        // 3. YOU ARE AN IDIOT RECONSTRUIDO (Ataque epiléptico retro)
        { 
            type: 'image', 
            title: 'YOU ARE AN IDIOT', 
            platform: 'all',
            html: `
            <div id="idiot-container" style="background:#fff; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; animation: idiotFlash 0.15s infinite;">
                <h1 style="color:#000; font-family:'Comic Sans MS', 'Arial', sans-serif; font-size:clamp(2rem, 8vw, 4rem); margin:0; text-align:center;">YOU ARE AN IDIOT!</h1>
                <h1 style="color:#000; font-family:'Comic Sans MS', 'Arial', sans-serif; font-size:clamp(3rem, 10vw, 5rem); margin:0;">☺ ☺ ☺</h1>
            </div>
            <style>
                @keyframes idiotFlash { 
                    0% { background-color: #ffffff; filter: invert(0); } 
                    50% { background-color: #000000; filter: invert(1); } 
                    100% { background-color: #ffffff; filter: invert(0); } 
                }
            </style>
            ` 
        }
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
                    modalBody.innerHTML = `<iframe src="${randomItem.src}" title="${randomItem.title}" frameborder="0" allowfullscreen allow="autoplay; encrypted-media" style="width:100%; height:100%;"></iframe>`;
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
    };

    window.closeChaos = function() {
        const modal = document.getElementById('chaos-modal');
        const modalBody = document.getElementById('chaos-content');
        if(modal) modal.style.display = 'none';
        if(modalBody) modalBody.innerHTML = ''; 
        document.documentElement.classList.remove('no-scroll');
        document.body.classList.remove('no-scroll');
    };

    window.triggerBSOD = function() {
        document.documentElement.classList.add('no-scroll');
        document.body.classList.add('no-scroll');

        const bsod = document.createElement('div');
        bsod.id = 'bsod-overlay';
        bsod.innerHTML = `
            <div class="bsod-text" style="background:#0000AA; color:#FFF; font-family:'Courier New', monospace; padding:5vw; height:100vh; display:flex; flex-direction:column; justify-content:center; position:fixed; top:0; left:0; width:100%; z-index:999999;">
                <p>A problem has been detected and windows has been shut down to prevent damage to your computer.</p><br>
                <p>DRIVER_IRQL_NOT_LESS_OR_EQUAL</p><br>
                <p>If this is the first time you've seen this stop error screen, restart your computer.</p><br>
                <p>Technical information:</p>
                <p>*** STOP: 0x000000D1 (DOOM_ERROR_404)</p><br>
                <p class="blink" style="animation:blink 1s infinite;">PRESS ANY KEY TO CONTINUE...</p>
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
    };

})();