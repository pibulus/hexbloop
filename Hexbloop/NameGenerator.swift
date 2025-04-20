import Foundation
import SwiftUI

// MARK: - NameGenerator with Enhanced Word Lists
class NameGenerator: ObservableObject {
    // Configuration settings
    private var forceLowercase = true
    private var tripleWordChance = 35
    private var quadWordChance = 5
    private var connectorChance = 45
    private var glitchTextChance = 8
    private var numerologyChance = 15
    private var corruptionChance = 5
    private var witchHouseChance = 10
    private var vaporwaveChance = 10
    private var verbStartChance = 30
    
    // Style toggles
    private var useMoonPhase = true
    private var useTimeBasedEffects = true
    private var useSparklepop = false
    private var useBlackmetal = false
    private var styleChance = 100
    
    // Core word lists for name generation
    private let starterWords = [
        // Temporal/Cosmic Power
        "Ancient", "Eternal", "Infinite", "Cosmic", "Stellar", "Astral", "Galactic", "Solar",
        "Lunar", "Celestial", "Primordial", "Timeless", "Universal", "Dimensional", "Void",
        "Ethereal", "Interdimensional", "Parallel", "Quantum", "Temporal", "Perpetual",
        
        // Tech/Digital
        "Cyber", "Digital", "Virtual", "Neural", "Binary", "Quantum", "Atomic", "Vector",
        "Matrix", "Circuit", "Synthetic", "Artificial", "Mechanical", "Electronic", "Bionic",
        "Techno", "Cyber", "Nano", "Mega", "Hyper", "Ultra", "Proto", "Neo", "Post", "Trans",
        
        // Dark/Occult
        "Dark", "Black", "Shadow", "Night", "Twilight", "Occult", "Mystic", "Arcane",
        "Esoteric", "Hermetic", "Demonic", "Diabolic", "Infernal", "Abyssal", "Stygian",
        "Nether", "Forbidden", "Hidden", "Secret", "Veiled", "Obscure", "Cryptic",
        
        // Elements/Nature
        "Storm", "Thunder", "Lightning", "Fire", "Ice", "Frost", "Wind", "Earth", "Solar",
        "Lunar", "Astral", "Cosmic", "Nuclear", "Plasma", "Crystal", "Stone", "Metal",
        
        // Destructive/Power
        "Iron", "Steel", "Chrome", "Nuclear", "Atomic", "Electric", "Plasma", "Toxic",
        "Lethal", "Fatal", "Terminal", "Ultimate", "Supreme", "Extreme", "Maximum", "Total",
        "Absolute", "Omega", "Alpha", "Prime", "Master", "Lords", "Kings", "Gods",
        
        // Psychological/Horror
        "Psycho", "Manic", "Deranged", "Twisted", "Warped", "Demented", "Insane", "Mad",
        "Lunatic", "Possessed", "Haunted", "Cursed", "Doomed", "Damned", "Lost", "Broken",
        
        // Religious/Mythological
        "Divine", "Sacred", "Holy", "Unholy", "Profane", "Blessed", "Cursed", "Demon",
        "Angel", "Spirit", "Ghost", "Wraith", "Spectral", "Ethereal", "Celestial",
        
        // Scientific/Mathematical
        "Zero", "Null", "Void", "Complex", "Quantum", "Fractal", "Vector", "Static",
        "Dynamic", "Kinetic", "Thermal", "Sonic", "Audio", "Visual", "Neural", "Synaptic",
        
        // Cultural/Historical
        "Nordic", "Celtic", "Roman", "Greek", "Viking", "Samurai", "Ninja", "Tribal",
        "Primal", "Savage", "Feral", "Wild", "Nomad", "Wandering", "Eternal", "Ancient",
        
        // Industrial/Urban
        "Urban", "Metro", "City", "Street", "Neon", "Chrome", "Steel", "Iron", "Metal",
        "Industrial", "Mechanical", "Electric", "Factory", "Machine", "Motor", "Engine",
        
        // Skate/Punk Energy
        "Thrashed", "Shredded", "Grinded", "Wrecked", "Crushed", "Slammed", "Stoked",
        "Street", "Pool", "Bowl", "Curb", "Ramp", "Rail", "Bank", "Ledge", "Ditch",
        "Deck", "Trucks", "Wheels", "Grip", "Slide", "Drop", "Bail", "Ollie", "Slash",

        // DIY/Garage
        "Backyard", "Garage", "Basement", "Attic", "Porch", "Stoop", "Alley", "Shed",
        "Junked", "Patched", "Rigged", "Hacked", "Modded", "Fixed", "Botched", "Taped",
        "Scrapped", "Salvaged", "Recycled", "Scavenged", "Built", "Assembled",

        // Cozy/Homey
        "Snuggled", "Cuddled", "Nestled", "Tucked", "Wrapped", "Bundled", "Comfy",
        "Kitchen", "Garden", "Cottage", "Bedroom", "Patio", "Window", "Nook", "Corner",
        "Blanket", "Pillow", "Sweater", "Socks", "Tea", "Coffee", "Toast", "Soup",

        // Small Creatures
        "Raccoon", "Possum", "Rat", "Mouse", "Frog", "Toad", "Spider", "Cricket",
        "Moth", "Beetle", "Snail", "Slug", "Worm", "Beetle", "Squirrel", "Crow",
        "Cat", "Dog", "Bird", "Bug", "Critter", "Beast", "Friend", "Buddy"
    ]
    
    private let middleWords = [
        // Core Concepts (Strong one-word impact)
        "Death", "Blood", "Void", "Ghost", "Witch", "Storm", "Doom", "Fire", "Ice", "Thunder",
        "Demon", "Dragon", "Shadow", "Moon", "Star", "Sun", "Wolf", "Snake", "Crow", "Raven",
        
        // Tech/Digital
        "Circuit", "System", "Matrix", "Code", "Data", "Signal", "Virus", "Network", "Binary",
        "Machine", "Robot", "Cyber", "Digital", "Virtual", "Neural", "Quantum", "Atomic",
        
        // Occult/Mystical
        "Ritual", "Magic", "Curse", "Spell", "Rune", "Sigil", "Oracle", "Vision", "Spirit",
        "Soul", "Demon", "Angel", "Prophet", "Wizard", "Sorcery", "Alchemy", "Mystic",
        
        // Dark/Horror
        "Terror", "Horror", "Nightmare", "Trauma", "Panic", "Fear", "Dread", "Grave", "Tomb",
        "Crypt", "Coffin", "Zombie", "Vampire", "Ghost", "Wraith", "Specter", "Phantom",
        
        // Violence/Metal
        "Blade", "Sword", "Axe", "Knife", "Gun", "Bomb", "Weapon", "Armor", "Shield", "War",
        "Battle", "Combat", "Warrior", "Fighter", "Soldier", "Knight", "Assassin", "Slayer",
        
        // Industrial/Mechanical
        "Engine", "Motor", "Gear", "Piston", "Steel", "Iron", "Chrome", "Metal", "Alloy",
        "Machine", "Factory", "Furnace", "Forge", "Reactor", "Generator", "Battery",
        
        // Science/Cosmic
        "Plasma", "Laser", "Neutron", "Proton", "Electron", "Particle", "Wave", "Field",
        "Force", "Energy", "Matter", "Space", "Time", "Void", "Nebula", "Galaxy", "Cosmos",
        
        // Sound/Noise
        "Noise", "Sound", "Static", "Feedback", "Distortion", "Echo", "Reverb", "Drone",
        "Bass", "Beat", "Rhythm", "Pulse", "Frequency", "Wave", "Tone", "Resonance"
    ]
    
    private let enderWords = [
        // Tech/Digital Nouns
        "entropy", "matrix", "cortex", "cipher", "nexus", "paradox", "void", "crisis",
        "omega", "virus", "machine", "reactor", "system", "plasma", "circuit",
        
        // Dark/Mystic Nouns
        "specter", "wraith", "demon", "oracle", "prophet", "witch", "serpent", "dragon",
        "leviathan", "cult", "ritual", "omen", "raven", "sphinx", "beast",
        
        // Power/Element Nouns
        "thunder", "venom", "steel", "crystal", "storm", "fire", "frost", "lightning",
        "stone", "chrome", "iron", "hammer", "blade", "fang", "claw",
        
        // Cosmic/Deep Nouns
        "monolith", "eclipse", "star", "cosmos", "abyss", "vortex", "nebula", "nova",
        "titan", "comet", "planet", "moon", "sun", "asteroid", "galaxy"
    ]
    
    private let verbStarters = [
        // Aggressive
        "Crushing", "Burning", "Destroying", "Smashing", "Breaking", "Shattering",
        "Ripping", "Tearing", "Blasting", "Exploding", "Decimating", "Slaying",
        // Movement
        "Running", "Flying", "Falling", "Rising", "Drifting", "Floating", "Sliding",
        "Gliding", "Diving", "Soaring", "Spinning", "Turning", "Warping", "Phasing",
        // Tech
        "Glitching", "Corrupting", "Processing", "Computing", "Programming", "Coding",
        "Hacking", "Scanning", "Loading", "Buffering", "Compiling", "Encrypting"
    ]
    
    private let blackmetalWords = [
        "Voidcaller", "Wraithbound", "Sepulcher",
        "Maledict", "Lament", "Charnel", "Desolate", "Vortex", "Riftspawn", "Putrescence",
        "Blight", "Doomwraith", "Gloomrend", "Deathsong", "Whisperer", "Spectral",
        "Vileblood", "Tombward", "Scourge", "Pestilent", "Shadowflame", "Frostbound",
        "Cataclysm", "Corpsegrinder", "Nightfall", "Ritualist", "Torment", "Unhallowed",
        "Hex", "Occultus", "Grimoire", "Lichfire", "Sundered", "Moribund", "Revenant",
        "Eldritch", "Hollowborn", "Foulweaver", "Serpentfire", "Netherbound", "Specterveil",
        "Necrotide", "Dreadwake", "Sableclad", "Shivergloom", "Calamity", "Mournsong",
        "Voidgaze", "Nightbane", "Hellmire", "Bloodmoon", "Graveborn", "Bonechant",
        "Plaguefrost", "Ironveil", "Cindermire", "Crimsonwake", "Harbinger"
    ]
    
    private let sparklepopWords = [
        "SPARKLE", "GLITTER", "MAGIC", "STAR", "CRYSTAL", "RAINBOW", "DREAM",
        "CANDY", "FAIRY", "PIXIE", "ANGEL", "HEAVEN", "SWEET", "SUGAR", "COSMIC", "LUNA",
        "PRISMATIC", "STELLAR", "ASTRAL", "RADIANT", "TWINKLE", "SHIMMER", "GLIMMER",
        "Aurora", "Radiant", "Resplendent", "Crystalline", "Dawncaller", "Lightbound",
        "Sanctuary", "Blessed", "Hymn", "Sanctum", "Flourishing", "Zephyr", "Bloomspire",
        "Effulgence", "Vitality", "Graceweaver", "Sunlit", "Whisperglow", "Ethereal",
        "Goldblood", "Hearthward", "Renewal", "Serene", "Emberlight", "Springbound",
        "Harmony", "Lifecry", "Tranquil", "Reborn", "Hallowed", "Charm", "Luminus",
        "Promise", "Sunflare", "Healing", "Verdant", "Ascendant", "Eternal", "Blessedborn",
        "Pureweaver", "Flamekissed", "Skybound", "Shimmerveil", "Lifetide", "Dawnwake",
        "Silverclad", "Morningglow", "Genesis", "Joysong", "Stargaze", "Lightbane"
    ]
    
    private let connectors = [
        // Basic Prepositions
        "of", "from", "in", "beyond", "beneath", "above", "through", "without", "versus",
        "against", "inside", "outside", "between", "among", "within", "despite", "under",
        "over", "behind", "before", "and",
        
        // Extended Mystical
        "beyond", "beneath", "within", "betwixt", "amidst", "throughout", "beyond-the",
        "beneath-the", "within-the", "through-the", "outside-the", "inside-the",
        
        // Tech Terms
        "via", "using", "while", "during", "after", "before", "error", "exception",
        "interrupt", "buffer", "cache", "stack", "heap", "null", "void", "undefined",
        
        // Transformation
        "corrupted-by", "glitched-through", "destroyed-by", "consumed-by", "eaten-by",
        "processed-by", "filtered-through", "converted-to", "transformed-into",
        
        // New Aggressive
        "versus", "against", "crushing", "destroying", "consuming", "devouring", "executing",
        
        // New Tech
        "processing", "compiling", "rendering", "executing", "parsing", "encoding"
    ]
    
    private let witchHouseSymbols = [
        // Classic Crosses
        "†", "‡", "✟", "✞", "☨", "✝", "✠", "✚", 
        // Triangles and Geometric
        "▲", "△", "▴", "◬", "◈", "◇", "◆", "⬙", "⬡", "⬢",
        // Lines and Dashes
        "⎯", "─", "═", "━",
        // Mystical/Occult
        "⌘", "☥", "⚰", "⚱", "☠", "☤", "⚕", "⚚",
        // Celestial
        "☽", "☾", "★", "☆", "✧", "✦", "⚝", "✴", "✳",
        // Pentagrams/Magic
        "⛤", "⛥", "⛦", "⛧", "⚝",
        // Power/Energy
        "⚡", "∆", "Ω", "⚛"
    ]
    
    private let vaporwaveSymbols = [
        // Classic Vaporwave
        "アエスト", "ＶＡＰＯＲ", "ＷＡＶＥ", "サイバー", "ＣＹＢＥＲ", "ＰＬＡＺＡ",
        // Additional Japanese Aesthetic
        "アンビエント", "デジタル", "バーチャル", "レトロ", "ネオン",
        // Extended Vaporwave
        "ＤＲＥＡＭ", "ＶＩＲＴＵＡＬ", "ＶＯＩＤ", "ＮＩＧＨＴ", "ＳＵＮＳＥＴ",
        // Tech Terms
        "ＳＹＳＴＥＭ", "ＭＥＭＯＲＹ", "ＥＲＲＯＲ", "ＤＡＴＡ", "ＧＲＩＤ"
    ]
    
    private let sparklepopSymbols = [
        "✧", "✮", "❀", "✿", "❁", "✾", "☆", "★", "♡", "♥", "❥", "💖", "✩", "⋆", "⭐", 
        "🌟", "✦", "⭑", "∗", "✫", "⊹", "✴", "🎀", "🌸", "✨", "💫", "⚡", "🦄", "🌈",
        "😺", "😻", "😸", "😽", "😹", "😼", "😺", "🐱", "🐈", "🐾", "🌺", "🌷", "🌹", 
        "💐", "🌼", "🌻", "🌟", "🌙", "☀️", "🌞", "🌜", "🌛", "🌠", "🌌", "🌃", "🌉",
        "💎", "🌺", "✨", "🌟", "💫", "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", 
        "💖", "💘", "💝", "💗", "💓", "💞", "💕", "💟"
    ]
    
    private let zalgoMarks = [
        "̶", "̷", "̸", "̹", "̺", "̻", "̼", "̽", "̾", "̿", "̀", "́", "͂", "̓", "̈́", "͆", "͊", "͋", "͌", "͐",
        "͑", "͒", "͗", "͛", "͝", "͞", "͠", "͡", "͢", "̀", "́", "͘", "̂", "̃", "̄", "̅", "̆", "̇", "̈", "̉",
        "̊", "̋", "̌", "̍", "̎", "̏", "̐", "̑", "̒", "̓", "̔", "̕", "̖", "̗", "̘", "̙", "̚", "̛", "̜", "̝",
        "̞", "̟", "̠", "̡", "̢", "̣", "̤", "̥", "̦", "̧", "̨", "̩", "̪", "̫", "̬", "̭", "̮", "̯", "̰", "̱"
    ]
    
    private let numerologyNumbers = [
        // Classic Power Numbers
        "666", "777", "888", "333", "444", "555", "111", "222", "999", "000",
        // Binary
        "101", "010", "001", "110", "011",
        // Hex
        "0x00", "0xFF", "0xF0", "0x0F",
        // Special Numbers
        "13", "23", "93", "616", "418",
        // Year Format
        "1999", "2000", "808", "909",
        // Combinations
        "666777", "333444", "000111"
    ]
    
    private let asciiElements = [
        // Classic Patterns
        "▓▒░", "░▒▓", "█▀█", "▀▄▀", "▄▀▄", 
        // Corners and Boxes
        "┌┐", "└┘", "┌└┐", "╔╗", "╚╝", "║║", "╠╣",
        // Gradients
        "░█░", "▒█▒", "▓█▓", "▒░▒", "▓▒▓",
        // Complex Patterns
        "▀█▀", "█▄█", "▌▌", "▐▐", "██",
        // Geometric
        "◢◣", "◥◤", "◄►", "◆◇", "◈◈",
        // Blocky
        "█▉▊▋▌▍▎", "▁▂▃▄▅▆▇█", "█■□▢▣▤▥▦▧▨▩"
    ]
    
    // Get current hour to influence naming
    private var hourOfDay: Int {
        Calendar.current.component(.hour, from: Date())
    }
    
    // Get current moon phase
    private func getMoonPhase() -> Int {
        // Simplified calculation of moon phase
        // Lunar period in seconds (29.53 days)
        let lunarPeriodSeconds: TimeInterval = 29.53 * 24 * 60 * 60
        
        // Known new moon reference date
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd HH:mm"
        formatter.timeZone = TimeZone(abbreviation: "UTC")
        let referenceNewMoon = formatter.date(from: "2022-01-06 18:33")!
        
        // Calculate time since reference new moon
        let timeSinceReference = Date().timeIntervalSince(referenceNewMoon)
        
        // Calculate current phase percentage (0-100)
        let phase = (timeSinceReference.truncatingRemainder(dividingBy: lunarPeriodSeconds)) / lunarPeriodSeconds * 100
        
        return Int(phase)
    }
    
    // Generate a random numerology suffix
    private func generateNumerology() -> String {
        guard Int.random(in: 1...100) <= numerologyChance else { return "" }
        
        return "_\(numerologyNumbers.randomElement() ?? "666")"
    }
    
    // Apply "corruption" effects to text
    private func corruptText(_ text: String) -> String {
        guard Int.random(in: 1...100) <= corruptionChance else { return text }
        
        var result = text
        let corruptionType = Int.random(in: 0...2)
        
        switch corruptionType {
        case 0: // Reverse chunks
            let length = text.count
            let chunkSize = length / 3
            if chunkSize > 0 {
                let startPos = Int.random(in: 0...(length - chunkSize))
                let startIndex = text.index(text.startIndex, offsetBy: startPos)
                let endIndex = text.index(startIndex, offsetBy: chunkSize)
                
                let prefix = text[..<startIndex]
                let middleReversed = String(text[startIndex..<endIndex].reversed())
                let suffix = text[endIndex...]
                
                result = String(prefix) + middleReversed + String(suffix)
            }
            
        case 1: // Hex insertion
            let hexVal = String(format: "%02x", Int.random(in: 0...255))
            result = "\(text)_0x\(hexVal)"
            
        case 2: // Binary glitch
            let binaryVal = String(Int.random(in: 0...15), radix: 2).padding(toLength: 4, withPad: "0", startingAt: 0)
            result = "\(text)_\(binaryVal)"
        }
        
        return result
    }
    
    // Add zalgo-style glitch text effects
    private func addZalgoEffects(to text: String) -> String {
        guard Int.random(in: 1...100) <= glitchTextChance else { return text }
        
        var result = ""
        let glitchIntensity = Int.random(in: 1...3)
        
        for char in text {
            result.append(char)
            if Int.random(in: 1...100) <= 30 {
                for _ in 0..<glitchIntensity {
                    if let zalgoMark = zalgoMarks.randomElement() {
                        result.append(zalgoMark)
                    }
                }
            }
        }
        
        return result
    }
    
    // Apply style-specific symbols based on mode
    private func applyStyleSymbols(to text: String) -> String {
        var result = text
        
        // Add witch house symbols
        if Int.random(in: 1...100) <= witchHouseChance {
            if let symbol = witchHouseSymbols.randomElement() {
                result = "\(symbol)\(result)\(symbol)"
            }
        }
        
        // Add vaporwave symbols
        if Int.random(in: 1...100) <= vaporwaveChance {
            if let symbol = vaporwaveSymbols.randomElement() {
                let insertPoint = Int.random(in: 0...result.count)
                let index = result.index(result.startIndex, offsetBy: insertPoint)
                result.insert(contentsOf: symbol, at: index)
            }
        }
        
        return result
    }
    
    // Generate name with natural influences and expanded options
    func generateName() -> String {
        // Check if we should use style-specific generation
        let useStyleSpecific = Int.random(in: 1...100) <= styleChance
        
        // Choose first word based on style settings
        let word1: String
        if useStyleSpecific && useSparklepop {
            word1 = sparklepopWords.randomElement() ?? "SPARKLE"
        } else if useStyleSpecific && useBlackmetal {
            word1 = blackmetalWords.randomElement() ?? "VOIDCALLER"
        } else if Int.random(in: 1...100) <= verbStartChance {
            word1 = verbStarters.randomElement() ?? "GLITCHING"
        } else {
            word1 = starterWords.randomElement() ?? "CYBER"
        }
        
        // Always get middle word
        let word2 = middleWords.randomElement() ?? "CIRCUIT"
        
        // Build initial name
        var result = "\(word1)_\(word2)"
        
        // Handle quad word chance first (it's rarer)
        if Int.random(in: 1...100) <= quadWordChance {
            let word3 = middleWords.randomElement() ?? "VOID"
            let word4 = enderWords.randomElement() ?? "entropy"
            
            if Int.random(in: 1...100) <= connectorChance {
                let conn1 = connectors.randomElement() ?? "of"
                let conn2 = connectors.randomElement() ?? "through"
                result = "\(word1)_\(conn1)_\(word2)_\(conn2)_\(word3)_\(word4)"
            } else {
                result = "\(word1)_\(word2)_\(word3)_\(word4)"
            }
        // Then handle triple word chance
        } else if Int.random(in: 1...100) <= tripleWordChance {
            let word3 = enderWords.randomElement() ?? "matrix"
            
            if Int.random(in: 1...100) <= connectorChance {
                let conn = connectors.randomElement() ?? "of"
                result = "\(word1)_\(word2)_\(conn)_\(word3)"
            } else {
                result = "\(word1)_\(word2)_\(word3)"
            }
        }
        
        // Apply style-specific formatting
        if useStyleSpecific && useSparklepop {
            result = result.uppercased()
            if let sym1 = sparklepopSymbols.randomElement(),
               let sym2 = sparklepopSymbols.randomElement() {
                result = "\(sym1)\(result)\(sym2)"
            }
        }
        
        if useStyleSpecific && useBlackmetal {
            result = "†_\(result)_†"
        }
        
        // Apply effects chain
        result = applyStyleSymbols(to: result)
        result = addZalgoEffects(to: result)
        result = corruptText(result)
        
        // Add numerology if needed
        result += generateNumerology()
        
        // Add date stamp (optional)
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "ddMMyy"
        let dateStr = dateFormatter.string(from: Date())
        result = "\(dateStr)_\(result)"
        
        // Handle lowercase conversion
        if forceLowercase && !useSparklepop {
            result = result.lowercased()
        }
        
        return result
    }
    
    // Apply glitch effects to a name
    func applyGlitchEffects(to name: String) -> String {
        // Only apply glitch effects occasionally
        guard Int.random(in: 1...100) <= 30 else {
            return name
        }
        
        var glitchedName = name
        
        // Replace some characters with similar looking ones
        let glitchMappings: [Character: Character] = [
            "A": "Λ", "E": "Σ", "I": "Ι", "O": "Ø", "U": "Ʊ",
            "N": "Π", "H": "Η", "T": "Τ", "X": "Χ", "S": "Ƨ"
        ]
        
        // Apply glitch mapping randomly to a few characters
        for i in 0..<glitchedName.count {
            let index = glitchedName.index(glitchedName.startIndex, offsetBy: i)
            let char = glitchedName[index]
            
            if glitchMappings.keys.contains(char), Int.random(in: 1...100) <= 25 {
                glitchedName.replaceSubrange(index...index, with: String(glitchMappings[char]!))
            }
        }
        
        return glitchedName
    }
    
    // Update configuration
    func updateConfiguration(
        forceLowercase: Bool? = nil,
        useSparklepop: Bool? = nil,
        useBlackmetal: Bool? = nil,
        useWitchHouse: Bool? = nil,
        glitchIntensity: Int? = nil,
        corruptionIntensity: Int? = nil
    ) {
        if let forceLowercase = forceLowercase {
            self.forceLowercase = forceLowercase
        }
        
        if let useSparklepop = useSparklepop {
            self.useSparklepop = useSparklepop
        }
        
        if let useBlackmetal = useBlackmetal {
            self.useBlackmetal = useBlackmetal
        }
        
        if let useWitchHouse = useWitchHouse {
            self.witchHouseChance = useWitchHouse ? 90 : 10
        }
        
        if let glitchIntensity = glitchIntensity {
            self.glitchTextChance = min(max(glitchIntensity, 0), 100)
        }
        
        if let corruptionIntensity = corruptionIntensity {
            self.corruptionChance = min(max(corruptionIntensity, 0), 100)
        }
    }
}