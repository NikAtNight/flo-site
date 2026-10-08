// Run from the site root: swift brand/generate-icon.swift
// Rebuilds the web SVGs, PNG exports, and Icon Composer artwork layer.
import CoreGraphics
import Foundation
import ImageIO

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let brand = root.appendingPathComponent("brand")
let assets = brand.appendingPathComponent("AppIcon.icon/Assets")
try FileManager.default.createDirectory(at: assets, withIntermediateDirectories: true)

func dots(count: Int, small: Bool = false) -> [(x: Double, y: Double, radius: Double)] {
    (0..<count).map { index in
        let t = Double(index) / Double(count - 1)
        return (
            142 + 740 * t,
            512 - 132 * sin(t * .pi * 2 * 1.28),
            (small ? 20 : 12) + (small ? 8 : 5) * (0.5 + 0.5 * sin(t * .pi * 4 - 1))
        )
    }
}

let artwork = dots(count: 19)
func circles(_ points: [(x: Double, y: Double, radius: Double)]) -> String {
    points.map { point in
        String(format: "<circle cx=\"%.2f\" cy=\"%.2f\" r=\"%.2f\"/>", point.x, point.y, point.radius)
    }.joined()
}

func svg(appearance: String? = nil, small: Bool = false) -> String {
    let dark = appearance == "dark"
    let style = appearance == nil
        ? "<style>.tile{fill:#fff;stroke:#ddd}.wave{fill:#000}@media(prefers-color-scheme:dark){.tile{fill:#000;stroke:#333}.wave{fill:#fff}}</style>"
        : ""
    return """
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
    \(style)
    <rect class="tile" x="32" y="32" width="960" height="960" rx="224" fill="\(dark ? "#000" : "#fff")" stroke="\(dark ? "#333" : "#ddd")" stroke-width="4"/>
    <g class="wave" fill="\(dark ? "#fff" : "#000")">\(circles(small ? dots(count: 13, small: true) : artwork))</g>
    </svg>
    """
}

try svg().write(to: root.appendingPathComponent("icon.svg"), atomically: true, encoding: .utf8)
try svg(small: true).write(to: brand.appendingPathComponent("favicon.svg"), atomically: true, encoding: .utf8)
try svg(appearance: "light", small: true).write(to: brand.appendingPathComponent("favicon-light.svg"), atomically: true, encoding: .utf8)
try svg(appearance: "dark", small: true).write(to: brand.appendingPathComponent("favicon-dark.svg"), atomically: true, encoding: .utf8)
try svg(appearance: "light").write(to: brand.appendingPathComponent("icon-light.svg"), atomically: true, encoding: .utf8)
try svg(appearance: "dark").write(to: brand.appendingPathComponent("icon-dark.svg"), atomically: true, encoding: .utf8)
try "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1024 1024\"><g fill=\"#fff\">\(circles(artwork))</g></svg>"
    .write(to: assets.appendingPathComponent("wave.svg"), atomically: true, encoding: .utf8)

// PNGs are full square artwork. Icon Composer supplies the platform mask.
for dark in [false, true] {
    guard let context = CGContext(data: nil, width: 1024, height: 1024,
        bitsPerComponent: 8, bytesPerRow: 0, space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else {
        fatalError("Could not create icon context")
    }
    context.setFillColor(CGColor(gray: dark ? 0 : 1, alpha: 1))
    context.fill(CGRect(x: 0, y: 0, width: 1024, height: 1024))
    context.setFillColor(CGColor(gray: dark ? 1 : 0, alpha: 1))
    for dot in artwork {
        context.fillEllipse(in: CGRect(x: dot.x - dot.radius, y: 1024 - dot.y - dot.radius,
            width: dot.radius * 2, height: dot.radius * 2))
    }
    let file = brand.appendingPathComponent(dark ? "icon-dark-1024.png" : "icon-light-1024.png")
    guard let image = context.makeImage(),
        let destination = CGImageDestinationCreateWithURL(file as CFURL, "public.png" as CFString, 1, nil) else {
        fatalError("Could not create PNG export")
    }
    CGImageDestinationAddImage(destination, image, nil)
    guard CGImageDestinationFinalize(destination) else { fatalError("Could not write PNG export") }
}
