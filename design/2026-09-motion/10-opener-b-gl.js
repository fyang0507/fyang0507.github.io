/* 10 · B — WebGL1 plumbing for the ink bloom. One program, one quad, three textures:
   uDesk (the desk composite, premultiplied, sized to the drawing's device pixels),
   uMap (the precomputed arrival map, NEAREST — the shader filters it itself),
   uNoise (256² seeded value noise, four independent channels, LINEAR + REPEAT).
   OBGL.create(canvas) → null when WebGL (or a usable shader) is unavailable. */
(function () {
  function compile(gl, type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn('[10b] shader:', gl.getShaderInfoLog(s)); return null; }
    return s;
  }

  function noiseData(n) {
    var seed = 1234567, d = new Uint8Array(n * n * 4);
    for (var i = 0; i < d.length; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; d[i] = (seed >> 16) & 255; }
    return d;
  }

  function create(canvas) {
    var gl = null;
    try {
      gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: 'low-power' });
    } catch (e) { gl = null; }
    if (!gl) return null;
    var vs = compile(gl, gl.VERTEX_SHADER, OB_SHADER.vs), fs = compile(gl, gl.FRAGMENT_SHADER, OB_SHADER.fs);
    if (!vs || !fs) return null;
    var pr = gl.createProgram();
    gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { console.warn('[10b] link:', gl.getProgramInfoLog(pr)); return null; }
    gl.useProgram(pr);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var U = {};
    ['uRes', 'uRect', 'uT', 'uMode', 'uTex', 'uSkip', 'uDesk', 'uMap', 'uNoise', 'uMapRes', 'uDeskRes', 'uDry', 'uPaper',
      'uDrop[0]', 'uCol[0]', 'uColRGB[0]'].forEach(function (n) { U[n.replace('[0]', '')] = gl.getUniformLocation(pr, n); });

    function tex(unit, filter, wrap) {
      var t = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
      return t;
    }
    var tDesk = tex(0, gl.LINEAR, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
    var tMap = tex(1, gl.NEAREST, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));
    var tNoise = tex(2, gl.LINEAR, gl.REPEAT);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, noiseData(256));
    gl.uniform1i(U.uDesk, 0); gl.uniform1i(U.uMap, 1); gl.uniform1i(U.uNoise, 2);
    gl.uniform2f(U.uMapRes, 1, 1); gl.uniform2f(U.uDeskRes, 1, 1);

    var api = { gl: gl, lost: false };
    api.setMap = function (img) {
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tMap);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);   // data, not colour
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.uniform2f(U.uMapRes, img.width, img.height);
    };
    api.setDesk = function (cv) {
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tDesk);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.BROWSER_DEFAULT_WEBGL);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv);
      gl.uniform2f(U.uDeskRes, cv.width, cv.height);
    };
    // u: { t, rect:[x,y,w,h] (canvas px), mode, tex, skip, dry:[a,b,c], drops:[[x,y,t,r]×4], cols:[[x,y,t,r]×4], rgb:[[r,g,b]×4] }
    api.draw = function (u) {
      if (gl.isContextLost()) { api.lost = true; return; }
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(U.uRes, canvas.width, canvas.height);
      gl.uniform4fv(U.uRect, u.rect);
      gl.uniform1f(U.uT, u.t); gl.uniform1f(U.uMode, u.mode); gl.uniform1f(U.uTex, u.tex); gl.uniform1f(U.uSkip, u.skip);
      gl.uniform3fv(U.uDry, u.dry);
      gl.uniform3fv(U.uPaper, [251 / 255, 246 / 255, 236 / 255]);
      gl.uniform4fv(U.uDrop, flat(u.drops, 4, 4));
      gl.uniform4fv(U.uCol, flat(u.cols, 4, 4));
      gl.uniform3fv(U.uColRGB, flat(u.rgb, 4, 3));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    api.destroy = function () {
      [tDesk, tMap, tNoise].forEach(function (t) { gl.deleteTexture(t); });
      gl.deleteBuffer(buf); gl.deleteProgram(pr); gl.deleteShader(vs); gl.deleteShader(fs);
      var ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    };
    return api;
  }

  function flat(list, n, k) {
    var out = new Float32Array(n * k);
    for (var i = 0; i < n && list && i < list.length; i++) for (var j = 0; j < k; j++) out[i * k + j] = list[i][j] || 0;
    return out;
  }

  window.OBGL = { create: create };
})();
