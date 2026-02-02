import { state } from './state.js?v=4';
import { perfumeDB, celebrities } from './db.js?v=4';
import { ui } from './ui.js?v=4';
import { NOTE_VOLATILITY, FAMILY_HARMONY, MAGIC_DUOS, EFFECT_TITLES } from './olfactory_data.js?v=1';

window.ui = ui;

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
            if (!recipe && labState?.currentResult?.id === id) {
                recipe = labState.currentResult;
            }

            if (recipe) {
                const added = state.toggleFavorite(recipe);

                // Direct UI Update for the Heart Button
                const svg = likeBtn.querySelector('svg');
                if (svg) {
                    if (added) {
                        svg.setAttribute('fill', 'currentColor');
                        svg.classList.remove('text-white/40');
                        svg.classList.add('text-red-500', 'stroke-red-500');

                        // Pulse animation
                        likeBtn.classList.add('scale-125');
                        setTimeout(() => likeBtn.classList.remove('scale-125'), 200);

                        ui.showToast('Рецепт сохранен!', 'success');
                    } else {
                        svg.setAttribute('fill', 'none');
                        svg.classList.remove('text-red-500', 'stroke-red-500');
                        svg.classList.add('text-white/40');
                        ui.showToast('Удалено из коллекции', 'delete');
                    }
                }

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

        // Share Button (Delegation)
        const shareBtn = e.target.closest('button[data-action="share"]');
        if (shareBtn) {
            e.stopPropagation();
            const id = shareBtn.dataset.id;
            let recipe = state.recipes.find(r => r.id === id);
            if (!recipe) recipe = state.favorites.find(r => r.id === id);
            if (!recipe && labState?.currentResult?.id === id) recipe = labState.currentResult;

            if (recipe) {
                const title = recipe.alchemy.title;
                const text = `✨ ScentMatrix Mix: ${title}\n\n🧪 ${recipe.base.name} + ${recipe.addon.name}\n📝 ${recipe.alchemy.story}\n\nСоздано в ScentMatrix AI\n👉 @scentmatrix_bot`;

                if (window.Telegram?.WebApp?.initData) {
                    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent('https://t.me/scentmatrix_bot/app')}&text=${encodeURIComponent(text)}`;
                    window.Telegram.WebApp.openTelegramLink(shareUrl);
                } else if (navigator.share) {
                    navigator.share({
                        title: 'ScentMatrix Mix',
                        text: text
                    }).catch(console.error);
                } else {
                    navigator.clipboard.writeText(text).then(() => {
                        ui.showToast('Ссылка скопирована', 'success');
                    });
                }
            }
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
                    <div class="px-5 py-4 hover:bg-white/5 cursor-pointer flex justify-between items-center group transition active:bg-white/10" data-add-id="${p.id}">
                        <div>
                            <div class="text-base text-white group-hover:text-gold-400 transition font-serif italic">${p.name}</div>
                            <div class="text-[10px] text-white/30 uppercase tracking-widest group-hover:text-white/50">${p.brand}</div>
                        </div>
                        <div class="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-gold-400 opacity-0 group-hover:opacity-100 transition transform translate-x-4 group-hover:translate-x-0">
                            <span class="text-lg leading-none">+</span>
                        </div>
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
                
                <div class="grid grid-cols-[1fr_auto_1fr] gap-3 items-center w-full mt-2 border-t border-white/5 pt-3">
                    <div class="text-left">
                        <div class="text-[9px] text-white font-bold tracking-wider uppercase leading-tight">${celeb.mix[0].name}</div>
                        <div class="text-[8px] text-white/50 uppercase tracking-wide mt-0.5 leading-tight">${celeb.mix[0].brand}</div>
                    </div>
                    <div class="text-gold-400 font-serif text-lg italic">+</div>
                    <div class="text-right">
                        <div class="text-[9px] text-white font-bold tracking-wider uppercase leading-tight">${celeb.mix[1].name}</div>
                        <div class="text-[8px] text-white/50 uppercase tracking-wide mt-0.5 leading-tight">${celeb.mix[1].brand}</div>
                    </div>
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
            const msgEl = document.createElement('div');
            msgEl.className = 'animate-reveal text-gold-400 mb-1';
            msgEl.textContent = msg;
            logs.appendChild(msgEl);
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

// --- OLFACTIVE ENGINE 2.0 ---

function generateRecipes() {
    const userParams = perfumeDB.filter(p => state.wardrobe.includes(p.id));
    const candidates = perfumeDB.filter(p => !state.wardrobe.includes(p.id));

    let recipes = [];

    // Safety check
    if (userParams.length === 0) {
        // If wardrobe empty, maybe show random highly rated ones or nothing
        return;
    }

    userParams.forEach(basePerfume => {
        candidates.forEach(addonPerfume => {
            let score = 0;
            let tags = [];
            let alchemyType = 'Neutral'; // Bridge, Contrast, Enhance
            let dynamicTitle = "";
            let description = "";

            // 1. FAMILY HARMONY (Base Score: 0-20)
            const harmonyScore = FAMILY_HARMONY[basePerfume.family]?.[addonPerfume.family] || 5;
            score += harmonyScore * 2;

            if (harmonyScore >= 9) tags.push("🔥 Химия семейств");

            // 2. NOTE BRIDGE (Connection)
            const sharedNotes = basePerfume.notes.filter(n => addonPerfume.notes.includes(n));
            if (sharedNotes.length > 0) {
                score += 30;
                alchemyType = 'Bridge';
                tags.push(`✨ Связь: ${sharedNotes[0]}`);
                description = `Ароматы соединяются через ноту ${sharedNotes[0]}.`;
            }

            // 3. MAGIC DUO
            const allNotes = [...basePerfume.notes, ...addonPerfume.notes];
            const magic = MAGIC_DUOS.find(duo => {
                const hasAll = duo.notes.every(n => allNotes.some(an => an.includes(n)));
                if (!hasAll) return false;

                // Anti-Boring Check: Ensure the duo isn't just one perfume
                const inP1 = duo.notes.every(n => basePerfume.notes.some(an => an.includes(n)));
                const inP2 = duo.notes.every(n => addonPerfume.notes.some(an => an.includes(n)));

                return !inP1 && !inP2; // Only valid if it requires BOTH
            });

            if (magic) {
                score += 50;
                dynamicTitle = magic.name;
                description = magic.desc;
                tags.push("🏆 Золотой Дуэт");
            }

            // 4. STRUCTURAL BALANCE
            score += analyzeStructure(basePerfume, addonPerfume);

            // 5. VIBE CHECK
            if (state.vibe) {
                if (addonPerfume.vibes.includes(state.vibe)) score += 25;
            }

            // --- FINAL ASSEMBLY ---
            if (!dynamicTitle) {
                const titles = EFFECT_TITLES[alchemyType in EFFECT_TITLES ? alchemyType : 'Contrast'];
                // Safety check for titles array
                if (titles && titles.length) {
                    dynamicTitle = titles[Math.floor(Math.random() * titles.length)];
                } else {
                    dynamicTitle = "Смелый Микс";
                }
            }

            if (!description) {
                if (alchemyType === 'Bridge') description = `Гармоничное продолжение ${basePerfume.name}.`;
                else description = `Смелый контраст текстур.`;
            }

            // Generate simple Alchemy object compatible with UI
            const alchemy = {
                mix: `${basePerfume.notes[0]} + ${addonPerfume.notes[0]}`, // Visual simplification
                effect: tags[0] || "Гармония",
                story: description,
                // We add our new fields too if UI wants to use them later
                title: dynamicTitle,
                tags: tags,
                type: alchemyType // Persist type for logic
            };

            // Dynamic Match % calculation
            // Wider spread: 60% - 99% to show real difference
            const normalizedScore = Math.min(1, score / 120);
            const chaos = Math.random() * 5; // 0-5% variance
            // Base 60 + up to 35 from score + chaos -> Max ~100 clamped to 99
            const matchValue = 60 + (normalizedScore * 35) + chaos;

            recipes.push({
                id: `${basePerfume.id}-${addonPerfume.id}`,
                base: basePerfume,
                addon: addonPerfume,
                score: score,
                matchPercent: Math.min(99, Math.floor(matchValue)),
                alchemy: alchemy
            });
        });
    });

    recipes.sort((a, b) => b.matchPercent - a.matchPercent);

    // Filter for unique titles/variety
    const uniqueRecipes = [];
    const usedTitles = new Set();

    for (const r of recipes) {
        if (uniqueRecipes.length >= 10) break;

        // If title already exists, try to fallback to a generic one
        if (usedTitles.has(r.alchemy.title)) {
            // Force a generic contrast/bridge title instead of the Magic Duo one
            const typeKey = r.alchemy.type === 'Bridge' ? 'Bridge' : 'Contrast';
            const titles = EFFECT_TITLES[typeKey];

            if (titles) {
                // Try to find an unused title in the list
                const freshTitle = titles.find(t => !usedTitles.has(t));
                if (freshTitle) {
                    r.alchemy.title = freshTitle;
                    // Also update story to match generic nature if it was specific
                    r.alchemy.story = r.alchemy.type === 'Bridge'
                        ? `Гармоничное слияние нот ${r.base.notes[0]} и ${r.addon.notes[0]}.`
                        : `Интригующая игра оттенков ${r.base.family} и ${r.addon.family}.`;
                } else {
                    continue; // Skip if we really can't find a unique name
                }
            } else {
                continue;
            }
        }

        usedTitles.add(r.alchemy.title);
        uniqueRecipes.push(r);
    }

    state.setRecipes(uniqueRecipes);
    ui.renderRecipes(uniqueRecipes);
}

function analyzeStructure(p1, p2) {
    const getVol = (p) => p.notes.map(n => NOTE_VOLATILITY[n] || 'heart');
    const v1 = getVol(p1);
    const v2 = getVol(p2);

    const hasBase = v1.includes('base') || v2.includes('base');
    const hasTop = v1.includes('top') || v2.includes('top');

    if (hasBase && hasTop) {
        return 15;
    }
    return 0;
}

// --- LAB LOGIC ---

let labState = {
    slot1: null,
    slot2: null,
    currentSlot: 1
};

window.openLabPicker = function (slot) {
    labState.currentSlot = slot;
    document.getElementById('lab-picker').classList.remove('translate-y-full');
    renderLabList();
    // Focus search
    setTimeout(() => document.getElementById('lab-search')?.focus(), 100);
};

window.closeLabPicker = function () {
    document.getElementById('lab-picker').classList.add('translate-y-full');
};

window.resetLab = function () {
    labState.slot1 = null;
    labState.slot2 = null;
    updateLabUI();
    document.getElementById('lab-result').innerHTML = '';
    document.getElementById('lab-result').classList.add('hidden');
    document.getElementById('lab-mix-btn').classList.add('pointer-events-none');
    document.getElementById('lab-mix-btn').classList.remove('bg-gradient-to-r', 'from-gold-500', 'to-gold-400', 'text-black', 'shadow-lg');
    document.getElementById('lab-mix-btn').classList.add('bg-white/5', 'text-white/20');
};

function renderLabList(filter = '') {
    const list = document.getElementById('lab-list');
    if (!list) return;

    const filtered = perfumeDB.filter(p =>
        p.name.toLowerCase().includes(filter.toLowerCase()) ||
        p.brand.toLowerCase().includes(filter.toLowerCase())
    );

    list.innerHTML = filtered.map(p => `
        <button onclick="selectLabItem('${p.id}')" class="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 active:bg-white/10 transition text-left mb-2">
            <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-lg">${getIconForFamily(p.family)}</div>
            <div>
                <div class="text-white font-serif text-sm">${p.name}</div>
                <div class="text-white/40 text-[10px] uppercase">${p.brand}</div>
            </div>
        </button>
    `).join('');
}

function getIconForFamily(family) {
    const map = {
        'Floral': '🌸', 'Oriental': '🏺', 'Woody': '🪵', 'Fresh': '💧', 'Citrus': '🍋', 'Fougere': '🌿', 'Leather': '👞', 'Chypre': '🌳'
    };
    return map[family] || '✨';
}

window.selectLabItem = function (id) {
    const numericId = Number(id);
    const p = perfumeDB.find(x => x.id === numericId);
    if (!p) return;

    if (labState.currentSlot === 1) labState.slot1 = p;
    else labState.slot2 = p;

    updateLabUI();
    closeLabPicker();
};

function updateLabUI() {
    [1, 2].forEach(i => {
        const p = labState[`slot${i}`];
        const preview = document.getElementById(`lab-preview-${i}`);

        if (p) {
            preview.classList.remove('hidden');
            preview.classList.add('flex');
            document.getElementById(`lab-name-${i}`).innerText = p.name;
            document.getElementById(`lab-brand-${i}`).innerText = p.brand;
            // Use Icon instead of Image
            document.getElementById(`lab-icon-${i}`).innerText = getIconForFamily(p.family);
        } else {
            preview.classList.add('hidden');
            preview.classList.remove('flex');
        }
    });

    const btn = document.getElementById('lab-mix-btn');
    if (labState.slot1 && labState.slot2) {
        btn.classList.remove('pointer-events-none', 'bg-white/5', 'text-white/20');
        btn.classList.add('bg-gradient-to-r', 'from-gold-500', 'to-gold-400', 'text-black', 'shadow-lg');
    } else {
        btn.classList.add('pointer-events-none', 'bg-white/5', 'text-white/20');
        btn.classList.remove('bg-gradient-to-r', 'from-gold-500', 'to-gold-400', 'text-black', 'shadow-lg');
    }
}

// Search listener
document.getElementById('lab-search')?.addEventListener('input', (e) => {
    renderLabList(e.target.value);
});


// CORE LOGIC
window.calculateLabMix = function () {
    const p1 = labState.slot1;
    const p2 = labState.slot2;
    if (!p1 || !p2) return;

    // Reuse logic from generateRecipes roughly
    let score = 0;
    let tags = [];
    let alchemyType = 'Neutral';
    let dynamicTitle = "";
    let description = "";

    // 1. Harmony
    const harmonyScore = FAMILY_HARMONY[p1.family]?.[p2.family] || 5;
    score += harmonyScore * 2;
    if (harmonyScore >= 9) tags.push("🔥 Химия семейств");

    // 2. Bridge
    const sharedNotes = p1.notes.filter(n => p2.notes.includes(n));
    if (sharedNotes.length > 0) {
        score += 30;
        alchemyType = 'Bridge';
        tags.push(`✨ Связь: ${sharedNotes[0]}`);
        description = `Ароматы соединяются через ноту ${sharedNotes[0]}.`;
    }

    // 3. Magic
    const allNotes = [...p1.notes, ...p2.notes];
    const magic = MAGIC_DUOS.find(duo => {
        const hasAll = duo.notes.every(n => allNotes.some(an => an.includes(n)));
        if (!hasAll) return false;

        // Anti-Boring Check
        const inP1 = duo.notes.every(n => p1.notes.some(an => an.includes(n)));
        const inP2 = duo.notes.every(n => p2.notes.some(an => an.includes(n)));

        return !inP1 && !inP2;
    });

    if (magic) {
        score += 50;
        dynamicTitle = magic.name;
        description = magic.desc;
        tags.push("🏆 Золотой Дуэт");
    }

    // 4. Structure
    score += analyzeStructure(p1, p2);

    // Assembly
    if (!dynamicTitle) {
        const titles = EFFECT_TITLES[alchemyType in EFFECT_TITLES ? alchemyType : 'Contrast'];
        if (titles) dynamicTitle = titles[Math.floor(Math.random() * titles.length)];
        else dynamicTitle = "Смелый Микс";
    }

    if (!description) {
        if (alchemyType === 'Bridge') description = `Гармоничное слияние ${p1.name} и ${p2.name}.`;
        else description = `Смелый контраст текстур ${p1.family} и ${p2.family}.`;
    }

    const normalizedScore = Math.min(1, score / 120);
    const chaos = Math.random() * 5;
    const matchPercent = Math.min(99, Math.floor(60 + (normalizedScore * 35) + chaos));

    // Create Recipe Object for Saving
    const recipeId = `lab-${p1.id}-${p2.id}`;
    const resultRecipe = {
        id: recipeId,
        base: p1,
        addon: p2,
        score: score,
        matchPercent: matchPercent,
        alchemy: {
            title: dynamicTitle,
            story: description,
            tags: tags,
            mix: `${p1.notes[0]} + ${p2.notes[0]}`, // Simplified visual
            type: alchemyType
        }
    };

    labState.currentResult = resultRecipe;
    const isLiked = state.isFavorite(recipeId);

    // Render Result
    const resultDiv = document.getElementById('lab-result');
    resultDiv.classList.remove('hidden');
    resultDiv.innerHTML = `
        <div class="glass-premium p-6 rounded-[2rem] relative overflow-hidden">
            <div class="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
            
            <div class="relative z-10 text-center">
                
                <!-- Save Button -->
                <button data-action="like" data-id="${recipeId}" class="absolute top-0 right-0 p-3 text-white/40 hover:text-red-500 transition active:scale-95 z-20">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" class="${isLiked ? 'text-red-500' : 'stroke-current'}" stroke="${isLiked ? 'none' : 'currentColor'}" stroke-width="1.5">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>

                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/10 border border-gold-400/20 backdrop-blur-md mb-4 mt-2">
                    <span class="w-2 h-2 rounded-full bg-gold-400 animate-pulse"></span>
                    <span class="text-[10px] text-gold-300 font-bold uppercase tracking-widest">Match: ${matchPercent}%</span>
                </div>

                <h3 class="text-3xl text-gradient-gold font-serif italic mb-2 leading-none">${dynamicTitle}</h3>
                <p class="text-white/60 text-xs font-light leading-relaxed mb-6">${description}</p>

                <div class="flex flex-wrap justify-center gap-2">
                    ${tags.map(t => `<span class="px-3 py-1 bg-white/5 rounded-lg text-[10px] text-white/50 border border-white/5">${t}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
};
