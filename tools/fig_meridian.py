"""Meridian-geometry figure for content/t01-basics.js, built from exact ellipse geometry
(M on the curve, exact normal, tangent, centres O1, O2). Usage: python tools/fig_meridian.py content/t01-basics.js"""
import math, re, sys
from pathlib import Path

X0, Yc = 62.0, 205.0       # axis x, ellipse centre y (svg, y down = z down)
a, b = 255.0, 160.0         # semi-axes: radial, axial (oblate head: R1 < R2, O1 between M and O2)
t0 = math.radians(53.0)     # parameter of point M
Ybot = 395.0                # end of the cylindrical part

f = lambda v: f'{v:.1f}'.rstrip('0').rstrip('.')
P = lambda t: (X0 + a * math.sin(t), Yc - b * math.cos(t))

def unit(x, y):
    l = math.hypot(x, y); return (x / l, y / l)

M = P(t0)
n = unit(math.sin(t0) / a, -math.cos(t0) / b)          # outward normal (up-right)
th = math.atan2(n[0], -n[1])                            # angle between normal and axis
tau = (math.cos(th), math.sin(th))                      # tangent, direction of growing s (right-down)
R1 = (a**2 * math.cos(t0)**2 + b**2 * math.sin(t0)**2) ** 1.5 / (a * b)
R2 = (M[0] - X0) / math.sin(th)
O1 = (M[0] - R1 * n[0], M[1] - R1 * n[1])
O2 = (M[0] - R2 * n[0], M[1] - R2 * n[1])
assert abs(O2[0] - X0) < 1e-9
# check M lies on the ellipse
assert abs(((M[0] - X0) / a) ** 2 + ((M[1] - Yc) / b) ** 2 - 1) < 1e-12

def add(p, v, k=1.0): return (p[0] + k * v[0], p[1] + k * v[1])

def arrow(tip, d, cls, size=9, half=3.6):
    """filled arrowhead at tip pointing along unit d"""
    bx, by = tip[0] - size * d[0], tip[1] - size * d[1]
    px, py = -d[1], d[0]
    pts = [tip, (bx + half * px, by + half * py), (bx - half * px, by - half * py)]
    return f'<path class="{cls}" d="M{f(pts[0][0])} {f(pts[0][1])}L{f(pts[1][0])} {f(pts[1][1])}L{f(pts[2][0])} {f(pts[2][1])}Z"/>'

def dim(p1, p2, off, side, label, lab_off):
    """dimension line between p1 and p2 shifted by off along unit 'side'"""
    q1, q2 = add(p1, side, off), add(p2, side, off)
    d = unit(q2[0] - q1[0], q2[1] - q1[1])
    e1a, e1b = add(p1, side, 4), add(p1, side, off + 5)
    e2a, e2b = add(p2, side, 4), add(p2, side, off + 5)
    mid = ((q1[0] + q2[0]) / 2, (q1[1] + q2[1]) / 2)
    lp = add(mid, side, lab_off)
    return '\n'.join([
        f'<line class="ext" x1="{f(e1a[0])}" y1="{f(e1a[1])}" x2="{f(e1b[0])}" y2="{f(e1b[1])}"/>',
        f'<line class="ext" x1="{f(e2a[0])}" y1="{f(e2a[1])}" x2="{f(e2b[0])}" y2="{f(e2b[1])}"/>',
        f'<line class="dm" x1="{f(q1[0])}" y1="{f(q1[1])}" x2="{f(q2[0])}" y2="{f(q2[1])}"/>',
        arrow(q1, (-d[0], -d[1]), 'ah'), arrow(q2, d, 'ah'),
        f'<text class="o lb" x="{f(lp[0])}" y="{f(lp[1])}" text-anchor="middle" dominant-baseline="central">{label}</text>',
    ])

def angle_arc(c, rad, a_from, a_to, label, lab_r):
    """arc around c from direction angle a_from to a_to (svg angles, clockwise positive)"""
    s = (c[0] + rad * math.cos(a_from), c[1] + rad * math.sin(a_from))
    e = (c[0] + rad * math.cos(a_to), c[1] + rad * math.sin(a_to))
    am = (a_from + a_to) / 2
    lp = (c[0] + lab_r * math.cos(am), c[1] + lab_r * math.sin(am))
    return (f'<path class="ang" d="M{f(s[0])} {f(s[1])}A{f(rad)} {f(rad)} 0 0 1 {f(e[0])} {f(e[1])}"/>\n'
            f'<text class="t lb" x="{f(lp[0])}" y="{f(lp[1])}" text-anchor="middle" dominant-baseline="central">θ</text>')

pole = P(0)
eq = P(math.pi / 2)
ax_top, ax_bot = 22.0, Ybot + 8
out = []
out.append('<svg viewBox="0 0 520 420" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Helvetica, Arial, sans-serif" font-size="17">')
out.append('<style>.a{stroke:var(--text);fill:none;stroke-width:1.4}.m{stroke:var(--accent);fill:none;stroke-width:3}'
           '.d{stroke:var(--muted);stroke-dasharray:6 4;fill:none;stroke-width:1.2}.t{fill:var(--text)}.c{fill:var(--accent)}'
           '.r{stroke:var(--plot2);stroke-width:2;fill:none}.o{fill:var(--plot2)}.dm{stroke:var(--plot2);stroke-width:1.2}'
           '.ext{stroke:var(--plot2);stroke-width:.8;opacity:.7}.ah{fill:var(--plot2)}.ang{stroke:var(--text);fill:none;stroke-width:1.3}'
           '.lb{paint-order:stroke;stroke:var(--bg);stroke-width:5px;stroke-linejoin:round;font-weight:600}</style>')
# axis with arrow down (z points down, as in Biderman; then dz = ds sin(theta))
out.append(f'<line class="a" x1="{f(X0)}" y1="{f(ax_top)}" x2="{f(X0)}" y2="{f(ax_bot)}"/>')
out.append(arrow((X0, ax_bot + 10), (0, 1), 'axh', 11, 4.5).replace('class="axh"', 'fill="var(--text)"'))
out.append(f'<text class="t lb" x="{f(X0 + 12)}" y="{f(ax_bot + 6)}">z<tspan font-weight="400" font-size="14"> — ось вращения</tspan></text>')
# meridian: exact quarter ellipse from the pole + cylinder
out.append(f'<path class="m" d="M{f(pole[0])} {f(pole[1])}A{f(a)} {f(b)} 0 0 1 {f(eq[0])} {f(eq[1])}L{f(eq[0])} {f(Ybot)}"/>')
out.append(f'<text class="c lb" x="{f(eq[0] + 10)}" y="{f(Yc + 120)}">меридиан</text>')
out.append(f'<circle cx="{f(pole[0])}" cy="{f(pole[1])}" r="3" fill="var(--accent)"/>')
# s along the meridian (label outside the curve, midway between pole and M)
sp = P(t0 * 0.45); sl = add(sp, unit(math.sin(t0 * 0.45) / a, -math.cos(t0 * 0.45) / b), 16)
out.append(f'<text class="c lb" x="{f(sl[0])}" y="{f(sl[1])}" text-anchor="middle" dominant-baseline="central" font-style="italic">s</text>')
# r: horizontal dashed from axis to M (+ reference extension to the right of M for the tangent angle)
out.append(f'<line class="d" x1="{f(X0)}" y1="{f(M[1])}" x2="{f(M[0] + 62)}" y2="{f(M[1])}"/>')
out.append(f'<text class="t lb" x="{f((X0 + M[0]) / 2)}" y="{f(M[1] - 10)}" text-anchor="middle" font-style="italic">r</text>')
# tangent t1 and outward normal n
t_a, t_b = add(M, tau, -70), add(M, tau, 105)
out.append(f'<line class="d" x1="{f(t_a[0])}" y1="{f(t_a[1])}" x2="{f(t_b[0])}" y2="{f(t_b[1])}"/>')
tl = add(t_b, tau, 6)
out.append(f'<text class="t lb" x="{f(tl[0])}" y="{f(tl[1] + 14)}">t₁</text>')
n_b = add(M, n, 70)
out.append(f'<line class="d" x1="{f(M[0])}" y1="{f(M[1])}" x2="{f(n_b[0])}" y2="{f(n_b[1])}"/>')
out.append(arrow(add(n_b, n, 9), n, 'nh', 10, 4).replace('class="nh"', 'fill="var(--muted)"'))
nl = add(n_b, n, 18)
out.append(f'<text class="t lb" x="{f(nl[0] + 4)}" y="{f(nl[1])}" dominant-baseline="central">n</text>')
# normal line M -> O2 through O1
out.append(f'<line class="r" x1="{f(M[0])}" y1="{f(M[1])}" x2="{f(O2[0])}" y2="{f(O2[1])}"/>')
# dimension lines: R1 on the upper-left side, R2 on the lower-right side of the normal
up_left = (-tau[0], -tau[1])
out.append(dim(M, O1, 20, up_left, 'R₁', 15))
out.append(dim(M, O2, 22, tau, 'R₂', 15))
# centres
out.append(f'<circle cx="{f(O1[0])}" cy="{f(O1[1])}" r="4" fill="var(--plot2)"/>')
o1l = add(O1, tau, 16)
out.append(f'<text class="o lb" x="{f(o1l[0] + 2)}" y="{f(o1l[1] + 4)}" dominant-baseline="central">O₁</text>')
out.append(f'<circle cx="{f(O2[0])}" cy="{f(O2[1])}" r="4" fill="var(--plot2)"/>')
out.append(f'<text class="o lb" x="{f(O2[0] - 10)}" y="{f(O2[1] + 4)}" text-anchor="end" dominant-baseline="central">O₂</text>')
# theta at O2: from the axis (up) to the normal; theta at M: from the radial direction to the tangent
out.append(angle_arc(O2, 46, -math.pi / 2, -math.pi / 2 + th, 'θ', 62))
out.append(angle_arc(M, 40, 0.0, th, 'θ', 55))
# point M (on top of everything)
out.append(f'<circle cx="{f(M[0])}" cy="{f(M[1])}" r="5" fill="var(--panel)" stroke="var(--text)" stroke-width="2"/>')
ml = add(M, (-tau[0] * 0.2 + n[0], -tau[1] * 0.2 + n[1]), 0)
out.append(f'<text class="t lb" x="{f(M[0] - 22)}" y="{f(M[1] - 12)}">M</text>')
out.append('</svg>')
svg = '\n'.join(out)

print(f'theta = {math.degrees(th):.2f} deg, R1 = {R1:.1f}, R2 = {R2:.1f}, M = ({M[0]:.1f}, {M[1]:.1f}), '
      f'O1 = ({O1[0]:.1f}, {O1[1]:.1f}), O2 = ({O2[0]:.1f}, {O2[1]:.1f})')

if len(sys.argv) > 1:
    p = Path(sys.argv[1])
    src = p.read_text(encoding='utf-8')
    new, k = re.subn(r'const geomSvg = R`<svg.*?</svg>`;', lambda m: 'const geomSvg = R`' + svg + '`;', src, flags=re.S)
    assert k == 1
    p.write_text(new, encoding='utf-8')
    print('patched', p)
else:
    print(svg)
