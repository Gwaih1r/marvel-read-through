// Original chapter cover art for Read-Through, drawn as SVG on a 300x400 canvas.
// Each scene shows a chapter's setting or central event. No characters, costumes, emblems or logos.

const rnd = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const stars = (n, seed, h = 260, op = .85) => { const r = rnd(seed); let s = ''; for (let i = 0; i < n; i++) s += `<circle cx="${(r() * 300).toFixed(1)}" cy="${(r() * h).toFixed(1)}" r="${(r() * 1.3 + .3).toFixed(2)}" fill="#fff" opacity="${(r() * op + .1).toFixed(2)}"/>`; return s; };
function skyline(seed, base, color, { op = 1, min = 20, max = 110, lit = '', litOp = .55 } = {}) {
  const r = rnd(seed); let x = -10, d = `M-10 400V${base}`, win = '';
  while (x < 310) {
    const w = 14 + r() * 26, top = base - min - r() * (max - min);
    d += `H${x.toFixed(0)}V${top.toFixed(0)}H${(x + w).toFixed(0)}V${base}`;
    if (lit) for (let y = top + 6; y < base - 6; y += 9) for (let wx = x + 4; wx < x + w - 4; wx += 7) if (r() < .28) win += `<rect x="${wx.toFixed(0)}" y="${y.toFixed(0)}" width="2.6" height="3.4"/>`;
    x += w + r() * 4;
  }
  return `<path d="${d}V400Z" fill="${color}" opacity="${op}"/>${win ? `<g fill="${lit}" opacity="${litOp}">${win}</g>` : ''}`;
}
const rays = (cx, cy, n, len, color, op, w = 6) => { let s = ''; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; s += `<path d="M${cx} ${cy}L${(cx + Math.cos(a - .04) * len).toFixed(1)} ${(cy + Math.sin(a - .04) * len).toFixed(1)}L${(cx + Math.cos(a + .04) * len).toFixed(1)} ${(cy + Math.sin(a + .04) * len).toFixed(1)}Z"/>`; } return `<g fill="${color}" opacity="${op}">${s}</g>`; };
const grad = (id, a, b, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
const glow = (id, c, o = 1) => `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`;
const smoke = (seed, y, color, op) => { const r = rnd(seed); let s = ''; for (let i = 0; i < 14; i++) s += `<circle cx="${(r() * 320 - 10).toFixed(0)}" cy="${(y + r() * 60 - 30).toFixed(0)}" r="${(18 + r() * 30).toFixed(0)}"/>`; return `<g fill="${color}" opacity="${op}">${s}</g>`; };
const embers = (seed, n, color, y0 = 0, y1 = 400) => { const r = rnd(seed); let s = ''; for (let i = 0; i < n; i++) s += `<circle cx="${(r() * 300).toFixed(0)}" cy="${(y0 + r() * (y1 - y0)).toFixed(0)}" r="${(r() * 1.8 + .6).toFixed(1)}"/>`; return `<g fill="${color}" opacity=".85">${s}</g>`; };

export const ART = {
  // Prologue: decades of history under searchlights, with flashbulbs going off
  100: () => `<defs>${grad('p0', '#2b1606', '#6b3a10')}${glow('p0g', '#ffd77a', .7)}</defs><rect width="300" height="400" fill="url(#p0)"/>
    <g fill="#ffe7a8" opacity=".16"><path d="M60 330L0 0h40z"/><path d="M240 330L300 30h-35z"/><path d="M150 330L120 0h50z"/></g>
    <circle cx="210" cy="150" r="60" fill="url(#p0g)"/><circle cx="90" cy="210" r="40" fill="url(#p0g)"/>
    ${skyline(3, 330, '#1a0d03', { lit: '#ffcf6a', max: 130 })}
    <g fill="none" stroke="#f3d9a4" stroke-width="1.2" opacity=".5"><path d="M20 360h260M20 368h200M20 376h240"/></g>`,

  // Planet X: a scarred world filling the sky over a dark city, debris raining down
  101: () => `<defs>${glow('p1', '#4ade80', .9)}${grad('p1s', '#021a0e', '#0b3d22')}</defs><rect width="300" height="400" fill="url(#p1s)"/>${stars(70, 7)}
    <circle cx="190" cy="140" r="120" fill="#0d4a2a"/><circle cx="160" cy="105" r="125" fill="url(#p1)" opacity=".6"/>
    <g fill="#052814" opacity=".8"><ellipse cx="150" cy="120" rx="26" ry="16"/><ellipse cx="230" cy="80" rx="16" ry="10"/><ellipse cx="210" cy="190" rx="30" ry="12"/><ellipse cx="110" cy="200" rx="12" ry="7"/></g>
    <g stroke="#b9ffd3" stroke-width="1.6" opacity=".7"><path d="M70 40l-22 40M110 20l-12 26M40 120l-14 24"/></g>
    ${skyline(9, 345, '#020d06', { lit: '#7cf2a6', max: 120 })}`,

  // Disassembled: a great house burning under a red sky
  102: () => `<defs>${grad('p2', '#2a0305', '#a3141b')}${glow('p2f', '#ffb347', .9)}</defs><rect width="300" height="400" fill="url(#p2)"/>
    ${smoke(21, 120, '#1a0204', .55)}${smoke(5, 70, '#3a0508', .45)}
    <g transform="translate(0 -60)"><circle cx="150" cy="250" r="120" fill="url(#p2f)" opacity=".7"/>
    <path d="M40 330V250l20-18v-20h20v8l70-48 70 48v-8h20v20l20 18v80z" fill="#140102"/>
    <g fill="#ffcf5a" opacity=".9"><rect x="80" y="262" width="12" height="18"/><rect x="118" y="262" width="12" height="18"/><rect x="170" y="262" width="12" height="18"/><rect x="208" y="262" width="12" height="18"/><rect x="140" y="292" width="20" height="38"/></g>
    <g fill="#ff7a1a"><path d="M95 250c-10-30 10-40 5-70 20 20 25 45 10 70z"/><path d="M180 240c-8-26 14-36 10-62 18 22 20 44 6 62z" opacity=".9"/><path d="M140 205c-4-20 10-28 8-48 12 16 14 34 4 48z" opacity=".8"/></g>
    </g>${embers(31, 40, '#ffd28a', 40, 330)}<rect y="330" width="300" height="70" fill="#0d0102"/>`,

  // House of M: a flawless city under a red sun, and a reflection that doesn't match
  103: () => `<defs>${grad('p3', '#3d0626', '#c2185b')}${glow('p3g', '#ff8fb8', .9)}</defs><rect width="300" height="230" fill="url(#p3)"/>
    <circle cx="150" cy="120" r="110" fill="url(#p3g)" opacity=".7"/><circle cx="150" cy="130" r="62" fill="#ff5c96"/>
    ${skyline(11, 230, '#2a0418', { lit: '#ffd1e3', max: 140 })}
    <rect y="230" width="300" height="170" fill="#16010b"/>
    <g transform="matrix(1 0 0 -1 0 460)" opacity=".38"><circle cx="150" cy="130" r="62" fill="#ff5c96"/>${skyline(47, 230, '#5a0a33', { max: 120 })}</g>
    <g stroke="#ff9ec4" stroke-width="1.2" opacity=".35"><path d="M0 250h300M20 270h260M50 292h200M0 318h300"/></g>`,

  // Civil War: the Capitol on the horizon, a city split down the middle
  104: () => `<defs>${grad('p4a', '#081a45', '#1d4fb8')}${grad('p4b', '#4a0909', '#c62828')}</defs>
    <path d="M0 0H178L122 400H0Z" fill="url(#p4a)"/><path d="M178 0H300V400H122Z" fill="url(#p4b)"/>
    <g transform="translate(0 -75)"><g fill="#e9eef8" opacity=".9"><path d="M110 230h80v8h-80z"/><path d="M118 230v-26h64v26z" opacity=".7"/><path d="M126 204a24 26 0 0 1 48 0z"/><path d="M148 178h4v-12h-4z"/></g>
    </g>${skyline(5, 330, '#040b20', { max: 70 })}
    <path d="M178 0l-16 70 14 40-22 70 16 50-25 80 8 90" stroke="#fff" stroke-width="5" fill="none" stroke-linejoin="bevel"/>
    <g fill="#fff" opacity=".85"><path d="M196 120l9-4 3 9-9 3z"/><path d="M130 205l7-2 1 7-7 1z"/><path d="M186 262l6-5 4 6-6 4z"/></g>`,

  // World War Hulk: a war-scarred ship over a city split by a giant crater
  105: () => `<defs>${grad('p5', '#0b2410', '#3f7a1f')}${glow('p5g', '#a6f55a', .8)}</defs><rect width="300" height="400" fill="url(#p5)"/>
    <g transform="translate(-30 40) scale(1.25)"><path d="M40 90l140-30 70 18-30 14-150 18z" fill="#0a1a0a"/><path d="M60 98l150-22" stroke="#a6f55a" stroke-width="2" opacity=".6"/><circle cx="235" cy="80" r="6" fill="#ffe07a"/><path d="M40 108l-30 6M70 104l-30 8" stroke="#a6f55a" stroke-width="2" opacity=".4"/></g>
    <ellipse cx="150" cy="300" rx="160" ry="80" fill="url(#p5g)" opacity=".9"/>
    ${skyline(15, 320, '#061006', { lit: '#c7ff8a', max: 110 })}
    <path d="M0 360q80-10 150 0t150 0V400H0z" fill="#030803"/><path d="M60 352l30 14 20-10 40 16 26-12 40 12" stroke="#a6f55a" stroke-width="3" fill="none"/>
    ${smoke(9, 300, '#0f2a0f', .45)}`,

  // Secret Invasion: the sky shatters, and green ships wait behind it
  106: () => `<rect width="300" height="400" fill="#160a28"/>
    <g fill="#0d3d1c"><path d="M160 130L20 0h120z"/><path d="M160 130L300 30v100z" opacity=".8"/></g>
    <g fill="#43e07c"><path d="M60 40l24 8-24 8z"/><path d="M220 70l26 8-26 8z" opacity=".8"/><path d="M120 18l18 6-18 6z" opacity=".6"/></g>
    <g stroke="#a5f3b4" stroke-width="1.6" fill="none" opacity=".9"><path d="M160 130L20 0M160 130L300 30M160 130L300 210M160 130L90 400M160 130L0 230M160 130L230 400"/><path d="M110 85l60-10 60 45-30 60-80 20-40-60z"/><path d="M60 45l110 10 120 25 10 130-60 110-130 40-110-60 10-120z" opacity=".5"/></g>
    <g fill="#4ade80"><path d="M160 130l-50-45 60-10z" opacity=".85"/><path d="M160 130l70-10-30 60z" opacity=".5"/><path d="M160 130l-80 20 40 60z" opacity=".35"/></g>
    ${skyline(17, 360, '#08040f', { lit: '#9cf5b5', max: 90 })}`,

  // Dark Reign: one tower over the city, every window lit red
  107: () => `<defs>${grad('p7', '#050505', '#3a0707')}${glow('p7g', '#ff2a2a', .7)}</defs><rect width="300" height="400" fill="url(#p7)"/>
    <g fill="#ff4d4d" opacity=".08"><path d="M150 60L40 400h60z"/><path d="M150 60L260 400h-60z"/></g>
    <circle cx="150" cy="90" r="90" fill="url(#p7g)" opacity=".6"/>
    <path d="M150 40l30 60v260h-60V100z" fill="#0d0d0d"/><path d="M150 40l30 60h-60z" fill="#1c1c1c"/>
    <g fill="#ff2a2a">${Array.from({ length: 22 }, (_, i) => `<rect x="${130 + (i % 4) * 11}" y="${112 + Math.floor(i / 4) * 30}" width="5" height="14" opacity="${.5 + (i * 7 % 5) / 10}"/>`).join('')}</g>
    ${skyline(23, 360, '#080808', { lit: '#b71c1c', max: 80 })}`,

  // Siege: a golden city floating over the plains, already starting to break apart
  108: () => `<defs>${grad('p8', '#2a1a00', '#d4920c')}${glow('p8g', '#ffe08a', .9)}</defs><rect width="300" height="400" fill="url(#p8)"/>
    <circle cx="150" cy="120" r="140" fill="url(#p8g)" opacity=".55"/>
    <path d="M50 190q100 30 200 0l-30 50-40 20-30 40-30-40-40-20z" fill="#2d1c02"/>
    <g fill="#ffd257"><path d="M90 190v-50l8-20 8 20v50z"/><path d="M140 190v-90l10-30 10 30v90z"/><path d="M190 190v-60l8-22 8 22v60z"/><path d="M115 190v-30l6-14 6 14v30z" opacity=".8"/><path d="M170 190v-36l6-14 6 14v36z" opacity=".8"/></g>
    <g fill="#2d1c02"><path d="M120 270l10 8-8 8z"/><path d="M180 285l8 6-7 7z"/><path d="M150 310l6 7-7 5z"/></g>
    <path d="M0 360q150-20 300 0V400H0z" fill="#3b2504"/><path d="M0 372q150-12 300 0" stroke="#7a520e" stroke-width="2" fill="none"/>`,

  // Fear Itself: hammers falling out of a gray sky like meteors
  109: () => `<defs>${grad('p9', '#11171a', '#55656d')}</defs><rect width="300" height="400" fill="url(#p9)"/>
    ${smoke(13, 60, '#1c2428', .5)}
    ${[[60, 60, 1], [180, 30, .8], [250, 140, .65], [110, 170, .9], [30, 220, .55]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) rotate(35) scale(${s})"><path d="M-3 -70h6v60h-6z" fill="#ff9d3b" opacity=".35"/><path d="M-3 -40h6v40h-6z" fill="#ffd28a" opacity=".55"/><rect x="-3" y="0" width="6" height="34" fill="#2b3134"/><rect x="-16" y="30" width="32" height="18" rx="2" fill="#cfd8dc"/></g>`).join('')}
    ${skyline(27, 340, '#0a0e10', { lit: '#ffb36b', max: 100 })}${embers(51, 30, '#ffb36b', 240, 340)}`,

  // Avengers vs. X-Men: a firebird of pure flame coming for Earth
  110: () => `<defs>${grad('p10', '#2a0800', '#bf360c')}${glow('p10g', '#ffd54f', 1)}</defs><rect width="300" height="400" fill="url(#p10)"/>${stars(40, 19, 200, .5)}
    <circle cx="150" cy="150" r="110" fill="url(#p10g)" opacity=".75"/>
    <g transform="translate(20 25)"><g fill="#ffb300"><path d="M150 210c-20-30-60-40-120-90 40 10 70 10 95 30-20-30-30-60-20-100 20 40 35 70 45 100 10-30 25-60 45-100 10 40 0 70-20 100 25-20 55-20 95-30-60 50-100 60-120 90z"/></g>
    <g fill="#fff3c4" opacity=".9"><path d="M150 200c-6-30-6-60 0-110 6 50 6 80 0 110z"/></g>
    <path d="M150 210c-10 40-30 70-60 100 30-10 50-30 60-60 10 30 30 50 60 60-30-30-50-60-60-100z" fill="#ff6f00" opacity=".9"/>
    </g><path d="M-40 400a190 70 0 0 1 380 0z" fill="#1d3a5c"/><path d="M-40 400a190 70 0 0 1 380 0" stroke="#7fc4ff" stroke-width="3" fill="none" opacity=".6"/>`,

  // Ultimate: a second Earth, drawn like a blueprint, with a wave about to hit
  111: () => `<defs>${grad('p11', '#06101c', '#0d2b4a')}</defs><rect width="300" height="400" fill="url(#p11)"/>
    <g stroke="#1e88e5" stroke-width=".7" opacity=".35">${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 20} 0V400M0 ${i * 26}H300"/>`).join('')}</g>
    <circle cx="210" cy="100" r="54" fill="none" stroke="#64b5f6" stroke-width="2"/><ellipse cx="210" cy="100" rx="54" ry="18" fill="none" stroke="#64b5f6" stroke-width="1.2" opacity=".7"/><path d="M210 46v108" stroke="#64b5f6" stroke-width="1.2" opacity=".7"/>
    <g transform="translate(0 -70)">${skyline(33, 350, '#040a12', { lit: '#90caf9', max: 110 })}
    <path d="M-10 400V300c40-60 110-90 170-60-40-5-70 15-80 40 30-30 90-30 120 10 20 30 60 40 110 20V400z" fill="#1565c0" opacity=".9"/><path d="M-10 300c40-60 110-90 170-60" stroke="#bbdefb" stroke-width="3" fill="none"/></g>`,

  // Infinity: a fleet descending through a golden breach in space
  112: () => `<defs>${grad('p12', '#12052e', '#3b1a8c')}${glow('p12g', '#ffd54f', .9)}</defs><rect width="300" height="400" fill="url(#p12)"/>${stars(80, 29)}
    <circle cx="150" cy="100" r="120" fill="url(#p12g)" opacity=".55"/>${rays(150, 100, 24, 260, '#ffe082', .14)}
    <g fill="#0b0320">${[[150, 140, 1.2], [90, 110, .8], [215, 105, .9], [60, 170, .6], [245, 175, .65], [130, 200, .5], [185, 215, .5]].map(([x, y, s]) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -22l14 18 26 6-26 6-14 14-14-14-26-6 26-6z"/>`).join('')}</g>
    <path d="M-40 400a190 60 0 0 1 380 0z" fill="#1b2f5c"/><path d="M-40 400a190 60 0 0 1 380 0" stroke="#ffd54f" stroke-width="2" fill="none" opacity=".7"/>`,

  // Original Sin: Earth rising over the moon, and a chalk outline on the surface
  113: () => `<rect width="300" height="400" fill="#030a14"/>${stars(90, 41, 230)}
    <circle cx="210" cy="110" r="44" fill="#13a8c4"/><path d="M180 90q20-10 30 4t30-2M188 128q18 6 34-6" stroke="#b2f2ff" stroke-width="5" fill="none" opacity=".5"/><circle cx="198" cy="98" r="44" fill="#030a14" opacity=".25"/>
    <g transform="translate(0 -70)"><path d="M0 260q150-30 300 0V480H0z" fill="#6f7b85"/><path d="M0 260q150-30 300 0" stroke="#c5ced6" stroke-width="2" fill="none"/>
    <g fill="#55606a"><ellipse cx="60" cy="300" rx="30" ry="8"/><ellipse cx="240" cy="330" rx="40" ry="10"/><ellipse cx="200" cy="285" rx="14" ry="4"/></g>
    <path transform="translate(20 -45)" d="M110 330c4-8 14-10 18-4l14-12 6 6-12 12 26 2v8l-26 4 10 18-8 4-14-16-14 10-6-6 10-12-10-8z" fill="none" stroke="#f4f8fb" stroke-width="2.2" stroke-linejoin="round" opacity=".9"/></g>`,

  // Axis: the city flipped upside down over itself
  114: () => `<defs>${grad('p14', '#0a0a0a', '#3a0d0d')}</defs><rect width="300" height="400" fill="url(#p14)"/>
    <g transform="matrix(1 0 0 -1 0 200)">${skyline(57, 0, '#e53935', { op: .85, max: 100 })}</g>
    <rect y="196" width="300" height="8" fill="#e53935"/>
    ${skyline(57, 400, '#151515', { lit: '#ef5350', max: 190, min: 120 })}
    <path d="M60 200a90 90 0 0 1 180 0" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/><path d="M232 186l8 14-16 2z" fill="#fff" opacity=".8"/>`,

  // Secret Wars: two Earths meeting in a blinding flash
  115: () => `<rect width="300" height="400" fill="#12052a"/>${stars(80, 61)}${glow('p15g', '#b9ffd0', 1)}
    <circle cx="150" cy="200" r="150" fill="url(#p15g)" opacity=".75"/>${rays(150, 200, 28, 300, '#ccffdf', .18, 8)}
    <circle cx="70" cy="200" r="88" fill="#0d6b35"/><path d="M30 160q30-20 50 0t40 10M20 230q40 10 70-10" stroke="#9cf5b5" stroke-width="5" fill="none" opacity=".5"/>
    <circle cx="230" cy="200" r="88" fill="#2a0a4a"/><path d="M200 170q30-10 60 10M210 240q30 10 50-10" stroke="#c39bff" stroke-width="5" fill="none" opacity=".5"/>
    <ellipse cx="150" cy="200" rx="10" ry="80" fill="#fff"/>`,

  // Civil War II: an eye in the sky showing a future, and a city split under it
  116: () => `<defs>${grad('p16', '#04163a', '#0d47a1')}${glow('p16g', '#fff59d', .9)}</defs><rect width="300" height="400" fill="url(#p16)"/>
    <circle cx="150" cy="120" r="110" fill="url(#p16g)" opacity=".5"/>
    <g transform="translate(45 50) scale(.8)"><path d="M40 120q110-90 220 0-110 90-220 0z" fill="#fdd835"/><circle cx="150" cy="120" r="36" fill="#0d47a1"/><circle cx="150" cy="120" r="16" fill="#020b1f"/><circle cx="142" cy="112" r="5" fill="#fff"/>
    </g><path d="M150 156L100 400h100z" fill="#fff59d" opacity=".18"/>
    ${skyline(71, 360, '#020b1f', { lit: '#fdd835', max: 100 })}<path d="M150 360v40" stroke="#fdd835" stroke-width="4"/>`,

  // Inhumans vs. X-Men: a poisonous mist rolling through the streets
  117: () => `<defs>${grad('p17', '#00201a', '#00695c')}</defs><rect width="300" height="400" fill="url(#p17)"/>
    ${skyline(77, 330, '#00130f', { lit: '#80deea', max: 140 })}
    <g fill="#4dd0e1" opacity=".55"><circle cx="60" cy="120" r="50"/><circle cx="130" cy="95" r="62"/><circle cx="210" cy="110" r="55"/><circle cx="270" cy="140" r="45"/><rect x="10" y="120" width="290" height="45"/></g><g fill="#b2ebf2" opacity=".35"><circle cx="120" cy="80" r="34"/><circle cx="200" cy="92" r="28"/></g><g stroke="#4dd0e1" stroke-width="2" opacity=".4"><path d="M40 170v40M90 170v70M150 165v50M210 170v80M260 170v40"/></g>${smoke(3, 220, '#26c6da', .25)}${smoke(17, 280, '#4dd0e1', .3)}${smoke(41, 330, '#84ffff', .25)}
    ${embers(23, 50, '#e0ffff', 120, 380)}`,

  // Secret Empire: a dome closing over the city, searchlights sweeping
  118: () => `<defs>${grad('p18', '#030d04', '#1b4d1f')}</defs><rect width="300" height="400" fill="url(#p18)"/>
    <g fill="#c8e6c9" opacity=".12"><path d="M40 340L-20 40h40z"/><path d="M260 340L320 60h-40z"/><path d="M150 340L170 30h30z"/></g>
    ${skyline(83, 340, '#020803', { lit: '#81c784', max: 120 })}
    <path d="M-20 340a170 210 0 0 1 340 0" fill="#4caf50" opacity=".1"/>
    <g fill="none" stroke="#81c784" stroke-width="1.6" opacity=".75"><path d="M-20 340a170 210 0 0 1 340 0"/><path d="M40 340a110 205 0 0 1 220 0"/><path d="M100 340a50 200 0 0 1 100 0"/><path d="M-5 260h310M30 190h240M80 150h140" opacity=".6"/></g>`,

  // Infinity Wars: six gems in the dark, and every hand reaching for them
  119: () => `<defs>${grad('p19', '#140c00', '#4a2c00')}${glow('p19g', '#ffca28', .8)}</defs><rect width="300" height="400" fill="url(#p19)"/>${stars(60, 13)}
    <circle cx="150" cy="190" r="130" fill="url(#p19g)" opacity=".4"/>
    ${[['#ffb300', 150, 110], ['#e53935', 215, 145], ['#7c4dff', 215, 215], ['#43a047', 150, 250], ['#1e88e5', 85, 215], ['#ff7043', 85, 145]].map(([c, x, y]) => `<g transform="translate(${x} ${y})"><circle r="26" fill="${c}" opacity=".25"/><path d="M0 -16l12 7v18l-12 7-12-7v-18z" fill="${c}"/><path d="M0 -16l12 7-12 7-12-7z" fill="#fff" opacity=".35"/></g>`).join('')}
    <path d="M150 180m-30 0a30 30 0 1 0 60 0a30 30 0 1 0-60 0" fill="none" stroke="#ffe082" stroke-width="1.5" opacity=".6"/>`,

  // War of the Realms: ten worlds hanging in the branches of one great tree, frost spreading below
  120: () => `<defs>${grad('p20', '#020c18', '#0a2e4d')}</defs><rect width="300" height="400" fill="url(#p20)"/>${stars(60, 81, 200)}
    <g stroke="#3e6a8a" stroke-width="7" fill="none" stroke-linecap="round"><path d="M150 400V220"/><path d="M150 260c-30-30-70-40-100-90M150 250c30-30 70-40 100-90M150 220c-10-40-30-70-30-120M150 220c10-40 30-70 30-120M150 300c-40-10-80 0-120-20M150 300c40-10 80 0 120-20"/></g>
    ${[[50, 170], [250, 170], [120, 100], [180, 100], [30, 280], [270, 280], [150, 60], [90, 140], [210, 140], [150, 160]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i === 9 ? 13 : 9}" fill="${i === 9 ? '#4fc3f7' : '#80deea'}" opacity="${i === 9 ? 1 : .75}"/>`).join('')}
    <path d="M0 360l30-20 20 14 30-26 30 22 40-30 30 24 40-20 30 18 50-22V400H0z" fill="#b3e5fc" opacity=".9"/>`,

  // House of X: a living island in a bright sea, flowers that open into gateways
  121: () => `<defs>${grad('p21', '#05261d', '#0e5e45')}${glow('p21g', '#ff80ab', .8)}</defs><rect width="300" height="400" fill="url(#p21)"/>
    <circle cx="150" cy="200" r="130" fill="url(#p21g)" opacity=".35"/>
    <g transform="translate(0 -70)"><path d="M30 300q40-90 120-90t120 90z" fill="#0b3d2e"/>
    <g>${[[90, 230, 30], [150, 205, 40], [210, 235, 30], [120, 265, 22], [185, 265, 22]].map(([x, y, r]) => `<g transform="translate(${x} ${y})">${[0, 1, 2, 3, 4, 5].map(i => `<ellipse rx="${r * .42}" ry="${r}" transform="rotate(${i * 60}) translate(0 ${-r * .7})" fill="#ff4081" opacity=".75"/>`).join('')}<circle r="${r * .35}" fill="#ffd6e5"/></g>`).join('')}</g>
    </g><path d="M0 230q150 20 300 0V400H0z" fill="#00838f"/><path d="M0 250q75 10 150 0t150 0M0 275q75 10 150 0t150 0" stroke="#84ffff" stroke-width="1.5" fill="none" opacity=".5"/>`,

  // King in Black: dark tendrils swallowing the Earth while a purple light leaks around the edge
  122: () => `<rect width="300" height="400" fill="#05000c"/>${stars(70, 91)}${glow('p22g', '#7c4dff', 1)}
    <circle cx="150" cy="200" r="150" fill="url(#p22g)" opacity=".6"/><circle cx="150" cy="200" r="92" fill="#1e3a6b"/>
    <g fill="#000" stroke="#000">${Array.from({ length: 14 }, (_, i) => { const a = i / 14 * Math.PI * 2, x = 150 + Math.cos(a) * 200, y = 200 + Math.sin(a) * 200, mx = 150 + Math.cos(a + .4) * 110, my = 200 + Math.sin(a + .4) * 110; return `<path d="M${x.toFixed(0)} ${y.toFixed(0)}Q${mx.toFixed(0)} ${my.toFixed(0)} ${(150 + Math.cos(a) * 40).toFixed(0)} ${(200 + Math.sin(a) * 40).toFixed(0)}" stroke-width="${10 + i % 4 * 4}" fill="none" stroke-linecap="round"/>`; }).join('')}</g>
    <circle cx="150" cy="200" r="44" fill="#000"/><path d="M128 194l10 6M172 194l-10 6" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/>`,

  // Devil's Reign: City Hall at night, red banners down every column
  123: () => `<defs>${grad('p23', '#0d0000', '#4a0000')}${glow('p23g', '#ff1744', .7)}</defs><rect width="300" height="400" fill="url(#p23)"/>
    <circle cx="150" cy="120" r="140" fill="url(#p23g)" opacity=".5"/>
    <path d="M40 160L150 100l110 60z" fill="#1a0000"/><rect x="40" y="160" width="220" height="12" fill="#2a0000"/>
    <g fill="#1f0000">${[56, 92, 128, 164, 200, 236].map(x => `<rect x="${x}" y="172" width="12" height="150"/>`).join('')}</g>
    <g fill="#ff1744">${[71, 107, 143, 179, 215].map(x => `<path d="M${x} 176h16v100l-8-10-8 10z"/>`).join('')}</g>
    <rect x="30" y="322" width="240" height="10" fill="#2a0000"/><rect x="20" y="332" width="260" height="68" fill="#120000"/>
    <g fill="#ff8a80" opacity=".12"><path d="M60 400L0 120h30z"/><path d="M240 400L300 120h-30z"/></g>`,

  // Judgment Day: a vast light in the sky passing sentence on the planet below
  124: () => `<defs>${grad('p24', '#1c120c', '#5d4037')}${glow('p24g', '#ffe082', 1)}</defs><rect width="300" height="400" fill="url(#p24)"/>
    <circle cx="200" cy="150" r="150" fill="url(#p24g)" opacity=".7"/>${rays(200, 150, 30, 360, '#ffe082', .16, 6)}
    <g transform="translate(40 55) scale(1.2)"><path d="M110 70h80M150 40v70M120 70l-14 34h28zM180 70l-14 34h28zM135 112h30" stroke="#fff8e1" stroke-width="3" fill="none" stroke-linejoin="round"/></g>
    <path d="M-60 400a210 110 0 0 1 420 0z" fill="#3e2723"/><path d="M-60 400a210 110 0 0 1 420 0" stroke="#ffd54f" stroke-width="3" fill="none"/>
    ${skyline(97, 400, '#1c120c', { max: 60, min: 10, lit: '#ffd54f' })}`,

  // Fall of X: the island burning, its flowers collapsing, embers everywhere
  125: () => `<defs>${grad('p25', '#120000', '#7f0000')}${glow('p25g', '#ff5252', .9)}</defs><rect width="300" height="400" fill="url(#p25)"/>
    <circle cx="150" cy="260" r="160" fill="url(#p25g)" opacity=".5"/>${smoke(55, 120, '#000', .5)}
    <g transform="translate(0 -70)"><path d="M20 320q40-80 130-80t130 80z" fill="#1a0000"/>
    <g fill="#d50000" opacity=".85">${[[90, 270, 30, 30], [150, 248, 40, -20], [210, 272, 28, 50]].map(([x, y, r, t]) => `<g transform="translate(${x} ${y}) rotate(${t})">${[0, 1, 2, 3, 4].map(i => `<ellipse rx="${r * .36}" ry="${r * .9}" transform="rotate(${i * 72 + 20}) translate(0 ${-r * .6})"/>`).join('')}</g>`).join('')}</g>
    <g fill="#ff6d00"><path d="M80 260c-6-24 8-32 4-54 16 18 18 36 8 54z"/><path d="M170 240c-6-24 10-34 6-58 16 18 18 40 6 58z"/></g>
    </g>${embers(71, 60, '#ffab40', 40, 330)}<path d="M0 250q150 20 300 0V400H0z" fill="#0a0000"/>`
};

// Second pass: more literal scenes for the chapters whose first drawings were too abstract.
const spire = (x, base, h, color) => `<path d="M${x - 14} ${base}V${base - h * .55}h6v-${h * .15}h4v-${h * .12}h3v-${h * .1}h2v-${h * .08}l1 -${h * .1}l1 ${h * .1}v${h * .08}h2v${h * .1}h3v${h * .12}h4v${h * .15}h6V${base}z" fill="${color}"/>`;
Object.assign(ART, {
  // Prologue: stacks of old front pages and a press camera flash over a vintage skyline
  100: () => `<defs>${grad('q0', '#2b1606', '#7a4512')}${glow('q0g', '#fff2c4', 1)}</defs><rect width="300" height="400" fill="url(#q0)"/>
    <g fill="#ffe7a8" opacity=".14"><path d="M60 300L0 0h40z"/><path d="M240 300L300 30h-35z"/></g>
    ${skyline(3, 260, '#1a0d03', { lit: '#ffcf6a', max: 120 })}${spire(150, 260, 170, '#1a0d03')}
    <circle cx="220" cy="110" r="70" fill="url(#q0g)" opacity=".8"/>
    <g transform="translate(176 92)"><rect width="70" height="44" rx="5" fill="#1d1208"/><circle cx="35" cy="24" r="14" fill="#3b2a14" stroke="#c9a86a" stroke-width="3"/><circle cx="35" cy="24" r="6" fill="#0d0904"/><rect x="48" y="-26" width="22" height="26" rx="3" fill="#e9e2cf"/><circle cx="59" cy="-13" r="8" fill="#fffbe8"/></g>
    <g transform="translate(150 175) rotate(-8) scale(.8)"><rect width="150" height="110" fill="#efe4c8"/><rect x="10" y="10" width="130" height="16" fill="#2b1d0c"/><rect x="10" y="34" width="60" height="50" fill="#9c8358"/><g fill="#6d5a3a"><rect x="78" y="34" width="62" height="5"/><rect x="78" y="44" width="62" height="5"/><rect x="78" y="54" width="50" height="5"/><rect x="78" y="64" width="62" height="5"/><rect x="10" y="92" width="130" height="5"/></g></g>`,

  // Planet X: a scarred planet looming over the Manhattan skyline, debris already falling
  101: () => `<defs>${glow('q1', '#4ade80', .9)}${grad('q1s', '#021a0e', '#0b3d22')}</defs><rect width="300" height="400" fill="url(#q1s)"/>${stars(70, 7)}
    <circle cx="170" cy="120" r="110" fill="#0d4a2a"/><circle cx="140" cy="90" r="115" fill="url(#q1)" opacity=".6"/>
    <g fill="#052814" opacity=".8"><ellipse cx="130" cy="100" rx="26" ry="16"/><ellipse cx="210" cy="70" rx="16" ry="10"/><ellipse cx="190" cy="170" rx="30" ry="12"/></g>
    <g fill="#b9ffd3">${[[60, 150], [90, 190], [240, 200], [210, 240], [40, 230]].map(([x, y]) => `<path d="M${x} ${y}l6 2-2 6-6-2z"/><path d="M${x + 3} ${y + 1}l-14-26" stroke="#b9ffd3" stroke-width="1.4" opacity=".5"/>`).join('')}</g>
    ${skyline(9, 340, '#020d06', { lit: '#7cf2a6', max: 110 })}${spire(160, 340, 210, '#020d06')}`,

  // Civil War: a blast on the horizon in Stamford, the Capitol, and a city split down the middle
  104: () => `<defs>${grad('q4a', '#081a45', '#1d4fb8')}${grad('q4b', '#4a0909', '#c62828')}${glow('q4g', '#ffb74d', 1)}</defs>
    <path d="M0 0H178L122 400H0Z" fill="url(#q4a)"/><path d="M178 0H300V400H122Z" fill="url(#q4b)"/>
    <circle cx="225" cy="150" r="70" fill="url(#q4g)" opacity=".85"/><path d="M205 175c-20-10-20-40 0-45 0-25 40-25 42 0 20 5 18 35-2 45z" fill="#ffcc80"/><rect x="216" y="172" width="18" height="40" fill="#ffb74d"/><path d="M190 212h60" stroke="#ffe0b2" stroke-width="4"/>
    <g fill="#e9eef8" opacity=".95" transform="translate(-55 -60)"><path d="M110 230h80v8h-80z"/><path d="M118 230v-26h64v26z" opacity=".7"/><path d="M126 204a24 26 0 0 1 48 0z"/><path d="M148 178h4v-12h-4z"/></g>
    ${skyline(5, 330, '#040b20', { max: 70, lit: '#9fb6e8' })}
    <path d="M178 0l-16 70 14 40-22 70 16 50-25 80 8 90" stroke="#fff" stroke-width="5" fill="none" stroke-linejoin="bevel"/>`,

  // World War Hulk: a gladiator arena built in the middle of the city, a warship above it
  105: () => `<defs>${grad('q5', '#0b2410', '#3f7a1f')}${glow('q5g', '#a6f55a', .9)}</defs><rect width="300" height="400" fill="url(#q5)"/>
    <g transform="translate(-20 10) scale(1.2)"><path d="M40 90l140-30 70 18-30 14-150 18z" fill="#0a1a0a"/><path d="M60 98l150-22" stroke="#a6f55a" stroke-width="2" opacity=".6"/><circle cx="235" cy="80" r="6" fill="#ffe07a"/></g>
    <g transform="translate(0 -55)">${skyline(15, 250, '#0a1d0a', { lit: '#c7ff8a', max: 90, litOp: .4 })}
    <ellipse cx="150" cy="300" rx="170" ry="70" fill="url(#q5g)" opacity=".8"/>
    <path d="M20 330V250q130-40 260 0v80z" fill="#1a2a12"/><path d="M20 250q130-40 260 0" stroke="#a6f55a" stroke-width="2" fill="none"/>
    <g fill="#0a140a">${Array.from({ length: 11 }, (_, i) => `<path d="M${34 + i * 22} 262h12v18a6 6 0 0 1-12 0z"/><path d="M${34 + i * 22} 296h12v16a6 6 0 0 1-12 0z"/>`).join('')}</g>
    </g><path d="M0 275h300v125H0z" fill="#050b05"/>`,

  // Siege: the golden city hovering over Oklahoma farmland and a small-town water tower
  108: () => `<defs>${grad('q8', '#2a1a00', '#d4920c')}${glow('q8g', '#ffe08a', .9)}</defs><rect width="300" height="400" fill="url(#q8)"/>
    <circle cx="160" cy="100" r="140" fill="url(#q8g)" opacity=".55"/>
    <g transform="translate(10 -40)"><path d="M50 190q100 30 200 0l-30 50-40 20-30 40-30-40-40-20z" fill="#2d1c02"/>
    <g fill="#ffd257"><path d="M90 190v-50l8-20 8 20v50z"/><path d="M140 190v-90l10-30 10 30v90z"/><path d="M190 190v-60l8-22 8 22v60z"/><path d="M115 190v-30l6-14 6 14v30z" opacity=".8"/><path d="M170 190v-36l6-14 6 14v36z" opacity=".8"/></g>
    <g fill="#2d1c02"><path d="M120 270l10 8-8 8z"/><path d="M180 285l8 6-7 7z"/></g></g>
    <path d="M0 310q150-14 300 0V400H0z" fill="#5c3c08"/><g stroke="#8a5d12" stroke-width="2" opacity=".8"><path d="M0 330q150-10 300 0M0 350q150-8 300 0M0 372q150-6 300 0"/></g>
    <g fill="#2b1a03" transform="translate(40 230)"><ellipse cx="20" cy="12" rx="22" ry="14"/><path d="M4 22l-6 60M36 22l6 60M12 24l-2 58M28 24l2 58" stroke="#2b1a03" stroke-width="3"/></g>`,

  // Ultimate: a wave taller than the skyline about to swallow the city
  111: () => `<defs>${grad('q11', '#06101c', '#0d2b4a')}</defs><rect width="300" height="400" fill="url(#q11)"/>
    <g stroke="#1e88e5" stroke-width=".7" opacity=".25">${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 20} 0V400M0 ${i * 26}H300"/>`).join('')}</g>
    ${skyline(33, 330, '#040a12', { lit: '#90caf9', max: 120 })}${spire(120, 330, 220, '#040a12')}
    <path d="M140 400V180c20-90 140-120 180-70-50-10-80 10-90 50 30-20 70-10 70 30V400z" fill="#1565c0" opacity=".95"/>
    <path d="M140 180c20-90 140-120 180-70" stroke="#e3f2fd" stroke-width="4" fill="none"/>${embers(61, 40, '#bbdefb', 80, 200)}`,

  // Original Sin: a lone house on the moon, Earth in the sky, and a chalk outline by the door
  113: () => `<rect width="300" height="400" fill="#030a14"/>${stars(90, 41, 200)}
    <circle cx="225" cy="70" r="36" fill="#13a8c4"/><path d="M200 60q20-10 30 4t20-2" stroke="#b2f2ff" stroke-width="4" fill="none" opacity=".5"/>
    <path d="M0 200q150-30 300 0V400H0z" fill="#6f7b85"/><path d="M0 200q150-30 300 0" stroke="#c5ced6" stroke-width="2" fill="none"/>
    <g fill="#55606a"><ellipse cx="50" cy="230" rx="30" ry="8"/><ellipse cx="250" cy="250" rx="34" ry="9"/></g>
    <path d="M110 192V150l40-30 40 30v42z" fill="#2c3540"/><path d="M104 152l46-36 46 36" stroke="#c5ced6" stroke-width="3" fill="none"/><rect x="142" y="164" width="16" height="28" fill="#ffd27a"/><rect x="120" y="160" width="12" height="12" fill="#ffd27a" opacity=".7"/>
    <path transform="translate(40 -120)" d="M110 330c4-8 14-10 18-4l14-12 6 6-12 12 26 2v8l-26 4 10 18-8 4-14-16-14 10-6-6 10-12-10-8z" fill="none" stroke="#f4f8fb" stroke-width="2.2" stroke-linejoin="round"/>`,

  // Inhumans vs. X-Men: a glowing cloud bank over the city, crackling with energy
  117: () => `<defs>${grad('q17', '#00201a', '#00695c')}${glow('q17g', '#84ffff', .8)}</defs><rect width="300" height="400" fill="url(#q17)"/>
    <ellipse cx="150" cy="130" rx="170" ry="90" fill="url(#q17g)" opacity=".5"/>
    <g fill="#26c6da" opacity=".75"><circle cx="40" cy="140" r="46"/><circle cx="105" cy="105" r="60"/><circle cx="180" cy="95" r="64"/><circle cx="250" cy="125" r="52"/><rect x="0" y="130" width="300" height="50"/></g>
    <g fill="#b2ebf2" opacity=".5"><circle cx="100" cy="80" r="30"/><circle cx="185" cy="70" r="34"/></g>
    <path d="M140 175l-12 34 14-4-16 40M210 175l-8 24 10-2-12 30" stroke="#e0ffff" stroke-width="3" fill="none" stroke-linejoin="round"/>
    ${smoke(17, 230, '#4dd0e1', .25)}${skyline(77, 340, '#00130f', { lit: '#80deea', max: 120 })}`,

  // Secret Empire: a black dome sealing off Manhattan, flying aircraft carriers patrolling overhead
  118: () => `<defs>${grad('q18', '#06180a', '#2e6b33')}</defs><rect width="300" height="400" fill="url(#q18)"/>
    ${[[200, 70, 1.3], [80, 120, .9]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#0a1a0b"><path d="M-60 0h120l-12 12H-48z"/><rect x="-10" y="-14" width="20" height="14"/><circle cx="-36" cy="16" r="10"/><circle cx="36" cy="16" r="10"/><path d="M-50 4h100" stroke="#81c784" stroke-width="1.5"/></g>`).join('')}
    <g transform="translate(0 -60)">${skyline(83, 350, '#020803', { lit: '#81c784', max: 80 })}
    <path d="M20 350a130 150 0 0 1 260 0z" fill="#000" opacity=".92"/><path d="M20 350a130 150 0 0 1 260 0" stroke="#a5d6a7" stroke-width="2" fill="none" opacity=".7"/></g><rect y="290" width="300" height="110" fill="#000"/>
    <g fill="#c8e6c9" opacity=".12"><path d="M10 400L-30 120h30z"/><path d="M290 400L330 120h-30z"/></g>`
});
