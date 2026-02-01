export const perfumeDB = [
    { id: 1, name: "Santal 33", brand: "Le Labo", family: "Woody", notes: ["Sandalwood", "Leather", "Papyrus", "Violet"], vibes: ["status", "artsy"] },
    { id: 2, name: "Baccarat Rouge 540", brand: "Maison Francis Kurkdjian", family: "Gourmand", notes: ["Saffron", "Amberwood", "Fir Resin", "Jasmine"], vibes: ["status", "seductive"] },
    { id: 3, name: "Black Orchid", brand: "Tom Ford", family: "Floral", notes: ["Truffle", "Orchid", "Patchouli", "Chocolate"], vibes: ["dark", "seductive"] },
    { id: 4, name: "Aventus", brand: "Creed", family: "Chypre", notes: ["Pineapple", "Birch", "Musk", "Bergamot"], vibes: ["status", "seductive"] },
    { id: 5, name: "Gypsy Water", brand: "Byredo", family: "Woody", notes: ["Juniper", "Pine", "Vanilla", "Sandalwood"], vibes: ["clean", "romantic"] },
    { id: 6, name: "Love, Don't Be Shy", brand: "Kilian", family: "Gourmand", notes: ["Marshmallow", "Orange Blossom", "Vanilla"], vibes: ["romantic", "seductive"] },
    { id: 7, name: "Do Son", brand: "Diptyque", family: "Floral", notes: ["Tuberose", "Orange Leaf", "Musk"], vibes: ["romantic", "fresh"] },
    { id: 8, name: "Jazz Club", brand: "Maison Margiela", family: "Woody", notes: ["Rum", "Tobacco", "Vanilla", "Pink Pepper"], vibes: ["dark", "artsy"] },
    { id: 9, name: "Lost Cherry", brand: "Tom Ford", family: "Gourmand", notes: ["Cherry", "Almond", "Tonka Bean", "Rose"], vibes: ["seductive", "romantic"] },
    { id: 10, name: "Mojave Ghost", brand: "Byredo", family: "Woody", notes: ["Sapodilla", "Magnolia", "Violet", "Cedar"], vibes: ["clean", "artsy"] },
    { id: 11, name: "Wood Sage & Sea Salt", brand: "Jo Malone", family: "Fresh", notes: ["Sea Salt", "Sage", "Grapefruit", "Ambrette"], vibes: ["fresh", "clean"] },
    { id: 12, name: "Neroli Portofino", brand: "Tom Ford", family: "Citrus", notes: ["Neroli", "Bergamot", "Lemon", "Amber"], vibes: ["fresh", "status"] },
    { id: 13, name: "Grand Soir", brand: "Maison Francis Kurkdjian", family: "Amber", notes: ["Amber", "Tonka Bean", "Vanilla", "Labdanum"], vibes: ["dark", "seductive"] }
];

export const vibes = [
    { id: 'status', name: 'Статус / Деньги', icon: '💼', desc: 'Уверенность, дистанция, власть' },
    { id: 'seductive', name: 'Соблазн / Секс', icon: '🔥', desc: 'Притяжение, интрига, шлейф' },
    { id: 'fresh', name: 'Свежесть / Спорт', icon: '🌊', desc: 'Чистота, энергия, легкость' },
    { id: 'romantic', name: 'Романтика / Свидание', icon: '🌹', desc: 'Нежность, мягкость, уют' },
    { id: 'dark', name: 'Мистика / Вечер', icon: '🌑', desc: 'Тайна, глубина, ночь' },
    { id: 'artsy', name: 'Арт / Богема', icon: '🎨', desc: 'Креативность, необычность' }
];

export const alchemyStories = {
    'status': { occasion: 'Деловая встреча', text: 'Аромат создает дистанцию, но вызывает уважение. Идеально под белый воротничок.' },
    'seductive': { occasion: 'Свидание', text: 'Шлейф, который хочется разгадывать. Оставляет "крючок" в памяти.' },
    'fresh': { occasion: 'Спорт / Прогулка', text: 'Ощущение чистоты и энергии. Будто вы только что из душа.' },
    'romantic': { occasion: 'Ужин при свечах', text: 'Нежный, обволакивающий кокон. Располагает к доверию.' },
    'dark': { occasion: 'Вечеринка', text: 'Мистический и глубокий. Выделяет из толпы.' },
    'artsy': { occasion: 'Выставка', text: 'Интеллектуальный запах. Сложный, не для всех.' }
};

export const alchemyEffects = {
    'Woody': { 'Floral': 'мягкая сила', 'Citrus': 'солнечный лес', 'Gourmand': 'дымный десерт', 'Green': 'утренняя роща' },
    'Floral': { 'Woody': 'цветок в тени', 'Citrus': 'лимонад из лепестков', 'Amber': 'горячий сад', 'Gourmand': 'засахаренный бутон' }
};
