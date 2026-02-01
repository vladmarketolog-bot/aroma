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
        const likeBtn = e.target.closest('[data-action="like"]');
        if (likeBtn) {
            e.preventDefault();
            const id = likeBtn.dataset.id;
            // Find full recipe in generated recipes OR favorites (if unliking from collection)
            let recipe = state.recipes.find(r => r.id === id);
            if (!recipe) {
                recipe = state.favorites.find(r => r.id === id);
            }

            if (recipe) {
                const added = state.toggleFavorite(recipe);

                // Update UI on ALL buttons for this card (Heart + Main Button)
                const card = likeBtn.closest('.glass-panel');
                if (card) {
                    // 1. Update Heart
                    const heartBtn = card.querySelector('button[data-action="like"].w-10');
                    if (heartBtn) {
                        const svg = heartBtn.querySelector('svg');
                        if (added) {
                            svg.setAttribute('fill', 'currentColor');
                            svg.classList.remove('text-white/40');
                            svg.classList.add('text-red-500', 'stroke-red-500');
                            heartBtn.classList.add('scale-110');
                            setTimeout(() => heartBtn.classList.remove('scale-110'), 200);
                        } else {
                            svg.setAttribute('fill', 'none');
                            svg.classList.remove('text-red-500', 'stroke-red-500');
                            svg.classList.add('text-white/40');
                        }
                    }

                    // 2. Update Big Button
                    const bigBtn = card.querySelector('button[data-action="like"].w-full');
                    if (bigBtn) {
                        if (added) {
                            bigBtn.classList.remove('bg-gold-500/10', 'hover:bg-gold-500/20', 'border-gold-500/20', 'text-gold-400');
                            bigBtn.classList.add('bg-green-500/20', 'text-green-400', 'border-green-500/20');
                            bigBtn.textContent = 'Сохранено в коллекции';
                        } else {
                            bigBtn.classList.add('bg-gold-500/10', 'hover:bg-gold-500/20', 'border-gold-500/20', 'text-gold-400');
                            bigBtn.classList.remove('bg-green-500/20', 'text-green-400', 'border-green-500/20');
                            bigBtn.textContent = 'Добавить в коллекцию';
                        }
                    }
                }

                ui.showToast(added ? 'Сохранено в избранное' : 'Удалено из избранного', added ? 'success' : 'delete');

                // Refresh if on Favorites screen
                if (!added && document.getElementById('screen-favorites').classList.contains('active')) {
                    ui.renderFavorites();
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
    const container = document.getElementById('celebrities-container');
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
        <div class="snap-center shrink-0 w-72 glass-premium p-0 rounded-3xl relative group cursor-pointer overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-gold-900/10">
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10 opacity-90"></div>
            <img src="${celeb.image}" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100">
            
            <div class="relative z-20 p-6 flex flex-col h-[380px] justify-end">
                <div class="mb-auto pt-2">
                    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/5 mb-3">
                        <span class="w-1.5 h-1.5 rounded-full ${celeb.mix[0].color} animate-pulse"></span>
                        <span class="text-[9px] text-white/90 uppercase tracking-wider">${celeb.vibe}</span>
                    </div>
                </div>

                <h3 class="font-serif text-3xl text-white italic mb-1 leading-none">${celeb.name}</h3>
                <div class="w-10 h-0.5 bg-gold-500/50 mb-4 rounded-full"></div>
                
                <p class="text-xs text-white/60 font-light leading-relaxed mb-4 line-clamp-2">"${celeb.quote}"</p>
                
                <div class="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest">
                    <span>${celeb.mix[0].name}</span>
                    <span class="text-gold-400">+</span>
                    <span>${celeb.mix[1].name}</span>
                </div>
            </div>
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

const FAMILY_MAP = {
    // Woody Archetype
    'Woody': 'Woody', 'Leather': 'Woody', 'Fougère': 'Woody', 'Chypre': 'Woody', 'Tobacco': 'Woody',
    // Floral Archetype
    'Floral': 'Floral',
    // Citrus/Fresh Archetype
    'Citrus': 'Citrus', 'Fresh': 'Citrus', 'Green': 'Citrus', 'Aromatic': 'Citrus', 'Sea': 'Citrus', 'Water': 'Citrus',
    // Gourmand Archetype
    'Gourmand': 'Gourmand', 'Fruity': 'Gourmand', 'Boozy': 'Gourmand', 'Sweet': 'Gourmand', 'Amber': 'Gourmand', 'Oriental': 'Gourmand', 'Spicy': 'Gourmand',
    // Clean Archetype
    'Clean': 'Clean', 'Musk': 'Clean', 'Aldehyde': 'Clean', 'Soapy': 'Clean'
};

function getAlchemyDescription(base, addon, vibe) {
    const baseNote = base.notes[base.notes.length - 1]; // Pick a base note
    const topNote = addon.notes[0]; // Pick a top note

    // Normalize families to use our effects matrix
    const baseArch = FAMILY_MAP[base.family] || 'Woody';
    const addonArch = FAMILY_MAP[addon.family] || 'Floral';

    // Try lookup both ways or direct
    let effect = alchemyEffects[baseArch]?.[addonArch];

    // If not found, try varying the fallback or using a generic "Complex" one
    if (!effect) {
        // Fallback for same-family layering
        if (baseArch === addonArch) {
            effect = `усиление ${baseArch.toLowerCase()} нот`;
        } else {
            effect = 'уникальный контраст';
        }
    }

    return {
        mix: `${baseNote} + ${topNote}`,
        effect: effect,
        story: alchemyStories[vibe]?.text || "Гармоничное сочетание для вашего образа.",
        occasion: alchemyStories[vibe]?.occasion || "На каждый день"
    };
}
