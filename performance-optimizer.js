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

    function initAll() { initMegaMenus(); initBeforeAfter(); }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();