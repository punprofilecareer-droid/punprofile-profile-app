"""
Turn a browser screenshot of the OG card source into `public/og.png`.

    python3 scripts/lib/og-correct.py <screenshot.jpg> public/og.png

**Why this exists.** The screenshot comes back in the display's colour space and
is re-encoded as sRGB without conversion, so a flat `primary` (#068376) arrives
as about #3A8276: red lifted by fifty, green and blue untouched. Nothing looks
wrong without measuring it, and the result is a share card carrying a duller
teal than the brand's own token.

Greys, black and white land exactly while saturated colours desaturate, which is
a gamut rotation rather than a per-channel curve. So the card source renders a
strip of patches in colours whose true values are known, and this fits a 3x3
matrix in linear light that maps measured back to true. Fitted on 16/08/2026 it
reproduced all six patches to within two sRGB units.

The strip must be the full width of the page, `STRIP_RATIO` of its height, and
carry `TRUTH` left to right. `public/README-og.md` has the rest of the recipe.
"""

import sys
import warnings

import numpy as np
from PIL import Image

# The card is 1200x630 and the strip 70px under it, so the page is 700 tall.
STRIP_RATIO = 70 / 700
OUT_SIZE = (1200, 630)

TRUTH = np.array(
    [
        (0, 0, 0),          # black
        (6, 131, 118),      # primary
        (93, 201, 190),     # primary-bright
        (204, 63, 0),       # accent
        (36, 36, 37),       # ink
        (255, 255, 255),    # white
    ],
    dtype=np.float64,
)


def to_lin(v):
    v = np.asarray(v, dtype=np.float64) / 255.0
    return np.where(v <= 0.04045, v / 12.92, ((v + 0.055) / 1.055) ** 2.4)


def to_srgb(v):
    v = np.clip(v, 0, 1)
    return np.where(v <= 0.0031308, v * 12.92, 1.055 * v ** (1 / 2.4) - 0.055) * 255.0


def page_bbox(a):
    """The rendered page against the browser's white surround."""
    h, w, _ = a.shape
    white = lambda c: c[0] > 248 and c[1] > 248 and c[2] > 248
    right = w - 1
    while right > 0 and white(a[5, right]):
        right -= 1
    bottom = h - 1
    while bottom > 0 and white(a[bottom, 5]):
        bottom -= 1
    return right + 1, bottom + 1


def main(src, dst):
    a = np.asarray(Image.open(src).convert("RGB"), dtype=np.float64)
    width, height = page_bbox(a)

    strip_h = int(round(height * STRIP_RATIO))
    sy = height - strip_h
    pw = width / len(TRUTH)
    # Sampled from the middle of each patch, never its edges: the capture is a
    # JPEG and the boundaries between patches carry ringing.
    measured = np.array(
        [
            a[sy + strip_h // 4 : sy + strip_h * 3 // 4,
              int(i * pw + pw * 0.3) : int(i * pw + pw * 0.7)].reshape(-1, 3).mean(axis=0)
            for i in range(len(TRUTH))
        ]
    )

    M, *_ = np.linalg.lstsq(to_lin(measured), to_lin(TRUTH), rcond=None)
    fit = to_srgb(to_lin(measured) @ M)
    worst = np.abs(fit - TRUTH).max()
    for t, f in zip(TRUTH, fit):
        print(f"  {tuple(t.astype(int))} -> {tuple(np.round(f, 1))}")
    if worst > 4:
        # A bad fit means the strip was misread, and silently shipping a
        # recoloured card is worse than stopping.
        raise SystemExit(f"FAIL calibration off by {worst:.1f} sRGB units; check the strip")

    with warnings.catch_warnings():
        # Pure black rows make numpy grumble about zero division in the
        # matmul and the result is still exactly black.
        warnings.simplefilter("ignore", RuntimeWarning)
        corrected = to_srgb(to_lin(a.reshape(-1, 3)) @ M).reshape(a.shape)
    card = Image.fromarray(np.clip(corrected, 0, 255).astype(np.uint8))
    card = card.crop((0, 0, width, sy)).resize(OUT_SIZE, Image.LANCZOS)
    card.save(dst)
    print(f"{dst} {card.size}, calibration within {worst:.1f} units")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
