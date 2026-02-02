import { state } from './state.js?v=4';
import { vibes } from './db.js?v=4';

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
            <button data-vibe="${v.id}" class="vibe-card relative h-32 rounded-[2rem] bg-white/5 border border-white/5 active:scale-95 text-left p-5 flex flex-col justify-between overflow-hidden group transition-all duration-300 hover:bg-white/10">
                <div class="absolute top-0 right-0 p-4 text-3xl opacity-30 group-hover:scale-125 group-hover:rotate-12 transition duration-500 origin-center grayscale group-hover:grayscale-0">${v.icon}</div>
                <div class="mt-auto relative z-10 w-full">
                    <div class="font-serif text-lg text-white mb-1 leading-tight group-hover:translate-x-1 transition">${v.name.split(' / ')[0]}</div>
                    <div class="text-[9px] text-white/30 uppercase tracking-widest leading-tight group-hover:text-gold-400 transition">${v.desc}</div>
                </div>
                <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>
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
        // Implementation is currently handled by app.js (renderWardrobeChips)
        // or delegated. Keeping this empty to prevent conflicts.
        const container = document.getElementById('wardrobe-chips');
        if (container && state.wardrobe.length === 0) {
            container.innerHTML = `<div class="w-full text-center py-4 border border-dashed border-white/10 rounded-xl text-[10px] text-white/30 animate-reveal">Ваш гардероб пуст. Добавьте ароматы выше.</div>`;
        }
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
            <div class="w-full h-full overflow-y-auto pb-32">
                <!-- Header Card -->
                <div class="sticky top-0 m-4 p-5 rounded-[2rem] glass-premium z-20 mb-8 relative overflow-hidden group">
                     <div class="absolute inset-0 bg-gradient-to-br from-gold-500/10 to-purple-500/10 opacity-50 group-hover:opacity-100 transition duration-700"></div>
                     <div class="absolute -top-10 -right-10 w-32 h-32 bg-gold-400/20 rounded-full blur-2xl"></div>

                    <div class="relative z-10 flex items-center gap-5">
                        <div class="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-gold-300 to-transparent">
                             <div class="w-full h-full rounded-full overflow-hidden bg-dark-900 border border-black relative">
                                ${avatarHTML}
                             </div>
                        </div>
                        <div>
                            <h3 class="text-2xl text-white font-serif italic">${user.first_name}</h3>
                            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-2 rounded-full bg-white/5 border border-white/5">
                                <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                <span class="text-[9px] text-white/50 uppercase tracking-widest">Online</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="px-6">
                    <!-- Stats Grid -->
                    <h4 class="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-4 pl-2">Статистика</h4>
                    <div class="grid grid-cols-2 gap-4 mb-10">
                        <div class="glass-premium p-5 rounded-3xl flex flex-col items-center justify-center gap-1 group hover:bg-white/5 transition">
                            <div class="text-3xl text-gold-300 font-serif group-hover:scale-110 transition duration-300">${wardrobeCount}</div>
                            <div class="text-[9px] text-white/40 uppercase tracking-widest text-center">Ароматов<br>в базе</div>
                        </div>
                        <div class="glass-premium p-5 rounded-3xl flex flex-col items-center justify-center gap-1 group hover:bg-white/5 transition">
                            <div class="text-3xl text-white font-serif group-hover:scale-110 transition duration-300">${favCount}</div>
                            <div class="text-[9px] text-white/40 uppercase tracking-widest text-center">Избранных<br>рецептов</div>
                        </div>
                    </div>

                    <!-- Actions -->
                    <h4 class="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-4 pl-2">Управление</h4>
                    <div class="space-y-3">
                        <button onclick="window.fullReset()" class="w-full p-4 rounded-2xl glass-premium flex items-center justify-between group hover:border-red-500/30 transition">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-red-500/10 transition">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="stroke-white/50 group-hover:stroke-red-400 transition"><path d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                </div>
                                <span class="text-sm text-white/60 group-hover:text-red-300 transition text-left">Сбросить<br>все данные</span>
                            </div>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="stroke-white/20 -rotate-90 group-hover:translate-x-1 transition"><path d="M6 9l6 6 6-6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </button>
                    </div>

                    <div class="text-center mt-12 mb-8">
                        <div class="w-12 h-1 bg-white/5 mx-auto rounded-full mb-4"></div>
                        <p class="text-[10px] text-white/20 tracking-widest">SCENTMATRIX v3.0 // BETA</p>
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
        if (id === 'input') {
            this.updateFab();
        } else {
            fab.classList.add('translate-y-40', 'opacity-0');
        }
    },

    showToast(msg, type = 'success') {
        const box = document.createElement('div');
        // Glass premium toast with blur and border
        box.className = `fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl glass-premium flex items-center gap-3 text-xs font-medium animate-reveal transition-all duration-300 transform shadow-2xl`;

        if (type === 'success') {
            box.classList.add('border-green-500/20');
            box.innerHTML = `<div class="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">✓</div> <span class="text-white/90">${msg}</span>`;
        } else if (type === 'delete') {
            box.classList.add('border-red-500/20');
            box.innerHTML = `<div class="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">✕</div> <span class="text-white/90">${msg}</span>`;
        } else {
            box.classList.add('border-blue-500/20');
            box.innerHTML = `<span class="text-blue-200">ℹ️ ${msg}</span>`;
        }

        document.body.appendChild(box);
        setTimeout(() => {
            box.style.opacity = '0';
            box.style.transform = 'translate(-50%, -20px) scale(0.95)';
            setTimeout(() => box.remove(), 400);
        }, 2500);
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
            <div class="glass-premium p-0 rounded-[2rem] relative overflow-hidden animate-reveal group mb-6" style="animation-delay: ${i * 0.15}s">
                <!-- Ambient Glow -->
                <div class="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-gold-500/20 transition duration-1000"></div>
                <div class="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-[50px] translate-y-1/2 -translate-x-1/2 group-hover:bg-purple-500/20 transition duration-1000"></div>
                
                <div class="p-8 relative z-10">
                    <!-- Header -->
                    <div class="flex justify-between items-start mb-8">
                        <div>
                            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/5 border border-gold-400/10 backdrop-blur-md mb-3">
                                <span class="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse"></span>
                                <span class="text-[9px] text-gold-300 font-bold uppercase tracking-widest">Match: ${Math.min(99, r.score)}%</span>
                            </div>
                            <h3 class="text-white font-serif text-3xl italic leading-none text-gradient-gold">${r.alchemy.title || r.alchemy.occasion || 'Уникальный Микс'}</h3>
                        </div>
                        <button data-action="like" data-id="${r.id}" class="w-12 h-12 -mt-2 -mr-2 rounded-full flex items-center justify-center transition active:scale-90 hover:bg-white/5 group/btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="${colorClass} transition-colors duration-300 group-hover/btn:scale-110"><path d="M19 14c1.49-1.28 3-4.34 3-6.53 0-3.02-2.63-5.47-5.63-5.47a5.57 5.57 0 0 0-3.95 2.5 5.57 5.57 0 0 0-3.95-2.5C5.63 2 3 4.45 3 7.47c0 2.19 1.51 5.25 3 6.53L12 21.6l7-7.6z"></path></svg>
                        </button>
                    </div>

                    <!-- Ingredients -->
                    <div class="flex items-center justify-between mb-8 relative">
                        <!-- Line Connector -->
                        <div class="absolute top-1/2 left-10 right-10 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                        <div class="text-center relative z-10 bg-dark-900/10 backdrop-blur-sm px-2 rounded-lg">
                            <div class="w-12 h-12 mx-auto rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-3 text-lg shadow-lg">🪵</div>
                            <div class="text-[9px] text-white/30 uppercase tracking-widest mb-1">Основа</div>
                            <div class="text-sm text-white font-serif truncate max-w-[100px] leading-tight">${r.base.name}</div>
                            <div class="text-[8px] text-white/40 uppercase tracking-wider truncate max-w-[100px] mt-1">${r.base.brand}</div>
                        </div>

                        <div class="relative z-10 bg-dark-800 rounded-full w-8 h-8 flex items-center justify-center border border-gold-500/30 text-gold-400 font-serif shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                            +
                        </div>

                        <div class="text-center relative z-10 bg-dark-900/10 backdrop-blur-sm px-2 rounded-lg">
                            <div class="w-12 h-12 mx-auto rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-3 text-lg shadow-lg">🌸</div>
                            <div class="text-[9px] text-gold-400/60 uppercase tracking-widest mb-1">Слой</div>
                            <div class="text-sm text-gold-400 font-serif italic truncate max-w-[100px] leading-tight">${r.addon.name}</div>
                            <div class="text-[8px] text-gold-400/40 uppercase tracking-wider truncate max-w-[100px] mt-1">${r.addon.brand}</div>
                        </div>
                    </div>

                    <!-- Description Box -->
                    <div class="glass-panel p-5 rounded-2xl border-l-[3px] border-l-gold-500/50 mb-6">
                        <div class="flex items-center gap-2 mb-3 opacity-60">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="stroke-gold-400"><path d="M2 12h20M12 2v20" stroke-width="2" stroke-linecap="round"/></svg>
                            <span class="text-[9px] uppercase tracking-widest text-white">Эффект</span>
                        </div>
                        <p class="text-sm text-white/80 leading-relaxed font-light">
                            <span class="block mb-2 italic text-lg">"${r.alchemy.story}"</span>
                            <span class="text-xs text-white/40 font-sans">Химия: ${r.alchemy.effect}</span>
                        </p>
                    </div>

                    </div>
                </div>
            </div>
        `;
    }
};
