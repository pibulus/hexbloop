import Foundation
import SwiftUI

// MARK: - NameGenerator with Enhanced Word Lists
class NameGenerator: ObservableObject {
    // Core word lists for name generation
    private let prefixes = [
        "GLITTER", "CRYPT", "LUNAR", "SHADOW", "FROST", "NEBULA", "PHANTOM", "SOLAR", 
        "TWILIGHT", "EMBER", "CYBER", "DIGITAL", "VIRTUAL", "NEURAL", "BINARY", "ATOMIC", 
        "VECTOR", "MATRIX", "CIRCUIT", "SYNTHETIC", "ARTIFICIAL", "MECHANICAL", "ELECTRONIC", 
        "BIONIC", "TECHNO", "NANO", "MEGA", "HYPER", "ULTRA", "PROTO", "NEO", "POST",
        "DARK", "BLACK", "SHADOW", "NIGHT", "OCCULT", "MYSTIC", "ARCANE", "ESOTERIC", 
        "HERMETIC", "DEMONIC", "DIABOLIC", "INFERNAL", "ABYSSAL", "STYGIAN", "FORBIDDEN", 
        "HIDDEN", "SECRET", "VEILED", "OBSCURE", "CRYPTIC", "STORM", "THUNDER", "LIGHTNING"
    ]
    
    private let suffixes = [
        "RITUAL", "MACHINE", "VECTOR", "CIPHER", "NOISE", "SPECTRUM", "ECHO", "WAVE", 
        "SPHERE", "FLARE", "DEATH", "BLOOD", "VOID", "GHOST", "WITCH", "STORM", "DOOM", 
        "DEMON", "DRAGON", "SHADOW", "MOON", "STAR", "SUN", "WOLF", "SNAKE", "CROW", 
        "CIRCUIT", "SYSTEM", "MATRIX", "CODE", "DATA", "SIGNAL", "VIRUS", "NETWORK", 
        "BINARY", "MACHINE", "ROBOT", "CYBER", "DIGITAL", "VIRTUAL", "NEURAL", "QUANTUM"
    ]
    
    private let verbStarters = [
        "CRUSHING", "BURNING", "DESTROYING", "SMASHING", "BREAKING", "SHATTERING",
        "RIPPING", "TEARING", "BLASTING", "EXPLODING", "DECIMATING", "SLAYING",
        "GLITCHING", "CORRUPTING", "PROCESSING", "COMPUTING", "PROGRAMMING", "CODING",
        "HACKING", "SCANNING", "LOADING", "BUFFERING", "COMPILING", "ENCRYPTING"
    ]
    
    private let witchHouseSymbols = ["†", "‡", "✟", "✞", "☨", "✝", "✠", "✚", "▲", "△"]
    
    // Get current hour to influence naming
    private var hourOfDay: Int {
        Calendar.current.component(.hour, from: Date())
    }
    
    // Generate name with natural influences
    func generateName() -> String {
        let useDarkMode = hourOfDay >= 20 || hourOfDay <= 6
        let useVerb = Int.random(in: 1...100) <= 30
        
        // Choose prefix based on time and randomness
        let prefix: String
        if useVerb {
            prefix = verbStarters.randomElement() ?? "GLITCHING"
        } else {
            prefix = prefixes.randomElement() ?? "CYBER"
        }
        
        let suffix = suffixes.randomElement() ?? "PULSE"
        let number = Int.random(in: 1000...9999)
        
        // Add witch house symbols at night
        let name: String
        if useDarkMode && Int.random(in: 1...100) <= 40 {
            let symbol = witchHouseSymbols.randomElement() ?? "†"
            name = "\(symbol)\(prefix)\(suffix)\(number)\(symbol)"
        } else {
            name = "\(prefix)\(suffix)\(number)"
        }
        
        return name
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
}