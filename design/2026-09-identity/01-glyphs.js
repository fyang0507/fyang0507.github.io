/* 01-glyphs.js — hand-authored strokes for the identity boards. Each glyph is a list of strokes in writing order,
   each drawn in the direction the pen travels, on a 100-unit box (y down). Absolute M / L / Q / C only (01-kit.js
   places them). No font outline is traced: every point was set by eye against the character's structure, the way a
   hand writes it: horizontals rise to the right (左低右高), long strokes arch or bow a little, dots are quick.
   k = the careful hand (硬笔楷书): the manuscript grid (C), the seal's inscription (B), and the signature (A),
       which writes the same characters faster (01-a-sign.js leans and tightens them). */
window.GLYPHS = {
  k: {
    '弗': [
      'M17 27 Q46 24 76 21 L73 42',                         // 横折
      'M22 44 Q48 42 73 41',                                // 横
      'M22 44 L21 63 Q55 62 87 58 Q88 78 82 89 L74 84',     // 竖折折钩
      'M41 6 L40 55 Q37 81 15 96',                          // 撇
      'M61 5 Q62 52 61 99'                                  // 竖
    ],
    '雷': [
      'M31 8 Q50 6 69 5',                                   // 横
      'M13 18 Q14 24 16 29',                                // 点
      'M15 17 Q50 15 86 12 L80 27',                         // 横钩
      'M50 6 L50 35',                                       // 竖
      'M28 22 Q34 22 39 25', 'M28 30 Q34 30 39 33',         // 点 点
      'M61 21 Q67 20 72 23', 'M61 29 Q67 28 72 31',         // 点 点
      'M21 45 Q22 70 23 94',                                // 竖
      'M21 45 Q50 43 78 41 L76 94',                         // 横折
      'M23 69 Q50 67 76 66',                                // 横
      'M50 43 L50 92',                                      // 竖
      'M23 94 Q50 92 77 91'                                 // 横
    ],
    '德': [
      'M27 6 Q20 19 10 30',                                 // 撇
      'M30 29 Q20 45 6 58',                                 // 撇
      'M19 43 Q19 71 20 98',                                // 竖
      'M39 17 Q66 15 93 12',                                // 横
      'M66 2 L66 27',                                       // 竖
      'M44 32 L45 47',                                      // 竖
      'M44 32 Q66 30 88 28 L86 46',                         // 横折
      'M59 31 L59 45', 'M73 30 L73 45',                     // 竖 竖
      'M45 47 Q65 46 86 45',                                // 横
      'M37 58 Q65 56 95 53',                                // 横
      'M44 70 Q46 76 49 82',                                // 点
      'M55 62 Q56 93 80 88 L72 80',                         // 卧钩
      'M67 63 Q70 67 72 73',                                // 点
      'M83 65 Q88 70 91 77'                                 // 点
    ],
    '继': [
      'M28 11 Q18 30 8 47 L27 43',                          // 撇折
      'M35 33 Q22 54 8 72 L35 65',                          // 撇折
      'M6 92 Q20 87 36 80',                                 // 提
      'M56 14 Q59 19 61 25',                                // 点
      'M84 12 Q81 20 77 26',                                // 撇
      'M51 37 Q70 36 90 33',                                // 横
      'M70 8 L70 76',                                       // 竖
      'M68 40 Q63 56 50 66',                                // 撇
      'M72 42 Q80 51 88 60',                                // 点
      'M46 8 Q46 50 46 90 Q70 89 96 87'                     // 竖折
    ],
    '续': [
      'M28 11 Q18 30 8 47 L27 43',                          // 撇折
      'M35 33 Q22 54 8 72 L35 65',                          // 撇折
      'M6 92 Q20 87 36 80',                                 // 提
      'M45 26 Q65 25 86 23',                                // 横
      'M65 11 L65 33',                                      // 竖
      'M43 40 Q66 39 90 37 L84 54',                         // 横钩
      'M51 47 Q56 51 61 57', 'M44 58 Q49 62 54 67',         // 点 点
      'M40 75 Q69 74 98 71',                                // 横
      'M67 47 Q67 80 40 99',                                // 撇
      'M70 81 Q85 89 98 99'                                 // 捺
    ],
    '写': [
      'M13 19 Q14 25 16 31',                                // 点
      'M15 19 Q51 18 88 15 L83 29',                         // 横钩
      'M33 40 Q56 39 80 37',                                // 横
      'M36 27 L29 60 Q54 59 80 57 Q80 82 73 94 L62 88',     // 竖折折钩
      'M11 77 Q39 76 67 74'                                 // 横
    ],
    '造': [
      'M49 11 Q46 27 33 40',                                // 撇
      'M43 29 Q66 27 89 24',                                // 横
      'M31 49 Q62 47 94 44',                                // 横
      'M62 8 L62 47',                                       // 竖
      'M40 59 L41 84',                                      // 竖
      'M40 59 Q61 58 82 56 L80 83',                         // 横折
      'M41 83 Q60 82 80 82',                                // 横
      'M12 17 Q18 23 22 30',                                // 点
      'M9 51 L21 50 L21 85 Q17 92 8 97',                    // 横折折撇
      'M21 85 Q31 97 56 97 L96 95'                          // 平捺
    ],
    '，': ['M22 70 Q31 76 20 91'],                            // in its own cell, low on the left (稿纸 rule)
    '︐': ['M60 6 Q69 13 58 27']                              // the vertical comma: high on the right
  },
  // x = the same hand written fast (行书 habits, for the signature): the pen stays down through a zigzag instead of
  // lifting (弓 in one stroke, 彳 as a Z, 纟 as one run), pairs of dots are one flick, a box closes on its way back.
  x: {
    '弗': [
      'M17 27 Q46 24 76 21 L73 41 Q48 42 24 43 L22 62 Q55 61 86 57 Q88 77 81 89 L73 84',   // 弓, one run
      'M41 5 L40 54 Q36 80 14 96',                                                        // 撇
      'M61 4 Q62 52 60 99'                                                                // 竖
    ],
    '雷': [
      'M31 8 Q50 6 69 5',
      'M13 17 L15 27 L18 16 Q50 14 86 12 L80 26',             // 冖: the dot, then up into the 横钩
      'M50 5 L50 34',
      'M28 22 Q34 22 38 25 L29 30 Q34 30 38 33',              // left dots, one flick
      'M61 21 Q67 20 71 23 L62 29 Q67 28 71 31',              // right dots
      'M21 45 Q22 70 23 94',
      'M21 45 Q50 43 78 41 L76 93',
      'M24 68 Q50 67 75 66',
      'M50 43 L50 92',
      'M23 94 Q50 92 77 91'
    ],
    '德': [
      'M27 6 Q20 19 11 29 L28 28 Q19 44 7 57',                // 彳's two 撇 as a Z
      'M19 43 Q19 71 20 98',
      'M39 17 Q66 15 93 12', 'M66 2 L66 27',
      'M44 32 L45 46', 'M44 32 Q66 30 88 28 L86 46 L46 47',   // 罒 closes on its way back
      'M59 31 L59 45', 'M73 30 L73 45',
      'M37 58 Q65 56 95 53',
      'M44 70 Q46 76 49 82', 'M55 62 Q56 93 80 88 L72 80',
      'M67 63 Q70 67 72 72 L83 65 Q88 70 91 77'               // 心's last two dots, one flick
    ],
    '继': [
      'M28 11 Q18 30 8 47 L28 42 Q20 56 8 72 L35 64',         // 纟 in one run
      'M6 92 Q20 87 36 80',
      'M56 14 Q59 19 61 25', 'M84 12 Q81 20 77 26',
      'M51 37 Q70 36 90 33', 'M70 8 L70 76',
      'M68 40 Q63 56 50 66', 'M72 42 Q80 51 88 60',
      'M46 8 Q46 50 46 90 Q70 89 96 87'
    ],
    '续': [
      'M28 11 Q18 30 8 47 L28 42 Q20 56 8 72 L35 64',
      'M6 92 Q20 87 36 80',
      'M45 26 Q65 25 86 23', 'M65 11 L65 33',
      'M43 40 Q66 39 90 37 L84 54',
      'M51 47 Q56 51 61 57 L45 58 Q49 62 54 67',               // the two dots, one flick
      'M40 75 Q69 74 98 71',
      'M67 47 Q67 80 40 99', 'M70 81 Q85 89 98 99'
    ]
  },
  // Latin, the same pen: letters on a 100-unit em (baseline 72, x-height 46, cap 14, descender 94), each with its
  // advance width w. Strokes go the way a hand writes them: down the stem first, bowls counter-clockwise.
  lat: {
    F: { w: 31, s: ['M6 14 Q7 44 6 72', 'M6 14 Q18 12 31 12', 'M6 43 L24 42'] },
    r: { w: 19, s: ['M4 46 L4 72 L4 57 Q8 46 19 47'] },
    e: { w: 25, s: ['M4 60 L24 59 Q24 46 14 46 Q3 46 3 59 Q3 72 14 72 Q21 72 25 66'] },
    d: { w: 25, s: ['M22 52 Q18 46 12 46 Q2 46 2 59 Q2 72 12 72 Q18 72 22 66', 'M22 13 L22 72'] },
    Y: { w: 31, s: ['M2 14 Q8 30 15 43', 'M29 13 Q22 30 15 43 L15 72'] },
    a: { w: 25, s: ['M22 52 Q18 46 12 46 Q2 46 2 59 Q2 72 12 72 Q18 72 22 66', 'M22 46 L22 72'] },
    n: { w: 25, s: ['M3 46 L3 72 L3 57 Q7 46 14 46 Q21 46 21 57 L21 72'] },
    g: { w: 25, s: ['M22 52 Q18 46 12 46 Q2 46 2 59 Q2 72 12 72 Q18 72 22 66', 'M22 46 L22 83 Q22 94 12 94 Q5 94 2 88'] }
  },
  // The signature's letters (A): the same pen, signing. Written quicker than lat: a lead-in on the F, a foot on its
  // stem, exit flicks that run toward the next letter, bowls that aren't circles, a g that doesn't close.
  sig: {
    F: { w: 40, s: ['M3 23 Q4 14 13 13 Q25 12 35 10 Q42 9 46 12', 'M20 12 Q22 40 18 61 Q16 72 9 73 Q4 73 3 69', 'M10 43 Q20 41 30 41'] },
    r: { w: 21, s: ['M5 48 Q6 60 5 72 Q6 58 10 51 Q13 47 21 48'] },
    e: { w: 25, s: ['M3 63 Q14 62 21 57 Q25 50 18 47 Q8 47 4 58 Q2 71 12 72 Q20 73 25 67'] },
    d: { w: 29, s: ['M21 51 Q17 46 11 47 Q3 49 3 61 Q3 72 11 72 Q18 72 21 65', 'M24 10 Q23 40 23 65 Q23 73 29 70'] },
    Y: { w: 33, s: ['M2 14 Q6 30 16 44', 'M31 12 Q25 30 17 45 Q15 60 15 72'] },
    a: { w: 28, s: ['M21 51 Q17 46 11 47 Q3 49 3 61 Q3 72 11 72 Q18 72 21 65', 'M23 47 Q22 60 23 67 Q24 73 29 70'] },
    n: { w: 29, s: ['M3 47 Q4 60 3 72 Q5 57 10 50 Q14 46 18 47 Q23 48 23 57 Q22 66 23 69 Q24 73 29 70'] },
    g: { w: 26, s: ['M21 51 Q17 46 11 47 Q3 49 3 61 Q3 72 11 72 Q18 72 21 65', 'M23 47 Q23 70 22 84 Q20 96 9 96 Q2 95 0 89'] }
  }
};
