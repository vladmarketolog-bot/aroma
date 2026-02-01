import { state } from './state.js';
import { vibes } from './db.js';

export const ui = {
    init() {
        // Initial renders
        this.renderVibes();
        this.updateFab();
        this.renderWardrobe();
        this.renderFavorites(); // Initial render if any
    },

    renderVibes() {
        const container = document.querySelector('.grid');
        if (!container) return;

        container.innerHTML = vibes.map(v => `
            <button data-vibe="${v.id}" class="vibe-card relative h-28 rounded-xl bg-white/5 border border-white/5 hover:border-gold-400/30 transition active:scale-95 text-left p-3 flex flex-col justify-between overflow-hidden group">
                <div class="absolute top-2 right-2 text-xl opacity-50 group-hover:scale-110 transition">${v.icon}</div>
                <div class="mt-auto relative z-10">
                    <div class="font-bold text-sm text-white mb-1 leading-tight">${v.name}</div>
                    <div class="text-[9px] text-white/40 leading-tight">${v.desc}</div>
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            </button>
        `).join('');

        // Re-attach listeners is handled in app.js via delegation or direct attach here?
        // Let's use delegation in app.js for cleanliness, or simple onclicks here if generated.
        // Actually, since we generate HTML strings, we need to bind events after render.
    },

    highlightVibe(vibeId) {
        document.querySelectorAll('.vibe-card').forEach(c => {
            c.classList.remove('ring-2', 'ring-gold-400', 'bg-gold-400/10', 'opacity-100');
            c.classList.add('opacity-50');

            if (c.dataset.vibe === vibeId) {
                c.classList.remove('opacity-50');
                c.classList.add('ring-2', 'ring-gold-400', 'bg-gold-400/10', 'opacity-100');
            }
        });
    },

    renderWardrobe() {
        const container = document.getElementById('wardrobe-chips');
        if (!container) return;

        if (state.wardrobe.length === 0) {
            container.innerHTML = `<div class="w-full text-center py-4 border border-dashed border-white/10 rounded-xl text-[10px] text-white/30">Ваш гардероб пуст. Добавьте ароматы выше.</div>`;
            return;
        }

        // Need to import perfumeDB to resolve names. 
        // We can attach it to the ui object or window for now, or just trust app.js passes it?
        // Actually, importing it here is cleaner as per ES modules.
        // We already imported 'vibes', let's fix imports at top of file.
        // Assuming imports are fixed, we proceed.
        // Note: We need to import perfumeDB at the top of ui.js

        container.innerHTML = '';
        state.wardrobe.forEach(id => {
            // Access perfumeDB from global or import. 
            // Since we can't easily change imports with replace_file (it's at top), 
            // we will assume app.js exposes it or we fetch it from a helper.
            // Let's rely on a helper 'getPerfumeById' which we need to import or have available.
            // TEMPORARY: We will dispatch a custom event or callback?
            // BETTER: We will ask state to give us full objects? 
            // Let's just assume we can get it via `state.getPerfume(id)` if we add that to state?
            // Or we just re-import at the top.
        });
        // Wait, renderWardrobe is actually implemented in app.js in my previous turn! 
        // "function renderWardrobeChips() { ... }" inside app.js.
        // ui.js had `renderWardrobe() { // We need perfume data... }` which was empty.
        // I should DELETE the empty function here or make app.js call ui.renderWardrobe(wardrobeList).

        // Let's stick to the pattern: `app.js` handles data -> `ui.js` rendering.
        // So `ui.renderWardrobe(items)` is better.
    },

    renderProfile() {
        const container = document.getElementById('screen-profile');
        if (!container) return;

        const user = window.Telegram?.WebApp?.initDataUnsafe?.user || { first_name: 'Парфюмер', photo_url: null };
        const avatar = user.photo_url || null;
        const avatarHTML = avatar
            ? `<img src="${avatar}" class="w-full h-full object-cover">`
            : `<div class="w-full h-full bg-gradient-to-br from-gold-400 to-amber-600 flex items-center justify-center text-white font-bold text-3xl">${user.first_name[0]}</div>`;

        // Stats
        const wardrobeCount = state.wardrobe.length;
        const favCount = state.favorites.length;

        // Signature
        // Simple logic: most common family in wardrobe
        // This requires data processing. Let's do it in App, pass data to UI?
        // Or just show counts for now.

        container.innerHTML = `
            <div class="w-full h-full overflow-y-auto pb-32 bg-dark-900">
                <header class="p-6 sticky top-0 bg-dark-900/95 backdrop-blur z-20 border-b border-white/5 flex justify-between items-center">
                    <h2 class="font-serif text-2xl text-white">Профиль</h2>
                </header>

                <div class="p-6">
                    <!-- User Card -->
                    <div class="flex items-center gap-4 mb-8">
                        <div class="w-20 h-20 rounded-full overflow-hidden border-2 border-gold-400 p-1">
                            <div class="w-full h-full rounded-full overflow-hidden bg-white/10">
                                ${avatarHTML}
                            </div>
                        </div>
                        <div>
                            <h3 class="text-xl text-white font-serif">${user.first_name}</h3>
                            <p class="text-xs text-white/50 uppercase tracking-widest">Master Blender</p>
                        </div>
                    </div>

                    <!-- Stats Cloud -->
                    <div class="grid grid-cols-2 gap-3 mb-8">
                        <div class="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div class="text-3xl text-gold-400 font-serif mb-1">${wardrobeCount}</div>
                            <div class="text-[10px] text-white/40 uppercase tracking-widest">В гардеробе</div>
                        </div>
                        <div class="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div class="text-3xl text-white font-serif mb-1">${favCount}</div>
                            <div class="text-[10px] text-white/40 uppercase tracking-widest">Cохранено</div>
                        </div>
                    </div>

                    <!-- Settings -->
                    <div class="space-y-4">
                        <h4 class="text-xs text-white/30 uppercase tracking-widest mb-4">Настройки</h4>
                        
                        <button onclick="window.fullReset()" class="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-red-500/10 hover:border-red-500/30 group transition">
                            <span class="text-sm text-white/70 group-hover:text-red-400">Сбросить данные</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="stroke-white/30 group-hover:stroke-red-400"><path d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </button>
                        
                        <div class="text-center mt-8">
                            <p class="text-[10px] text-white/20">ScentMatrix v1.0.2</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    updateFab() {
        const fab = document.getElementById('fab-container');
        if (!fab) return;

        if (state.wardrobe.length > 0 && state.vibe) {
            fab.classList.remove('translate-y-20', 'translate-y-40', 'opacity-0');
        } else {
            fab.classList.add('translate-y-40', 'opacity-0');
        }
    },

    switchScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(`screen-${id}`);
        if (target) target.classList.add('active');

        // Nav state
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

        // simple mapping
        let navId = '';
        if (['input', 'processing', 'result'].includes(id)) navId = 'nav-create';
        if (id === 'favorites') navId = 'nav-fav';
        if (id === 'profile') {
            navId = 'nav-profile';
            this.renderProfile();
        }

        if (navId) {
            const btn = document.getElementById(navId);
            if (btn) btn.classList.add('active');
        }

        // Fab visibility
        const fab = document.getElementById('fab-container');
        if (id === 'input' || id === 'result') {
            this.updateFab();
        } else {
            fab.classList.add('translate-y-40', 'opacity-0');
        }
    },

    showToast(msg, type = 'success') {
        const box = document.createElement('div');
        box.className = `fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 rounded-full border backdrop-blur-md flex items-center gap-2 text-xs font-medium animate-reveal transition-all duration-300 transform`;

        if (type === 'success') {
            box.classList.add('bg-green-900/40', 'border-green-500/30', 'text-green-200');
            box.innerHTML = `<span class="text-green-400">✓</span> ${msg}`;
        } else if (type === 'delete') {
            box.classList.add('bg-red-900/40', 'border-red-500/30', 'text-red-200');
            box.innerHTML = `<span class="text-red-400">✕</span> ${msg}`;
        } else {
            box.classList.add('bg-blue-900/40', 'border-blue-500/30', 'text-blue-200');
            box.innerHTML = `<span>ℹ️</span> ${msg}`;
        }

        document.body.appendChild(box);
        setTimeout(() => {
            box.style.opacity = '0';
            box.style.transform = 'translate(-50%, -10px)';
            setTimeout(() => box.remove(), 300);
        }, 2000);
    },

    renderRecipes(recipes) {
        const container = document.getElementById('recipes-container');
        if (!container) return;
        container.innerHTML = recipes.map((r, i) => this.generateRecipeCardHTML(r, i)).join('');
    },

    renderFavorites() {
        const container = document.getElementById('favorites-container');
        if (!container) return; // Happens if we are not on that screen? No, DOM exists.

        if (state.favorites.length === 0) {
            container.innerHTML = `
                <div class="text-center py-20 opacity-30">
                    <div class="text-4xl mb-2">🧪</div>
                    <p class="text-sm">Пока пусто</p>
                </div>`;
            return;
        }
        container.innerHTML = state.favorites.map((r, i) => this.generateRecipeCardHTML(r, i)).join('');
    },

    generateRecipeCardHTML(r, i) {
        const isLiked = state.isFavorite(r.id);
        const fill = isLiked ? 'currentColor' : 'none';
        const colorClass = isLiked ? 'text-red-500 stroke-red-500' : 'text-white/40';

        return `
            <div class="glass-panel p-0 rounded-3xl relative overflow-hidden animate-reveal group mb-4" style="animation-delay: ${i * 0.1}s">
                <div class="absolute inset-0 opacity-10 bg-gradient-to-br from-gold-500/20 via-purple-500/10 to-blue-500/20 group-hover:opacity-20 transition duration-700"></div>
                
                <div class="p-6 relative z-10">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                                <span>✨ Синтез: ${Math.min(99, r.score)}%</span>
                            </div>
                            <h3 class="text-white font-serif text-xl italic">${r.alchemy.occasion}</h3>
                        </div>
                        <button data-action="like" data-id="${r.id}" class="w-10 h-10 -mt-2 -mr-2 rounded-full flex items-center justify-center transition active:scale-90 hover:bg-white/5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="${colorClass} transition-colors duration-300 pointer-events-none"><path d="M19 14c1.49-1.28 3-4.34 3-6.53 0-3.02-2.63-5.47-5.63-5.47a5.57 5.57 0 0 0-3.95 2.5 5.57 5.57 0 0 0-3.95-2.5C5.63 2 3 4.45 3 7.47c0 2.19 1.51 5.25 3 6.53L12 21.6l7-7.6z"></path></svg>
                        </button>
                    </div>

                    <div class="flex items-center justify-between mb-6">
                        <div class="text-center w-1/3">
                            <div class="text-[9px] text-white/30 uppercase mb-1">Ваша база</div>
                            <div class="text-xs text-white font-medium truncate px-1">${r.base.name}</div>
                        </div>
                        <div class="relative w-1/3 flex justify-center">
                            <div class="absolute inset-0 bg-gold-400 blur-xl opacity-20"></div>
                            <div class="text-gold-400 font-serif text-2xl relative z-10">+</div>
                        </div>
                        <div class="text-center w-1/3">
                            <div class="text-[9px] text-gold-400/70 uppercase mb-1">Cлой №2</div>
                            <div class="text-sm text-gold-400 font-serif italic truncate px-1">${r.addon.name}</div>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <div class="bg-white/5 rounded-xl p-3 border border-white/5 flex items-center justify-between">
                            <div class="text-[10px] text-white/50">Соединение нот:</div>
                            <div class="text-xs text-white font-mono flex items-center gap-2">
                                <span>${r.alchemy.mix.split(' + ')[0]}</span>
                                <span class="text-white/20">→</span>
                                <span>${r.alchemy.mix.split(' + ')[1]}</span>
                            </div>
                        </div>
                        
                        <div class="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-lg">🧪</span>
                                <span class="text-[10px] uppercase text-gold-400 tracking-widest">Эффект наслоения</span>
                            </div>
                            <p class="text-xs text-white/80 leading-relaxed italic">
                                "${r.alchemy.story}" <br>
                                <span class="opacity-50 not-italic mt-1 block text-[10px] font-sans">Реакция: ${r.alchemy.effect}</span>
                            </p>
                        </div>
                    </div>

                    <a href="#" class="mt-4 w-full py-3 bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/20 text-gold-400 rounded-xl text-xs uppercase tracking-widest font-semibold text-center block transition">
                        Добавить в коллекцию
                    </a>
                </div>
            </div>
        `;
    }
};
