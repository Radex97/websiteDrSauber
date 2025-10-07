// Performance Optimizer für bessere Scroll-Performance
(function() {
    let scrollTimer = null;
    let isScrolling = false;
    let openMega = null;
    
    // Scroll-Handler
    function handleScroll() {
        if (!isScrolling) {
            document.documentElement.classList.add('js-scrolling');
            isScrolling = true;
        }
        
        // Clear existing timer
        clearTimeout(scrollTimer);
        
        // Set new timer
        scrollTimer = setTimeout(function() {
            document.documentElement.classList.remove('js-scrolling');
            isScrolling = false;
        }, 150); // 150ms nach dem Scroll wieder aktivieren
    }
    
    // Event Listener hinzufügen
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Prefers reduced motion respektieren
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.classList.add('js-reduced-motion');
    }

    // Mega-Menu Interaktion & A11y
    function closeOpenMega() {
        if (!openMega) return;
        openMega.classList.remove('open');
        const parent = openMega.closest('.nav-dropdown.mega');
        if (parent) parent.setAttribute('aria-expanded', 'false');
        openMega = null;
    }

    function initMegaMenus() {
        const megaDropdowns = document.querySelectorAll('.nav-dropdown.mega');
        megaDropdowns.forEach(drop => {
            const toggle = drop.querySelector('.mega-toggle');
            const panel = drop.querySelector('.mega-menu');
            if (!toggle || !panel) return;

            // Hover/Fokus (Desktop)
            drop.addEventListener('mouseenter', () => {
                panel.classList.add('open');
                drop.setAttribute('aria-expanded', 'true');
                openMega = panel;
            });
            drop.addEventListener('mouseleave', () => {
                panel.classList.remove('open');
                drop.setAttribute('aria-expanded', 'false');
                openMega = null;
            });

            // Click/Touch (Mobile & Fallback)
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const isOpen = panel.classList.contains('open');
                closeOpenMega();
                if (!isOpen) {
                    panel.classList.add('open');
                    drop.setAttribute('aria-expanded', 'true');
                    openMega = panel;
                }
            });

            // Tastatur
            drop.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    closeOpenMega();
                    toggle.focus();
                }
            });
        });

        // Globaler ESC-Listener
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeOpenMega();
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!openMega) return;
            const isInside = e.target.closest && e.target.closest('.nav-dropdown.mega');
            if (!isInside) closeOpenMega();
        });
    }

    // Mobile Navigation: Toggle-Button einfügen und steuern (Desktop bleibt unberührt)
    function initMobileNav() {
        const header = document.querySelector('.header .container');
        const nav = document.querySelector('.header .nav');
        if (!header || !nav) return;

        // Prüfen, ob Toggle bereits existiert
        let toggle = header.querySelector('.nav-toggle');
        if (!toggle) {
            toggle = document.createElement('button');
            toggle.className = 'nav-toggle';
            toggle.type = 'button';
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('aria-controls', 'primary-nav');
            toggle.innerHTML = '<span class="visually-hidden">Menü</span><span class="nav-toggle-burger"></span>';
            // Toggle vor der Navigation platzieren (rechts neben Logo)
            header.insertBefore(toggle, nav);

            // ARIA ID sicherstellen
            if (!nav.id) nav.id = 'primary-nav';
        }

        // Öffnen/Schließen
        function setOpen(state) {
            if (state) {
                nav.classList.add('is-open');
                toggle.setAttribute('aria-expanded', 'true');
                // Ein offenes Mega ggf. schließen
                document.querySelectorAll('.nav-dropdown.mega[aria-expanded="true"]').forEach(d => d.setAttribute('aria-expanded','false'));
                document.querySelectorAll('.nav-dropdown .mega-menu.open').forEach(m => m.classList.remove('open'));
            } else {
                nav.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        }

        toggle.addEventListener('click', function() {
            const isOpen = nav.classList.contains('is-open');
            setOpen(!isOpen);
        });

        // Schließen bei Resize > 768px, damit Desktop unverändert bleibt
        let lastW = window.innerWidth;
        window.addEventListener('resize', () => {
            const w = window.innerWidth;
            if (w !== lastW && w > 768) setOpen(false);
            lastW = w;
        });

        // Schließen bei Outside-Klick auf Mobil
        document.addEventListener('click', (e) => {
            if (window.innerWidth > 768) return;
            const inside = e.target.closest && e.target.closest('.header');
            if (!inside) setOpen(false);
        });
    }

    function initBeforeAfter() {
        const wrappers = document.querySelectorAll('.comparison-wrapper');
        wrappers.forEach(wrapper => {
            const before = wrapper.querySelector('.before-image');
            const after = wrapper.querySelector('.after-image');
            const slider = wrapper.querySelector('.comparison-slider');
            const handle = wrapper.querySelector('.slider-handle');
            if (!before || !after || !slider || !handle) return;

            let dragging = false;

            function setPosition(coord) {
                const rect = wrapper.getBoundingClientRect();
                if (wrapper.classList.contains('vertical')) {
                    const cy = Math.min(Math.max((coord - rect.top), 0), rect.height);
                    const percentY = (cy / rect.height) * 100;
                    before.style.clipPath = `polygon(0 0, 100% 0, 100% ${percentY}%, 0 ${percentY}%)`;
                    after.style.clipPath = `polygon(0 ${percentY}%, 100% ${percentY}%, 100% 100%, 0 100%)`;
                    slider.style.top = `${percentY}%`;
                } else {
                    let x = Math.min(Math.max(coord - rect.left, 0), rect.width);
                    const percent = (x / rect.width) * 100;
                    before.style.clipPath = `polygon(0 0, ${percent}% 0, ${percent}% 100%, 0 100%)`;
                    after.style.clipPath = `polygon(${percent}% 0, 100% 0, 100% 100%, ${percent}% 100%)`;
                    slider.style.left = `${percent}%`;
                }
            }

            function start(e) {
                dragging = true; wrapper.classList.add('dragging');
                const point = e.touches ? e.touches[0] : e;
                setPosition(wrapper.classList.contains('vertical') ? point.clientY : point.clientX);
            }
            function move(e) {
                if (!dragging) return;
                const point = e.touches ? e.touches[0] : e;
                setPosition(wrapper.classList.contains('vertical') ? point.clientY : point.clientX);
            }
            function end() { dragging = false; wrapper.classList.remove('dragging'); }

            handle.addEventListener('mousedown', start);
            slider.addEventListener('mousedown', start);
            window.addEventListener('mousemove', move);
            window.addEventListener('mouseup', end);
            handle.addEventListener('touchstart', start, {passive:true});
            slider.addEventListener('touchstart', start, {passive:true});
            window.addEventListener('touchmove', move, {passive:false});
            window.addEventListener('touchend', end);
        });
    }

    function initAll() { initMegaMenus(); initBeforeAfter(); initMobileNav(); }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();