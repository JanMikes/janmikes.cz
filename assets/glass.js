// Fluted-glass background. Decorative only: the page reads fine without it.
// Expects <div class="glass" aria-hidden="true"><canvas></canvas></div>, fixed and overscanned in CSS.
// One seamless loop: every motion is a whole number of cycles per LOOP seconds, so the last frame
// equals the first. Once per loop the light breathes down to near-black and blooms back.
(() => {
  const host = document.querySelector('.glass'), cv = host && host.querySelector('canvas');
  const gl = cv && cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return;

  const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uPh, uLight;
uniform vec3 uBg, uC1, uC2, uC3, uC4, uC5, uSweep;
uniform vec4 uView;
const float FLUTES = 4.6, ANGLE = -.72, REFR = -1.7, WARP = .5, DISP = .09, SOFT = .08, TAU = 6.28318;

float h1(float n){ return fract(sin(n * 127.1) * 43758.5453); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float blob(vec2 p, vec2 c, float r){ vec2 d = p - c; return exp(-dot(d, d) / (r * r)); }

vec3 field(vec2 p, float env){
  float grow = mix(2.0, 1.0, env);                           // lights defocus as they dim
  vec3 col = vec3(0.);
  for (int i = 0; i < 5; i++){
    float fi = float(i), s = fi * 3.7 + 1.;
    // closed paths: integer frequencies of the loop phase
    vec2 c = vec2(h1(s) * 2. - 1., h1(s + 1.) - .5) * vec2(.95, .7)
           + vec2(.35 * sin(uPh * (1. + mod(fi, 2.)) + TAU * h1(s + 2.)),
                  .22 * cos(uPh * (1. + mod(fi + 1., 3.)) + TAU * h1(s + 3.)));
    float r = (.26 + .32 * h1(s + 4.)) * grow;
    float breathe = mix(.15, 1., .5 + .5 * sin(uPh * (1. + mod(fi, 3.)) + TAU * h1(s + 5.)));
    vec3 cc = i == 0 ? uC1 : i == 1 ? uC2 : i == 2 ? uC3 : i == 3 ? uC5 : uC1;
    col += cc * blob(p, c, r) * breathe;
  }
  col *= env;
  col += uC4 * blob(p, uSweep.xy, .3) * uSweep.z * max(env, .25);
  return col;
}

vec3 flute(vec2 p, vec2 across, vec2 along, float cell, float f, float env){
  float a = dot(p, along);
  float o = (f - .5) * REFR * (1. + .25 * sin(a * 1.7 - uPh * 2.)) / FLUTES;  // the lens breathes as waves pass
  // each flute streams its light along itself at its own pace
  vec2 q = p + along * ((h1(cell + 3.1) - .5) * .35 + .14 * sin(uPh * 2. + TAU * h1(cell + 9.)));
  vec3 c = vec3(field(q + across * o * (1. - DISP), env).r, field(q + across * o, env).g, field(q + across * o * (1. + DISP), env).b);
  float shade = mix(.08, 1., pow(sin(clamp(f, 0., 1.) * 3.14159), 1.3));
  return c * shade * (.55 + .45 * h1(cell * 1.7 + 1.));
}

void main(){
  vec2 p = (gl_FragCoord.xy - .5 * uRes) / uRes.y;
  float env = 1. - pow(.5 + .5 * cos(uPh), 6.);              // 0 at the loop seam, ~1 for most of it
  vec2 across = vec2(cos(ANGLE), sin(ANGLE)), along = vec2(-across.y, across.x);
  float s = dot(p, across), a = dot(p, along);
  // travelling waves along the flutes: the ribs ripple like liquid instead of standing still
  float flow = .16 * sin(a * 2.2 - uPh * 3. + s * 1.3)
             + .09 * sin(a * 3.7 + uPh * 2. - s * .8)
             + .04 * sin(a * 6.1 - uPh * 5.);
  float u = (s + flow) * FLUTES + WARP * sin(s * 2.3 + uPh);
  float cell = floor(u), f = fract(u);
  float side = f > .5 ? 1. : -1., d = min(f, 1. - f);
  float w = .5 * (1. - smoothstep(0., SOFT, d));             // melt each flute into its neighbour
  vec3 lit = mix(flute(p, across, along, cell, f, env), flute(p, across, along, cell + side, f - side, env), w);
  float y = gl_FragCoord.y, x = gl_FragCoord.x;
  float vig = smoothstep(uView.x - uView.z * .5, uView.x + uView.z, y)
            * smoothstep(uView.y + uView.w * .2, uView.y - uView.w, y)
            * smoothstep(0., uView.z, x) * smoothstep(uRes.x, uRes.x - uView.z, x);
  vec3 tone = 1. - exp(-lit * vig * 1.4);
  vec3 col = uLight > .5 ? uBg - tone * .5 : uBg + tone;
  col += (hash(gl_FragCoord.xy + fract(uPh * 37.) * 91.) - .5) * 3. / 255.;  // grain, kills banding
  gl_FragColor = vec4(col, 1.);
}`;
  const VERT = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }';

  const rgb = (h, k = 1) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255 * k);
  const PALETTES = {
    dark: { bg: rgb('#0b0c0f'), c: [rgb('#2f3fbf', .5), rgb('#1b2470', .75), rgb('#5a66e0', .28), rgb('#4b57d6', .4), rgb('#2a1f7a', .55)] },
    // light: lights subtract from paper, so these are complements of the tints you see
    light: { bg: rgb('#ffffff'), c: [[.62, .55, .12], [.55, .5, .2], [.3, .27, 0], [.4, .36, .05], [.3, .36, .1]] },
  };
  const SCALE = .5, LOOP = 40, SWEEP = LOOP / 4;

  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
  const pr = gl.createProgram();
  gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const U = {}, u = n => U[n] || (U[n] = gl.getUniformLocation(pr, n));

  const view = { pad: 0, h: 1, w: 1 };
  const resize = () => {
    const r = cv.getBoundingClientRect();
    cv.width = Math.max(1, Math.round(r.width * SCALE)); cv.height = Math.max(1, Math.round(r.height * SCALE));
    gl.viewport(0, 0, cv.width, cv.height);
    view.pad = -r.top; view.h = r.height; view.w = r.width;
  };
  addEventListener('resize', resize); resize();

  const dark = matchMedia('(prefers-color-scheme: dark)');
  const theme = () => document.documentElement.dataset.theme || (dark.matches ? 'dark' : 'light');
  let t = +(new URLSearchParams(location.search).get('t') || 0), last = performance.now(), acc = 0, raf;

  const draw = () => {
    const pal = PALETTES[theme()], small = view.w < 600, lt = t % LOOP;
    // a soft light sweeps left to right, fades out at the edge, starts over from the left
    const ph = (lt % SWEEP) / SWEEP, half = view.w / view.h / 2;
    gl.uniform3f(u('uSweep'), -half - .3 + ph * (2 * half + .6), .08 * Math.sin(ph * Math.PI * 2), Math.pow(Math.sin(ph * Math.PI), 1.5));
    gl.uniform2f(u('uRes'), cv.width, cv.height);
    gl.uniform1f(u('uPh'), lt / LOOP * Math.PI * 2);
    gl.uniform1f(u('uLight'), theme() === 'light' ? 1 : 0);
    gl.uniform4f(u('uView'), view.pad * SCALE, (view.pad + innerHeight) * SCALE, (small ? 24 : 90) * SCALE, (small ? 80 : 180) * SCALE);
    gl.uniform3fv(u('uBg'), pal.bg); ['uC1', 'uC2', 'uC3', 'uC4', 'uC5'].forEach((k, i) => gl.uniform3fv(u(k), pal.c[i]));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const loop = now => {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(.1, (now - last) / 1000); last = now; acc += dt;
    if (acc < 1 / 30) return;                                  // 30 fps is plenty for slow light
    t += acc; acc = 0; draw();
  };
  const start = () => { cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(loop); };

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { t = LOOP * .4; draw(); new MutationObserver(draw).observe(document.documentElement, { attributes: true }); }
  else { start(); document.addEventListener('visibilitychange', () => document.hidden ? cancelAnimationFrame(raf) : start()); }
  requestAnimationFrame(() => host.classList.add('on'));
})();
