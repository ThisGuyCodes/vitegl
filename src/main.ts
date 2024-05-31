import './style.css';
import typescriptLogo from './typescript.svg';
import viteLogo from '/vite.svg';
import vertexShaderSource from './vertexShader.glsl?raw';
import fragmentShaderSource from './fragmentShader.glsl?raw';
import { initShaderProgram, getProgInfo } from './shaders';
import { initSquare } from './shapes';
import { perspective, view } from './matrices';
import { mat4, vec3, quat } from 'gl-matrix';



const app = document.querySelector<HTMLDivElement>('#app')!
const instanceID = crypto.randomUUID();
app.setAttribute('instance', instanceID);

const gameCanvas = document.createElement('canvas');
gameCanvas.setAttribute('width', '640');
gameCanvas.setAttribute('height', '480');

const frameTime = document.createElement('div');
const cmdStateDiv = document.createElement('div');
const cmdStatePre = document.createElement('pre');
cmdStateDiv.appendChild(cmdStatePre);

app.appendChild(frameTime);
app.appendChild(gameCanvas);
app.appendChild(cmdStateDiv);

const gl = gameCanvas.getContext('webgl2')!;

const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

gl.useProgram(shaderProgram);

const progInfo = getProgInfo(gl, {
  program: shaderProgram,
  attributes: { vertexPosition: 'aVertexPosition' },
  uniforms: { projectionMatrix: 'uProjectionMatrix', modelViewMatrix: 'uViewMatrix' },
})



// Set clear color to black, fully opaque
gl.clearColor(0.0, 0.0, 0.0, 1.0);
// Clear everything
gl.clearDepth(1.0);
// enable depth testing
gl.enable(gl.DEPTH_TEST);
// near things obscure far
gl.depthFunc(gl.LEQUAL);

let projMat = perspective(mat4.create(),
  (45 * Math.PI) / 180,
  gl.canvas.width / gl.canvas.height,
  0.1,
  100.0,
);

gl.uniformMatrix4fv(
  progInfo.uniformLocations.projectionMatrix,
  false,
  projMat,
);

const square = initSquare(gl);
gl.bindBuffer(gl.ARRAY_BUFFER, square.position.buffer);
gl.vertexAttribPointer(
  progInfo.attribLocations.vertexPosition,
  3,
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

const cmdState: Record<string, boolean> = {
  forward: false,
  left: false,
  backward: false,
  right: false,
  up: false,
  down: false,
  turnLeft: false,
  turnRight: false,
}

const keysMap: Record<string, string> = {
  w: 'forward',
  a: 'left',
  s: 'backward',
  d: 'right',
  ' ': 'up',
  Shift: 'down',
  q: 'turnLeft',
  e: 'turnRight',
}

document.onkeydown = function (e: KeyboardEvent) {
  const mapping = keysMap[e.key];
  if (mapping !== undefined) {
    cmdState[mapping] = true;
  }
}

document.onkeyup = function (e: KeyboardEvent) {
  const mapping = keysMap[e.key];
  if (mapping !== undefined) {
    cmdState[mapping] = false;
  }
}

const timeFactor = 0.01;

let rotCam = mat4.create();
mat4.fromYRotation(rotCam, 0);
let transCam = mat4.create();
mat4.fromTranslation(transCam, [0, 0, -8]);

const movement = function (delta: number) {
  const adj = delta * timeFactor;
  let leftRight = 0;
  let downUp = 0;
  let forwardBack = 0;
  let turn = 0;
  if (cmdState.forward) {
    forwardBack += adj;
  };
  if (cmdState.backward) {
    forwardBack -= adj;
  };
  if (cmdState.left) {
    leftRight += adj;
  };
  if (cmdState.right) {
    leftRight -= adj;
  };
  if (cmdState.down) {
    downUp += adj;
  };
  if (cmdState.up) {
    downUp -= adj;
  };
  if (cmdState.turnLeft) {
    turn -= adj*0.5;
  };
  if (cmdState.turnRight) {
    turn += adj*0.5;
  };
  mat4.rotateY(rotCam, rotCam, turn);
  const rotQuat = mat4.getRotation(quat.create(), rotCam);
  let angle = vec3.create();
  const rotation = quat.getAxisAngle(angle, rotQuat);
  console.log(rotation);
  console.log(angle);
  let transVec = vec3.rotateY(vec3.create(), [leftRight, downUp, forwardBack], angle, -rotation);
  mat4.translate(transCam, transCam, transVec);

  mat4.multiply(viewMat, rotCam, transCam);
}

const tick = function (delta: number, gl: WebGL2RenderingContext) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  movement(delta);

  gl.uniformMatrix4fv(
    progInfo.uniformLocations.modelViewMatrix,
    false,
    viewMat,
  );

  gl.uniformMatrix4fv(
    progInfo.uniformLocations.projectionMatrix,
    false,
    projMat,
  );

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, square.position.points);

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
    cmdStatePre.innerHTML = JSON.stringify(cmdState, null, 2);
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
