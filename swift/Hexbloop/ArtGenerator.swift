import Foundation
import SwiftUI
import CoreGraphics
import AppKit

// MARK: - Art Generator for Procedural Artwork
class ArtGenerator: ObservableObject {
    // Generation properties
    private let width: Int = 1000
    private let height: Int = 1000
    private let maxShapes: Int = 30
    
    // Generation style options
    enum ArtStyle: String, CaseIterable {
        case electronic = "Electronic"
        case darkSynthwave = "Dark Synthwave"
        case ambientSpace = "Ambient Space" 
        case loFi = "Lo-Fi"
        case industrial = "Industrial"
        case cyberPunk = "Cyberpunk"
        case vaporwave = "Vaporwave"
        case glitch = "Glitch"
    }
    
    // Color palettes for different moods and styles
    private let darkPalette = [
        NSColor(red: 0.1, green: 0.0, blue: 0.2, alpha: 1.0),
        NSColor(red: 0.3, green: 0.0, blue: 0.3, alpha: 1.0),
        NSColor(red: 0.5, green: 0.0, blue: 0.1, alpha: 1.0),
        NSColor(red: 0.1, green: 0.0, blue: 0.1, alpha: 1.0),  // Very dark purple
        NSColor(red: 0.2, green: 0.1, blue: 0.3, alpha: 1.0)
    ]
    
    private let brightPalette = [
        NSColor(red: 0.8, green: 0.2, blue: 0.7, alpha: 1.0),  // Vibrant pink
        NSColor(red: 0.9, green: 0.4, blue: 0.3, alpha: 1.0),  // Coral
        NSColor(red: 0.7, green: 0.8, blue: 0.9, alpha: 1.0),  // Light blue
        NSColor(red: 0.5, green: 0.5, blue: 1.0, alpha: 1.0),  // Medium blue
        NSColor(red: 1.0, green: 0.8, blue: 0.2, alpha: 1.0)   // Gold
    ]
    
    private let naturalPalette = [
        NSColor(red: 0.0, green: 0.3, blue: 0.6, alpha: 1.0),  // Deep blue
        NSColor(red: 0.6, green: 0.4, blue: 0.2, alpha: 1.0),  // Earth brown
        NSColor(red: 0.2, green: 0.4, blue: 0.2, alpha: 1.0),  // Forest green
        NSColor(red: 0.7, green: 0.7, blue: 0.8, alpha: 1.0),  // Silver gray
        NSColor(red: 0.5, green: 0.3, blue: 0.5, alpha: 1.0)   // Purple
    ]
    
    // New cyberpunk palette
    private let cyberpunkPalette = [
        NSColor(red: 0.0, green: 0.9, blue: 1.0, alpha: 1.0),  // Neon cyan
        NSColor(red: 1.0, green: 0.0, blue: 0.8, alpha: 1.0),  // Hot pink
        NSColor(red: 1.0, green: 0.8, blue: 0.0, alpha: 1.0),  // Bright yellow
        NSColor(red: 0.0, green: 0.5, blue: 0.9, alpha: 1.0),  // Electric blue
        NSColor(red: 0.9, green: 0.0, blue: 0.4, alpha: 1.0)   // Magenta
    ]
    
    // Lo-Fi palette
    private let lofiPalette = [
        NSColor(red: 0.6, green: 0.4, blue: 0.5, alpha: 1.0),  // Muted purple
        NSColor(red: 0.5, green: 0.5, blue: 0.4, alpha: 1.0),  // Soft olive
        NSColor(red: 0.3, green: 0.4, blue: 0.5, alpha: 1.0),  // Steel blue
        NSColor(red: 0.5, green: 0.3, blue: 0.3, alpha: 1.0),  // Faded rust
        NSColor(red: 0.4, green: 0.4, blue: 0.4, alpha: 1.0)   // Medium grey
    ]
    
    // Vaporwave palette
    private let vaporwavePalette = [
        NSColor(red: 1.0, green: 0.4, blue: 0.8, alpha: 1.0),  // Bubble gum pink
        NSColor(red: 0.4, green: 0.8, blue: 1.0, alpha: 1.0),  // Light blue
        NSColor(red: 0.7, green: 0.5, blue: 1.0, alpha: 1.0),  // Lavender
        NSColor(red: 0.0, green: 0.8, blue: 0.8, alpha: 1.0),  // Teal
        NSColor(red: 0.9, green: 0.9, blue: 0.4, alpha: 1.0)   // Soft yellow
    ]
    
    // Get palette for a specific art style
    private func getPalette(for style: ArtStyle? = nil) -> [NSColor] {
        // If no style provided, determine based on time of day
        if style == nil {
            let hourOfDay = Calendar.current.component(.hour, from: Date())
            
            if hourOfDay >= 20 || hourOfDay < 6 {
                return darkPalette
            } else if hourOfDay >= 10 && hourOfDay < 16 {
                return brightPalette
            } else {
                return naturalPalette
            }
        }
        
        // Return palette based on style
        switch style {
        case .electronic:
            return brightPalette
        case .darkSynthwave:
            return darkPalette
        case .ambientSpace:
            return naturalPalette
        case .loFi:
            return lofiPalette
        case .industrial:
            return darkPalette
        case .cyberPunk:
            return cyberpunkPalette
        case .vaporwave:
            return vaporwavePalette
        case .glitch:
            return cyberpunkPalette
        default:
            return brightPalette
        }
    }
    
    // Convert NSColor to hex string
    private func hexString(from color: NSColor) -> String {
        let color = color.usingColorSpace(.deviceRGB) ?? color
        return String(format: "#%02X%02X%02X", 
                    Int(color.redComponent * 255),
                    Int(color.greenComponent * 255),
                    Int(color.blueComponent * 255))
    }
    
    // Shape generation with extended shape types
    private func generateRandomShape(style: ArtStyle? = nil, seed: Int? = nil) -> String {
        // Use seed if provided, otherwise generate random values
        let randomSource: () -> Int = {
            if let seed = seed {
                // Simple but effective way to get different values from a seed
                return (seed * 1664525 + 1013904223) % Int.max
            } else {
                return Int.random(in: 0...10000)
            }
        }
        
        // Generate shape properties 
        let shapeType = seed != nil ? (seed! % 8) : Int.random(in: 0...7)
        let x = Int.random(in: 0...width)
        let y = Int.random(in: 0...height)
        let size = Int.random(in: 50...300)
        let rotation = Int.random(in: 0...360)
        let opacity = Double.random(in: 0.2...0.8)
        
        // Get color palette based on style or time of day
        let colors = getPalette(for: style)
        let color = colors.randomElement()!
        let colorString = hexString(from: color)
        
        // Add a second color for gradients
        let color2 = colors.randomElement()!
        let color2String = hexString(from: color2)
        
        // Define gradient ID
        let gradientId = "gradient_\(randomSource())"
        let useGradient = Int.random(in: 0...10) > 6
        
        var svg = ""
        
        // Add gradient definition if using gradient
        if useGradient {
            svg += """
            <linearGradient id="\(gradientId)" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="\(colorString)" />
                <stop offset="100%" stop-color="\(color2String)" />
            </linearGradient>
            
            """
        }
        
        // Fill attribute (solid color or gradient)
        let fillAttr = useGradient ? "url(#\(gradientId))" : colorString
        
        switch shapeType {
        case 0: // Circle
            svg += """
            <circle cx="\(x)" cy="\(y)" r="\(size/2)"
                    fill="\(fillAttr)" opacity="\(opacity)"
                    transform="rotate(\(rotation) \(x) \(y))" />
            """
        case 1: // Rectangle
            svg += """
            <rect x="\(x - size/2)" y="\(y - size/2)" width="\(size)" height="\(size)"
                  fill="\(fillAttr)" opacity="\(opacity)"
                  transform="rotate(\(rotation) \(x) \(y))" />
            """
        case 2: // Hexagon
            let points = hexagonPoints(centerX: x, centerY: y, size: size)
            svg += """
            <polygon points="\(points)"
                     fill="\(fillAttr)" opacity="\(opacity)"
                     transform="rotate(\(rotation) \(x) \(y))" />
            """
        case 3: // Triangle
            let x1 = x
            let y1 = y - size/2
            let x2 = x - size/2
            let y2 = y + size/2
            let x3 = x + size/2
            let y3 = y + size/2
            svg += """
            <polygon points="\(x1),\(y1) \(x2),\(y2) \(x3),\(y3)"
                     fill="\(fillAttr)" opacity="\(opacity)"
                     transform="rotate(\(rotation) \(x) \(y))" />
            """
        case 4: // Star
            let points = starPoints(centerX: x, centerY: y, size: size)
            svg += """
            <polygon points="\(points)"
                     fill="\(fillAttr)" opacity="\(opacity)"
                     transform="rotate(\(rotation) \(x) \(y))" />
            """
        case 5: // Diamond
            let halfSize = size / 2
            let points = "\(x),\(y-halfSize) \(x+halfSize),\(y) \(x),\(y+halfSize) \(x-halfSize),\(y)"
            svg += """
            <polygon points="\(points)"
                     fill="\(fillAttr)" opacity="\(opacity)"
                     transform="rotate(\(rotation) \(x) \(y))" />
            """
        case 6: // Crescent
            let outerRadius = size / 2
            let innerRadius = outerRadius * 0.7
            let cx2 = x + (outerRadius - innerRadius) * 0.6
            svg += """
            <g transform="rotate(\(rotation) \(x) \(y))">
                <circle cx="\(x)" cy="\(y)" r="\(outerRadius)" fill="\(fillAttr)" opacity="\(opacity)" />
                <circle cx="\(cx2)" cy="\(y)" r="\(innerRadius)" fill="black" opacity="\(opacity)" />
            </g>
            """
        case 7: // Cross
            let halfSize = size / 2
            let thickness = size / 6
            svg += """
            <g transform="rotate(\(rotation) \(x) \(y))">
                <rect x="\(x-thickness/2)" y="\(y-halfSize)" width="\(thickness)" height="\(size)" fill="\(fillAttr)" opacity="\(opacity)" />
                <rect x="\(x-halfSize)" y="\(y-thickness/2)" width="\(size)" height="\(thickness)" fill="\(fillAttr)" opacity="\(opacity)" />
            </g>
            """
        default:
            svg += ""
        }
        
        // Apply effects based on style
        switch style {
        case .glitch:
            // Always add glitch effect for glitch style
            svg = svg.replacingOccurrences(of: "/>", with: " filter=\"url(#glitch)\" />")
        case .vaporwave:
            // Add blur for vaporwave style
            svg = svg.replacingOccurrences(of: "/>", with: " filter=\"url(#blur)\" />")
        default:
            // Occasionally add a glitch effect for other styles
            if Int.random(in: 0...10) > 7 {
                let filter = "url(#glitch)"
                svg = svg.replacingOccurrences(of: "/>", with: " filter=\"\(filter)\" />")
            }
        }
        
        return svg
    }
    
    private func hexagonPoints(centerX: Int, centerY: Int, size: Int) -> String {
        let points = [
            (centerX, centerY - size/2),               // Top
            (centerX + size/2, centerY - size/4),      // Top right
            (centerX + size/2, centerY + size/4),      // Bottom right
            (centerX, centerY + size/2),               // Bottom
            (centerX - size/2, centerY + size/4),      // Bottom left
            (centerX - size/2, centerY - size/4)       // Top left
        ]
        
        return points.map { "\($0.0),\($0.1)" }.joined(separator: " ")
    }
    
    private func starPoints(centerX: Int, centerY: Int, size: Int) -> String {
        let outerRadius = Double(size) / 2
        let innerRadius = outerRadius * 0.4
        var points = ""
        
        for i in 0..<10 {
            let angle = Double(i) * .pi / 5
            let radius = i % 2 == 0 ? outerRadius : innerRadius
            let x = centerX + Int(cos(angle) * radius)
            let y = centerY + Int(sin(angle) * radius)
            points += "\(x),\(y) "
        }
        
        return points.trimmingCharacters(in: .whitespaces)
    }
    
    // Generate SVG filters for various effects
    private func generateFilters(style: ArtStyle? = nil) -> String {
        // Randomize filter parameters based on style
        let glitchX = Int.random(in: -10...10)
        let glitchY = Int.random(in: -8...8)
        let displacementScale = style == .glitch ? Int.random(in: 5...15) : Int.random(in: 0...10)
        let blurStrength = style == .vaporwave ? "3" : "1.5"
        let grainOpacity = style == .loFi ? "0.3" : "0.15"
        
        return """
        <defs>
            <!-- GRADIENT DEFINITIONS -->
            <linearGradient id="cyberpunkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FF00CC" />
                <stop offset="50%" stop-color="#3300FF" />
                <stop offset="100%" stop-color="#00FFFF" />
            </linearGradient>
            
            <linearGradient id="vaporwaveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FF6AD5" />
                <stop offset="50%" stop-color="#C774E8" />
                <stop offset="100%" stop-color="#AD8CFF" />
            </linearGradient>
            
            <radialGradient id="darkGradient" cx="50%" cy="50%" r="75%" fx="50%" fy="50%">
                <stop offset="0%" stop-color="#2A0C3A" />
                <stop offset="80%" stop-color="#14061F" />
                <stop offset="100%" stop-color="#0A0A0A" />
            </radialGradient>
            
            <!-- FILTERS -->
            <filter id="glitch" x="-20%" y="-20%" width="140%" height="140%">
                <!-- RGB split glitch effect -->
                <feColorMatrix type="matrix"
                    values="1 0 0 0 0
                            0 1 0 0 0
                            0 0 1 0 0
                            0 0 0 1 0" result="r" />
                <feOffset in="r" dx="\(glitchX)" dy="0" result="r1" />
                
                <feColorMatrix in="SourceGraphic" type="matrix"
                    values="0 0 0 0 0
                            0 1 0 0 0
                            0 0 0 0 0
                            0 0 0 1 0" result="g" />
                <feOffset in="g" dx="0" dy="\(glitchY)" result="g1" />
                
                <feColorMatrix in="SourceGraphic" type="matrix"
                    values="0 0 0 0 0
                            0 0 0 0 0
                            0 0 1 0 0
                            0 0 0 1 0" result="b" />
                <feOffset in="b" dx="\(glitchX * -1)" dy="\(glitchY * -1)" result="b1" />
                
                <feBlend mode="screen" in="r1" in2="g1" result="rg" />
                <feBlend mode="screen" in="rg" in2="b1" result="rgb" />
                
                <!-- Add noise displacement -->
                <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
                <feDisplacementMap in="rgb" in2="noise" scale="\(displacementScale)" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            
            <!-- Enhanced grain filter -->
            <filter id="grain" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" result="noise"/>
                <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 \(grainOpacity) 0" result="grainPattern"/>
                <feComposite operator="in" in="grainPattern" in2="SourceGraphic" result="grain"/>
                <feBlend mode="overlay" in="SourceGraphic" in2="grain" result="blend"/>
            </filter>
            
            <!-- Vignette effect with adjustable darkness -->
            <filter id="vignette">
                <feColorMatrix type="matrix" 
                    values="0.5 0 0 0 0
                            0 0.5 0 0 0
                            0 0 0.5 0 0
                            0 0 0 1 0" />
                <feGaussianBlur stdDeviation="50" result="blur" />
                <feBlend in="SourceGraphic" in2="blur" mode="multiply" />
            </filter>
            
            <!-- Blur filter for dreamy effects -->
            <filter id="blur">
                <feGaussianBlur stdDeviation="\(blurStrength)" />
            </filter>
            
            <!-- Duotone filter for Vaporwave style -->
            <filter id="duotone">
                <feColorMatrix type="matrix"
                    values="0.33 0.33 0.33 0 0
                            0.33 0.33 0.33 0 0
                            0.33 0.33 0.33 0 0
                            0    0    0    1 0" result="grayscale"/>
                <feComponentTransfer color-interpolation-filters="sRGB" result="duotone">
                    <feFuncR type="table" tableValues="0.4 1"/>
                    <feFuncG type="table" tableValues="0.1 0.8"/>
                    <feFuncB type="table" tableValues="0.6 1"/>
                    <feFuncA type="table" tableValues="0 1"/>
                </feComponentTransfer>
            </filter>
            
            <!-- Noise texture overlay -->
            <filter id="noise">
                <feTurbulence type="turbulence" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" result="noise"/>
                <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" result="coloredNoise"/>
                <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="noisyImage"/>
                <feBlend mode="overlay" in="noisyImage" in2="SourceGraphic"/>
            </filter>
        </defs>
        """
    }
    
    // Generate complete SVG with style 
    func generateSVG(for bandName: String, style: ArtStyle? = nil) -> String {
        // Determine style based on band name if not provided
        let artStyle: ArtStyle
        if let style = style {
            artStyle = style
        } else {
            // Simple hashing to get a consistent style for a given name
            let hash = bandName.hash
            let styleIndex = abs(hash) % ArtStyle.allCases.count
            artStyle = ArtStyle.allCases[styleIndex]
        }
        
        // Create a deterministic seed for shapes from the band name
        let seed = bandName.hash
        
        // Get colors for background based on style
        let palette = getPalette(for: artStyle)
        let bgColor1 = palette.randomElement()!
        let bgColor2 = palette.randomElement()!
        let bgColor1String = hexString(from: bgColor1)
        let bgColor2String = hexString(from: bgColor2)
        
        // Select background gradient style based on art style
        let bgGradientId: String
        let bgFilterEffect: String
        
        switch artStyle {
        case .cyberPunk:
            bgGradientId = "cyberpunkGradient"
            bgFilterEffect = "filter=\"url(#grain)\""
        case .vaporwave:
            bgGradientId = "vaporwaveGradient"
            bgFilterEffect = "filter=\"url(#duotone)\""
        case .darkSynthwave:
            bgGradientId = "darkGradient"
            bgFilterEffect = "filter=\"url(#grain)\""
        default:
            bgGradientId = "bgGradient"
            bgFilterEffect = "filter=\"url(#grain)\""
        }
        
        // Generate more shapes for complex styles
        let numShapes: Int
        switch artStyle {
        case .glitch, .vaporwave:
            numShapes = Int.random(in: 25...40)
        case .loFi:
            numShapes = Int.random(in: 5...15)
        default:
            numShapes = Int.random(in: 15...maxShapes)
        }
        
        // Generate shapes with the selected style and seed for consistency
        var generatedShapes = ""
        for i in 0..<numShapes {
            // Deterministic but varied seeds for each shape
            let shapeSeed = seed ^ i
            generatedShapes += generateRandomShape(style: artStyle, seed: shapeSeed)
            generatedShapes += "\n    "
        }
        
        // Create the SVG, ensuring the background is fully opaque
        let svg = """
        <svg width="\(width)" height="\(height)" xmlns="http://www.w3.org/2000/svg">
            \(generateFilters(style: artStyle))
            
            <!-- Custom bg gradient definition -->
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="\(bgColor1String)" />
                <stop offset="100%" stop-color="\(bgColor2String)" />
            </linearGradient>
            
            <!-- Completely opaque backgrounds (multiple layers to ensure no transparency) -->
            <rect width="100%" height="100%" fill="black" opacity="1.0" />
            <rect width="100%" height="100%" fill="#000000" opacity="1.0" />
            
            <!-- Gradient background with filter -->
            <rect width="100%" height="100%" fill="url(#\(bgGradientId))" \(bgFilterEffect) opacity="1.0" />
            
            <!-- Shapes -->
            \(generatedShapes)
            
            <!-- Apply style-specific final effects -->
            \(finalEffectsForStyle(artStyle))
        </svg>
        """
        
        return svg
    }
    
    // Generate final effects layer based on style
    private func finalEffectsForStyle(_ style: ArtStyle) -> String {
        switch style {
        case .vaporwave:
            return """
            <!-- Grid lines for vaporwave style -->
            <g opacity="0.3">
                <!-- Horizontal lines -->
                \((0...10).map { i in
                    let y = i * (height / 10)
                    return "<line x1=\"0\" y1=\"\(y)\" x2=\"\(width)\" y2=\"\(y)\" stroke=\"white\" stroke-width=\"1\" />"
                }.joined(separator: "\n                "))
                
                <!-- Vertical lines -->
                \((0...10).map { i in
                    let x = i * (width / 10)
                    return "<line x1=\"\(x)\" y1=\"0\" x2=\"\(x)\" y2=\"\(height)\" stroke=\"white\" stroke-width=\"1\" />"
                }.joined(separator: "\n                "))
            </g>
            
            <!-- Vignette effect -->
            <rect width="100%" height="100%" fill="none" filter="url(#vignette)" />
            """
        case .darkSynthwave:
            return """
            <!-- Sun/horizon for synthwave style -->
            <circle cx="\(width/2)" cy="\(height * 5/6)" r="\(width/4)" fill="url(#cyberpunkGradient)" opacity="0.6" />
            <rect x="0" y="\(height * 5/6)" width="\(width)" height="\(height/6)" fill="black" />
            
            <!-- Grid lines -->
            <g opacity="0.4">
                \((0...20).map { i in
                    let y = height * 5/6 + i * (height/6/20)
                    let x1 = width/2 - (width * i/40)
                    let x2 = width/2 + (width * i/40)
                    return "<line x1=\"\(x1)\" y1=\"\(y)\" x2=\"\(x2)\" y2=\"\(y)\" stroke=\"#FF00FF\" stroke-width=\"1\" />"
                }.joined(separator: "\n                "))
            </g>
            
            <!-- Vignette effect -->
            <rect width="100%" height="100%" fill="none" filter="url(#vignette)" />
            """
        case .glitch:
            return """
            <!-- Extra glitch overlay -->
            <rect width="100%" height="100%" fill="none" filter="url(#noise)" opacity="0.2" />
            
            <!-- Static scanlines -->
            <rect width="100%" height="100%" fill="url(#scanlines)" opacity="0.1" />
            <pattern id="scanlines" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="scale(1)">
                <line x1="0" y1="1" x2="100%" y2="1" stroke="#FFF" stroke-width="1" opacity="0.5"/>
            </pattern>
            
            <!-- VHS tracking lines -->
            <rect y="\(Int.random(in: 0...height-100))" width="100%" height="4" fill="white" opacity="0.2" />
            
            <!-- Vignette effect -->
            <rect width="100%" height="100%" fill="none" filter="url(#vignette)" />
            """
        default:
            return """
            <!-- Simple vignette effect -->
            <rect width="100%" height="100%" fill="none" filter="url(#vignette)" />
            """
        }
    }
    
    // Render SVG to high-quality Image
    func renderImage(from svgString: String) -> NSImage? {
        guard let data = svgString.data(using: .utf8) else { return nil }
        
        let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent("temp_\(UUID().uuidString).svg")
        do {
            // Write SVG to temp file
            try data.write(to: tempURL)
            
            // Load SVG
            if let image = NSImage(contentsOf: tempURL) {
                // Create high-quality PNG representation
                let targetSize = NSSize(width: width, height: height)
                
                // Create new image with proper background handling
                let newImage = NSImage(size: targetSize)
                newImage.lockFocus()
                
                // Draw solid black background to ensure no transparency
                NSColor.black.setFill()
                NSRect(x: 0, y: 0, width: targetSize.width, height: targetSize.height).fill()
                
                // Draw the SVG image
                image.draw(in: NSRect(x: 0, y: 0, width: targetSize.width, height: targetSize.height), 
                          from: NSRect.zero, 
                          operation: .sourceOver, 
                          fraction: 1.0)
                
                newImage.unlockFocus()
                
                // Clean up
                try? FileManager.default.removeItem(at: tempURL)
                
                return newImage
            }
        } catch {
            print("❌ Error rendering SVG: \(error)")
        }
        
        return nil
    }
    
    // Generate PNG data directly from SVG with guaranteed opaque background
    func generatePNGData(for bandName: String, style: ArtStyle? = nil) -> Data? {
        // Generate SVG with the selected style
        let svgString = generateSVG(for: bandName, style: style)
        
        // Render to NSImage
        guard let svgImage = renderImage(from: svgString) else {
            print("Failed to render SVG to image")
            return nil
        }
        
        // Create a bitmap representation with explicit black background
        let bitmapRep = NSBitmapImageRep(
            bitmapDataPlanes: nil,
            pixelsWide: Int(width),
            pixelsHigh: Int(height),
            bitsPerSample: 8,
            samplesPerPixel: 4,
            hasAlpha: true,
            isPlanar: false,
            colorSpaceName: .deviceRGB,
            bytesPerRow: 0,
            bitsPerPixel: 0
        )!
        
        bitmapRep.size = NSSize(width: width, height: height)
        
        NSGraphicsContext.saveGraphicsState()
        NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmapRep)
        
        // Fill with black background first
        NSColor.black.setFill()
        NSRect(x: 0, y: 0, width: width, height: height).fill()
        
        // Draw the image on top
        svgImage.draw(in: NSRect(x: 0, y: 0, width: width, height: height),
                     from: NSRect.zero,
                     operation: .sourceOver,
                     fraction: 1.0)
        
        NSGraphicsContext.restoreGraphicsState()
        
        // Get PNG data with full color and alpha information
        let pngData = bitmapRep.representation(using: .png, properties: [.compressionFactor: 1.0])
        
        if pngData == nil {
            print("Failed to convert image to PNG data")
        }
        
        return pngData
    }
    
    // Save SVG to file (utility method)
    func saveSVG(_ svgString: String, to url: URL) throws {
        let data = Data(svgString.utf8)
        try data.write(to: url)
    }
    
    // Generate artwork in PNG format directly
    func generateArtwork(for bandName: String, style: ArtStyle? = nil) -> NSImage? {
        let svgString = generateSVG(for: bandName, style: style)
        return renderImage(from: svgString)
    }
    
    // Legacy method for compatibility
    func generateArtwork(for bandName: String, to outputDirectory: URL) -> URL? {
        // This method is kept for backward compatibility
        return nil
    }
}