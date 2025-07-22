import SwiftUI

struct ContentViewMinimal: View {
    var body: some View {
        VStack {
            Image(systemName: "waveform.badge.magnifyingglass")
                .imageScale(.large)
                .foregroundStyle(.tint)
            Text("Hexbloop is starting...")
                .font(.title)
        }
        .padding()
        .frame(width: 800, height: 600)
    }
}

#Preview {
    ContentViewMinimal()
}