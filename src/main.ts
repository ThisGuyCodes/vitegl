import './style.css';
import typescriptLogo from './typescript.svg';
import viteLogo from '/vite.svg';
import vertexShaderSource from './vertexShader.glsl?raw';
import fragmentShaderSource from './fragmentShader.glsl?raw';
import { initShaderProgram, getProgInfo } from './shaders';
import { initSquare } from './shapes';
import { perspective, view } from './matrices';
import { mat4 } from 'gl-matrix';



const app = document.querySelector<HTMLDivElement>('#app')!
const instanceID = crypto.randomUUID();
app.setAttribute('instance', instanceID);

const gameCanvas = document.createElement('canvas');
gameCanvas.setAttribute('width', '640');
gameCanvas.setAttribute('height', '480');

const frameTime = document.createElement('div');

app.appendChild(frameTime);
app.appendChild(gameCanvas);

const gl = gameCanvas.getContext('webgl2')!;

const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

gl.useProgram(shaderProgram);

const progInfo = getProgInfo(gl, {
  program: shaderProgram,
  attributes: { vertexPosition: 'aVertexPosition' },
  uniforms: { projectionMatrix: 'uProjectionMatrix', modelViewMatrix: 'uModelViewMatrix' },
})



// Set clear color to black, fully opaque
gl.clearColor(0.0, 0.0, 0.0, 1.0);
// Clear everything
gl.clearDepth(1.0);
// enable depth testing
gl.enable(gl.DEPTH_TEST);
// near things obscure far
gl.depthFunc(gl.LEQUAL);

gl.uniformMatrix4fv(
  progInfo.uniformLocations.projectionMatrix,
  false,
  perspective(mat4.create(),
    (45 * Math.PI) / 180,
    gl.canvas.width / gl.canvas.height,
    0.1,
    100.0,
  ),
);

const square = initSquare(gl);
gl.bindBuffer(gl.ARRAY_BUFFER, square.position);
gl.vertexAttribPointer(
  progInfo.attribLocations.vertexPosition,
  2,
  gl.FLOAT,
  false,
  0,
  0,
);
gl.enableVertexAttribArray(progInfo.attribLocations.vertexPosition);

let lastTime = 0;
let viewMat = view(mat4.create(),
  [-0.0, 0.0, -8.0],
)

document.onkeydown = function(e: KeyboardEvent) {
  switch (e.key) {
    case 'd': {
      mat4.translate(viewMat, viewMat, [-0.1, 0.0, 0.0]);
      break;
    };
    case 'a': {
      mat4.translate(viewMat, viewMat, [0.1, 0.0, 0.0]);
      break;
    };
    case 'Shift': {
      mat4.translate(viewMat, viewMat, [0.0, 0.1, 0.0]);
      break;
    };
    case ' ': {
      mat4.translate(viewMat, viewMat, [0.0, -0.1, 0.0]);
      break;
    };
    case 'w': {
      mat4.translate(viewMat, viewMat, [0.0, 0.0, 0.1]);
      break;
    };
    case 's': {
      mat4.translate(viewMat, viewMat, [0.0, 0.0, -0.1]);
      break;
    };
  }
}

const tick = function (delta: number, gl: WebGL2RenderingContext) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniformMatrix4fv(
    progInfo.uniformLocations.modelViewMatrix,
    false,
    viewMat,
  );

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  delta = Math.round(delta);
  if (delta !== lastTime) {
    frameTime.innerHTML = `frame time: ${delta}ms`;
    lastTime = delta;
  };
};

const frame = function (): (stamp: number) => void {
  let previousStamp: number = 0;
  let innerFrame: (stamp: number) => void = () => { console.log('test') };
  innerFrame = function (stamp: number) {
    const delta = stamp - previousStamp;
    tick(delta, gl);
    previousStamp = stamp;
    const currentInstance = document.querySelector<HTMLCanvasElement>('#app')!.getAttribute('instance');
    if (instanceID === currentInstance) {
      window.requestAnimationFrame(innerFrame);
    } else {
      console.log(`${instanceID} != ${currentInstance}`)
    };
  };
  return innerFrame
}();
window.requestAnimationFrame(frame);
