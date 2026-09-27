import subprocess
import os
import shutil

w, h = 800, 620
pad_x, pad_y = 48, 38
x0, y0 = pad_x, pad_y
width, height = w - 2 * pad_x, h - 2 * pad_y
x1, y1 = x0 + width, y0 + height

nx, ny = 14, 11
dx = width / nx
dy = height / ny
r = 11.5

p = [f'M {x0},{y0}']
for i in range(nx):
    seg_x0 = x0 + i * dx
    seg_x1 = x0 + (i + 1) * dx
    flat = (dx - 2 * r) / 2
    p.append(f'L {seg_x0 + flat},{y0} A {r},{r} 0 0,0 {seg_x1 - flat},{y0} L {seg_x1},{y0}')

for i in range(ny):
    seg_y0 = y0 + i * dy
    seg_y1 = y0 + (i + 1) * dy
    flat = (dy - 2 * r) / 2
    p.append(f'L {x1},{seg_y0 + flat} A {r},{r} 0 0,0 {x1},{seg_y1 - flat} L {x1},{seg_y1}')

for i in range(nx, 0, -1):
    seg_x1 = x0 + i * dx
    seg_x0 = x0 + (i - 1) * dx
    flat = (dx - 2 * r) / 2
    p.append(f'L {seg_x1 - flat},{y1} A {r},{r} 0 0,0 {seg_x0 + flat},{y1} L {seg_x0},{y1}')

for i in range(ny, 0, -1):
    seg_y1 = y0 + i * dy
    seg_y0 = y0 + (i - 1) * dy
    flat = (dy - 2 * r) / 2
    p.append(f'L {x0},{seg_y1 - flat} A {r},{r} 0 0,0 {x0},{seg_y0 + flat} L {x0},{seg_y0}')

p.append('Z')
path_str = ' '.join(p)

inner_x = x0 + 38
inner_y = y0 + 34
inner_w = width - 76
inner_h = height - 68

configs = [
    {
        "key": "question_blue",
        "orig_name": "Screenshot 2026-09-26 at 4.19.33 PM.png",
        "bg": "#1354bb",
        "loc_color": "#ffffff",
        "is_question": True,
        "q_color": "#ffffff",
    },
    {
        "key": "question_magenta",
        "orig_name": "Screenshot 2026-09-26 at 4.19.38 PM.png",
        "bg": "#c73373",
        "loc_color": "#ffffff",
        "is_question": True,
        "q_color": "#ffffff",
    },
    {
        "key": "question_lime",
        "orig_name": "Screenshot 2026-09-26 at 4.19.42 PM.png",
        "bg": "#c8ea29",
        "loc_color": "#1354bb",
        "is_question": True,
        "q_color": "#1354bb",
    },
    {
        "key": "response_magenta",
        "orig_name": "Screenshot 2026-09-26 at 4.19.46 PM.png",
        "bg": "#c73373",
        "loc_color": "#ffffff",
        "is_question": False,
        "line_color": "#1354bb",
        "lines": [inner_y + 145, inner_y + 225, inner_y + 305, inner_y + 385],
    },
    {
        "key": "response_blue",
        "orig_name": "Screenshot 2026-09-26 at 4.19.50 PM.png",
        "bg": "#1354bb",
        "loc_color": "#ffffff",
        "is_question": False,
        "line_color": "#e3f03b",
        "lines": [inner_y + 145, inner_y + 225, inner_y + 305, inner_y + 385],
    },
    {
        "key": "response_lime",
        "orig_name": "Screenshot 2026-09-26 at 4.19.54 PM.png",
        "bg": "#c8ea29",
        "loc_color": "#1354bb",
        "is_question": False,
        "line_color": "#1354bb",
        "lines": [inner_y + 195, inner_y + 285, inner_y + 375],
    },
]

dest_dirs = [
    "artifacts/apna-home-screen/src/assets/stamps",
    "artifacts/apna-home-screen/public/stamps",
    "attached_assets",
    ".conversation/attached_assets",
]

for d in dest_dirs:
    os.makedirs(d, exist_ok=True)

for cfg in configs:
    tmp_png = f"/tmp/{cfg['key']}.png"
    cmd = [
        'convert', '-size', f'{w}x{h}', 'xc:none',
        '-fill', '#ffffff', '-stroke', '#1a1a1a', '-strokewidth', '2',
        '-draw', f'path "{path_str}"',
        '-fill', cfg['bg'], '-stroke', '#1a1a1a', '-strokewidth', '1',
        '-draw', f'rectangle {inner_x},{inner_y} {inner_x + inner_w},{inner_y + inner_h}',
        '-fill', cfg['loc_color'], '-stroke', 'none',
        '-font', 'Liberation-Sans-Bold', '-pointsize', '20',
        '-annotate', f'+{inner_x + 55}+{inner_y + 44}', 'location',
    ]

    if cfg['is_question']:
        cmd.extend([
            '-fill', cfg['q_color'],
            '-pointsize', '38', '-gravity', 'Center',
            '-annotate', '+0-25', 'What makes this place',
            '-annotate', '+0+35', 'special to you?',
        ])
    else:
        lx0 = inner_x + 60
        lx1 = inner_x + inner_w - 60
        for ly in cfg['lines']:
            cmd.extend([
                '-stroke', cfg['line_color'], '-strokewidth', '3',
                '-draw', f'line {lx0},{ly} {lx1},{ly}',
            ])

    cmd.append(tmp_png)
    subprocess.run(cmd, check=True)

    # Save to all target paths with both key name and original screenshot name
    for d in dest_dirs:
        shutil.copy(tmp_png, os.path.join(d, f"{cfg['key']}.png"))
        shutil.copy(tmp_png, os.path.join(d, cfg['orig_name']))
        # Also with narrow spaces in PM
        shutil.copy(tmp_png, os.path.join(d, cfg['orig_name'].replace(' PM', '\u202fPM')))

print("All 6 PNG assets generated and saved across all asset directories successfully!")
