/**
 * Wordle Game Module
 * @module wordle
 * @description Word guessing game with statistics tracking
 * @requires storage.js
 * @requires auth-guard.js
 */

"use strict";

/** @constant {string[]} Available 5-letter words */

const WORDS = [
    "about", "above", "abuse", "actor", "acute", "admit", "adopt", "adult", "after", "again",
    "agent", "agree", "ahead", "alarm", "album", "alert", "alike", "alive", "allow", "alone",
    "along", "alter", "among", "angel", "anger", "angle", "angry", "apart", "apple", "apply",
    "arena", "argue", "arise", "armor", "arose", "array", "arrow", "aside", "asset", "audio",
    "audit", "avoid", "award", "aware", "awful", "bacon", "badge", "badly", "baker", "bases",
    "basic", "basin", "basis", "batch", "beach", "beard", "beast", "began", "begin", "begun",
    "being", "belly", "below", "bench", "berry", "birth", "black", "blade", "blame", "blank",
    "blast", "blaze", "bleed", "blend", "bless", "blind", "blink", "block", "blood", "bloom",
    "blown", "blues", "blunt", "board", "boast", "bonus", "boost", "booth", "bound", "brain",
    "brake", "brand", "brass", "brave", "bread", "break", "breed", "brick", "bride", "brief",
    "bring", "broad", "broke", "brook", "broom", "brown", "brush", "buddy", "build", "built",
    "bunch", "burst", "buyer", "cabin", "cable", "cache", "camel", "candy", "cargo", "carol",
    "carry", "carve", "catch", "cater", "cause", "cease", "chain", "chair", "chalk", "champ",
    "chant", "chaos", "charm", "chart", "chase", "cheap", "cheat", "check", "cheek", "cheer",
    "chess", "chest", "chick", "chief", "child", "chill", "china", "chord", "chose", "chunk",
    "civic", "civil", "claim", "clamp", "clash", "clasp", "class", "clean", "clear", "clerk",
    "click", "cliff", "climb", "cling", "clock", "clone", "close", "cloth", "cloud", "clown",
    "coach", "coast", "cocoa", "colon", "color", "comet", "comic", "coral", "corps", "couch",
    "cough", "could", "count", "court", "cover", "crack", "craft", "crane", "crash", "crawl",
    "crazy", "cream", "creek", "creep", "crest", "crime", "crisp", "cross", "crowd", "crown",
    "crude", "cruel", "crush", "cubic", "curve", "cycle", "daily", "dairy", "dance", "dealt",
    "death", "debit", "debug", "debut", "decay", "decor", "decoy", "delay", "delta", "delve",
    "demon", "denim", "dense", "depot", "depth", "derby", "devil", "diary", "digit", "diner",
    "dirty", "disco", "ditch", "diver", "dizzy", "dodge", "doing", "dolly", "donor", "donut",
    "doubt", "dough", "dozen", "draft", "drain", "drake", "drama", "drank", "drawl", "drawn",
    "dread", "dream", "dress", "dried", "drift", "drill", "drink", "drive", "droit", "droll",
    "drone", "drool", "droop", "drown", "drugs", "drums", "drunk", "dryer", "dryly", "dummy",
    "dunce", "dwell", "dying", "eager", "eagle", "early", "earth", "easel", "eaten", "eater",
    "ebony", "edged", "eerie", "eight", "elbow", "elder", "elect", "elite", "elope", "elude",
    "email", "ember", "empty", "enact", "ended", "enemy", "enjoy", "enter", "entry", "equal",
    "equip", "erase", "erect", "erode", "error", "erupt", "essay", "evade", "event", "every",
    "exact", "exalt", "excel", "exert", "exile", "exist", "extra", "eying", "fable", "faced",
    "facet", "faint", "fairy", "faith", "false", "famed", "fancy", "farce", "fatal", "fatty",
    "fault", "favor", "feast", "feign", "fence", "ferry", "fetal", "fetch", "fever", "fiber",
    "field", "fiend", "fiery", "fifth", "fifty", "fight", "filmy", "final", "finch", "finer",
    "first", "fishy", "fixed", "fixer", "fizzy", "flair", "flake", "flame", "flank", "flare",
    "flash", "flask", "flesh", "flick", "flier", "fling", "flint", "flirt", "float", "flock",
    "flood", "floor", "flora", "floss", "flour", "flout", "fluid", "flung", "flunk", "flush",
    "flute", "focal", "focus", "foggy", "folio", "folly", "force", "forge", "forgo", "forth",
    "forty", "forum", "found", "foyer", "frail", "frame", "frank", "fraud", "freak", "freed",
    "fresh", "friar", "fried", "frill", "frisk", "frizz", "frock", "front", "frost", "froth",
    "frown", "froze", "fruit", "fudge", "fully", "fumed", "fungi", "funky", "funny", "furry",
    "fussy", "fuzzy", "gauge", "gaunt", "gauze", "gavel", "gears", "gecko", "geese", "genes",
    "genie", "genre", "ghost", "giant", "giddy", "gifts", "gills", "given", "giver", "gives",
    "gland", "glare", "glass", "glaze", "gleam", "glean", "glide", "glint", "glitz", "gloat",
    "globe", "gloom", "glory", "gloss", "glove", "glyph", "gnome", "goals", "goats", "godly",
    "going", "golly", "goose", "gorge", "gouge", "gourd", "grace", "grade", "grain", "grand",
    "grant", "grape", "graph", "grasp", "grass", "grate", "grave", "gravy", "graze", "great",
    "greed", "greek", "green", "greet", "grief", "grill", "grime", "grimy", "grind", "gripe",
    "groan", "groom", "grope", "gross", "group", "grove", "growl", "grown", "grows", "gruel",
    "gruff", "grunt", "guard", "guess", "guest", "guide", "guild", "guilt", "guise", "gulch",
    "gummy", "guppy", "gusty", "gutsy", "gypsy", "habit", "hairy", "halve", "handy", "happy",
    "hardy", "harsh", "haste", "hasty", "hatch", "haven", "havoc", "hazel", "heady", "heard",
    "heart", "heath", "heavy", "hedge", "heels", "hefty", "heist", "hello", "hence", "herbs",
    "heron", "hilly", "hinge", "hippo", "hippy", "hobby", "hoist", "holly", "homer", "honey",
    "honor", "hoped", "horde", "horny", "horse", "hotel", "hound", "house", "hover", "howdy",
    "human", "humid", "humor", "humps", "hunch", "hunky", "hurry", "husky", "hyena", "hyper",
    "ideal", "idiom", "idiot", "image", "imply", "incur", "index", "indie", "inept", "infer",
    "inner", "input", "inter", "intro", "ionic", "irony", "issue", "itchy", "items", "ivory",
    "jazzy", "jeans", "jelly", "jerky", "jetty", "jewel", "jiffy", "jimmy", "joint", "joker",
    "jolly", "joust", "judge", "juice", "juicy", "jumbo", "jumps", "jumpy", "junky", "juror",
    "karma", "kayak", "kebab", "khaki", "kinky", "kiosk", "kitty", "knack", "knead", "kneed",
    "kneel", "knelt", "knife", "knock", "knoll", "known", "knows", "koala", "kudos", "label",
    "labor", "laced", "laden", "ladle", "lager", "lance", "lanky", "lapel", "lapse", "large",
    "larva", "laser", "lasso", "latch", "later", "latex", "lathe", "latin", "laugh", "layer",
    "leach", "leafy", "leaky", "leapt", "learn", "lease", "leash", "least", "leave", "ledge",
    "leech", "leery", "lefty", "legal", "leggy", "lemon", "lemur", "leper", "level", "lever",
    "libel", "liege", "light", "liked", "liken", "lilac", "limbo", "limit", "lined", "linen",
    "liner", "lingo", "links", "lions", "lipid", "liver", "livid", "llama", "loamy", "lobby",
    "local", "locus", "lodge", "lofty", "logic", "login", "loins", "loose", "lordy", "loser",
    "lotto", "lotus", "louse", "lousy", "lover", "lower", "lowly", "loyal", "lucid", "lucky",
    "lumen", "lumpy", "lunar", "lunch", "lunge", "lupus", "lurch", "lurid", "lusty", "lying",
    "lymph", "lyric", "macho", "macro", "madam", "madly", "magic", "major", "maker", "mamma",
    "mango", "manly", "manor", "maple", "march", "marry", "marsh", "match", "mated", "maybe",
    "mayor", "mealy", "meant", "meaty", "medal", "media", "medic", "melee", "melon", "mercy",
    "merge", "merit", "merry", "messy", "metal", "meter", "metro", "micro", "midst", "might",
    "mimic", "mince", "miner", "minim", "minor", "minus", "mirth", "miser", "missy", "misty",
    "mixed", "mixer", "mocha", "modal", "model", "modem", "moist", "moldy", "mommy", "money",
    "month", "moody", "moose", "moral", "moron", "morph", "mossy", "motel", "motif", "motor",
    "motto", "mount", "mourn", "mouse", "mousy", "mouth", "moved", "mover", "movie", "mower",
    "mucus", "muddy", "mulch", "mummy", "munch", "mural", "murky", "music", "musty", "nanny",
    "nasal", "nasty", "natal", "naval", "navel", "needs", "needy", "nerve", "nervy", "never",
    "newer", "newly", "nicer", "niche", "niece", "night", "nimby", "ninja", "ninny", "ninth",
    "nippy", "nitty", "noble", "nobly", "noise", "noisy", "nomad", "noose", "north", "notch",
    "noted", "novel", "nudge", "nurse", "nutty", "nylon", "oaken", "occur", "ocean", "octet",
    "oddly", "offal", "offer", "often", "oiled", "olive", "omens", "onset", "opera", "optic",
    "orbit", "order", "organ", "other", "otter", "ought", "ounce", "outdo", "outer", "owned",
    "owner", "oxide", "ozone", "paddy", "pagan", "paint", "pairs", "palsy", "panel", "panic",
    "pansy", "papal", "paper", "parch", "party", "pasta", "paste", "pasty", "patch", "patio",
    "patsy", "patty", "pause", "payee", "payer", "peace", "peach", "pearl", "pecan", "pedal",
    "penal", "pence", "penny", "perch", "peril", "perky", "pesky", "petal", "petty", "phase",
    "phone", "phony", "photo", "piano", "picky", "piece", "piety", "piggy", "pilot", "pinch",
    "piney", "pinky", "pinto", "piper", "pique", "pitch", "pithy", "pivot", "pixel", "pixie",
    "pizza", "place", "plaid", "plain", "plane", "plank", "plant", "plate", "plaza", "plead",
    "pleat", "plied", "plier", "plonk", "pluck", "plumb", "plume", "plump", "plums", "plunk",
    "plush", "plyer", "poach", "point", "poise", "poker", "polar", "polka", "polls", "polyp",
    "ponds", "pooch", "poppy", "porch", "porky", "poser", "posit", "posse", "pouch", "pound",
    "power", "prank", "prawn", "press", "price", "prick", "pride", "pried", "prime", "primo",
    "print", "prior", "prism", "privy", "prize", "probe", "prone", "prong", "proof", "prose",
    "proud", "prove", "prowl", "proxy", "prude", "prune", "psalm", "pubic", "pudgy", "pulse",
    "punch", "pupil", "puppy", "purge", "purse", "pushy", "putty", "pygmy", "quack", "quake",
    "qualm", "quart", "queen", "query", "quest", "queue", "quick", "quiet", "quill", "quilt",
    "quirk", "quota", "quote", "rabbi", "rabid", "racer", "radar", "radii", "radio", "rainy",
    "raise", "rally", "ralph", "ramen", "ranch", "randy", "range", "rapid", "rarer", "raspy",
    "ratio", "ratty", "raven", "rayon", "razor", "reach", "react", "ready", "realm", "reams",
    "rebel", "rebut", "recap", "recur", "redux", "reedy", "refer", "reign", "relax", "relay",
    "relic", "remit", "remix", "renal", "renew", "repay", "repel", "reply", "rerun", "reset",
    "resin", "retch", "retro", "retry", "reuse", "revel", "revue", "rhino", "rhyme", "rider",
    "ridge", "rifle", "right", "rigid", "rigor", "rinse", "ripen", "risen", "riser", "risky",
    "ritzy", "rival", "river", "rivet", "roach", "roast", "robin", "robot", "rocky", "rodeo",
    "roger", "rogue", "roomy", "roost", "roots", "rouge", "rough", "round", "route", "rover",
    "rowdy", "rowed", "royal", "ruddy", "ruder", "rugby", "ruins", "ruler", "rumba", "rumor",
    "rupee", "rural", "rusty", "sadly", "safer", "saint", "salad", "sally", "salon", "salsa",
    "salty", "salve", "salvo", "sandy", "saner", "sappy", "sassy", "satin", "satyr", "sauce",
    "saucy", "sauna", "saute", "savor", "savoy", "savvy", "scald", "scale", "scalp", "scaly",
    "scamp", "scant", "scare", "scarf", "scary", "scene", "scent", "scion", "scoff", "scold",
    "scone", "scoop", "scoot", "scope", "score", "scorn", "scout", "scowl", "scram", "scrap",
    "screw", "scrub", "seams", "sedan", "seedy", "seems", "seize", "sense", "sepia", "serve",
    "setup", "seven", "sever", "sewed", "shade", "shady", "shaft", "shake", "shaky", "shall",
    "shame", "shank", "shape", "shard", "share", "shark", "sharp", "shave", "shawl", "shear",
    "sheen", "sheep", "sheer", "sheet", "shelf", "shell", "shift", "shine", "shiny", "shire",
    "shirk", "shirt", "shock", "shoes", "shone", "shook", "shoot", "shops", "shore", "short",
    "shout", "shove", "shown", "showy", "shrew", "shrub", "shrug", "shuck", "shunt", "sided",
    "siege", "sieve", "sight", "sigma", "silky", "silly", "since", "sinew", "singe", "siren",
    "sissy", "sixth", "sixty", "skate", "skied", "skier", "skimp", "skirt", "skull", "skunk",
    "slack", "slain", "slang", "slant", "slash", "slate", "slave", "sleek", "sleep", "sleet",
    "slept", "slice", "slick", "slide", "slime", "slimy", "sling", "slink", "slope", "slosh",
    "sloth", "slump", "slung", "slunk", "slurp", "slush", "slyly", "smack", "small", "smart",
    "smash", "smear", "smell", "smelt", "smile", "smirk", "smite", "smith", "smoke", "smoky",
    "snack", "snafu", "snail", "snake", "snaky", "snare", "snarl", "sneak", "sneer", "snide",
    "sniff", "snipe", "snoop", "snore", "snort", "snout", "snowy", "snuck", "snuff", "soapy",
    "sober", "soggy", "solar", "solid", "solve", "sonar", "sonic", "sooth", "sooty", "sorry",
    "sound", "south", "space", "spade", "spank", "spare", "spark", "spasm", "spawn", "speak",
    "spear", "speck", "speed", "spell", "spend", "spent", "spice", "spicy", "spied", "spike",
    "spill", "spine", "spiny", "spoil", "spoke", "spoof", "spook", "spool", "spoon", "spore",
    "sport", "spout", "spray", "spree", "sprig", "spunk", "spurt", "squad", "squat", "squib",
    "stack", "staff", "stage", "staid", "stain", "stair", "stake", "stale", "stalk", "stall",
    "stamp", "stand", "stank", "staph", "stare", "stark", "stars", "start", "stash", "state",
    "stave", "stays", "stead", "steak", "steal", "steam", "steed", "steel", "steep", "steer",
    "stems", "steno", "steps", "stern", "stick", "stiff", "still", "stilt", "sting", "stink",
    "stint", "stock", "stoic", "stoke", "stomp", "stone", "stony", "stood", "stool", "stoop",
    "stops", "store", "stork", "storm", "story", "stout", "stove", "strap", "straw", "stray",
    "strep", "strip", "strut", "stuck", "study", "stuff", "stump", "stung", "stunk", "stunt",
    "style", "suave", "sugar", "suite", "sulky", "sunny", "super", "surer", "surge", "surly",
    "sushi", "swamp", "swank", "swarm", "swath", "swear", "sweat", "sweep", "sweet", "swell",
    "swept", "swift", "swill", "swine", "swing", "swipe", "swirl", "swish", "swiss", "swoon",
    "swoop", "sword", "swore", "sworn", "swung", "synod", "syrup", "tabby", "table", "taboo",
    "tacit", "tacky", "taffy", "taint", "taken", "taker", "tally", "talon", "tamer", "tango",
    "tangy", "taper", "tapir", "tardy", "taste", "tasty", "tatty", "taunt", "tawny", "teach",
    "teary", "tease", "teddy", "teeth", "tempo", "tenet", "tenor", "tense", "tenth", "tepee",
    "tepid", "terms", "terra", "terse", "testy", "thank", "thaws", "theft", "their", "theme",
    "there", "these", "thick", "thief", "thigh", "thing", "think", "third", "thong", "thorn",
    "those", "three", "threw", "throb", "throw", "thrum", "thumb", "thump", "tiara", "tibia",
    "tidal", "tiger", "tight", "tilde", "timer", "timid", "tipsy", "titan", "title", "toast",
    "today", "toddy", "token", "tonal", "toner", "tongs", "tonic", "tooth", "topaz", "topic",
    "torch", "torso", "torus", "total", "totem", "touch", "tough", "towel", "tower", "toxic",
    "toxin", "trace", "track", "tract", "trade", "trail", "train", "trait", "tramp", "trash",
    "trawl", "tread", "treat", "trend", "triad", "trial", "tribe", "trick", "tried", "trims",
    "trite", "troll", "troop", "trope", "trout", "trove", "truce", "truck", "truly", "trump",
    "trunk", "truss", "trust", "truth", "tryst", "tubal", "tubes", "tulip", "tummy", "tumor",
    "tuner", "tunic", "turbo", "tutor", "twain", "twang", "tweak", "tweed", "tweet", "twice",
    "twigs", "twine", "twirl", "twist", "twixt", "tying", "udder", "ulcer", "ultra", "umbra",
    "uncle", "uncut", "under", "undid", "undue", "unfed", "unfit", "unify", "union", "unite",
    "units", "unity", "unlit", "unmet", "untie", "until", "unwed", "unzip", "upper", "upset",
    "urban", "urine", "usage", "usher", "using", "usual", "utter", "vague", "valid", "valor",
    "value", "valve", "vapid", "vapor", "vault", "vaunt", "vegan", "venue", "verge", "verse",
    "video", "vigil", "vigor", "villa", "vinyl", "viola", "viper", "viral", "virus", "visit",
    "visor", "vista", "vital", "vivid", "vixen", "vocal", "vodka", "vogue", "voice", "voila",
    "vomit", "voted", "voter", "vouch", "vowel", "vying", "wacky", "wader", "wafer", "wager",
    "wagon", "waist", "waive", "waken", "waldo", "waltz", "warty", "waste", "watch", "water",
    "waved", "waxen", "weary", "weave", "wedge", "weedy", "weigh", "weird", "welsh", "wench",
    "wetly", "whale", "wharf", "wheat", "wheel", "where", "which", "whiff", "while", "whine",
    "whiny", "whirl", "whisk", "white", "whole", "whose", "widen", "wider", "widow", "width",
    "wield", "willy", "wimpy", "wince", "winch", "windy", "wired", "wiser", "witch", "witty",
    "woken", "woman", "women", "woods", "woozy", "wordy", "world", "worry", "worse", "worst",
    "worth", "would", "wound", "woven", "wrack", "wrath", "wreak", "wreck", "wrest", "wring",
    "wrist", "write", "wrong", "wrote", "wrung", "yacht", "yearn", "yeast", "yield", "young",
    "youth", "zebra", "zesty", "zonal"
];

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = Object.freeze({
    wordLength: 5,
    maxAttempts: 6,
    flipDelay: 300,
    shakeDelay: 600
});

const KEYBOARD_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"]
];

// ============================================================================
// GAME STATE
// ============================================================================

const state = {
    target: "",
    row: 0,
    tile: 0,
    board: [],
    guessed: [],
    gameOver: false,
    won: false,
    revealing: false
};

// ============================================================================
// DOM CACHE
// ============================================================================

let els = {};

// initElements: Caches frequently accessed DOM elements for later use.
function initElements() { 
    els = {
        board: document.getElementById("wordleBoard"),
        keyboard: document.getElementById("keyboard"),
        message: document.getElementById("message"),
        attempts: document.getElementById("attemptsDisplay"),
        streak: document.getElementById("streakDisplay"),
        modal: document.getElementById("gameOverModal"),
        newBtn: document.getElementById("newGameBtn"),
        againBtn: document.getElementById("playAgainBtn")
    };
}

// ============================================================================
// STORAGE HELPERS
// ============================================================================

const username = getActiveUsername();
/**
 *  Generates a game-specific key for local storage by combining the base key with the username.
 * @param {*} base - The base key to combine with the username.
 * @returns {string} - The combined key for local storage.
 */
function gameKey(base) {
    return userKey(base, username);
}
/**
 *  Loads a numeric statistic from local storage, returning a fallback value if not found or invalid.
 * @param {*} key - The key of the statistic to load.
 * @param {*} fallback - The fallback value to return if the statistic is not found or invalid.
 * @returns  {number} - The loaded statistic or the fallback value.
 */
function loadStat(key, fallback = 0) {
    const val = readJson(gameKey(key), fallback);
    const num = Number(val);
    return Number.isNaN(num) ? fallback : num;
}
/**
 *  Saves a statistic to local storage.
 * @param {*} key - The key of the statistic to save.
 * @param {*} value - The value of the statistic to save.
 */
function saveStat(key, value) {
    writeJson(gameKey(key), value);
}

/**
 *  Increments a numeric statistic in local storage by a specified amount.
 * @param {*} key - The key of the statistic to increment.
 * @param {*} amount - The amount to increment the statistic by (default is 1).
 * @returns {number} - The new value of the statistic after incrementing.
 */
function incrementStat(key, amount = 1) {
    const next = loadStat(key, 0) + amount;
    saveStat(key, next);
    return next;
}

/**
 *  Retrieves the recent game results from local storage.
 * @returns {Array} - An array of recent game result entries.
 */
function getRecent() {
    const data = readJson(gameKey(GAME2_LS_KEYS.RECENT_RESULTS), []);
    return Array.isArray(data) ? data : [];
}

/**
 *  Adds a new entry to the recent game results in local storage.
 * @param {*} entry - The game result entry to add.
 */
function addRecent(entry) {
    const updated = [entry, ...getRecent()].slice(0, 5);
    writeJson(gameKey(GAME2_LS_KEYS.RECENT_RESULTS), updated);
}

// ============================================================================
// WORD FUNCTIONS
// ============================================================================

/**
 *  Selects a random word from the WORDS array and returns it in uppercase.
 * @returns {string} - The selected word in uppercase.
 */
function selectWord() {
    return WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase();
}

/**
 *  Checks if a given word is valid by verifying its presence in the WORDS array.
 * @param {*} word - The word to validate.
 * @returns {boolean} - True if the word is valid, false otherwise.
 */
function isValidWord(word) {
    return WORDS.includes(word.toLowerCase());
}

/**
 *  Retrieves the current word being formed based on the current row in the game state.
 * @returns {string} - The current word.
 */
function getCurrentWord() {
    return state.board[state.row].map(c => c.letter).join(""); 
}

// ============================================================================
// BOARD & KEYBOARD
// ============================================================================

/**
 * Creates the Wordle game board with rows and cells.
 */
function createBoard() {
    els.board.innerHTML = "";
    state.board = [];
    
    for (let i = 0; i < CONFIG.maxAttempts; i++) {
        const row = document.createElement("div");
        row.className = "wordle-row";
        row.dataset.row = i;
        
        const rowData = [];
        for (let j = 0; j < CONFIG.wordLength; j++) {
            const tile = document.createElement("div");
            tile.className = "wordle-cell";
            tile.dataset.row = i;
            tile.dataset.col = j;
            row.appendChild(tile);
            rowData.push({ letter: "", state: "" });
        }
        
        els.board.appendChild(row);
        state.board.push(rowData);
    }
}

/**
 * Creates the on-screen keyboard for the Wordle game.
 */
function createKeyboard() {
    els.keyboard.innerHTML = "";
    
    KEYBOARD_ROWS.forEach(row => {
        const rowDiv = document.createElement("div"); // keyboard row
        rowDiv.className = "keyboard-row";
        
        row.forEach(key => {
            const btn = document.createElement("button"); // key button
            btn.className = "key";
            btn.textContent = key;
            btn.dataset.key = key;
            if (key === "ENTER" || key === "⌫") btn.classList.add("wide");
            btn.addEventListener("click", () => handleKey(key)); 
            rowDiv.appendChild(btn);
        });
        
        els.keyboard.appendChild(rowDiv);
    });
}

/**
 *  Updates a specific tile on the board with a letter.
 * @param {*} row - row index
 * @param {*} col - column index
 * @param {*} letter - letter to place
 */
function updateTile(row, col, letter) { 
    const tile = document.querySelector(`.wordle-cell[data-row="${row}"][data-col="${col}"]`);
    if (tile) {
        tile.textContent = letter; // display letter
        tile.classList.toggle("filled", !!letter);
    }
    state.board[row][col].letter = letter;
}

/**
 *  Updates the state and appearance of a keyboard key.
 * @param {*} letter - the letter/key to update
 * @param {*} newState - the new state ("correct", "present", "absent")
 * @returns 
 */
function updateKeyboardKey(letter, newState) { // updates key color/state
    const key = document.querySelector(`.key[data-key="${letter}"]`); // find key button
    if (!key) return;
    
    const current = key.dataset.state;
    if (current === "correct") return;
    if (current === "present" && newState !== "correct") return;
    
    key.classList.remove("correct", "present", "absent");
    key.classList.add(newState);
    key.dataset.state = newState;
}

// ============================================================================
// GAME LOGIC
// ============================================================================

/**
 *  Handles key inputs for the Wordle game.
 * @param {*} key - the key that was pressed
 */
function handleKey(key) {
    if (state.gameOver || state.revealing) return;
    
    if (key === "ENTER") {
        submitGuess();
    } else if (key === "⌫" || key === "BACKSPACE") {
        deleteLetter();
    } else if (/^[A-Z]$/.test(key)) {
        addLetter(key);
    }
}

/**
 *  Adds a letter to the current tile in the game board.
 * @param {*} letter - the letter to add
 */
function addLetter(letter) {
    if (state.tile >= CONFIG.wordLength) return;
    updateTile(state.row, state.tile, letter);
    state.tile++;
}

/**
 *  Deletes the last letter from the current tile in the game board.
 */
function deleteLetter() {
    if (state.tile <= 0) return; 
    state.tile--;
    updateTile(state.row, state.tile, "");
}

/**
 *  Submits the current guess and evaluates it. 
 */
function submitGuess() {
    const guess = getCurrentWord();
    
    if (guess.length !== CONFIG.wordLength) {
        showMessage("Not enough letters", "error");
        shakeRow(state.row);
        return;
    }
    
    if (!isValidWord(guess)) {
        showMessage("Not in word list", "error");
        shakeRow(state.row);
        return;
    }
    
    if (state.guessed.includes(guess)) {
        showMessage("Already guessed!", "error");
        shakeRow(state.row);
        return;
    }
    
    state.guessed.push(guess);
    revealWord(guess);
}

/**
 *  Evaluates a guess against the target word and returns the result for each letter.
 * @param {*} guess - the guessed word
 * @returns {Array} - array of results for each letter ("correct", "present", "absent")
 */
function evaluateGuess(guess) {
    const results = new Array(CONFIG.wordLength).fill("absent"); // fisrst, all absent
    const targetLetters = state.target.split("");
    const guessLetters = guess.split("");
    
    // mark correct positions
    guessLetters.forEach((letter, i) => { 
        if (letter === targetLetters[i]) { // if correct, mark
            results[i] = "correct";
            targetLetters[i] = null;
        }
    });
    
    // mark present letters
    guessLetters.forEach((letter, i) => {
        if (results[i] === "correct") return; 
        const idx = targetLetters.indexOf(letter);
        if (idx !== -1) { // if present, mark
            results[i] = "present";
            targetLetters[idx] = null;
        }
    });
    
    return results;
}

/**
 *  Reveals the guessed word on the board with animations and updates the game state.
 * @param {*} guess - the guessed word
 */
function revealWord(guess) {
    state.revealing = true;
    const results = evaluateGuess(guess);
    const row = document.querySelector(`.wordle-row[data-row="${state.row}"]`);  // get current row
    const tiles = row.querySelectorAll(".wordle-cell"); // get tiles in the row
    
    tiles.forEach((tile, i) => { // reveal each tile with delay
        setTimeout(() => {
            tile.classList.add("flip");
            setTimeout(() => { 
                tile.classList.add(results[i]); 
                updateKeyboardKey(guess[i], results[i]); // update keyboard 
            }, 250);
        }, i * CONFIG.flipDelay);
    });
    
    setTimeout(() => {
        state.revealing = false;
        
        if (guess === state.target) {
            handleWin();
        } else if (state.row >= CONFIG.maxAttempts - 1) {
            handleLoss();
        } else {
            state.row++;
            state.tile = 0;
            updateAttempts();
        }
    }, CONFIG.wordLength * CONFIG.flipDelay + 500);
}

/**
 *  Applies a shake animation to the specified row to indicate an error.
 * @param {*} rowIndex - the index of the row to shake
 */
function shakeRow(rowIndex) {
    const row = document.querySelector(`.wordle-row[data-row="${rowIndex}"]`);
    row.classList.add("shake");
    setTimeout(() => row.classList.remove("shake"), CONFIG.shakeDelay);
}


// ============================================================================
// WIN/LOSS HANDLING
// ============================================================================

/**
 * Handles the win condition, updating the game state and displaying messages.
 */
function handleWin() {
    state.gameOver = true;
    state.won = true;
    
    const messages = ["Genius!", "Magnificent!", "Impressive!", "Splendid!", "Great!", "Phew!"];
    showMessage(messages[Math.min(state.row, messages.length - 1)], "success");
    
    const score = (CONFIG.maxAttempts - state.row) * 10;
    updateStats(true, score);
    
    setTimeout(() => showGameOver(true), 1500);
}

/**
 * Handles the loss condition, updating the game state and displaying messages.
 */
function handleLoss() {
    state.gameOver = true;
    state.won = false;
    
    showMessage(state.target, "info", 3000);
    updateStats(false, 0);
    
    setTimeout(() => showGameOver(false), 2000);
}

/**
 *  Updates the player's statistics based on the game outcome.
 * @param {*} won - whether the player won
 * @param {*} score - the score achieved
 */
function updateStats(won, score) {
    incrementStat(GAME2_LS_KEYS.GAMES_PLAYED);
    incrementStat(GAME2_LS_KEYS.SESSIONS);
    
    if (won) {
        incrementStat(GAME2_LS_KEYS.WINS);
        incrementStat(GAME2_LS_KEYS.TOTAL_POINTS, score);
        
        const streak = loadStat(GAME2_LS_KEYS.CURRENT_STREAK, 0) + 1;
        saveStat(GAME2_LS_KEYS.CURRENT_STREAK, streak);
        
        const best = loadStat(GAME2_LS_KEYS.BEST_STREAK, 0);
        if (streak > best) saveStat(GAME2_LS_KEYS.BEST_STREAK, streak);
        
        const bestScore = loadStat(GAME2_LS_KEYS.BEST_SCORE, 0);
        if (score > bestScore) saveStat(GAME2_LS_KEYS.BEST_SCORE, score);
    } else {
        saveStat(GAME2_LS_KEYS.CURRENT_STREAK, 0);
    }
    
    addRecent({
        game: "Wordle",
        score,
        date: new Date().toISOString(),
        attempts: won ? state.row + 1 : 6,
        difficulty: won ? `${state.row + 1}/6` : "X/6"
    });
}

/**
 *  Displays the game over modal with results.
 * @param {*} won - whether the player won
 */
function showGameOver(won) {
    const title = document.getElementById("modalTitle");
    const message = document.getElementById("modalMessage");
    const word = document.getElementById("wordReveal");
    const attempts = document.getElementById("finalAttempts");
    const streak = document.getElementById("finalStreak");
    const wins = document.getElementById("totalWins");
    
    title.innerHTML = won 
        ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-right:8px;"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>Congratulations!'
        : "😢 Game Over";
    message.textContent = won ? "You guessed the word!" : "Better luck next time!";
    word.textContent = state.target;
    attempts.textContent = won ? `${state.row + 1}/6` : "X/6";
    streak.textContent = loadStat(GAME2_LS_KEYS.CURRENT_STREAK, 0);
    wins.textContent = loadStat(GAME2_LS_KEYS.WINS, 0);
    
    els.modal.classList.add("show");
}

// ============================================================================
// UI HELPERS
// ============================================================================

/**
 *  Displays a temporary message to the player.
 * @param {*} text - the message text
 * @param {*} type - the message type ("info", "success", "error")
 * @param {*} duration - how long to show the message (in ms)
 */
function showMessage(text, type = "info", duration = 2000) {
    els.message.textContent = text;
    els.message.className = `message show ${type}`;
    setTimeout(() => els.message.classList.remove("show"), duration);
}

/**
 * Updates the attempts display in the UI.
 */
function updateAttempts() {
    els.attempts.textContent = `${state.row}/${CONFIG.maxAttempts}`;
}

/**
 * Updates the current streak display in the UI.
 */
function updateStreak() {
    els.streak.textContent = loadStat(GAME2_LS_KEYS.CURRENT_STREAK, 0);
}


// ============================================================================
// GAME CONTROL
// ============================================================================

/**
 * Starts a new game by resetting the state and initializing the board and keyboard.
 */
function startNewGame() {
    state.target = selectWord();
    state.row = 0;
    state.tile = 0;
    state.guessed = [];
    state.gameOver = false;
    state.won = false;
    state.revealing = false;
    
    els.modal.classList.remove("show");
    createBoard();
    createKeyboard();
    updateAttempts();
    updateStreak();
    
    console.log("New game. Target:", state.target);
}

// ============================================================================
// EVENT BINDING
// ============================================================================

/**
 * Initializes event listeners for keyboard input and buttons.
 */
function initEvents() {
    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        const key = e.key.toUpperCase();
        if (key === "ENTER") handleKey("ENTER");
        else if (key === "BACKSPACE") handleKey("⌫");
        else if (/^[A-Z]$/.test(key)) handleKey(key);
    });
    
    els.newBtn.addEventListener("click", startNewGame);
    els.againBtn.addEventListener("click", startNewGame);
}

/**
 * Initializes the Wordle game (auth handled by auth-guard.js)
 */
function init() {
    if (!getCurrentSession()) return;
    ensureGame2DefaultsForUser(username);
    initElements();
    initEvents();
    startNewGame();
}
// Start the game when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", init);
