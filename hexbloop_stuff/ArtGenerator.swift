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
    
    // Color palettes for different moods
    private let darkPalette = [
        NSColor(red: 0.1, green: 0.0, blue: 0.2, alpha: 1.0),
        NSColor(red: 0.3, green: 0.0, blue: 0.3, alpha: 1.0),
        NSColor(red: 0.5, green: 0.0, blue: 0.1, alpha: 1.0),
        NSColor(red: 0.0, green: 0.0, blue: 0.0, alpha: 1.0),
        NSColor(red: 0.2, green: 0.1, blue: 0.3, alpha: 1.0)
    ]
    
    private let brightPalette = [
        NSColor(red: 0.8, green: 0.2, blue: 0.7, alpha: 1.0),
        NSColor(red: 0.9, green: 0.4, blue: 0.3, alpha: 1.0),
        NSColor(red: 0.7, green: 0.8, blue: 0.9, alpha: 1.0),
        NSColor(red: 0.5, green: 0.5, blue: 1.0, alpha: 1.0),
        NSColor(red: 1.0, green: 0.8, blue: 0.2, alpha: 1.0)
    ]
    
    private let naturalPalette = [
        NSColor(red: 0.0, green: 0.3, blue: 0.6, alpha: 1.0), // Deep blue
        NSColor(red: 0.6, green: 0.4, blue: 0.2, alpha: 1.0), // Earth brown
        NSColor(red: 0.2, green: 0.4, blue: 0.2, alpha: 1.0), // Forest green
        NSColor(red: 0.7, green: 0.7, blue: 0.8, alpha: 1.0), // Silver gray
        NSColor(red: 0.5, green: 0.3, blue: 0.5, alpha: 1.0)  // Purple
    ]
    
    // Shape generation
    private func generateRandomShape() -> String {
        let shapeType = Int.random(in: 0...4)
        let x = Int.random(in: 0...width)
        let y = Int.random(in: 0...height)
        let size = Int.random(in: 50...300)
        let rotation = Int.random(in: 0...360)
        let opacity = Double.random(in: 0.2...0.8)
        
        // Determine color palette based on time of day
        let hourOfDay = Calendar.current.component(.hour, from: Date())
        let colors: [NSColor]
        
        if hourOfDay >= 20 || hourOfDay < 6 {
            colors = darkPalette
        } else if hourOfDay >= 10 && hourOfDay < 16 {
            colors = brightPalette
        } else {
            colors = naturalPalette
        }
        
        let color = colors.randomElement() ?? NSColor.white
        let components = color.cgColor.components ?? [1.0, 1.0, 1.0, 1.0]
        let r = components.count > 0 ? components[0] : 1.0
        let g = components.count > 1 ? components[1] : 1.0
        let b = components.count > 2 ? components[2] : 1.0
        let colorString = String(format: "#%02X%02X%02X", 
                                Int(r * 255),
                                Int(g * 255),
                                Int(b * 255))
        
        var svg = ""
        
        switch shapeType {
        case 0: // Circle
            svg = """
            <circle cx="\(x)" cy="\(y)" r="\(size/2)"
                    fill="\(colorString)" opacity="\(opacity)"
                    transform="rotate(\(rotation) \(x) \(y))" />
            """
        case 1: // Rectangle
            svg = """
            <rect x="\(x - size/2)" y="\(y - size/2)" width="\(size)" height="\(size)"
                  fill="\(colorString)" opacity="\(opacity)"
                  transform="rotate(\(rotation) \(x) \(y))" />
            """
        case 2: // Hexagon
            let points = hexagonPoints(centerX: x, centerY: y, size: size)
            svg = """
            <polygon points="\(points)"
                     fill="\(colorString)" opacity="\(opacity)"
                     transform="rotate(\(rotation) \(x) \(y))" />
            """
        case 3: // Triangle
            let x1 = x
            let y1 = y - size/2
            let x2 = x - size/2
            let y2 = y + size/2
            let x3 = x + size/2
            let y3 = y + size/2
            svg = """
            <polygon points="\(x1),\(y1) \(x2),\(y2) \(x3),\(y3)"
                     fill="\(colorString)" opacity="\(opacity)"
                     transform="rotate(\(rotation) \(x) \(y))" />
            """
        case 4: // Star
            let points = starPoints(centerX: x, centerY: y, size: size)
            svg = """
            <polygon points="\(points)"
                     fill="\(colorString)" opacity="\(opacity)"
                     transform="rotate(\(rotation) \(x) \(y))" />
            """
        default:
            svg = ""
        }
        
        // Occasionally add a glitch effect
        if Int.random(in: 0...10) > 7 {
            let filter = "url(#glitch)"
            svg = svg.replacingOccurrences(of: "/>", with: " filter=\"\(filter)\" />")
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
    
    // Generate SVG filters for glitch effects
    private func generateFilters() -> String {
        return """
        <defs>
            <filter id="glitch" x="-20%" y="-20%" width="140%" height="140%">
                <feColorMatrix type="matrix"
                    values="1 0 0 0 0
                            0 1 0 0 0
                            0 0 1 0 0
                            0 0 0 1 0" result="r" />
                <feOffset in="r" dx="\(Int.random(in: -10...10))" dy="0" result="r1" />
                <feColorMatrix in="SourceGraphic" type="matrix"
                    values="0 0 0 0 0
                            0 1 0 0 0
                            0 0 0 0 0
                            0 0 0 1 0" result="g" />
                <feOffset in="g" dx="0" dy="\(Int.random(in: -8...8))" result="g1" />
                <feColorMatrix in="SourceGraphic" type="matrix"
                    values="0 0 0 0 0
                            0 0 0 0 0
                            0 0 1 0 0
                            0 0 0 1 0" result="b" />
                <feOffset in="b" dx="\(Int.random(in: -6...6))" dy="\(Int.random(in: -6...6))" result="b1" />
                <feBlend mode="normal" in="r1" in2="g1" result="rg" />
                <feBlend mode="normal" in="rg" in2="b1" result="rgb" />
                <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
                <feDisplacementMap in="rgb" in2="noise" scale="\(Int.random(in: 0...10))" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            
            <filter id="grain" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" result="noise"/>
                <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.15 0" result="grainPattern"/>
                <feComposite operator="in" in="grainPattern" in2="SourceGraphic" result="grain"/>
                <feBlend mode="overlay" in="SourceGraphic" in2="grain" result="blend"/>
            </filter>
            
            <filter id="vignette">
                <feColorMatrix type="matrix" 
                    values="0.5 0 0 0 0
                            0 0.5 0 0 0
                            0 0 0.5 0 0
                            0 0 0 1 0" />
                <feGaussianBlur stdDeviation="50" result="blur" />
                <feBlend in="SourceGraphic" in2="blur" mode="multiply" />
            </filter>
        </defs>
        """
    }
    
    // Generate complete SVG
    func generateSVG(for bandName: String) -> String {
        let numShapes = Int.random(in: 15...maxShapes)
        let shapes = (0..<numShapes).map { _ in generateRandomShape() }.joined(separator: "\n    ")
        
        let bgColor1 = darkPalette.randomElement() ?? NSColor.black
        let bgColor2 = darkPalette.randomElement() ?? NSColor.darkGray
        
        let bg1Components = bgColor1.cgColor.components ?? [0.0, 0.0, 0.0, 1.0]
        let bg1R = bg1Components.count > 0 ? bg1Components[0] : 0.0
        let bg1G = bg1Components.count > 1 ? bg1Components[1] : 0.0
        let bg1B = bg1Components.count > 2 ? bg1Components[2] : 0.0
        
        let bg2Components = bgColor2.cgColor.components ?? [0.2, 0.2, 0.2, 1.0]
        let bg2R = bg2Components.count > 0 ? bg2Components[0] : 0.2
        let bg2G = bg2Components.count > 1 ? bg2Components[1] : 0.2
        let bg2B = bg2Components.count > 2 ? bg2Components[2] : 0.2
        
        let bgColor1String = String(format: "#%02X%02X%02X", 
                            Int(bg1R * 255),
                            Int(bg1G * 255),
                            Int(bg1B * 255))
        let bgColor2String = String(format: "#%02X%02X%02X", 
                            Int(bg2R * 255),
                            Int(bg2G * 255),
                            Int(bg2B * 255))
        
        let svg = """
        <svg width="\(width)" height="\(height)" xmlns="http://www.w3.org/2000/svg">
            \(generateFilters())
            
            <!-- Background -->
            <rect width="100%" height="100%" fill="black" />
            <rect width="100%" height="100%" fill="url(#bgGradient)" filter="url(#grain)" />
            
            <!-- Gradient definition -->
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="\(bgColor1String)" />
                <stop offset="100%" stop-color="\(bgColor2String)" />
            </linearGradient>
            
            <!-- Shapes -->
            \(shapes)
            
            <!-- Band Name -->
            <text x="50%" y="50%" font-family="monospace" font-size="60" fill="white" text-anchor="middle" dominant-baseline="middle" filter="url(#glitch)">
                \(bandName)
            </text>
            
            <!-- Vignette effect -->
            <rect width="100%" height="100%" fill="none" filter="url(#vignette)" />
        </svg>
        """
        
        return svg
    }
    
    // Render SVG to Image
    func renderImage(from svgString: String) -> NSImage? {
        guard let data = svgString.data(using: .utf8) else { return nil }
        
        let tempURL = FileManager.default.temporaryDirectory.appendingPathComponent("temp_svg.svg")
        do {
            try data.write(to: tempURL)
            if let image = NSImage(contentsOf: tempURL) {
                try? FileManager.default.removeItem(at: tempURL)
                return image
            }
        } catch {
            print("❌ Error rendering SVG: \(error)")
        }
        
        return nil
    }
    
    // Save SVG to file
    func saveSVG(_ svgString: String, to url: URL) throws {
        let data = Data(svgString.utf8)
        try data.write(to: url)
    }
    
    // Generate and save artwork for a band name
    func generateArtwork(for bandName: String, to outputDirectory: URL) -> URL? {
        let svg = generateSVG(for: bandName)
        let artworkURL = outputDirectory.appendingPathComponent("\(bandName)_artwork.svg")
        
        do {
            try saveSVG(svg, to: artworkURL)
            print("✨ Artwork saved to: \(artworkURL.path)")
            return artworkURL
        } catch {
            print("❌ Error saving artwork: \(error)")
            return nil
        }
    }
}