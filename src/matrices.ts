import { mat4, ReadonlyVec3 } from 'gl-matrix';

export const perspective = function (out: mat4, fov: number, aspect: number, zNear: number, zFar: number): mat4 {
    mat4.perspective(out, fov, aspect, zNear, zFar);
    return out;
}

export const view = function (out: mat4, trans: ReadonlyVec3): mat4 {
    mat4.translate(
        out,
        out,
        trans,
    );
    return out;
}
