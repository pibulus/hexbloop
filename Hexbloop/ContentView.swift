import SwiftUI
import AVFoundation
import UniformTypeIdentifiers
import CoreImage.CIFilterBuiltins

// MARK: - AudioPlayer: Ambient Audio Loop
class AudioPlayer: ObservableObject {
    private var audioPlayer: AVAudioPlayer?

    func startAmbientLoop() {
        guard let url = Bundle.main.url(forResource: "ambient_loop", withExtension: "mp3") else {
            print("❌ Could not find ambient_loop.mp3")
            return
        }

        do {
            audioPlayer = try AVAudioPlayer(contentsOf: url)
            audioPlayer?.numberOfLoops = -1
            audioPlayer?.volume = 0.5
            audioPlayer?.play()
        } catch {
            print("❌ Error playing ambient loop: \(error)")
        }
    }
}

// MARK: - NameGenerator
class NameGenerator: ObservableObject {
    func generateName() -> String {
        let prefixes = ["GLITTER", "CRYPT", "LUNAR", "SHADOW", "FROST", "NEBULA", "PHANTOM", "SOLAR", "TWILIGHT", "EMBER"]
        let suffixes = ["RITUAL", "MACHINE", "VECTOR", "CIPHER", "NOISE", "SPECTRUM", "ECHO", "WAVE", "SPHERE", "FLARE"]
        return "\(prefixes.randomElement() ?? "HEX")\(suffixes.randomElement() ?? "PULSE")\(Int.random(in: 1000...9999))"
    }
}

// MARK: - AudioConverter: Handles File Conversion
class AudioConverter {
    func processAudio(at inputURL: URL, to outputURL: URL) async throws {
        let asset = AVURLAsset(url: inputURL)

        guard let exportSession = AVAssetExportSession(
            asset: asset,
            presetName: AVAssetExportPresetAppleM4A
        ) else {
            throw NSError(domain: "AudioProcessing", code: 1, userInfo: [NSLocalizedDescriptionKey: "Could not create export session"])
        }

        exportSession.outputURL = outputURL
        exportSession.outputFileType = .m4a

        print("🎵 Starting conversion...")
        await exportSession.export()

        if let error = exportSession.error {
            print("❌ Export error: \(error.localizedDescription)")
            throw error
        }

        print("✨ Conversion complete: \(outputURL.lastPathComponent)")
    }
}

// MARK: - ContentView
struct ContentView: View {
    @StateObject private var audioPlayer = AudioPlayer()
    @StateObject private var nameGenerator = NameGenerator()
    @State private var processedFiles: [String] = []
    @State private var isProcessing = false
    @State private var showSuccess = false
    @State private var successOpacity = 0.0
    @State private var pentagramRotation = 0.0

    @State private var isHoveringOverHex = false

    @State private var backgroundColors: [Color] = [Color.black.opacity(0.9), Color.gray.opacity(0.8), Color.blue.opacity(0.7)]
    @State private var hexagonColors: [Color] = [Color.purple.opacity(0.7), Color.pink.opacity(0.6)]
    @State private var innerHexagonColors: [Color] = [Color.yellow.opacity(0.5), Color.orange.opacity(0.5)]

    @State private var glowPulse1 = false
    @State private var glowPulse2 = false
    @State private var glowPulse3 = false

    private let backgroundColor = Color(red: 0.05, green: 0.05, blue: 0.1)

    private let audioConverter = AudioConverter()

    private var outputDirectory: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("HexbloopOutput", isDirectory: true)
    }

    var body: some View {
        ZStack {
            // MARK: - Background Glow
            RadialGradient(
                gradient: Gradient(colors: [backgroundColor, Color.black]),
                center: .center,
                startRadius: 10,
                endRadius: 700
            )
            .ignoresSafeArea()
            .blur(radius: 60)

            // Grain Texture Overlay
            Image("grain")
                .resizable()
                .ignoresSafeArea()
                .blendMode(.overlay)
                .opacity(0.2)

            // MARK: - Glowing Hexagons and Pentagram
            ZStack {
                Hexagon()
                    .fill(LinearGradient(gradient: Gradient(colors: isHoveringOverHex ? [Color.purple, Color.purple.opacity(0.8)] : hexagonColors), startPoint: .top, endPoint: .bottom))
                    .frame(width: 300, height: 300)
                    .shadow(color: Color.purple.opacity(1.0), radius: glowPulse1 ? 120 : 90)
                    .opacity(glowPulse1 ? 0.9 : 0.7)
                    .scaleEffect(glowPulse1 ? 1.3 : 1.0)
                    .animation(
                        .easeInOut(duration: 2.5).repeatForever(autoreverses: true),
                        value: glowPulse1
                    )

                Hexagon()
                    .fill(LinearGradient(gradient: Gradient(colors: isHoveringOverHex ? [Color.purple, Color.purple.opacity(0.8)] : hexagonColors.reversed()), startPoint: .bottom, endPoint: .top))
                    .frame(width: 250, height: 250)
                    .shadow(color: Color.blue.opacity(0.9), radius: glowPulse2 ? 100 : 80)
                    .opacity(glowPulse2 ? 0.8 : 0.6)
                    .scaleEffect(glowPulse2 ? 1.2 : 1.0)
                    .animation(
                        .easeInOut(duration: 2.5).repeatForever(autoreverses: true),
                        value: glowPulse2
                    )

                Hexagon()
                    .fill(LinearGradient(gradient: Gradient(colors: innerHexagonColors), startPoint: .leading, endPoint: .trailing))
                    .frame(width: 200, height: 200)
                    .shadow(color: Color.orange.opacity(0.7), radius: glowPulse3 ? 90 : 60)
                    .opacity(glowPulse3 ? 0.7 : 0.5)
                    .scaleEffect(glowPulse3 ? 1.2 : 1.0)
                    .animation(
                        .easeInOut(duration: 3).repeatForever(autoreverses: true),
                        value: glowPulse3
                    )

                Text("\u{26E7}") // Pentagram
                    .font(.system(size: 120))
                    .foregroundColor(.white.opacity(0.4))
                    .shadow(color: .purple.opacity(0.9), radius: 40)
                    .rotationEffect(.degrees(isProcessing ? pentagramRotation : 0))
                    .animation(.linear(duration: 6), value: pentagramRotation)
            }

            // MARK: - Notifications
            VStack {
                Spacer()
                ForEach(processedFiles, id: \ .self) { fileName in
                    Text("Converted: \(fileName)")
                        .foregroundColor(.white)
                        .font(.subheadline)
                        .padding()
                        .background(Color.black.opacity(0.4))
                        .clipShape(RoundedRectangle(cornerRadius: 15))
                        .padding(.bottom, 5)
                        .transition(.opacity)
                        .onAppear {
                            DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                                withAnimation(.easeOut(duration: 2)) {
                                    processedFiles.removeAll { $0 == fileName }
                                }
                            }
                        }
                }
            }

            // MARK: - Success Effect
            if showSuccess {
                Circle()
                    .strokeBorder(
                        LinearGradient(
                            gradient: Gradient(colors: [Color.white.opacity(0.7), Color.purple.opacity(0.5)]),
                            startPoint: .top,
                            endPoint: .bottom
                        ),
                        lineWidth: 20
                    )
                    .frame(width: 350, height: 350)
                    .blur(radius: 30)
                    .opacity(successOpacity)
                    .scaleEffect(showSuccess ? 1.5 : 1.0)
                    .animation(
                        .easeInOut(duration: 2.5),
                        value: showSuccess
                    )
                    .onAppear {
                        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
                            withAnimation(.easeOut(duration: 2)) {
                                successOpacity = 0.0
                                showSuccess = false
                            }
                        }
                    }
            }
        }
        .onDrop(of: [UTType.fileURL.identifier], isTargeted: $isHoveringOverHex) { providers in
            Task {
                await processDrop(providers: providers)
            }
            return true
        }
        .onAppear {
            setupDirectory()
            audioPlayer.startAmbientLoop()
            glowPulse1.toggle()
            glowPulse2.toggle()
            glowPulse3.toggle()
        }
    }

    private func setupDirectory() {
        do {
            try FileManager.default.createDirectory(
                at: outputDirectory,
                withIntermediateDirectories: true
            )
            print("✨ Directory created successfully: \(outputDirectory.path)")
        } catch {
            print("Error creating directory: \(error)")
        }
    }

    @MainActor
    private func processDrop(providers: [NSItemProvider]) async {
        for provider in providers {
            do {
                isProcessing = true
                pentagramRotation += 360

                let generatedName = nameGenerator.generateName()
                let outputURL = outputDirectory.appendingPathComponent("\(generatedName).m4a")

                if let inputURL = try await provider.loadFileURL() {
                    try await audioConverter.processAudio(at: inputURL, to: outputURL)
                    withAnimation {
                        processedFiles.append(generatedName)
                        showSuccessFeedback()
                    }
                }
            } catch {
                print("Error processing file: \(error)")
            }
        }
        isProcessing = false
    }

    private func showSuccessFeedback() {
        withAnimation {
            successOpacity = 1.0
            showSuccess = true
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
            withAnimation(.easeOut(duration: 2.5)) {
                successOpacity = 0.0
                showSuccess = false
            }
        }
    }
}

extension NSItemProvider {
    func loadFileURL() async throws -> URL? {
        guard let urlData = try await loadItem(forTypeIdentifier: UTType.fileURL.identifier, options: nil) as? Data,
              let url = URL(dataRepresentation: urlData, relativeTo: nil) else {
            throw NSError(domain: "FileProcessing", code: 0, userInfo: [NSLocalizedDescriptionKey: "Invalid file data"])
        }
        return url
    }
}

struct Hexagon: Shape {
    func path(in rect: CGRect) -> Path {
        let width = rect.width
        let height = rect.height
        let points = [
            CGPoint(x: 0.5 * width, y: 0),
            CGPoint(x: width, y: 0.25 * height),
            CGPoint(x: width, y: 0.75 * height),
            CGPoint(x: 0.5 * width, y: height),
            CGPoint(x: 0, y: 0.75 * height),
            CGPoint(x: 0, y: 0.25 * height)
        ]

        var path = Path()
        path.move(to: points[0])
        points.dropFirst().forEach { path.addLine(to: $0) }
        path.closeSubpath()
        return path
    }
}

#Preview {
    ContentView()
}
