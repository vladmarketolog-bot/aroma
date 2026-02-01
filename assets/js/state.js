export class State {
    constructor() {
        this.wardrobe = [];
        this.vibe = null;
        this.recipes = [];
        this.favorites = [];
        this.listeners = [];

        this.load();
    }

    load() {
        const saved = localStorage.getItem('scentmatrix_state');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.wardrobe = parsed.wardrobe || [];
                this.favorites = parsed.favorites || [];
            } catch (e) {
                console.error("Failed to parse state:", e);
                // Reset or ignore corrupted state
                this.wardrobe = [];
                this.favorites = [];
            }
            // We don't load 'vibe' or 'recipes' to allow a fresh start, 
            // but we could if we wanted to restore session.
            // For now, let's keep wardrobe and favorites as persistent.
        }
    }

    save() {
        localStorage.setItem('scentmatrix_state', JSON.stringify({
            wardrobe: this.wardrobe,
            favorites: this.favorites
        }));
        this.notify();
    }

    subscribe(listener) {
        this.listeners.push(listener);
    }

    notify() {
        this.listeners.forEach(cb => cb(this));
    }

    // Actions
    addToWardrobe(id) {
        if (!this.wardrobe.includes(id)) {
            this.wardrobe.push(id);
            this.save();
        }
    }

    removeFromWardrobe(id) {
        this.wardrobe = this.wardrobe.filter(x => x !== id);
        this.save();
    }

    setVibe(vibeId) {
        this.vibe = vibeId;
        this.notify();
    }

    setRecipes(recipes) {
        this.recipes = recipes;
        this.notify();
    }

    toggleFavorite(recipe) {
        const index = this.favorites.findIndex(f => f.id === recipe.id);
        if (index >= 0) {
            this.favorites.splice(index, 1);
            this.save();
            return false; // removed
        } else {
            this.favorites.push(recipe);
            this.save();
            return true; // added
        }
    }

    isFavorite(recipeId) {
        return this.favorites.some(f => f.id === recipeId);
    }

    reset() {
        this.wardrobe = [];
        this.vibe = null;
        this.recipes = [];
        // Do not delete favorites on reset? Usually "Reset App" implies starting the creation flow over.
        // If we want a "Hard Reset" we'd clear favorites too.
        // For now, "Reset" just clears the current session flow (Wardrobe + Vibe).
        this.notify();
    }
}

export const state = new State();
