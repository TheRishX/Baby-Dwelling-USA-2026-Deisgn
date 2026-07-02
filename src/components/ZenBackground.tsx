import { useEffect, useRef, useState } from 'react';

export default function ZenBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      console.warn('WebGL not supported');
      return;
    }

    // Vertex Shader
    const vsSource = `
      attribute vec2 position;
      varying vec2 vTexCoord;
      void main() {
        vTexCoord = position * 0.5 + 0.5;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment Shader - Flowing Silk / Fabric Movement
    const fsSource = `
      precision highp float;
      varying vec2 vTexCoord;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;

      // Pseudo-noise function
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                   mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
      }

      float fbm(vec2 p) {
        float value = 0.0;
        float amplitude = 0.5;
        for (int i = 0; i < 4; i++) {
          value += amplitude * noise(p);
          p *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }

      void main() {
        vec2 uv = vTexCoord;
        
        // Flowing fabric wave coordinate shifts
        vec2 q = vec2(
          fbm(uv * 3.0 + vec2(uTime * 0.05, uTime * 0.02)),
          fbm(uv * 3.0 + vec2(uTime * 0.03, uTime * 0.06))
        );
        
        vec2 r = vec2(
          fbm(uv * 2.0 + q * 2.0 + vec2(uTime * 0.04, uTime * 0.01)),
          fbm(uv * 2.0 + q * 2.0 + vec2(uTime * 0.01, uTime * 0.03))
        );
        
        float f = fbm(uv * 1.5 + r * 1.5);
        
        // Interpolate between the 3 organic colors
        vec3 col = mix(uColor1, uColor2, f);
        col = mix(col, uColor3, clamp(q.x * q.y * 2.5, 0.0, 1.0));
        
        // Add subtle lighting high-points for premium silk texture
        float spec = clamp(r.x * r.y * 1.8, 0.0, 1.0);
        col += vec3(spec * 0.08);
        
        // Soft vignette to keep the background grounded
        float vignette = 1.0 - smoothstep(0.4, 1.4, length(uv - 0.5));
        col *= (vignette * 0.3 + 0.7);
        
        gl_FragColor = vec4(col, 0.15); // subtle ambient transparency
      }
    `;

    // Compile Shader function
    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(vsSource, gl.VERTEX_SHADER);
    const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    // Positions for full-screen quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uTimeLoc = gl.getUniformLocation(program, 'uTime');
    const uResolutionLoc = gl.getUniformLocation(program, 'uResolution');
    const uColor1Loc = gl.getUniformLocation(program, 'uColor1');
    const uColor2Loc = gl.getUniformLocation(program, 'uColor2');
    const uColor3Loc = gl.getUniformLocation(program, 'uColor3');

    // Soft organic colors
    // 1. Light Cream Beige: (245, 239, 231) -> (0.96, 0.94, 0.91)
    // 2. Sand: (216, 195, 165) -> (0.85, 0.76, 0.65)
    // 3. Sage Green: (156, 163, 137) -> (0.61, 0.64, 0.54)
    const color1 = [0.96, 0.94, 0.91];
    const color2 = [0.85, 0.76, 0.65];
    const color3 = [0.61, 0.64, 0.54];

    // Set colors once
    gl.uniform3f(uColor1Loc, color1[0], color1[1], color1[2]);
    gl.uniform3f(uColor2Loc, color2[0], color2[1], color2[2]);
    gl.uniform3f(uColor3Loc, color3[0], color3[1], color3[2]);

    // Handle Resize using ResizeObserver
    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolutionLoc, canvas.width, canvas.height);
    };

    const resizeObserver = new ResizeObserver(() => {
      // Debounce slightly or run immediately
      handleResize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    handleResize();

    // Animation Loop
    let animationFrameId: number;
    let lastTime = 0;

    const render = (time: number) => {
      if (!isActive) return;
      const elapsed = time * 0.001; // convert to seconds
      gl.uniform1f(uTimeLoc, elapsed);

      gl.clearColor(0.0, 0.0, 0.0, 0.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Clean up
    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive]);

  return (
    <div
      id="zen-background-container"
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0"
    >
      <canvas
        id="zen-shader-canvas"
        ref={canvasRef}
        className="w-full h-full block opacity-70 transition-opacity duration-1000"
      />
      
      {/* Floating Zen Action Selector to toggle ambient motion rendering */}
      <div className="absolute bottom-6 right-6 z-10 pointer-events-auto flex items-center gap-2">
        <button
          onClick={() => setIsActive(!isActive)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-medium tracking-wide shadow-sm border border-sand/30 bg-warm-white/95 text-charcoal hover:bg-white active:scale-95 transition-all cursor-pointer dark:bg-charcoal/90 dark:text-warm-white dark:border-charcoal/50"
          title={isActive ? "Pause silk ambient motion" : "Play silk ambient motion"}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-sage animate-ping' : 'bg-sand'}`} />
          <span>{isActive ? 'Ambient Zen: Active' : 'Ambient Zen: Paused'}</span>
        </button>
      </div>
    </div>
  );
}
