// Water ripples over an image, after jquery.ripples (MIT, Pierre Sirtautas) without jQuery.
// A height field runs on the GPU in two float textures; each frame it spreads the waves,
// then the image is drawn bent by the slope of the water, plus a little glint.

const VERTEX = `
attribute vec2 vertex;
varying vec2 coord;
void main() {
  coord = vertex * 0.5 + 0.5;
  gl_Position = vec4(vertex, 0.0, 1.0);
}`;

const DROP = `
precision highp float;
const float PI = 3.141592653589793;
uniform sampler2D state;
uniform vec2 center;
uniform float radius;
uniform float strength;
uniform float aspect;
varying vec2 coord;
void main() {
  vec4 info = texture2D(state, coord);
  float drop = max(0.0, 1.0 - length((center - coord) * vec2(aspect, 1.0)) / radius);
  drop = 0.5 - cos(drop * PI) * 0.5;
  info.r += drop * strength;
  gl_FragColor = info;
}`;

const UPDATE = `
precision highp float;
uniform sampler2D state;
uniform vec2 delta;
varying vec2 coord;
void main() {
  vec4 info = texture2D(state, coord);
  vec2 dx = vec2(delta.x, 0.0);
  vec2 dy = vec2(0.0, delta.y);
  float average = (
    texture2D(state, coord - dx).r + texture2D(state, coord - dy).r +
    texture2D(state, coord + dx).r + texture2D(state, coord + dy).r
  ) * 0.25;
  info.g += (average - info.r) * 2.0;
  info.g *= 0.995;
  info.r += info.g;
  gl_FragColor = info;
}`;

const RENDER = `
precision highp float;
uniform sampler2D image;
uniform sampler2D state;
uniform vec2 delta;
uniform vec2 perturbance;
varying vec2 coord;
void main() {
  float height = texture2D(state, coord).r;
  float heightX = texture2D(state, vec2(coord.x + delta.x, coord.y)).r;
  float heightY = texture2D(state, vec2(coord.x, coord.y + delta.y)).r;
  vec3 dx = vec3(0.004, heightX - height, 0.0);
  vec3 dy = vec3(0.0, heightY - height, 0.004);
  vec2 offset = -normalize(cross(dy, dx)).xz;
  float glint = pow(max(0.0, dot(offset, normalize(vec2(-0.6, 1.0)))), 4.0);
  gl_FragColor = texture2D(image, coord + offset * perturbance) + glint * 0.5;
}`;

export interface RipplesOptions {
  /** Simulation cells across the width; the height follows the canvas's aspect ratio. */
  resolution?: number;
  /** How far the image bends, in CSS pixels. */
  perturbance?: number;
}

export class Ripples {
  private gl: WebGLRenderingContext;
  private width: number;
  private height: number;
  private textures: WebGLTexture[] = [];
  private framebuffers: WebGLFramebuffer[] = [];
  private image: WebGLTexture;
  private programs: Record<'drop' | 'update' | 'render', { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null> }>;
  private delta: [number, number];
  private perturbance: [number, number];
  private current = 0;

  /** Returns undefined when the browser can't render to float textures. */
  static create(canvas: HTMLCanvasElement, image: TexImageSource, options: RipplesOptions = {}) {
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false });
    if (!gl) return undefined;
    const type = floatType(gl);
    if (type === undefined) return undefined;
    return new Ripples(gl, type, image, options);
  }

  private constructor(
    gl: WebGLRenderingContext,
    type: { type: number; linear: boolean },
    image: TexImageSource,
    { resolution = 512, perturbance = 8 }: RipplesOptions,
  ) {
    this.gl = gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    this.width = resolution;
    this.height = Math.max(16, Math.round((resolution * cssHeight) / cssWidth));
    this.delta = [1 / this.width, 1 / this.height];
    this.perturbance = [perturbance / cssWidth, perturbance / cssHeight];

    const filter = type.linear ? gl.LINEAR : gl.NEAREST;
    for (let i = 0; i < 2; i++) {
      const texture = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      setParameters(gl, filter);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, type.type, null);
      const framebuffer = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      this.textures.push(texture);
      this.framebuffers.push(framebuffer);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.image = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.image);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    setParameters(gl, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);

    this.programs = {
      drop: program(gl, DROP, ['state', 'center', 'radius', 'strength', 'aspect']),
      update: program(gl, UPDATE, ['state', 'delta']),
      render: program(gl, RENDER, ['image', 'state', 'delta', 'perturbance']),
    };
  }

  /** x and y are 0 to 1 from the top left; radius is in CSS pixels. */
  drop(x: number, y: number, radius: number, strength: number) {
    const { gl } = this;
    const canvas = gl.canvas as HTMLCanvasElement;
    const { program: p, uniforms: u } = this.programs.drop;
    gl.useProgram(p);
    gl.uniform2f(u.center, x, 1 - y);
    gl.uniform1f(u.radius, radius / canvas.clientHeight);
    gl.uniform1f(u.strength, strength);
    gl.uniform1f(u.aspect, canvas.clientWidth / canvas.clientHeight);
    this.step();
  }

  /** Moves the water one frame on and draws it. */
  frame() {
    const { gl } = this;
    const { program: update, uniforms: u } = this.programs.update;
    gl.useProgram(update);
    gl.uniform2f(u.delta, ...this.delta);
    this.step();

    const { program: render, uniforms: r } = this.programs.render;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.useProgram(render);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.image);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[this.current]);
    gl.uniform1i(r.image, 0);
    gl.uniform1i(r.state, 1);
    gl.uniform2f(r.delta, ...this.delta);
    gl.uniform2f(r.perturbance, ...this.perturbance);
    this.draw(render);
  }

  destroy() {
    this.gl.getExtension('WEBGL_lose_context')?.loseContext();
  }

  // Runs the bound program from the current state texture into the other one, then swaps.
  private step() {
    const { gl } = this;
    const program = gl.getParameter(gl.CURRENT_PROGRAM) as WebGLProgram;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffers[1 - this.current]);
    gl.viewport(0, 0, this.width, this.height);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.textures[this.current]);
    gl.uniform1i(gl.getUniformLocation(program, 'state'), 0);
    this.draw(program);
    this.current = 1 - this.current;
  }

  private draw(program: WebGLProgram) {
    const { gl } = this;
    const vertex = gl.getAttribLocation(program, 'vertex');
    gl.enableVertexAttribArray(vertex);
    gl.vertexAttribPointer(vertex, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }
}

function setParameters(gl: WebGLRenderingContext, filter: number) {
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

function program(gl: WebGLRenderingContext, fragment: string, uniforms: string[]) {
  const compile = (kind: number, source: string) => {
    const shader = gl.createShader(kind)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) ?? 'Shader did not compile');
    }
    return shader;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl.VERTEX_SHADER, VERTEX));
  gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) ?? 'Program did not link');
  }
  return {
    program: p,
    uniforms: Object.fromEntries(uniforms.map((name) => [name, gl.getUniformLocation(p, name)])),
  };
}

// Full float where it renders, else half float (most phones); undefined if neither does.
function floatType(gl: WebGLRenderingContext) {
  const candidates: { type: number; linear: boolean }[] = [];
  if (gl.getExtension('OES_texture_float')) {
    candidates.push({ type: gl.FLOAT, linear: !!gl.getExtension('OES_texture_float_linear') });
  }
  const half = gl.getExtension('OES_texture_half_float');
  if (half) {
    candidates.push({
      type: half.HALF_FLOAT_OES,
      linear: !!gl.getExtension('OES_texture_half_float_linear'),
    });
  }
  return candidates.find(({ type }) => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    setParameters(gl, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, type, null);
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.deleteFramebuffer(framebuffer);
    gl.deleteTexture(texture);
    return ok;
  });
}
