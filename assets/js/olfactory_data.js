// OLFACTORY INTELLIGENCE DATA //

// 1. Note Volatility (Virtual Pyramid)
// Defines the "weight" of a note to calculate structural balance.
export const NOTE_VOLATILITY = {
    // Top Notes (Fleeting, Bright, Lift)
    'Citrus': 'top', 'Bergamot': 'top', 'Lemon': 'top', 'Grapefruit': 'top', 'Mandarin': 'top', 'Lime': 'top', 'Yuzu': 'top',
    'Mint': 'top', 'Basil': 'top', 'Pink Pepper': 'top', 'Ginger': 'top', 'Sea Notes': 'top', 'Aldehydes': 'top',
    'Apple': 'top', 'Pear': 'top', 'Blackcurrant': 'top', 'Raspberry': 'top', 'Strawberry': 'top', 'Lychee': 'top',

    // Heart Notes (Character, Core)
    'Rose': 'heart', 'Jasmine': 'heart', 'Lavender': 'heart', 'Neroli': 'heart', 'Orange Blossom': 'heart', 'Tuberose': 'heart',
    'Peony': 'heart', 'Violet': 'heart', 'Iris': 'heart', 'Orchid': 'heart', 'Magnolia': 'heart', 'Lilac': 'heart',
    'Geranium': 'heart', 'Cardamom': 'heart', 'Nutmeg': 'heart', 'Cinnamon': 'heart', 'Clove': 'heart', 'Saffron': 'heart',
    'Fig': 'heart', 'Coconut': 'heart', 'Almond': 'heart', 'Peach': 'heart',

    // Base Notes (Depth, Sillage, Foundation)
    'Vanilla': 'base', 'Tonka': 'base', 'Woody': 'base', 'Cedar': 'base', 'Sandalwood': 'base', 'Oud': 'base', 'Vetiver': 'base',
    'Patchouli': 'base', 'Oakmoss': 'base', 'Musk': 'base', 'Amber': 'base', 'Leather': 'base', 'Tobacco': 'base',
    'Incense': 'base', 'Myrrh': 'base', 'Benzoin': 'base', 'Labdanum': 'base', 'Chocolate': 'base', 'Coffee': 'base', 'Caramel': 'base'
};

// 2. Family Harmony Matrix
// High score = Excellent contrast or complement.
export const FAMILY_HARMONY = {
    'Woody': { 'Citrus': 10, 'Floral': 8, 'Spicy': 9, 'Gourmand': 7, 'Fresh': 9 },
    'Floral': { 'Woody': 8, 'Musk': 10, 'Citrus': 9, 'Gourmand': 7, 'Amber': 8 },
    'Citrus': { 'Woody': 10, 'Floral': 9, 'Musk': 8, 'Spicy': 7, 'Fresh': 6 }, // Fresh+Fresh is boring (6)
    'Gourmand': { 'Spicy': 10, 'Woody': 7, 'Floral': 7, 'Citrus': 8, 'Musk': 9 },
    'Spicy': { 'Gourmand': 10, 'Woody': 9, 'Floral': 6, 'Citrus': 7, 'Amber': 10 },
    'Musk': { 'Floral': 10, 'Woody': 8, 'Citrus': 8, 'Clean': 5 }, // Clean+Clean is too sterile
    'Amber': { 'Spicy': 10, 'Woody': 9, 'Floral': 8, 'Gourmand': 9 },
    'Fresh': { 'Woody': 9, 'Floral': 8, 'Citrus': 6 },
    'Fougère': { 'Citrus': 9, 'Woody': 8, 'Spicy': 8 }
};

// 3. Magic Duos (The "Golden Pairs")
// If these specific notes meet, instant bonus.
export const MAGIC_DUOS = [
    { notes: ['Rose', 'Oud'], name: "Royal Arabian", desc: "Классический восточный дуэт: нежная роза и мощный уд." },
    { notes: ['Rose', 'Patchouli'], name: "Chypre Soul", desc: "Элегантная драма. Роза приземляется сырыми пачули." },
    { notes: ['Vanilla', 'Tobacco'], name: "Gentleman's Club", desc: "Сладкий дым. Уютно, дорого и статусно." },
    { notes: ['Lavender', 'Vanilla'], name: "Modern Fougère", desc: "Чистота лаванды сглаженная кремовой ванилью." },
    { notes: ['Bergamot', 'Vetiver'], name: "Crisp Earth", desc: "Звонкий цитрус на сухой древесной базе." },
    { notes: ['Jasmine', 'Sandalwood'], name: "Creamy White", desc: "Интексицирующая цветочность на сливочном дереве." },
    { notes: ['Sea Notes', 'Woody'], name: "Driftwood", desc: "Соленое дерево, выброшенное на берег." },
    { notes: ['Coffee', 'Rose'], name: "Noir Cafe", desc: "Неожиданная гурманика: цветы и горький эспрессо." },
    { notes: ['Pineapple', 'Birch'], name: "The King", desc: "Легендарный профиль Aventus: дым и фрукты." },
    { notes: ['Saffron', 'Amberwood'], name: "Crystal Heat", desc: "Профиль Baccarat: жженый сахар и минеральность." }
];

// 4. Dynamic Title Generators
export const EFFECT_TITLES = {
    'Contrast': ["Игра Контрастов", "Лед и Пламя", "Свет и Тень", "Дерзкий Баланс"],
    'Bridge': ["Идеальная Связка", "Гармоничный Аккорд", "Монолитный Образ", "Бесшовный Микс"],
    'Enhance': ["Усилитель Глубины", "Яркая Вспышка", "Долгая Стойкость", "Новая Грань"]
};
