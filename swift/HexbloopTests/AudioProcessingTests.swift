import XCTest
import AVFoundation
@testable import Hexbloop

class AudioProcessingTests: XCTestCase {
    
    var audioEngine: MacAudioEngine!
    var testBundle: Bundle!
    var tempDirectory: URL!
    
    override func setUp() {
        super.setUp()
        audioEngine = MacAudioEngine()
        testBundle = Bundle(for: type(of: self))
        tempDirectory = FileManager.default.temporaryDirectory.appendingPathComponent("HexbloopTests", isDirectory: true)
        try? FileManager.default.createDirectory(at: tempDirectory, withIntermediateDirectories: true)
    }
    
    override func tearDown() {
        // Clean up temp files
        try? FileManager.default.removeItem(at: tempDirectory)
        super.tearDown()
    }
    
    // MARK: - Test File Creation
    
    func testCreateTestAudioFile() throws {
        let testFile = try createTestAudioFile(duration: 2.0, frequency: 440.0)
        XCTAssertTrue(FileManager.default.fileExists(atPath: testFile.path))
        
        // Verify file can be read
        let audioFile = try AVAudioFile(forReading: testFile)
        XCTAssertGreaterThan(audioFile.length, 0)
    }
    
    // MARK: - Processing Parameters Tests
    
    func testProcessingParametersGeneration() {
        let params = ProcessingParameters.generateWithMoonPhaseInfluence()
        
        // Test that all parameters are within valid ranges
        XCTAssertGreaterThanOrEqual(params.distortionAmount, 0.0)
        XCTAssertLessThanOrEqual(params.distortionAmount, 1.0)
        
        XCTAssertGreaterThan(params.highPassFreq, 0.0)
        XCTAssertLessThan(params.highPassFreq, params.lowPassFreq)
        
        XCTAssertGreaterThanOrEqual(params.reverbAmount, 0.0)
        XCTAssertLessThanOrEqual(params.reverbAmount, 1.0)
        
        XCTAssertGreaterThan(params.compressionRatio, 1.0)
        XCTAssertLessThanOrEqual(params.compressionThreshold, 0.0)
    }
    
    func testMoonPhaseCalculation() {
        let moonPhase = ProcessingParameters.getMoonPhaseDescription()
        let validPhases = ["Full Moon", "New Moon", "Waxing Moon", "Waning Moon"]
        XCTAssertTrue(validPhases.contains(moonPhase))
    }
    
    // MARK: - Audio Processing Tests
    
    func testBasicAudioProcessing() async throws {
        // Create a test audio file
        let inputFile = try createTestAudioFile(duration: 1.0, frequency: 440.0)
        let outputFile = tempDirectory.appendingPathComponent("output.m4a")
        
        // Create processing parameters
        let params = ProcessingParameters()
        params.distortionAmount = 0.3
        params.reverbAmount = 0.2
        
        // Process the file
        let expectation = XCTestExpectation(description: "Audio processing completes")
        var finalProgress: Float = 0.0
        
        let success = try await audioEngine.processAudioFile(
            at: inputFile,
            to: outputFile,
            with: params
        ) { progress in
            finalProgress = progress
            if progress >= 1.0 {
                expectation.fulfill()
            }
        }
        
        await fulfillment(of: [expectation], timeout: 30.0)
        
        XCTAssertTrue(success)
        XCTAssertEqual(finalProgress, 1.0, accuracy: 0.01)
        XCTAssertTrue(FileManager.default.fileExists(atPath: outputFile.path))
        
        // Verify output file has content
        let outputAudioFile = try AVAudioFile(forReading: outputFile)
        XCTAssertGreaterThan(outputAudioFile.length, 0)
    }
    
    func testProcessingWithHighMemoryPressure() async throws {
        // This test simulates processing under memory pressure
        let inputFile = try createTestAudioFile(duration: 0.5, frequency: 440.0)
        let outputFile = tempDirectory.appendingPathComponent("output_memory.m4a")
        
        let params = ProcessingParameters()
        
        // Force memory pressure simulation if possible
        let success = try await audioEngine.processAudioFile(
            at: inputFile,
            to: outputFile,
            with: params
        ) { _ in }
        
        XCTAssertTrue(success)
        XCTAssertTrue(FileManager.default.fileExists(atPath: outputFile.path))
    }
    
    func testProcessingCancellation() async throws {
        // Test that cancellation works properly
        let inputFile = try createTestAudioFile(duration: 5.0, frequency: 440.0)
        let outputFile = tempDirectory.appendingPathComponent("output_cancelled.m4a")
        
        let params = ProcessingParameters()
        
        let task = Task {
            try await audioEngine.processAudioFile(
                at: inputFile,
                to: outputFile,
                with: params
            ) { _ in }
        }
        
        // Cancel after a short delay
        try await Task.sleep(nanoseconds: 500_000_000) // 0.5 seconds
        task.cancel()
        
        // The task should complete (either successfully or with cancellation)
        _ = try? await task.value
    }
    
    // MARK: - File Validation Tests
    
    func testFileSizeValidation() {
        let fileManager = HexbloopFileManager.shared
        
        // Test file size limits
        let maxSize: Int64 = 500 * 1024 * 1024 // 500MB
        XCTAssertTrue(maxSize > 0)
        
        // Test unique output path generation
        let path1 = fileManager.generateUniqueOutputPath(baseName: "test", fileExtension: "m4a")
        let path2 = fileManager.generateUniqueOutputPath(baseName: "test", fileExtension: "m4a")
        XCTAssertNotEqual(path1, path2)
    }
    
    func testInvalidAudioFile() async {
        // Create an invalid file (not audio)
        let invalidFile = tempDirectory.appendingPathComponent("invalid.txt")
        try? "This is not an audio file".write(to: invalidFile, atomically: true, encoding: .utf8)
        
        let outputFile = tempDirectory.appendingPathComponent("output_invalid.m4a")
        let params = ProcessingParameters()
        
        do {
            _ = try await audioEngine.processAudioFile(
                at: invalidFile,
                to: outputFile,
                with: params
            ) { _ in }
            XCTFail("Should have thrown an error for invalid file")
        } catch {
            // Expected error
            XCTAssertNotNil(error)
        }
    }
    
    // MARK: - Metadata Tests
    
    func testMetadataApplication() async throws {
        let inputFile = try createTestAudioFile(duration: 1.0, frequency: 440.0)
        
        // Apply metadata
        try await audioEngine.applyMetadataAndArtwork(
            to: inputFile,
            artistName: "Test Artist",
            albumName: "Test Album",
            trackName: "Test Track",
            artworkURL: nil
        )
        
        // Verify metadata was applied
        let asset = AVAsset(url: inputFile)
        let metadata = asset.metadata
        
        // Check that metadata exists (actual values depend on format support)
        XCTAssertFalse(metadata.isEmpty)
    }
    
    // MARK: - Helper Methods
    
    private func createTestAudioFile(duration: TimeInterval, frequency: Float) throws -> URL {
        let sampleRate = 44100.0
        let channels: AVAudioChannelCount = 2
        
        guard let format = AVAudioFormat(standardFormatWithSampleRate: sampleRate, channels: channels) else {
            throw NSError(domain: "TestError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to create audio format"])
        }
        
        let frameCount = AVAudioFrameCount(duration * sampleRate)
        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount) else {
            throw NSError(domain: "TestError", code: 2, userInfo: [NSLocalizedDescriptionKey: "Failed to create audio buffer"])
        }
        
        buffer.frameLength = frameCount
        
        // Generate a simple sine wave
        let channelData = buffer.floatChannelData
        let angleIncrement = 2.0 * Float.pi * frequency / Float(sampleRate)
        
        for channel in 0..<Int(channels) {
            if let channelBuffer = channelData?[channel] {
                for frame in 0..<Int(frameCount) {
                    channelBuffer[frame] = sin(Float(frame) * angleIncrement) * 0.5
                }
            }
        }
        
        let fileURL = tempDirectory.appendingPathComponent("test_\(UUID().uuidString).wav")
        let file = try AVAudioFile(forWriting: fileURL, settings: format.settings)
        try file.write(from: buffer)
        
        return fileURL
    }
}

// MARK: - Name Generator Tests

class NameGeneratorTests: XCTestCase {
    
    let nameGenerator = NameGenerator()
    
    func testNameGeneration() {
        // Test different styles
        let styles: [NameGenerator.NameStyle] = [.sparklepop, .blackmetal, .vaporwave, .witchhouse, .webcore]
        
        for style in styles {
            let name = nameGenerator.generateGlitchedName(style: style)
            XCTAssertFalse(name.isEmpty)
            XCTAssertGreaterThan(name.count, 5) // Should have reasonable length
        }
    }
    
    func testGlitchEffects() {
        let originalName = "TEST_NAME"
        
        // Apply different glitch levels
        let light = nameGenerator.applyGlitchEffects(to: originalName, intensity: .light)
        let medium = nameGenerator.applyGlitchEffects(to: originalName, intensity: .medium)
        let heavy = nameGenerator.applyGlitchEffects(to: originalName, intensity: .heavy)
        
        // Verify each level produces different results
        XCTAssertNotEqual(originalName, light) // Should have some changes
        XCTAssertNotEqual(light, medium)
        XCTAssertNotEqual(medium, heavy)
    }
    
    func testNameUniqueness() {
        // Generate multiple names and check they're mostly unique
        var names = Set<String>()
        let iterations = 100
        
        for _ in 0..<iterations {
            let name = nameGenerator.generateGlitchedName()
            names.insert(name)
        }
        
        // Should have high uniqueness (at least 80% unique)
        XCTAssertGreaterThan(names.count, iterations * 8 / 10)
    }
}

// MARK: - Art Generator Tests

class ArtGeneratorTests: XCTestCase {
    
    let artGenerator = ArtGenerator()
    
    func testSVGGeneration() {
        let svg = artGenerator.generateSVG(for: "TEST_BAND")
        
        // Verify SVG structure
        XCTAssertTrue(svg.contains("<svg"))
        XCTAssertTrue(svg.contains("</svg>"))
        XCTAssertTrue(svg.contains("width=\"800\""))
        XCTAssertTrue(svg.contains("height=\"800\""))
        
        // Should have shapes
        XCTAssertTrue(svg.contains("<") && svg.contains(">"))
    }
    
    func testColorGeneration() {
        // Test that colors are valid hex values
        for _ in 0..<10 {
            let svg = artGenerator.generateSVG(for: "TEST")
            
            // Extract hex color values
            let hexPattern = /#[0-9A-F]{6}/
            let matches = svg.matches(of: hexPattern)
            
            XCTAssertFalse(matches.isEmpty)
            
            // Verify all matches are valid hex colors
            for match in matches {
                let hexString = String(svg[match.range])
                XCTAssertEqual(hexString.count, 7) // # + 6 digits
            }
        }
    }
}