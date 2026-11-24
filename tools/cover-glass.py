# Делает стёкла окна на обложке прозрачными, чтобы за ними ехал лес.
# Запуск: python3 tools/cover-glass.py  (после каждого нового экспорта cover.png)
from PIL import Image
import sys
p = sys.argv[1] if len(sys.argv) > 1 else 'src/assets/pixel/cover.png'
im = Image.open(p).convert('RGBA'); px = im.load(); W, H = im.size
FRAME = {(19, 15, 33), (63, 63, 77)}          # тёмная рама и серый переплёт
BOX = (190, 30, 288, 107)                       # рамка окна: стекло не выйдет за неё
seeds = [(230, 40), (230, 80)]                  # верхнее и нижнее стекло
seen = set(); stack = list(seeds)
while stack:
    x, y = stack.pop()
    if (x, y) in seen or not (BOX[0] <= x <= BOX[2] and BOX[1] <= y <= BOX[3]): continue
    seen.add((x, y))
    if px[x, y][:3] in FRAME: continue
    px[x, y] = (0, 0, 0, 0)
    stack += [(x+1, y), (x-1, y), (x, y+1), (x, y-1)]
im.save(p); print('прозрачных пикселей:', sum(1 for x in range(W) for y in range(H) if px[x, y][3] == 0))
