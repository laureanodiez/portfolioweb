// =========================================================================
// MAIN.JS — SOULPAGE simplificada + lógica de portfolio.html sin tocar
// =========================================================================

(function() {
    'use strict';

    // --- VARIABLES DE ESTADO ---
    let currentState = 0; // usado solo en portfolio.html: 0 Mesa | 1 Flotando | 2 Conectada
    let isCoolingDown = false; // anti-spam del botón "sentite con suerte"

    // --- INICIALIZADOR PRINCIPAL ---
    document.addEventListener('DOMContentLoaded', () => {
        const isHome = document.getElementById('intro-layer') !== null;
        const isPortfolioPage = document.getElementById('mainContent') !== null;

        if (isHome) initHome();
        if (isPortfolioPage) initPortfolioLogic();
    });

    // =========================================================================
    // 1. LÓGICA DE LA HOME (index.html)
    // =========================================================================
    function initHome() {
        const enterBtn = document.getElementById('enter-soulcard');
        const introLayer = document.getElementById('intro-layer');

        if (enterBtn && introLayer) {
            enterBtn.addEventListener('click', (e) => {
                e.preventDefault();

                const bgm = document.getElementById('bgm-audio');
                if (bgm && !bgm.paused) bgm.pause();

                enterBtn.disabled = true;
                enterBtn.textContent = '[ ... ]';

                setTimeout(() => {
                    introLayer.classList.add('crt-shutdown-effect');
                    setTimeout(() => { window.location.href = 'portfolio.html'; }, 700);
                }, 200);
            });
        }

        // --- Ventanas: el botón "_" las minimiza (encoge a solo la barra de título) ---
        document.querySelectorAll('.win-btn-min').forEach((btn) => {
            const toggleMin = () => {
                const win = btn.closest('.win');
                if (!win) return;
                const minimized = win.classList.toggle('win-minimized');
                btn.setAttribute('aria-expanded', String(!minimized));
            };
            btn.addEventListener('click', toggleMin);
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleMin();
                }
            });
        });

        // --- PENSAMIENTOS.EXE: abrir/cerrar el lector ---
        document.querySelectorAll('.essay-item').forEach((item) => {
            item.addEventListener('click', () => openEssay(item.dataset.essay));
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openEssay(item.dataset.essay);
                }
            });
        });

        // --- Cerrar cualquier modal con ESC o clickeando el fondo ---
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            const chaosModal = document.getElementById('chaos-modal');
            const essayModal = document.getElementById('essay-modal');
            if (chaosModal && chaosModal.classList.contains('is-open')) window.closeChaos();
            if (essayModal && essayModal.classList.contains('is-open')) window.closeEssay();
        });
        document.querySelectorAll('.modal-overlay').forEach((overlay) => {
            overlay.addEventListener('click', (e) => {
                if (e.target !== overlay) return;
                if (overlay.id === 'chaos-modal') window.closeChaos();
                if (overlay.id === 'essay-modal') window.closeEssay();
            });
        });

        // --- NOW.EXE: recently watched (letterboxd) + recently played (spotify) ---
        loadLetterboxd();
        loadSpotifyRecent();

        initScrollProgress();
        initKonamiCode();
    }

    // --- Barra de progreso de scroll, arriba de todo ---
    function initScrollProgress() {
        const bar = document.getElementById('scroll-progress');
        if (!bar) return;
        const update = () => {
            const h = document.documentElement;
            const scrollable = h.scrollHeight - h.clientHeight;
            const pct = scrollable > 0 ? (h.scrollTop / scrollable) * 100 : 0;
            bar.style.width = pct + '%';
        };
        document.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
    }

    // --- Konami code: ↑ ↑ ↓ ↓ ← → ← → B A ---
    function initKonamiCode() {
        const sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let pos = 0;
        document.addEventListener('keydown', (e) => {
            const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            const expected = sequence[pos];
            if (key === expected) {
                pos++;
                if (pos === sequence.length) {
                    pos = 0;
                    document.body.classList.add('konami-flash');
                    setTimeout(() => {
                        document.body.classList.remove('konami-flash');
                        window.openEssay('konami');
                    }, 900);
                }
            } else {
                pos = (key === sequence[0]) ? 1 : 0;
            }
        });
    }

    // --- NOW.EXE: helpers ---

    // Cuenta pública de Letterboxd (RSS es público, no necesita API key).
    const LETTERBOXD_RSS_URL = 'https://letterboxd.com/lxx10/rss/';

    // Spotify "recently played" — función serverless propia, ya deployada.
    const SPOTIFY_RECENT_ENDPOINT = 'https://spotify-api-opal-eight.vercel.app/api/spotify';

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str == null ? '' : String(str);
        return div.innerHTML;
    }

    function renderMarqueeFallback(track, msg) {
        if (!track) return;
        track.style.animation = 'none';
        track.innerHTML = `<span class="marquee-fallback">${escapeHtml(msg)}</span>`;
    }

    function renderMarqueeTrack(track, items) {
        if (!track) return;
        if (!items || !items.length) {
            renderMarqueeFallback(track, 'nada por acá todavía');
            return;
        }
        track.style.animation = '';
        const html = items.map((it) => `
            <a class="marquee-item" href="${it.url ? escapeHtml(it.url) : '#'}" target="_blank" rel="noopener noreferrer">
                <span class="marquee-thumb" style="background-image:url('${escapeHtml(it.image || '')}')"></span>
                <span class="marquee-title">${escapeHtml(it.title)}</span>
                ${it.artist ? `<span class="marquee-subtitle">${escapeHtml(it.artist)}</span>` : ''}
            </a>
        `).join('');
        // Se duplica el contenido para que el loop de la cinta sea continuo (translateX -50%).
        track.innerHTML = html + html;
    }

    async function loadLetterboxd() {
        const track = document.getElementById('watched-track');
        if (!track) return;
        try {
            const proxied = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(LETTERBOXD_RSS_URL)}`;
            const res = await fetch(proxied);
            if (!res.ok) throw new Error('rss2json ' + res.status);
            const data = await res.json();
            const items = (data.items || []).slice(0, 10).map((item) => {
                const tmp = document.createElement('div');
                tmp.innerHTML = item.description || '';
                const img = tmp.querySelector('img');
                const title = (item.title || '').replace(/,\s*\d{4}.*$/, '');
                return { title, image: img ? img.src : '', url: item.link };
            });
            renderMarqueeTrack(track, items);
        } catch (err) {
            console.warn('No se pudo cargar el RSS de Letterboxd', err);
            renderMarqueeFallback(track, 'no se pudo cargar letterboxd');
        }
    }

    async function loadSpotifyRecent() {
        const track = document.getElementById('played-track');
        if (!track) return;
        if (!SPOTIFY_RECENT_ENDPOINT) {
            renderMarqueeFallback(track, 'conectá spotify acá (ver comentario en main.js)');
            return;
        }
        try {
            const res = await fetch(SPOTIFY_RECENT_ENDPOINT);
            if (!res.ok) throw new Error('spotify endpoint ' + res.status);
            const items = await res.json();
            renderMarqueeTrack(track, (items || []).slice(0, 10));
        } catch (err) {
            console.warn('No se pudo cargar recently played de Spotify', err);
            renderMarqueeFallback(track, 'no se pudo cargar spotify');
        }
    }

    // =========================================================================
    // 2. LÓGICA DEL PORTFOLIO 3D (portfolio.html) — sin cambios
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
    // 3. API PÚBLICA (llamada desde el HTML inline)
    // =========================================================================

    // --- Ticker del título de la pestaña, tipo marquee, mientras suena la música ---
    const PAGE_TITLE = document.title;
    let titleTickerId = null;

    function startTitleTicker() {
        const text = '♪ ahora suena: frutiger2.wav — laureano diez.   ';
        let i = 0;
        stopTitleTicker();
        titleTickerId = setInterval(() => {
            document.title = text.slice(i) + text.slice(0, i);
            i = (i + 1) % text.length;
        }, 280);
    }

    function stopTitleTicker() {
        if (titleTickerId) {
            clearInterval(titleTickerId);
            titleTickerId = null;
        }
        document.title = PAGE_TITLE;
    }

    window.toggleBGM = function() {
        const bgm = document.getElementById('bgm-audio');
        const btn = document.getElementById('music-toggle');
        const label = document.getElementById('music-label');
        if(!bgm || !btn || !label) return;

        if(bgm.paused) {
            bgm.play().catch(e => console.warn("Interacción requerida (el navegador bloquea el autoplay)", e));
            btn.classList.add('playing');
            btn.setAttribute('aria-pressed', 'true');
            label.textContent = "ahora suena: frutiger2.wav";
            startTitleTicker();
        } else {
            bgm.pause();
            btn.classList.remove('playing');
            btn.setAttribute('aria-pressed', 'false');
            label.textContent = "tocar música";
            stopTitleTicker();
        }
    };

    // --- "SENTITE CON SUERTE": ruleta de cosas random ---
    const chaosContent = [
        { type: 'game', title: 'DOOM (1993)', platform: 'all', src: 'https://archive.org/details/doom_20221019' },
        { type: 'game', title: 'WOLFENSTEIN 3D', src: 'https://archive.org/embed/msdos_Wolfenstein_3D_1992', platform: 'all' },
        { type: 'game', title: 'PRINCE OF PERSIA', platform: 'desktop', src: 'https://archive.org/embed/msdos_Prince_of_Persia_1990' },
        { type: 'game', title: 'RESIDENT EVIL 2 (1996), LEON DISC', platform: 'desktop', src: 'https://www.retrogames.cc/embed/42943-resident-evil-2-dual-shock-ver-disc-1-leon.html' },
        { type: 'game', title: 'SILENT HILL (PS1)', platform: 'desktop', src: 'https://www.retrogames.cc/embed/41684-silent-hill.html' },
        { type: 'game', title: 'CRASH BANDICOOT', platform: 'desktop', src: 'https://www.retrogames.cc/embed/40784-crash-bandicoot.html' },
        { type: 'game', title: 'SONIC THE HEDGEHOG', platform: 'desktop', src: 'https://www.retrogames.cc/embed/30899-sonic-the-hedgehog-usa-europe.html' },
        { type: 'game', title: '2048 CLASSIC', src: 'https://gabrielecirulli.github.io/2048/', platform: 'mobile' },
        { type: 'game', title: 'SPACE CADET PINBALL', src: 'https://alula.github.io/SpaceCadetPinball/', platform: 'desktop' },
        { type: 'game', title: 'MINESWEEPER', src: 'https://minesweeperonline.com/', platform: 'all' },
        { type: 'game', title: 'FLOPPY BIRD', src: 'https://nebezb.com/floppybird/', platform: 'mobile' },
        { type: 'game', title: 'HEXTRIS', src: 'https://hextris.io/', platform: 'mobile' },
        { type: 'game', title: 'CHROME DINO', src: 'https://chromedino.com/', platform: 'mobile' },
        { type: 'game', title: 'LITTLE ALCHEMY 2', src: 'https://littlealchemy2.com/', platform: 'mobile' },
        { type: 'video', title: 'NOT A RICK ROLL', src: 'https://top-shows.netlify.app/', platform: 'all' },
        { type: 'video', title: 'NYAN CAT', src: 'https://www.youtube.com/embed/QH2-TGUlwu4?autoplay=1', platform: 'all' },
        { type: 'game', title: 'THE MATRIX', src: 'https://matrixscreensaver.online/', platform: 'all' },
        { type: 'bsod', title: 'FATAL ERROR', html: '', platform: 'all' },
        {
            type: 'image',
            title: 'SYSTEM UPDATE...',
            platform: 'all',
            html: `
            <div style="background:#000; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#fff; font-family:'Courier New', monospace; text-align:center;">
                <h2 style="color:#ff5a1f;">CONFIGURANDO ACTUALIZACIONES</h2>
                <p style="margin: 15px 0; font-size:1.2rem;">23% completado.</p>
                <p style="color:#888;">No apague el equipo.</p>
                <div style="margin-top:30px; width:80%; max-width:300px; height:20px; border:2px solid #888; padding:2px; box-sizing:border-box;">
                    <div style="width:23%; height:100%; background:#ff5a1f; animation: fakeLoad 10s infinite;"></div>
                </div>
            </div>
            <style>@keyframes fakeLoad { 0% {width: 23%;} 50% {width: 29%;} 100% {width: 23%;} }</style>
            `
        },
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
        const label = document.getElementById('lucky-label');
        const originalLabel = "sentite con suerte";

        isCoolingDown = true;
        if(btn) btn.disabled = true;
        if(label) label.textContent = "cargando...";

        const randomItem = listToUse[Math.floor(Math.random() * listToUse.length)];

        if (randomItem.type === 'bsod') {
            window.triggerBSOD();
            setTimeout(() => {
                isCoolingDown = false;
                if(btn) btn.disabled = false;
                if(label) label.textContent = originalLabel;
            }, 1000);
            return;
        }

        const modal = document.getElementById('chaos-modal');
        const modalTitle = document.getElementById('chaos-title');
        const modalBody = document.getElementById('chaos-content');

        if(modal && modalTitle && modalBody) {
            modalTitle.innerText = randomItem.title;
            modal.classList.add('is-open');
            modal.setAttribute('aria-hidden', 'false');
            document.documentElement.classList.add('no-scroll');
            document.body.classList.add('no-scroll');

            setTimeout(() => {
                if (randomItem.type === 'game' || randomItem.type === 'video') {
                    modalBody.innerHTML = `<iframe src="${randomItem.src}" title="${randomItem.title}" frameborder="0" allowfullscreen allow="autoplay; encrypted-media"></iframe>`;
                } else {
                    modalBody.innerHTML = randomItem.html;
                }
                setTimeout(() => {
                    isCoolingDown = false;
                    btn.disabled = false;
                    if(label) label.textContent = originalLabel;
                }, 3000);
            }, 100);
        }
    };

    // --- PENSAMIENTOS.EXE: contenido completo de cada entrada ---
    const ESSAY_CONTENT = {
        pentagono: {
            title: 'pentágono',
            date: '15 feb 2026',
            gif: 'assets/img/gifs/pentagon.gif',
            body: 'A la naturaleza le encanta el hexágono. Es la figura perfecta, funcional por excelencia, la base de casi todo lo que es "eficiente" y se encuentra como una estructura fuerte (a nivel micro y macroscópico). Pero, personalmente, siempre tiré más para otra figura… El pentágono. El pentágono es otra historia. Aunque en su imperfección esconda mucho valor y potencia -tiene usos y forma parte del paisaje natural (como en las flores!)-, siempre se queda a una arista de representar la perfección natural. Identifico mis ideas y lo que hago con el pentágono porque, seamos sinceros, todos somos un poco así. Nunca vamos a alcanzar la perfección del hexágono, y eso está bien! Es en esa asimetría donde reside nuestra verdadera capacidad de crear, de experimentar, de ser humanos.'
        },
        creatividad: {
            title: 'flesh and blood:mi proceso creativo',
            date: '20 dic 2025',
            body: 'Con el paso de los años, he vivido experiencias que me confirman que en el acto de la expresión creativa hallo aquello que otros suelen buscar la vida entera. Especialmente mediante la música y la invención -ese rigor mental que exige el arte— me sumerjo en un estado de libertad donde hago catarsis con la energía acumulada en cada vivencia, combustible de lo que es, como colorario, mi vida. Por eso, la más mínima iteración del proceso creativo es digna de orgullo; no porque el resultado sea siempre "perfecto", sino porque es, inevitablemente, una expresión de mí. De la misma manera y de forma natural, inculco en las acciones que llevo a cabo mi proceso creativo, ya sean actividades cotidianas o proyectos colectivos, siendo uno de los pilares del proceso la experimentación. Experimentar es lo que me permite extender los límites, es el puntapié, la intención de buscar la solución y responder las preguntas, muchas veces escapando de lo usual, requiriendo involucrarse en lo...taboo. Desde pequeño, he sentido una fascinación por cómo la tecnología puede actuar como un puente entre la imaginación abstracta y la realidad tangible. Si bien muchos logros son materiales, físicos, palpables a través de productos finales -como lo puede ser un disco con su caja con su librito en el caso de la música, o una pintura o escultura en el caso del arte plástico-, las expresiones artísticas digitales quedan, muchas veces, exentas de esta posibilidad de "tocar" una obra de la que estás ciertamente orgulloso. En un mundo donde todo tiende a ser efímero y espontáneo, yo —y cada vez más gente que escapa del contenido generado por IA— me inclino más por... lo físico (ver SOULCARD PORTFOLIO).'
        },
        soulcard: {
            title: 'soulcard',
            date: '???',
            body: 'Uno al presentarse formalmente, estilaba usar una tarjeta de negocios. Es una tradición elegante, empoderante, pero obsoleta: una usanza que parecía haber muerto a manos de las redes sociales. Pero, como todo vuelve... Imaginate que el trabajo de toda tu vida sea accesible desde un mismo punto, con respaldo físico, uno que ya todos conocen, pero con una funcionalidad desconocida, desaprovechada. La "SOULCARD™" es un artefacto digital diseñado para contener todas las facetas creativas de una persona en un solo objeto portable. Todos los proyectos de tu vida en formato de bolsillo. Todo resultado de tu trabajo, cualquier desarrollo digital del que hayas participado o liderado, en un sólo lugar. Transferís todos tus proyectos a tu SOULCARD© y podés comenzar a organizarlo y decorarlo a tu gusto, con infinitas opciones. "Al insertar tu SOULCARD al visor especial SOULVISION vas a poder experimentar de forma inmersiva la exposición de cada proyecto en su integridad, como nunca antes. Tu creatividad es el límite, y SOULCARD® el museo portable de todas tus obras."'
        },
        // No está en la lista de pensamientos.exe — solo se llega acá con el código Konami.
        konami: {
            title: 'encontraste algo',
            date: '¯\\_(ツ)_/¯',
            body: 'No hay premio. Solo quería que supieras que si llegaste hasta acá escribiendo flechas como en 1987, probablemente tenemos gustos parecidos. Gracias por quedarte tanto tiempo dando vueltas por acá.'
        }
    };

    window.openEssay = function(id) {
        const essay = ESSAY_CONTENT[id];
        if (!essay) return;

        const modal = document.getElementById('essay-modal');
        const titleBar = document.getElementById('essay-modal-title');
        const title = document.getElementById('essay-reader-title');
        const date = document.getElementById('essay-reader-date');
        const gif = document.getElementById('essay-reader-gif');
        const text = document.getElementById('essay-reader-text');
        if (!modal || !title || !date || !text) return;

        titleBar.textContent = `${id}.txt`;
        title.textContent = essay.title;
        date.textContent = essay.date;
        text.textContent = essay.body;

        if (essay.gif) {
            gif.src = essay.gif;
            gif.alt = '';
            gif.hidden = false;
        } else {
            gif.hidden = true;
            gif.removeAttribute('src');
        }

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.documentElement.classList.add('no-scroll');
        document.body.classList.add('no-scroll');
    };

    window.closeEssay = function() {
        const modal = document.getElementById('essay-modal');
        if (modal) {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
        }
        document.documentElement.classList.remove('no-scroll');
        document.body.classList.remove('no-scroll');
    };

    window.closeChaos = function() {
        const modal = document.getElementById('chaos-modal');
        const modalBody = document.getElementById('chaos-content');
        if(modal) {
            modal.classList.remove('is-open');
            modal.setAttribute('aria-hidden', 'true');
        }
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