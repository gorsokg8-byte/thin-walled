// Numerical solvers for axisymmetric shells of revolution: canonical system (13.1),
// initial-parameter method (MNP), Godunov orthonormalization, conical finite elements.
// Units are whatever the caller uses consistently (the calculators use mm, MPa, N/mm).
// Meridian convention: z points down, t = (cos θ, sin θ), n = (sin θ, -cos θ), all parts chained.
(function () {
  const S = (TW.solver = {});
  const deg = Math.PI / 180;

  // ---------- meridian model ----------
  // parts: [{type:'cyl'|'cone'|'sph'|'plate', L, theta (deg), th1, th2 (deg), h1, h2}]
  S.model = function (r0, parts, E, mu, p) {
    const segs = [];
    let r = r0, s0 = 0;
    for (const pt of parts) {
      let seg;
      if (pt.type === 'sph') {
        const t1 = pt.th1 * deg, t2 = pt.th2 * deg;
        const Rs = r / Math.sin(t1);
        seg = { type: 'sph', L: Rs * (t2 - t1), Rs, t1, r0: r };
        seg.at = s => { const t = t1 + s / Rs; return { r: Rs * Math.sin(t), th: t }; };
      } else {
        const th = (pt.type === 'cyl' ? 90 : pt.type === 'plate' ? (pt.inward ? 180 : 0) : pt.theta) * deg;
        const rr = r;
        seg = { type: pt.type, L: pt.L, th, r0: rr };
        seg.at = s => ({ r: rr + s * Math.cos(th), th });
      }
      seg.s0 = s0; seg.h1 = pt.h1; seg.h2 = pt.h2 == null ? pt.h1 : pt.h2;
      segs.push(seg);
      s0 += seg.L;
      r = seg.at(seg.L).r;
    }
    const m = { segs, L: s0, E, mu, p, joints: segs.slice(1).map(g => g.s0) };
    // geometry and stiffness at arc coordinate s (side: -1 takes the part ending at a joint)
    m.at = function (s, side) {
      let k = segs.length - 1;
      for (let i = 0; i < segs.length; i++) {
        const end = segs[i].s0 + segs[i].L;
        if (s < end - 1e-12 || (side < 0 && Math.abs(s - end) < 1e-12) ) { k = i; break; }
      }
      const g = segs[k], loc = Math.min(Math.max(s - g.s0, 0), g.L);
      const q = g.at(loc);
      const h = g.h1 + (g.h2 - g.h1) * (g.L ? loc / g.L : 0);
      return { r: q.r, c: Math.cos(q.th), sn: Math.sin(q.th), h, Eh: E * h, D: E * h ** 3 / (12 * (1 - mu * mu)), part: k };
    };
    return m;
  };

  // Matrix [F] (13.7) and load vector (13.8) at s; pressure p acts along n (internal pressure > 0).
  function FG(m, s, side) {
    const g = m.at(s, side), mu = m.mu, r = Math.max(g.r, 1e-9), c = g.c, sn = g.sn;
    const a = (1 - mu * mu) / (g.Eh * r);
    const F = [
      [-mu * c / r, 0, -sn, a * c * c, a * sn * c, 0],
      [-mu * sn / r, 0, c, a * sn * c, a * sn * sn, 0],
      [0, 0, -mu * c / r, 0, 0, 1 / (r * g.D)],
      [g.Eh / r, 0, 0, mu * c / r, mu * sn / r, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, (1 - mu * mu) * g.D * c * c / r, sn, -c, mu * c / r],
    ];
    const qr = m.p * sn, qz = -m.p * c;
    return { F, gv: [0, 0, 0, -r * qr, -r * qz, 0], g };
  }
  S.FG = FG;

  // RK4 for Y' = F Y + G (G added to the last column only).
  function rk4(m, Y, s, h, side) {
    const f = (ss, Yc, sd) => {
      const { F, gv } = FG(m, ss, sd);
      return Yc.map((col, j) => {
        const out = new Array(6).fill(0);
        for (let i = 0; i < 6; i++) {
          let v = 0;
          for (let k = 0; k < 6; k++) v += F[i][k] * col[k];
          out[i] = v + (j === Yc.length - 1 ? gv[i] : 0);
        }
        return out;
      });
    };
    const add = (A, B, t) => A.map((col, j) => col.map((v, i) => v + t * B[j][i]));
    const k1 = f(s, Y, 1), k2 = f(s + h / 2, add(Y, k1, h / 2), 1), k3 = f(s + h / 2, add(Y, k2, h / 2), 1), k4 = f(s + h, add(Y, k3, h), -1);
    return Y.map((col, j) => col.map((v, i) => v + h / 6 * (k1[j][i] + 2 * k2[j][i] + 2 * k3[j][i] + k4[j][i])));
  }

  // Boundary condition: { idx: [three prescribed components of y], val: [their values] }.
  S.bc = function (type, r, opt) {
    opt = opt || {};
    switch (type) {
      case 'clamped': return { idx: [0, 1, 2], val: [0, 0, 0] };
      case 'hinged': return { idx: [0, 1, 5], val: [0, 0, 0] };
      case 'sym': return { idx: [1, 2, 3], val: [0, 0, 0] };          // η = 0, ϑ = 0, N = 0
      case 'pole': return { idx: [0, 2, 4], val: [0, 0, 0] };         // ρ = 0, ϑ = 0, rZ = 0
      case 'slide': return { idx: [0, 2, 4], val: [0, 0, r * (opt.Z || 0)] }; // ρ = 0, ϑ = 0, Z given
      default: return { idx: [3, 4, 5], val: [r * (opt.N || 0), r * (opt.Z || 0), r * (opt.M || 0)] }; // free
    }
  };

  function solve(A, b) {
    const n = b.length, M = A.map((row, i) => row.concat([b[i]]));
    for (let c = 0; c < n; c++) {
      let piv = c;
      for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
      [M[c], M[piv]] = [M[piv], M[c]];
      if (Math.abs(M[c][c]) < 1e-300) throw new Error('вырожденная система (проверьте закрепления: осевое смещение должно быть закреплено хотя бы на одном торце)');
      for (let r = c + 1; r < n; r++) {
        const f = M[r][c] / M[c][c];
        for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
      }
    }
    const x = new Array(n).fill(0);
    for (let r = n - 1; r >= 0; r--) {
      let s = M[r][n];
      for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
      x[r] = s / M[r][r];
    }
    return x;
  }
  S.linsolve = solve;

  // λ = ∫β ds — used to choose steps and segments.
  S.lambda = function (m) {
    let lam = 0, bmax = 0;
    const n = 400;
    for (let i = 0; i < n; i++) {
      const g = m.at((i + 0.5) * m.L / n);
      const R2 = Math.abs(g.sn) > 1e-6 ? g.r / Math.abs(g.sn) : Infinity;
      const b = Math.pow(3 * (1 - m.mu * m.mu), 0.25) / Math.sqrt(R2 * g.h);
      lam += b * m.L / n; bmax = Math.max(bmax, b);
    }
    return { lam, bmax };
  };

  // Shooting solver. godunov=false -> plain initial-parameter method (one segment, no orthonormalization).
  S.shoot = function (m, bcL, bcR, opt) {
    opt = opt || {};
    const { lam } = S.lambda(m);
    // grid: nodes at joints, step ≤ 1/(8β)
    const nSteps = Math.max(400, Math.ceil(lam * 12) + 200);
    const breaks = [0].concat(m.joints, [m.L]);
    const grid = [];
    for (let k = 0; k < breaks.length - 1; k++) {
      const a = breaks[k], b = breaks[k + 1], n = Math.max(8, Math.ceil(nSteps * (b - a) / m.L));
      for (let i = 0; i < n; i++) grid.push(a + (b - a) * i / n);
    }
    grid.push(m.L);

    // initial matrix: columns e_i for the free components, last column = particular solution
    const free = [0, 1, 2, 3, 4, 5].filter(i => !bcL.idx.includes(i));
    let Y = free.map(i => { const v = new Array(6).fill(0); v[i] = 1; return v; });
    const y0 = new Array(6).fill(0);
    bcL.idx.forEach((i, k) => { y0[i] = bcL.val[k]; });
    Y.push(y0);

    const segLen = opt.godunov ? Math.max(1, Math.round(grid.length / Math.max(4, Math.ceil(lam / 1.0)))) : Infinity;
    const store = [];   // {s, Y, seg}
    const Omegas = [];
    let seg = 0;
    store.push({ s: 0, Y, seg });
    for (let i = 1; i < grid.length; i++) {
      Y = rk4(m, Y, grid[i - 1], grid[i] - grid[i - 1]);
      store.push({ s: grid[i], Y, seg });
      if (opt.godunov && i % segLen === 0 && i < grid.length - 1) {
        // Gram–Schmidt: Y = Z Ω
        const Z = [], Om = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 1]];
        for (let j = 0; j < 4; j++) {
          let v = Y[j].slice();
          for (let k = 0; k < Z.length && k < 3; k++) {
            const w = Z[k].reduce((a, x, t) => a + x * Y[j][t], 0);
            Om[k][j] = w;
            v = v.map((x, t) => x - w * Z[k][t]);
          }
          if (j < 3) {
            const nrm = Math.sqrt(v.reduce((a, x) => a + x * x, 0));
            Om[j][j] = nrm; v = v.map(x => x / nrm);
          }
          Z.push(v);
        }
        Omegas.push(Om);
        Y = Z; seg++;
        store.push({ s: grid[i], Y, seg });
      }
    }
    // right boundary: B Y c = b, c = (c1, c2, c3, 1)
    const A = bcR.idx.map(i => [Y[0][i], Y[1][i], Y[2][i]]);
    const rhs = bcR.idx.map((i, k) => bcR.val[k] - Y[3][i]);
    let cond = 0;
    { // crude conditioning measure: ratio of smallest pivot-ish scale
      const colN = [0, 1, 2].map(j => Math.sqrt(A.reduce((a, row) => a + row[j] * row[j], 0)));
      const det = A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) - A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) + A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
      cond = Math.abs(det) / (colN[0] * colN[1] * colN[2] || 1);
    }
    const cs = [];
    let c = solve(A, rhs).concat([1]);
    cs[seg] = c;
    for (let j = seg - 1; j >= 0; j--) {
      const Om = Omegas[j], cn = cs[j + 1], x = [0, 0, 0, 1];
      for (let r = 2; r >= 0; r--) {
        let v = cn[r] - Om[r][3];
        for (let k = r + 1; k < 3; k++) v -= Om[r][k] * x[k];
        x[r] = v / Om[r][r];
      }
      cs[j] = x;
    }
    const out = [];
    for (const st of store) {
      // skip duplicate nodes after orthonormalization
      if (out.length && Math.abs(out[out.length - 1].s - st.s) < 1e-12) continue;
      const cc = cs[st.seg];
      const y = [0, 1, 2, 3, 4, 5].map(i => st.Y.reduce((a, col, j) => a + col[i] * cc[j], 0));
      out.push({ s: st.s, y });
    }
    return { pts: out, lam, segments: seg + 1, cond };
  };

  // Section resultants from the state vector.
  S.post = function (m, s, y, side) {
    const g = m.at(s, side), r = Math.max(g.r, 1e-9), mu = m.mu;
    const [rho, eta, th, rN, rZ, rM] = y;
    const N = rN / r, Z = rZ / r, M1 = rM / r;
    const T1 = N * g.c + Z * g.sn, Q = N * g.sn - Z * g.c;
    const T2 = mu * T1 + g.Eh * rho / r;
    const M2 = mu * M1 + (1 - mu * mu) * g.D * g.c * th / r;
    const h = g.h;
    return {
      s, r, rho, eta, th, N, Z, T1, T2, Q, M1, M2,
      s1o: T1 / h + 6 * M1 / h ** 2, s1i: T1 / h - 6 * M1 / h ** 2,
      s2o: T2 / h + 6 * M2 / h ** 2, s2i: T2 / h - 6 * M2 / h ** 2,
    };
  };

  // ---------- finite elements: conical element (16.1)-(16.9) ----------
  // Nodal dof: {ρ, η, ϑ}. Returns nodal displacements and element-centre resultants.
  S.fem = function (m, nEl, bcL, bcR, edgeL, edgeR) {
    const mu = m.mu;
    // nodes along s, keep joints as nodes
    const breaks = [0].concat(m.joints, [m.L]);
    const sN = [0];
    for (let k = 0; k < breaks.length - 1; k++) {
      const a = breaks[k], b = breaks[k + 1], n = Math.max(2, Math.round(nEl * (b - a) / m.L));
      for (let i = 1; i <= n; i++) sN.push(a + (b - a) * i / n);
    }
    const nn = sN.length, ndof = 3 * nn, bw = 6;
    // symmetric band storage K[i][j-i], j-i in 0..bw-1
    const K = Array.from({ length: ndof }, () => new Array(bw).fill(0));
    const Fv = new Array(ndof).fill(0);
    const gp = [[0.1127016653792583, 5 / 18], [0.5, 8 / 18], [0.8872983346207417, 5 / 18]];
    const elems = [];
    for (let e = 0; e < nn - 1; e++) {
      const sa = sN[e], sb = sN[e + 1];
      const ga = m.at(sa, 1), gb = m.at(sb, -1);
      const ra = ga.r, rb = gb.r;
      const L = Math.hypot(rb - ra, (sb - sa) * gb.sn + 0) || (sb - sa);
      // straight cone through the two nodes
      const dz = (sb - sa) * 0; // z not needed: element angle from chord
      const chordR = rb - ra;
      // chord direction: use mean tangent angle of the meridian between nodes
      const gm = m.at((sa + sb) / 2, 1);
      const c = chordR / (sb - sa), sn = Math.sqrt(Math.max(0, 1 - c * c)) * (gm.sn >= 0 ? 1 : -1);
      const Le = sb - sa;
      const lam = [[c, sn, 0], [sn, -c, 0], [0, 0, -1]];
      const Ke = Array.from({ length: 6 }, () => new Array(6).fill(0));
      const Fe = new Array(6).fill(0);
      const Bmats = [];
      for (const [xi, wgt] of gp) {
        const r = ra + xi * (rb - ra);
        const h = ga.h + (gb.h - ga.h) * xi;
        const Eh = m.E * h / (1 - mu * mu), Dd = m.E * h ** 3 / (12 * (1 - mu * mu));
        // shape functions and derivatives wrt s
        const N1 = 1 - 3 * xi * xi + 2 * xi ** 3, N2 = Le * xi * (1 - xi) ** 2, N3 = 3 * xi * xi - 2 * xi ** 3, N4 = Le * xi * xi * (xi - 1);
        const d1 = (-6 * xi + 6 * xi * xi) / Le, d2 = (1 - 4 * xi + 3 * xi * xi), d3 = (6 * xi - 6 * xi * xi) / Le, d4 = (3 * xi * xi - 2 * xi);
        const dd1 = (-6 + 12 * xi) / Le ** 2, dd2 = (-4 + 6 * xi) / Le, dd3 = (6 - 12 * xi) / Le ** 2, dd4 = (6 * xi - 2) / Le;
        // local q = {u1, w1, w1', u2, w2, w2'}
        const B = [
          [-1 / Le, 0, 0, 1 / Le, 0, 0],
          [(1 - xi) * c / r, N1 * sn / r, N2 * sn / r, xi * c / r, N3 * sn / r, N4 * sn / r],
          [0, -dd1, -dd2, 0, -dd3, -dd4],
          [0, -c / r * d1, -c / r * d2, 0, -c / r * d3, -c / r * d4],
        ];
        const Dm = [[Eh, mu * Eh, 0, 0], [mu * Eh, Eh, 0, 0], [0, 0, Dd, mu * Dd], [0, 0, mu * Dd, Dd]];
        const DB = Dm.map(row => [0, 1, 2, 3, 4, 5].map(j => row.reduce((a, v, k) => a + v * B[k][j], 0)));
        const f = 2 * Math.PI * Le * wgt * r;
        for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) Ke[i][j] += f * B.reduce((a, row, k) => a + row[i] * DB[k][j], 0);
        // pressure along local normal w
        const Nw = [0, N1, N2, 0, N3, N4];
        for (let i = 0; i < 6; i++) Fe[i] += f * Nw[i] * m.p;
        Bmats.push({ xi, B, Dm, r, h });
      }
      // transform to global: q_loc = Λ q_glob
      const Lm = Array.from({ length: 6 }, () => new Array(6).fill(0));
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { Lm[i][j] = lam[i][j]; Lm[i + 3][j + 3] = lam[i][j]; }
      const KL = Ke.map(row => [0, 1, 2, 3, 4, 5].map(j => row.reduce((a, v, k) => a + v * Lm[k][j], 0)));
      const Kg = [0, 1, 2, 3, 4, 5].map(i => [0, 1, 2, 3, 4, 5].map(j => Lm.reduce((a, row, k) => a + row[i] * KL[k][j], 0)));
      const Fg = [0, 1, 2, 3, 4, 5].map(i => Lm.reduce((a, row, k) => a + row[i] * Fe[k], 0));
      const dofs = [3 * e, 3 * e + 1, 3 * e + 2, 3 * e + 3, 3 * e + 4, 3 * e + 5];
      for (let i = 0; i < 6; i++) {
        Fv[dofs[i]] += Fg[i];
        for (let j = i; j < 6; j++) K[dofs[i]][dofs[j] - dofs[i]] += Kg[i][j];
      }
      elems.push({ e, sa, sb, Lm, mid: Bmats[1], c, sn });
    }
    // edge loads: generalized nodal forces = ∓2πr {N, Z, M1} (left −, right +)
    const r0 = m.at(0).r, rL = m.at(m.L, -1).r;
    if (edgeL) edgeL.forEach((v, i) => { Fv[i] += -2 * Math.PI * r0 * v; });
    if (edgeR) edgeR.forEach((v, i) => { Fv[ndof - 3 + i] += 2 * Math.PI * rL * v; });
    // prescribed zero displacements
    const fix = new Set();
    bcL.forEach(i => fix.add(i));
    bcR.forEach(i => fix.add(ndof - 3 + i));
    for (const d of fix) {
      for (let j = 0; j < bw; j++) K[d][j] = 0;
      for (let i = Math.max(0, d - bw + 1); i < d; i++) K[i][d - i] = 0;
      K[d][0] = 1; Fv[d] = 0;
    }
    // banded Cholesky (LDLᵀ)
    for (let i = 0; i < ndof; i++) {
      for (let k = Math.max(0, i - bw + 1); k < i; k++) {
        const lik = K[k][i - k];
        if (!lik) continue;
        const f = lik / K[k][0];
        for (let j = i; j < Math.min(ndof, k + bw); j++) K[i][j - i] -= f * K[k][j - k];
      }
      if (Math.abs(K[i][0]) < 1e-300) throw new Error('вырожденная матрица жёсткости (закрепите осевое смещение)');
    }
    const x = Fv.slice();
    for (let i = 0; i < ndof; i++) for (let k = Math.max(0, i - bw + 1); k < i; k++) x[i] -= K[k][i - k] / K[k][0] * x[k];
    for (let i = ndof - 1; i >= 0; i--) {
      for (let j = i + 1; j < Math.min(ndof, i + bw); j++) x[i] -= K[i][j - i] * x[j];
      x[i] /= K[i][0];
    }
    const nodes = sN.map((s, i) => ({ s, rho: x[3 * i], eta: x[3 * i + 1], th: x[3 * i + 2] }));
    const res = elems.map(el => {
      const qg = x.slice(3 * el.e, 3 * el.e + 6);
      const ql = el.Lm.map(row => row.reduce((a, v, k) => a + v * qg[k], 0));
      const { B, Dm, h } = el.mid;
      const eps = B.map(row => row.reduce((a, v, k) => a + v * ql[k], 0));
      const sig = Dm.map(row => row.reduce((a, v, k) => a + v * eps[k], 0));
      return { s: (el.sa + el.sb) / 2, T1: sig[0], T2: sig[1], M1: sig[2], M2: sig[3], h,
        s1o: sig[0] / h + 6 * sig[2] / h ** 2, s1i: sig[0] / h - 6 * sig[2] / h ** 2 };
    });
    return { nodes, res, nEl: nn - 1 };
  };
})();
