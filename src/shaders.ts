const loadShader = function (gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        throw new Error('could not compile shader')
    }

    return shader;
}

export const initShaderProgram = function (gl: WebGL2RenderingContext, vsSource: string, fsSource: string): WebGLProgram {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram()!;
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        const programLog = gl.getProgramInfoLog(shaderProgram)!;
        throw new Error(`Unable to initialized the shader program: ${programLog}`)
    }

    return shaderProgram;
}

// interface ProgInfo {
//     program: WebGLProgram,
//     attribLocations: {
//         [key: string]: number,
//     },
//     uniformLocations: {
//         [key: string]: WebGLUniformLocation | null,
//     },
// };

type rec = Record<string, string>
interface ProgInfo<A extends rec, U extends rec> {
    program: WebGLProgram,
    attribLocations: {
        [k in (keyof A)]: number
    },
    uniformLocations: {
        [k in (keyof U)]: WebGLUniformLocation
    }
};

interface ProgStructure<A extends rec, U extends rec> {
    program: WebGLProgram,
    attributes: A,
    uniforms: U,
};

export const getProgInfo = function <A extends rec, U extends rec>(gl: WebGL2RenderingContext, pInfo: ProgStructure<A, U>): ProgInfo<A, U> {
    const p = pInfo.program;
    const attribLocations: Record<string, number> = {};
    const uniformLocations: Record<string, WebGLUniformLocation> = {};
    Object.entries(pInfo.attributes).map(([attrib, name]) => {
        const loc = gl.getAttribLocation(p, name);
        if (loc === -1) {
            throw new TypeError(`attribute ${name} returned -1 location`);
        };
        attribLocations[attrib] = loc;
    });
    Object.entries(pInfo.uniforms).forEach(([uniform, name]) => {
        const loc = gl.getUniformLocation(p, name);
        if (loc === null) {
            throw new TypeError(`uniform ${name} returned null location`);
        };
        uniformLocations[uniform] = loc;
    });
    const ret: ProgInfo<typeof pInfo.attributes, typeof pInfo.uniforms> = {
        program: gl,
        attribLocations: attribLocations as any,
        uniformLocations: uniformLocations as any,
    };
    return ret;
}
