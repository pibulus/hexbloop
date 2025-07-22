//
//  HexbloopApp.swift
//  Hexbloop
//
//  Created by Pablo Alvarado on 15/1/2025.
//

import SwiftUI

@main
struct HexbloopApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .frame(minWidth: 800, minHeight: 600)
                .preferredColorScheme(.dark)
        }
        .windowStyle(.hiddenTitleBar)
    }
}
