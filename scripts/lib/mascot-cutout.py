"""
Cut the mascot out of its white JPEG background.

Two passes, and the second one is the fix. A flood fill from the corners clears
everything OUTSIDE the character but cannot reach the counter of the P, the hole
the letterform is defined by, so the first version shipped a character with a
white plug in it. This also labels every ENCLOSED near-white region and clears
the ones big enough to be real, which is the counter (split in two by the
glasses arm crossing it) and not the handful of 1-20px JPEG speckles.
"""
from PIL import Image, ImageFilter
from collections import deque
import sys

src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
w, h = im.size
px = im.load()

TOL = 26
MIN_ENCLOSED = 200  # below this it is jpeg noise, not a hole anyone drew

def near(c):
    return abs(c[0] - 255) + abs(c[1] - 255) + abs(c[2] - 255) <= TOL * 3

bg = [[False] * h for _ in range(w)]
seen = [[False] * h for _ in range(w)]
cleared = 0

for y in range(h):
    for x in range(w):
        if seen[x][y] or not near(px[x, y]):
            continue
        q = deque([(x, y)])
        seen[x][y] = True
        pix = []
        edge = False
        while q:
            cx, cy = q.popleft()
            pix.append((cx, cy))
            if cx == 0 or cy == 0 or cx == w - 1 or cy == h - 1:
                edge = True
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < w and 0 <= ny < h and not seen[nx][ny] and near(px[nx, ny]):
                    seen[nx][ny] = True
                    q.append((nx, ny))
        if edge or len(pix) >= MIN_ENCLOSED:
            if not edge:
                cleared += len(pix)
            for cx, cy in pix:
                bg[cx][cy] = True

alpha = Image.new("L", (w, h), 255)
ap = alpha.load()
for y in range(h):
    for x in range(w):
        if bg[x][y]:
            ap[x, y] = 0
alpha = alpha.filter(ImageFilter.GaussianBlur(0.6))  # take the jpeg fringe off

out = im.convert("RGBA")
out.putalpha(alpha)
out = out.crop(out.getbbox())
out.thumbnail((640, 640), Image.LANCZOS)
rgb = out.convert("RGB").quantize(colors=128, method=Image.MEDIANCUT).convert("RGB")
rgb.putalpha(out.getchannel("A"))
rgb.save(dst, optimize=True)
print(f"{dst} {rgb.size}, {cleared}px of enclosed background cleared")
