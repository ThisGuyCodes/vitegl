
const squarePosition = function (gl: WebGL2RenderingContext): { buffer: WebGLBuffer, points: number } {
    const positionBuffer = gl.createBuffer()!;

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = new Float32Array([
        1.0, 1.0, 4.0,
        -1.0, 1.0, 3.0,
        1.0, -1.0, 2.0,
        -1.0, -1.0, 1.0,
        -2.0, -2.0, -4.0,
    ]);

    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    return { buffer: positionBuffer, points: positions.length / 3 };
}

export const initSquare = function (gl: WebGL2RenderingContext) {
    return {
        position: squarePosition(gl),
    }
}
