// Conical finite elements for branched axisymmetric structures (several shells/plates meeting at a node).
// Same element as TW.solver.fem (10.1)-(10.5); here geometry is given by node coordinates (r, z),
// z points down, and nodes with the same key are shared between branches (rigid joint: common ρ, η, ϑ).
(function () {
  const GP = [[0.0694318442029737, 0.1739274225687269], [0.3300094782075719, 0.3260725774312731],
    [0.6699905217924281, 0.3260725774312731], [0.9305681557970263, 0.1739274225687269]];

  function element(a, b, ha, hb, E, mu, pFn) {
    const dr = b.r - a.r, dz = b.z - a.z, Le = Math.hypot(dr, dz), c = dr / Le, sn = dz / Le;
    const lam = [[c, sn, 0], [sn, -c, 0], [0, 0, -1]];
    const Ke = Array.from({ length: 6 }, () => new Array(6).fill(0));
    const Fe = new Array(6).fill(0);
    const Bat = xi => {
      const r = a.r + xi * dr;
      const N1 = 1 - 3 * xi * xi + 2 * xi ** 3, N2 = Le * xi * (1 - xi) ** 2, N3 = 3 * xi * xi - 2 * xi ** 3, N4 = Le * xi * xi * (xi - 1);
      const d1 = (-6 * xi + 6 * xi * xi) / Le, d2 = 1 - 4 * xi + 3 * xi * xi, d3 = (6 * xi - 6 * xi * xi) / Le, d4 = 3 * xi * xi - 2 * xi;
      const dd1 = (-6 + 12 * xi) / Le ** 2, dd2 = (-4 + 6 * xi) / Le, dd3 = (6 - 12 * xi) / Le ** 2, dd4 = (6 * xi - 2) / Le;
      const h = ha + (hb - ha) * xi;
      const Eh = E * h / (1 - mu * mu), D = E * h ** 3 / (12 * (1 - mu * mu));
      return {
        r, h, N: [0, N1, N2, 0, N3, N4],
        B: [
          [-1 / Le, 0, 0, 1 / Le, 0, 0],
          [(1 - xi) * c / r, N1 * sn / r, N2 * sn / r, xi * c / r, N3 * sn / r, N4 * sn / r],
          [0, -dd1, -dd2, 0, -dd3, -dd4],
          [0, -c / r * d1, -c / r * d2, 0, -c / r * d3, -c / r * d4],
        ],
        Dm: [[Eh, mu * Eh, 0, 0], [mu * Eh, Eh, 0, 0], [0, 0, D, mu * D], [0, 0, mu * D, D]],
      };
    };
    for (const [xi, w] of GP) {
      const { r, B, Dm, N } = Bat(xi);
      const f = 2 * Math.PI * Le * w * r;
      const DB = Dm.map(row => [0, 1, 2, 3, 4, 5].map(j => row.reduce((s, v, k) => s + v * B[k][j], 0)));
      for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) Ke[i][j] += f * B.reduce((s, row, k) => s + row[i] * DB[k][j], 0);
      const p = pFn ? pFn(r, a.z + xi * dz) : 0;
      for (let i = 0; i < 6; i++) Fe[i] += f * N[i] * p;
    }
    const L = Array.from({ length: 6 }, () => new Array(6).fill(0));
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { L[i][j] = lam[i][j]; L[i + 3][j + 3] = lam[i][j]; }
    const KL = Ke.map(row => [0, 1, 2, 3, 4, 5].map(j => row.reduce((s, v, k) => s + v * L[k][j], 0)));
    const Kg = [0, 1, 2, 3, 4, 5].map(i => [0, 1, 2, 3, 4, 5].map(j => L.reduce((s, row, k) => s + row[i] * KL[k][j], 0)));
    const Fg = [0, 1, 2, 3, 4, 5].map(i => L.reduce((s, row, k) => s + row[i] * Fe[k], 0));
    // resultants at a local point xi from global nodal displacements
    const result = (qg, xi) => {
      const ql = L.map(row => row.reduce((s, v, k) => s + v * qg[k], 0));
      const { B, Dm, h } = Bat(xi);
      const eps = B.map(row => row.reduce((s, v, k) => s + v * ql[k], 0));
      const f = Dm.map(row => row.reduce((s, v, k) => s + v * eps[k], 0));
      return { T1: f[0], T2: f[1], M1: f[2], M2: f[3], h };
    };
    return { Kg, Fg, result, Le };
  }

  // spec: { E, mu, pFn(r, z), branches: [{ name, from, to, n, pt: t => ({r, z}), h1, h2, grade }],
  //         fix: { key: [dof indices 0=ρ,1=η,2=ϑ] } }
  TW.femTree = function (spec) {
    const nodes = [], keyIdx = {};
    const nodeOf = (key, p) => {
      if (key && keyIdx[key] != null) return keyIdx[key];
      nodes.push(p);
      if (key) keyIdx[key] = nodes.length - 1;
      return nodes.length - 1;
    };
    const elems = [];
    for (const br of spec.branches) {
      const ts = [];
      for (let i = 0; i <= br.n; i++) {
        const u = i / br.n;
        ts.push(br.grade === 'end' ? 1 - (1 - u) ** 2 : br.grade === 'start' ? u * u : br.grade === 'both' ? (1 - Math.cos(Math.PI * u)) / 2 : u);
      }
      const ids = ts.map((t, i) => nodeOf(i === 0 ? br.from : i === br.n ? br.to : null, Object.assign({ s: t }, br.pt(t))));
      for (let i = 0; i < br.n; i++) {
        const hA = br.h1 + (br.h2 - br.h1) * ts[i], hB = br.h1 + (br.h2 - br.h1) * ts[i + 1];
        elems.push({ br: br.name, a: ids[i], b: ids[i + 1], ta: ts[i], tb: ts[i + 1], el: element(nodes[ids[i]], nodes[ids[i + 1]], hA, hB, spec.E, spec.mu, br.pFn === undefined ? spec.pFn : br.pFn) });
      }
    }
    const nd = 3 * nodes.length;
    let bw = 1;
    for (const e of elems) bw = Math.max(bw, 3 * Math.abs(e.b - e.a) + 3);
    const K = Array.from({ length: nd }, () => new Float64Array(bw));
    const F = new Float64Array(nd);
    for (const e of elems) {
      const dofs = [3 * e.a, 3 * e.a + 1, 3 * e.a + 2, 3 * e.b, 3 * e.b + 1, 3 * e.b + 2];
      for (let i = 0; i < 6; i++) {
        F[dofs[i]] += e.el.Fg[i];
        for (let j = 0; j < 6; j++) if (dofs[j] >= dofs[i]) K[dofs[i]][dofs[j] - dofs[i]] += e.el.Kg[i][j];
      }
    }
    for (const [key, list] of Object.entries(spec.fix || {})) {
      const n = keyIdx[key];
      for (const k of list) {
        const d = 3 * n + k;
        for (let j = 0; j < bw; j++) K[d][j] = 0;
        for (let i = Math.max(0, d - bw + 1); i < d; i++) K[i][d - i] = 0;
        K[d][0] = 1; F[d] = 0;
      }
    }
    // banded LDLᵀ
    for (let i = 0; i < nd; i++) {
      for (let k = Math.max(0, i - bw + 1); k < i; k++) {
        const lik = K[k][i - k];
        if (!lik) continue;
        const f = lik / K[k][0];
        const top = Math.min(nd, k + bw);
        for (let j = i; j < top; j++) K[i][j - i] -= f * K[k][j - k];
      }
      if (Math.abs(K[i][0]) < 1e-300) throw new Error('вырожденная матрица жёсткости');
    }
    const x = Float64Array.from(F);
    for (let i = 0; i < nd; i++) for (let k = Math.max(0, i - bw + 1); k < i; k++) x[i] -= K[k][i - k] / K[k][0] * x[k];
    for (let i = nd - 1; i >= 0; i--) {
      for (let j = i + 1; j < Math.min(nd, i + bw); j++) x[i] -= K[i][j - i] * x[j];
      x[i] /= K[i][0];
    }
    const disp = i => ({ rho: x[3 * i], eta: x[3 * i + 1], th: x[3 * i + 2] });
    const qOf = e => [x[3 * e.a], x[3 * e.a + 1], x[3 * e.a + 2], x[3 * e.b], x[3 * e.b + 1], x[3 * e.b + 2]];
    return {
      nodes, keyIdx, elems, disp,
      // resultants at the end of a branch that touches node `key`
      at(key, brName) {
        const n = keyIdx[key];
        const e = elems.find(el => el.br === brName && (el.a === n || el.b === n));
        return e.el.result(qOf(e), e.a === n ? 0 : 1);
      },
      along(brName, xi) {
        return elems.filter(e => e.br === brName).map(e => Object.assign({ t: e.ta + xi * (e.tb - e.ta) }, e.el.result(qOf(e), xi)));
      },
    };
  };
})();
