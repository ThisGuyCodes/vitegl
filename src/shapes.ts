
const squarePosition = function (gl: WebGL2RenderingContext): WebGLBuffer {
    const positionBuffer = gl.createBuffer()!;

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positions = new Float32Array([
        1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        -1.0, -1.0,
    ]);

    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

    return positionBuffer;
}

export const initSquare = function(gl: WebGL2RenderingContext) {
    return {
        position: squarePosition(gl),
    }
}
