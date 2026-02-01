import { state } from './state.js?v=4';
import { perfumeDB, alchemyStories, alchemyEffects, celebrities } from './db.js?v=4';
import { ui } from './ui.js?v=4';

// --- CONTROLLER ---

// 1. Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Telegram Init
    if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.setHeaderColor('#050505');
        window.Telegram.WebApp.setBackgroundColor('#050505');
    }

    // Load State
    state.load();
    ui.init();
    renderCelebrities();
    renderWardrobeChips(); // specific render using DB

    // Listeners
    setupEventListeners();

    // Intro
    setTimeout(() => {
        ui.switchScreen('input');
    }, 2500);
});

// 2. Event Listeners
function setupEventListeners() {
    // Nav Buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = btn.dataset.target; // we will add data-target to HTML
            // map old onclicks too if needed, but cleaner to use data attrs
        });
    });

    // Vibe Selection (Delegation)
    document.addEventListener('click', (e) => {
        const vibeCard = e.target.closest('.vibe-card');
        if (vibeCard) {
            const id = vibeCard.dataset.vibe;
            state.setVibe(id);
            ui.highlightVibe(id);
            ui.updateFab();
        }

        // Like Button (Delegation)
        const likeBtn = e.target.closest('button[data-action="like"]');
        if (likeBtn) {
            e.preventDefault();
            const id = likeBtn.dataset.id;
            // Find full recipe object? 
            // We store recipes in state.recipes.
            // If it's from Favorites screen, it's in state.favorites.
            let recipe = state.recipes.find(r => r.id === id);

            // If not in generated recipes, maybe it's already in favorites (and we are unliking from favorites screen)
            if (!recipe) {
                recipe = state.favorites.find(r => r.id === id);
            }

            if (recipe) {
                const added = state.toggleFavorite(recipe);

                // Visual feedback
                const svg = likeBtn.querySelector('svg');
                if (added) {
                    svg.setAttribute('fill', 'currentColor');
                    svg.classList.remove('text-white/40');
                    svg.classList.add('text-red-500', 'stroke-red-500');
                    likeBtn.classList.add('scale-110');
                    setTimeout(() => likeBtn.classList.remove('scale-110'), 200);
                    ui.showToast('Сохранено в избранное', 'success');
                } else {
                    svg.setAttribute('fill', 'none');
                    svg.classList.remove('text-red-500', 'stroke-red-500');
                    svg.classList.add('text-white/40');
                    ui.showToast('Удалено из избранного', 'delete');

                    // If on Favorites screen, refresh
                    if (document.getElementById('screen-favorites').classList.contains('active')) {
                        ui.renderFavorites();
                    }
                }
            }
        }

        // Wardrobe Remove (Delegation)
        const removeBtn = e.target.closest('button[data-action="remove-wardrobe"]');
        if (removeBtn) {
            const id = parseInt(removeBtn.dataset.id);
            state.removeFromWardrobe(id);
            renderWardrobeChips();
            ui.updateFab();
        }
    });

    // Search
    const searchInput = document.getElementById('perfume-search');
    const resultsBox = document.getElementById('search-results');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            console.log('Search:', query); // Debugging

            // Clean state if query is too short
            if (query.length < 1) {
                resultsBox.classList.add('hidden');
                resultsBox.innerHTML = '';
                return;
            }

            // Filter
            const matches = perfumeDB.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.brand.toLowerCase().includes(query)
            );

            // Show results or 'Not found'
            resultsBox.classList.remove('hidden');

            if (matches.length > 0) {
                resultsBox.innerHTML = matches.map(p => `
                    <div class="px-4 py-3 hover:bg-white/5 cursor-pointer flex justify-between items-center group transition" data-add-id="${p.id}">
                        <div>
                            <div class="text-sm text-white group-hover:text-gold-400 transition font-medium">${p.name}</div>
                            <div class="text-[10px] text-white/40 group-hover:text-white/60">${p.brand}</div>
                        </div>
                        <div class="text-xs text-gold-400 opacity-0 group-hover:opacity-100 transition transform translate-x-2 group-hover:translate-x-0">+</div>
                    </div>
                `).join('');

                // Re-attach listeners to new elements
                resultsBox.querySelectorAll('[data-add-id]').forEach(el => {
                    el.addEventListener('click', (ev) => {
                        ev.stopPropagation(); // Prevent bubbling issues
                        const id = parseInt(el.dataset.addId);
                        state.addToWardrobe(id);
                        renderWardrobeChips();
                        ui.updateFab();

                        // Clear and hide
                        searchInput.value = '';
                        resultsBox.classList.add('hidden');
                        resultsBox.innerHTML = '';
                    });
                });
            } else {
                resultsBox.innerHTML = `
                    <div class="px-4 py-4 text-center">
                        <div class="text-sm text-white/40 italic">Ничего не найдено</div>
                        <div class="text-[10px] text-white/20 mt-1">Попробуйте ввести название на английском</div>
                    </div>
                `;
            }
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !resultsBox.contains(e.target)) {
                resultsBox.classList.add('hidden');
            }
        });
    }
}

// 3. Logic Helpers
function renderCelebrities() {
    const container = document.querySelector('.overflow-x-auto .flex'); // Target the container inside the scroll wrapper
    if (!container) return;

    // We assume 'celebrities' is imported. Check top of file.
    // If not, we need to import it. Let's assume we fix imports separately or access via db.js which we imported fully.
    // Wait, import { perfumeDB, alchemyStories, alchemyEffects } from './db.js'; was at top.
    // I need to update the import in app.js as well!

    // For now, let's just use the 'celebrities' if they are exported from db.js
    // I will need to update the import line at the top of app.js in a separate edit or assume the user accepts "magic" if I don't.
    // But I must be correct. The previous step updated db.js. This step updates app.js logic.
    // I will dynamically generate HTML.

    // Actually, I can't easily change the import line "at line 2" with this tool usage unless I target top of file.
    // Let's do that in a sec. First, defining the function.

    // To avoid "celebrities is not defined", I will fetch it from a global or re-import it if I were rewriting the whole file.
    // Since I am patching, I will assume I will fix the import in the next step.

    /* 
       Wait, I can just use `import(./db.js)` dynamically? No, top level only.
       I will execute a replace on line 2 to add 'celebrities' to the import list.
    */

    // Let's write the function content assuming 'celebrities' is available.

    container.innerHTML = celebrities.map(celeb => `
        <div class="snap-center shrink-0 w-64 glass-panel p-4 rounded-2xl border border-white/5 relative group cursor-pointer hover:border-gold-400/30 transition">
            <div class="flex items-center gap-3 mb-3">
                <div class="w-10 h-10 rounded-full bg-white/10 overflow-hidden">
                    <img src="${celeb.image}" class="w-full h-full object-cover">
                </div>
                <div>
                    <div class="text-sm font-serif text-white">${celeb.name}</div>
                    <div class="text-[9px] text-white/40 uppercase">${celeb.vibe}</div>
                </div>
            </div>
            <div class="space-y-2 text-[10px] text-white/70">
                <div class="flex items-center gap-2 bg-white/5 p-1.5 rounded-lg">
                    <span class="w-1.5 h-1.5 rounded-full ${celeb.mix[0].color}"></span> ${celeb.mix[0].name}
                </div>
                <div class="flex justify-center text-gold-400 text-xs">+</div>
                <div class="flex items-center gap-2 bg-white/5 p-1.5 rounded-lg">
                    <span class="w-1.5 h-1.5 rounded-full ${celeb.mix[1].color}"></span> ${celeb.mix[1].name}
                </div>
            </div>
            <p class="mt-3 text-[10px] italic text-white/50 leading-tight">"${celeb.quote}"</p>
        </div>
    `).join('');
}

function renderWardrobeChips() {
    const container = document.getElementById('wardrobe-chips');
    if (!container) return;

    container.innerHTML = '';

    if (state.wardrobe.length === 0) {
        container.innerHTML = `<div class="w-full text-center py-4 border border-dashed border-white/10 rounded-xl text-[10px] text-white/30 animate-reveal">Ваш гардероб пуст. Добавьте ароматы выше.</div>`;
        return;
    }

    state.wardrobe.forEach(id => {
        const p = perfumeDB.find(x => x.id === id);
        if (!p) return;

        const chip = document.createElement('div');
        chip.className = 'inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full pl-3 pr-2 py-1.5 animate-reveal';
        chip.innerHTML = `
            <span class="text-xs text-white">${p.name}</span>
            <button data-action="remove-wardrobe" data-id="${id}" class="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
                <svg width="8" height="8" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3" class="pointer-events-none"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
        `;
        container.appendChild(chip);
    });
}

window.startSynthesis = function () {
    if (state.wardrobe.length === 0 || !state.vibe) return;
    ui.switchScreen('processing');

    const logs = document.getElementById('processing-log');
    const messages = ["Анализ молекулярной структуры...", "Поиск гармоничных контрастов...", "Синтез ольфакторной пирамиды...", "Финализация рецепта..."];

    logs.innerHTML = '';
    messages.forEach((msg, i) => {
        setTimeout(() => {
            logs.innerHTML = `<div class="animate-reveal text-gold-400">${msg}</div>`;
        }, i * 800);
    });

    setTimeout(() => {
        generateRecipes();
        ui.switchScreen('result');
    }, 3500);
};

window.switchTab = function (screenId) {
    ui.switchScreen(screenId);
};

window.resetApp = function () {
    state.reset(); // only resets flow
    renderWardrobeChips();
    ui.highlightVibe(null); // Clear highlight
    ui.updateFab();
    ui.switchScreen('input');
};

window.fullReset = function () {
    if (confirm('Вы уверены? Это удалит всю вашу коллекцию и гардероб.')) {
        state.reset();
        state.favorites = [];
        state.save(); // Save empty
        location.reload();
    }
};

function generateRecipes() {
    const userParams = perfumeDB.filter(p => state.wardrobe.includes(p.id));
    const candidates = perfumeDB.filter(p => !state.wardrobe.includes(p.id));

    let recipes = [];

    userParams.forEach(u => {
        candidates.forEach(c => {
            let score = 0;
            if (c.vibes.includes(state.vibe)) score += 40;
            if (u.family !== c.family) score += 20;
            const shared = u.notes.filter(n => c.notes.includes(n));
            if (shared.length > 0) score += 15;

            const alchemy = getAlchemyDescription(u, c, state.vibe);

            recipes.push({
                id: `${u.id}-${c.id}`,
                base: u,
                addon: c,
                score: score + Math.floor(Math.random() * 15),
                alchemy: alchemy
            });
        });
    });

    recipes.sort((a, b) => b.score - a.score);
    const topRecipes = recipes.slice(0, 3);
    state.setRecipes(topRecipes);
    ui.renderRecipes(topRecipes);
}

function getAlchemyDescription(base, addon, vibe) {
    const baseNote = base.notes[base.notes.length - 1];
    const topNote = addon.notes[0];

    const effect = alchemyEffects[base.family]?.[addon.family] || 'уникальный контраст';

    return {
        mix: `${baseNote} + ${topNote}`,
        effect: effect,
        story: alchemyStories[vibe]?.text || "Гармоничное сочетание для вашего образа.",
        occasion: alchemyStories[vibe]?.occasion || "На каждый день"
    };
}
