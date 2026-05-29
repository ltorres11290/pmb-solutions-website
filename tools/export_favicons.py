#!/usr/bin/env python3
"""
Export PNG favicons and multi-resolution favicon.ico from the PMB-Solutions mark.

Preferred:  pip install cairosvg pillow
  → Renders favicon-raster-source.svg / apple-touch-raster-source.svg (logo-accurate).

Fallback (stdlib only): solid brand-color squares + ICO with embedded PNGs.

Run from the site root:
    python tools/export_favicons.py
"""
from __future__ import annotations

import io
import struct
import sys
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Brand fill (matches logo hexagon #1E40AF)
BRAND_RGBA = (30, 64, 175, 255)


def _png_chunk(chunk_type: bytes, data: bytes) -> bytes:
    crc = zlib.crc32(chunk_type + data) & 0xFFFFFFFF
    return struct.pack(">I", len(data)) + chunk_type + data + struct.pack(">I", crc)


def rgba_png(width: int, height: int, rgba: tuple[int, int, int, int]) -> bytes:
    """Minimal truecolor+alpha PNG (8-bit)."""
    raw = b"".join([b"\x00" + bytes(rgba) * width for _ in range(height)])
    comp = zlib.compress(raw, 9)
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    sig = b"\x89PNG\r\n\x1a\n"
    return sig + _png_chunk(b"IHDR", ihdr) + _png_chunk(b"IDAT", comp) + _png_chunk(b"IEND", b"")


def _png_dimensions(png: bytes) -> tuple[int, int]:
    if png[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("Not a PNG")
    if png[12:16] != b"IHDR":
        raise ValueError("Missing IHDR")
    return struct.unpack(">II", png[16:24])


def ico_from_pngs(pngs: list[bytes]) -> bytes:
    """Windows Vista+ ICO containing embedded PNG images."""
    count = len(pngs)
    header = struct.pack("<HHH", 0, 1, count)
    dir_size = 16 * count
    offset = 6 + dir_size
    directory = bytearray()
    images = bytearray()
    pos = offset
    for png in pngs:
        w, h = _png_dimensions(png)
        wb = w if w < 256 else 0
        hb = h if h < 256 else 0
        directory.extend(
            struct.pack(
                "<BBBBHHII",
                wb,
                hb,
                0,
                0,
                1,
                0,
                len(png),
                pos,
            )
        )
        images.extend(png)
        pos += len(png)
    return header + bytes(directory) + bytes(images)


def export_with_cairo() -> bool:
    try:
        import cairosvg
        from PIL import Image
    except ImportError:
        return False

    def svg_to_png(svg_path: Path, size: int) -> bytes:
        return cairosvg.svg2png(url=str(svg_path), output_width=size, output_height=size)

    jobs = [
        ("favicon-raster-source.svg", "favicon-16x16.png", 16),
        ("favicon-raster-source.svg", "favicon-32x32.png", 32),
        ("favicon-raster-source.svg", "android-chrome-192x192.png", 192),
        ("favicon-raster-source.svg", "android-chrome-512x512.png", 512),
        ("apple-touch-raster-source.svg", "apple-touch-icon.png", 180),
    ]
    for svg_name, png_name, px in jobs:
        svg = ROOT / svg_name
        if not svg.is_file():
            print(f"Missing {svg}", file=sys.stderr)
            return False
        (ROOT / png_name).write_bytes(svg_to_png(svg, px))
        print(f"Wrote {png_name} ({px}x{px}) [cairosvg]")

    fav16 = ROOT / "favicon-16x16.png"
    fav32 = ROOT / "favicon-32x32.png"
    im16 = Image.open(fav16).convert("RGBA")
    im32 = Image.open(fav32).convert("RGBA")
    im48 = im32.resize((48, 48), Image.Resampling.LANCZOS)
    buf = io.BytesIO()
    im16.save(buf, format="ICO", append_images=[im32, im48])
    (ROOT / "favicon.ico").write_bytes(buf.getvalue())
    print("Wrote favicon.ico (16, 32, 48) [Pillow]")
    return True


def export_solid_fallback() -> None:
    sizes = [
        ("favicon-16x16.png", 16),
        ("favicon-32x32.png", 32),
        ("android-chrome-192x192.png", 192),
        ("android-chrome-512x512.png", 512),
        ("apple-touch-icon.png", 180),
    ]
    png_map: dict[str, bytes] = {}
    for name, px in sizes:
        data = rgba_png(px, px, BRAND_RGBA)
        (ROOT / name).write_bytes(data)
        png_map[name] = data
        print(f"Wrote {name} ({px}x{px}) [solid fallback]")

    png48 = rgba_png(48, 48, BRAND_RGBA)
    ico_bytes = ico_from_pngs(
        [png_map["favicon-16x16.png"], png_map["favicon-32x32.png"], png48]
    )
    (ROOT / "favicon.ico").write_bytes(ico_bytes)
    print("Wrote favicon.ico (16, 32, 48) [stdlib ICO + embedded PNG]")

    try:
        from PIL import Image

        buf = io.BytesIO()
        Image.open(io.BytesIO(png_map["favicon-16x16.png"])).convert("RGBA").save(
            buf,
            format="ICO",
            append_images=[
                Image.open(io.BytesIO(png_map["favicon-32x32.png"])).convert("RGBA"),
                Image.open(io.BytesIO(png_map["favicon-48x48.png"])).convert("RGBA"),
            ],
        )
        (ROOT / "favicon.ico").write_bytes(buf.getvalue())
        print("Rewrote favicon.ico [Pillow ICO]")
    except ImportError:
        pass


def main() -> int:
    if export_with_cairo():
        print("Done (high-fidelity raster from SVG).")
        return 0
    print("cairosvg/Pillow not available — writing solid brand PNGs + ICO.", file=sys.stderr)
    export_solid_fallback()
    print("Done (fallback). Re-run after: pip install cairosvg pillow")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
