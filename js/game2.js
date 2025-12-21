/**
 * Wordle Game - PlayHub Gaming Portal
 * @file game2.js
 * @description Word guessing game with statistics tracking.
 * @requires storage.js
 */

"use strict";

// ============================================================================
// WORD LISTS
// ============================================================================

const WORD_LIST = [
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

const ANSWER_WORDS = [
    "about", "above", "actor", "admit", "adult", "after", "again", "agent", "agree", "ahead",
    "album", "alert", "alive", "allow", "alone", "along", "among", "angel", "anger", "angry",
    "apart", "apple", "arena", "argue", "arise", "armor", "array", "arrow", "audio", "avoid",
    "award", "aware", "awful", "badge", "badly", "baker", "basic", "beach", "beast", "began",
    "begin", "being", "below", "bench", "birth", "black", "blade", "blame", "blank", "blast",
    "blend", "blind", "block", "blood", "bloom", "board", "bonus", "booth", "bound", "brain",
    "brake", "brand", "brave", "bread", "break", "breed", "brick", "bride", "brief", "bring",
    "broad", "broke", "brown", "brush", "build", "built", "bunch", "burst", "buyer", "cabin",
    "cable", "camel", "candy", "cargo", "carry", "catch", "cause", "chain", "chair", "charm",
    "chart", "chase", "cheap", "check", "cheek", "cheer", "chess", "chest", "chief", "child",
    "china", "chose", "chunk", "civil", "claim", "class", "clean", "clear", "clerk", "click",
    "cliff", "climb", "clock", "clone", "close", "cloth", "cloud", "clown", "coach", "coast",
    "color", "comic", "coral", "couch", "could", "count", "court", "cover", "crack", "craft",
    "crane", "crash", "crawl", "crazy", "cream", "creek", "crime", "crisp", "cross", "crowd",
    "crown", "cruel", "crush", "curve", "cycle", "daily", "dance", "death", "debut", "decay",
    "delay", "demon", "denim", "depth", "devil", "diary", "digit", "dirty", "ditch", "diver",
    "doing", "donor", "doubt", "dough", "draft", "drain", "drama", "drank", "drawn", "dread",
    "dream", "dress", "dried", "drift", "drill", "drink", "drive", "drown", "drums", "drunk",
    "dying", "eager", "eagle", "early", "earth", "eaten", "eight", "elbow", "elder", "elect",
    "elite", "email", "empty", "enemy", "enjoy", "enter", "entry", "equal", "error", "essay",
    "event", "every", "exact", "exist", "extra", "faint", "fairy", "faith", "false", "fancy",
    "fatal", "fault", "favor", "feast", "fence", "fever", "fiber", "field", "fiery", "fifth",
    "fifty", "fight", "final", "first", "fixed", "flame", "flash", "flesh", "float", "flock",
    "flood", "floor", "flour", "fluid", "flush", "focal", "focus", "force", "forge", "forth",
    "forty", "forum", "found", "frame", "frank", "fraud", "fresh", "fried", "front", "frost",
    "fruit", "fully", "funny", "giant", "given", "glass", "globe", "glory", "going", "grace",
    "grade", "grain", "grand", "grant", "grape", "graph", "grasp", "grass", "grave", "great",
    "greed", "green", "greet", "grief", "grill", "grind", "group", "grove", "growl", "grown",
    "guard", "guess", "guest", "guide", "guilt", "habit", "happy", "harsh", "hasty", "haven",
    "heart", "heavy", "hedge", "hello", "hence", "honey", "honor", "horse", "hotel", "hound",
    "house", "human", "humor", "hurry", "ideal", "image", "imply", "index", "inner", "input",
    "intro", "irony", "issue", "jeans", "jewel", "joint", "joker", "jolly", "judge", "juice",
    "jumbo", "karma", "knife", "knock", "known", "label", "labor", "large", "laser", "later",
    "laugh", "layer", "learn", "lease", "least", "leave", "legal", "lemon", "level", "lever",
    "light", "liked", "limit", "lined", "liver", "local", "lodge", "logic", "loose", "lover",
    "lower", "loyal", "lucky", "lunar", "lunch", "lying", "magic", "major", "maker", "manor",
    "maple", "march", "match", "maybe", "mayor", "meant", "medal", "media", "mercy", "merge",
    "merit", "merry", "metal", "meter", "micro", "might", "minor", "minus", "mixed", "model",
    "money", "month", "moral", "motor", "motto", "mount", "mouse", "mouth", "moved", "movie",
    "music", "nanny", "nasty", "naval", "nerve", "never", "newer", "night", "noble", "noise",
    "north", "noted", "novel", "nurse", "occur", "ocean", "offer", "often", "olive", "opera",
    "orbit", "order", "other", "ought", "outer", "owned", "owner", "paint", "panel", "panic",
    "paper", "party", "pasta", "patch", "pause", "peace", "peach", "pearl", "penny", "perch",
    "phase", "phone", "photo", "piano", "piece", "pilot", "pinch", "pitch", "pixel", "pizza",
    "place", "plain", "plane", "plant", "plate", "plaza", "plead", "pluck", "plumb", "plump",
    "plush", "poach", "point", "polar", "pouch", "pound", "power", "press", "price", "pride",
    "prime", "print", "prior", "prize", "proof", "proud", "prove", "pulse", "punch", "pupil",
    "puppy", "queen", "query", "quest", "quick", "quiet", "quote", "radio", "rainy", "raise",
    "rally", "ranch", "range", "rapid", "ratio", "razor", "reach", "react", "ready", "realm",
    "rebel", "refer", "reign", "relax", "renew", "repay", "reply", "rerun", "reset", "retry",
    "reuse", "rider", "ridge", "rifle", "right", "risky", "rival", "river", "roach", "roast",
    "robin", "robot", "rocky", "rough", "round", "route", "royal", "rugby", "ruins", "ruler",
    "rumor", "rural", "sadly", "saint", "salad", "salon", "sandy", "sauce", "scale", "scare",
    "scarf", "scary", "scene", "scent", "score", "scout", "scrap", "screw", "seize", "sense",
    "serve", "setup", "seven", "shade", "shake", "shaky", "shall", "shame", "shape", "share",
    "shark", "sharp", "shave", "sheet", "shelf", "shell", "shift", "shine", "shiny", "shirt",
    "shock", "shoot", "shore", "short", "shout", "shown", "sight", "silly", "since", "siren",
    "sixth", "sixty", "skate", "skull", "slack", "slate", "slave", "sleep", "slice", "slide",
    "slope", "small", "smart", "smash", "smell", "smile", "smoke", "snake", "sneak", "solid",
    "solve", "sorry", "sound", "south", "space", "spare", "spark", "speak", "spear", "speed",
    "spell", "spend", "spent", "spice", "spill", "spine", "spoil", "spoke", "spoon", "sport",
    "spray", "squad", "stack", "staff", "stage", "stain", "stair", "stake", "stand", "stare",
    "start", "state", "steak", "steal", "steam", "steel", "steep", "steer", "stick", "still",
    "sting", "stock", "stone", "stood", "stool", "store", "storm", "story", "stout", "stove",
    "strap", "straw", "strip", "stuck", "study", "stuff", "style", "sugar", "suite", "sunny",
    "super", "surge", "swear", "sweat", "sweep", "sweet", "swept", "swift", "swing", "swipe",
    "sword", "sworn", "table", "taken", "taste", "teach", "teeth", "tempo", "tense", "thank",
    "theft", "their", "theme", "there", "these", "thick", "thief", "thigh", "thing", "think",
    "third", "those", "three", "threw", "throw", "thumb", "tiger", "tight", "timer", "title",
    "today", "token", "tooth", "topic", "torch", "total", "touch", "tough", "towel", "tower",
    "toxic", "trace", "track", "trade", "trail", "train", "trait", "trash", "treat", "trend",
    "trial", "tribe", "trick", "tried", "troop", "trout", "truck", "truly", "trump", "trunk",
    "trust", "truth", "tutor", "twice", "twist", "ultra", "uncle", "under", "union", "unite",
    "unity", "until", "upper", "upset", "urban", "usage", "usual", "valid", "value", "video",
    "viral", "virus", "visit", "vital", "vivid", "vocal", "voice", "voter", "wagon", "waist",
    "watch", "water", "waved", "weary", "weave", "wedge", "weigh", "weird", "whale", "wheat",
    "wheel", "where", "which", "while", "white", "whole", "whose", "widen", "widow", "width",
    "witch", "woman", "women", "woods", "world", "worry", "worse", "worst", "worth", "would",
    "wound", "woven", "wrath", "wreck", "wrist", "write", "wrong", "wrote", "yacht", "yield",
    "young", "youth", "zebra"
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

function gameKey(base) {
    return userKey(base, username);
}

function loadStat(key, fallback = 0) {
    const val = readJson(gameKey(key), fallback);
    const num = Number(val);
    return Number.isNaN(num) ? fallback : num;
}

function saveStat(key, value) {
    writeJson(gameKey(key), value);
}

function incrementStat(key, amount = 1) {
    const next = loadStat(key, 0) + amount;
    saveStat(key, next);
    return next;
}

function getRecent() {
    const data = readJson(gameKey(GAME2_LS_KEYS.RECENT_RESULTS), []);
    return Array.isArray(data) ? data : [];
}

function addRecent(entry) {
    const updated = [entry, ...getRecent()].slice(0, 5);
    writeJson(gameKey(GAME2_LS_KEYS.RECENT_RESULTS), updated);
}

// ============================================================================
// WORD FUNCTIONS
// ============================================================================

function selectWord() {
    return ANSWER_WORDS[Math.floor(Math.random() * ANSWER_WORDS.length)].toUpperCase();
}

function isValidWord(word) {
    const lower = word.toLowerCase();
    return WORD_LIST.includes(lower) || ANSWER_WORDS.includes(lower);
}

function getCurrentWord() {
    return state.board[state.row].map(c => c.letter).join("");
}

// ============================================================================
// BOARD & KEYBOARD
// ============================================================================

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

function createKeyboard() {
    els.keyboard.innerHTML = "";
    
    KEYBOARD_ROWS.forEach(row => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "keyboard-row";
        
        row.forEach(key => {
            const btn = document.createElement("button");
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

function updateTile(row, col, letter) {
    const tile = document.querySelector(`.wordle-cell[data-row="${row}"][data-col="${col}"]`);
    if (tile) {
        tile.textContent = letter;
        tile.classList.toggle("filled", !!letter);
    }
    state.board[row][col].letter = letter;
}

function updateKeyboardKey(letter, newState) {
    const key = document.querySelector(`.key[data-key="${letter}"]`);
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

function addLetter(letter) {
    if (state.tile >= CONFIG.wordLength) return;
    updateTile(state.row, state.tile, letter);
    state.tile++;
}

function deleteLetter() {
    if (state.tile <= 0) return;
    state.tile--;
    updateTile(state.row, state.tile, "");
}

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

function evaluateGuess(guess) {
    const results = new Array(CONFIG.wordLength).fill("absent");
    const targetLetters = state.target.split("");
    const guessLetters = guess.split("");
    
    // Mark correct positions
    guessLetters.forEach((letter, i) => {
        if (letter === targetLetters[i]) {
            results[i] = "correct";
            targetLetters[i] = null;
        }
    });
    
    // Mark present letters
    guessLetters.forEach((letter, i) => {
        if (results[i] === "correct") return;
        const idx = targetLetters.indexOf(letter);
        if (idx !== -1) {
            results[i] = "present";
            targetLetters[idx] = null;
        }
    });
    
    return results;
}

function revealWord(guess) {
    state.revealing = true;
    const results = evaluateGuess(guess);
    const row = document.querySelector(`.wordle-row[data-row="${state.row}"]`);
    const tiles = row.querySelectorAll(".wordle-cell");
    
    tiles.forEach((tile, i) => {
        setTimeout(() => {
            tile.classList.add("flip");
            setTimeout(() => {
                tile.classList.add(results[i]);
                updateKeyboardKey(guess[i], results[i]);
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

function shakeRow(rowIndex) {
    const row = document.querySelector(`.wordle-row[data-row="${rowIndex}"]`);
    row.classList.add("shake");
    setTimeout(() => row.classList.remove("shake"), CONFIG.shakeDelay);
}

// ============================================================================
// WIN/LOSS HANDLING
// ============================================================================

function handleWin() {
    state.gameOver = true;
    state.won = true;
    
    const messages = ["Genius!", "Magnificent!", "Impressive!", "Splendid!", "Great!", "Phew!"];
    showMessage(messages[Math.min(state.row, messages.length - 1)], "success");
    
    const score = (CONFIG.maxAttempts - state.row) * 10;
    updateStats(true, score);
    
    setTimeout(() => showGameOver(true), 1500);
}

function handleLoss() {
    state.gameOver = true;
    state.won = false;
    
    showMessage(state.target, "info", 3000);
    updateStats(false, 0);
    
    setTimeout(() => showGameOver(false), 2000);
}

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

function showMessage(text, type = "info", duration = 2000) {
    els.message.textContent = text;
    els.message.className = `message show ${type}`;
    setTimeout(() => els.message.classList.remove("show"), duration);
}

function updateAttempts() {
    els.attempts.textContent = `${state.row}/${CONFIG.maxAttempts}`;
}

function updateStreak() {
    els.streak.textContent = loadStat(GAME2_LS_KEYS.CURRENT_STREAK, 0);
}

// ============================================================================
// GAME CONTROL
// ============================================================================

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

// ============================================================================
// INITIALIZATION
// ============================================================================

function init() {
    ensureGame2DefaultsForUser(username);
    initElements();
    initEvents();
    startNewGame();
}

document.addEventListener("DOMContentLoaded", init);
