// @ts-nocheck
"use strict";
const canvasParams = {
    width: 960,
    height: 540
};
const viewParams = {
    pointsPerRender: 100,
    running: false
};
let wheelTimeout;
const wheelTimeoutLength = 30;
const setBinaryKeys = value => event => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            scene.camera.moveUp = value;
            break;
        case 'ArrowDown':
        case 'KeyS':
            scene.camera.moveDown = value;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            scene.camera.moveLeft = value;
            break;
        case 'ArrowRight':
        case 'KeyD':
            scene.camera.moveRight = value;
            break;
        case 'KeyZ':
            scene.camera.moveOut = value;
            break;
        case 'KeyX':
            scene.camera.moveIn = value;
            break;
        case 'KeyQ':
            scene.camera.rotateLeft = value;
            break;
        case 'KeyE':
            scene.camera.rotateRight = value;
            break;
    }
};
const observationPoint = {};
const createCanvas = () => document.createElement('canvas');
const createViewCanvas = ({ width, height }) => {
    const canvas = createCanvas();
    canvas.width = width;
    canvas.height = height;
    return canvas;
};
const createDrawCanvas = () => { };
const createViewPlane = () => {
};
/*

     y=======z
      -   . /
       .-  /
     .    x
  |.________

y - x
x - y
*/
const vAdd = ([a1, b1, c1], [a2, b2, c2]) => [a1 + a2, b1 + b2, c1 + c2];
const vDifference = ([a1, b1, c1], [a2, b2, c2]) => [a2 - a1, b2 - b1, c2 - c1];
const vScale = ([a1, b1, c1], s) => [s * a1, s * b1, s * c1];
const vDivide = (vector, s) => vScale(vector, 1 / s);
const vDot = ([a1, b1, c1], [a2, b2, c2]) => a1 * a2 + b1 * b2 + c1 * c2;
const vCrossProduct = ([a1, b1, c1], [a2, b2, c2]) => ([
    b1 * c2 - c1 * b2,
    c1 * a2 - a1 * c2,
    a1 * b2 - b1 * a2
]);
const vMagnitude = vector => vDot(vector, vector);
const vLength = vector => Math.sqrt(vMagnitude(vector));
const vUnit = vector => vDivide(vector, vLength(vector));
const rotateVectorByQ = (vector, [a, b, c, d]) => {
    const qv = [b, c, d];
    return (vAdd(vScale(qv, 2 * vDot(qv, vector)), vAdd(vScale(vector, a * a - vDot(qv, qv)), vScale(vCrossProduct(qv, vector), 2 * a))));
};
const scene = {
    camera: {
        backgroundOpacity: 0.25,
        fov: 120,
        aspect: 16 / 9,
        planeDistance: 1,
        up: [0, 1, 0],
        dir: [0, 0, 1],
        q: [1, 0, 0, 0],
        velocity: [0, 0, 0],
        origin: [-0.33, -0.25, -0.75] // ?
    },
    runSim: true,
    addVector: vector => {
        const [a, b, c] = vector;
        scene.objects.push(['vector', [a, b, c]]);
        return vector;
    },
    addSphere: (radius, origin, color = [Math.random(), Math.random(), Math.random(), 1]) => {
        //addSphere: (radius, origin, color = [0, 0, 1, 1]) => {
        const sphere = ['sphere', { radius, origin, color }];
        scene.objects.push(sphere);
        return sphere;
    },
    objects: [ //?
    ]
};
const tickScene = (scene, dt, tickNumber) => {
    let cameraVelocity = [0, 0, 0];
    let cameraSpin = [0, 0, 0];
    if (scene.camera.moveUp)
        cameraVelocity = vAdd(cameraVelocity, [0, 0.1, 0]);
    if (scene.camera.moveDown)
        cameraVelocity = vAdd(cameraVelocity, [0, -0.1, 0]);
    if (scene.camera.moveRight)
        cameraVelocity = vAdd(cameraVelocity, [0.1, 0, 0]);
    if (scene.camera.moveLeft)
        cameraVelocity = vAdd(cameraVelocity, [-0.1, 0, 0]);
    if (scene.camera.moveIn)
        cameraVelocity = vAdd(cameraVelocity, [0, 0, 0.1]);
    if (scene.camera.moveOut)
        cameraVelocity = vAdd(cameraVelocity, [0, 0, -0.1]);
    if (scene.camera.rotateLeft)
        cameraSpin = vAdd(cameraSpin, [0, -0.1, 0]);
    if (scene.camera.rotateRight)
        cameraSpin = vAdd(cameraSpin, [0, 0.1, 0]);
    scene.camera.velocity = cameraVelocity;
    scene.camera.spin = cameraSpin;
    scene.camera.origin = vAdd(scene.camera.origin, vScale(scene.camera.velocity, 1 / tps));
    scene.camera.dir = vUnit(vAdd(scene.camera.dir, vScale(scene.camera.spin, 1 / tps)));
    //scene.camera.direction = rotateVectorByQ(scene.camera.direction, cameraSpin);
    //console.log(scene.camera.velocity);
    //scene.camera.origin = [-(Math.sin(tickNumber) + 1) / 20, -(Math.cos(tickNumber) + 1) / 20, -(Math.sin(tickNumber) + 1) / 20];
};
const test = () => {
    console.log('testing...');
    for (let i = -10; i <= 10; i += 2) {
        for (let j = -10; j <= 10; j += 2) {
            scene.addSphere(1, [i, j + i % 2, 5]);
        }
    }
    //const v1 = scene.addVector([1, 2, 3]);
    //const v2 = scene.addVector([4, 5, 6]);
    //console.log(vDifference(v1, v2));
};
const sphereRayIntersection = (sphere, ray) => {
    const oc = vDifference(ray.origin, sphere.origin);
    const a = vDot(ray, ray);
    if (a === 0)
        return;
    const b = vDot(ray, oc);
    const c = vDot(oc, oc) - sphere.radius * sphere.radius;
    const delta = b * b - a * c;
    if (delta < 0)
        return;
    const root = Math.sqrt(delta);
    let t = (b - root) / a;
    if (t < 0)
        t = (b + root) / a;
    if (t < 0)
        return;
    return vAdd(ray.origin, vScale(ray, t));
};
const vRotateTo = (vector, direction) => {
    const q = qFromUnitVectors([0, 0, 1], vUnit(direction));
    return rotateVectorByQ(vector, q);
};
const project = (x, y, camera) => {
    const half = Math.tan((camera.fov * Math.PI / 180) / 2) * camera.planeDistance;
    const px = (x * 2 - 1) * camera.aspect * half;
    const py = (1 - y * 2) * half;
    return vRotateTo(vUnit([px, py, camera.planeDistance]), camera.dir);
};
const intersects = (ray, object) => {
    const [type, description] = object;
    switch (type) {
        case 'sphere':
            const intersection = sphereRayIntersection(description, ray);
            if (intersection) {
                return {
                    ray,
                    object,
                    intersection,
                    getColor() {
                        return description.color;
                    }
                };
            }
            break;
        default: return;
    }
};
const REFLECTION_STEPS = 4;
const REFLECT_BIAS = 0.05;
const traceRay = (dir, origin, scene, base, stepsLeft) => {
    const ray = [dir[0], dir[1], dir[2]];
    ray.origin = origin;
    const objects = scene.objects;
    let bestSphere = null;
    let bestPoint = null;
    let bestT = Infinity;
    for (let i = 0; i < objects.length; i++) {
        const object = objects[i];
        if (object[0] !== 'sphere')
            continue;
        const intersection = sphereRayIntersection(object[1], ray);
        if (!intersection)
            continue;
        const t = vLength(vDifference(origin, intersection));
        if (t < REFLECT_BIAS * 0.4 || t >= bestT)
            continue;
        bestT = t;
        bestSphere = object[1];
        bestPoint = intersection;
    }
    if (!bestSphere)
        return base;
    const color = bestSphere.color;
    const reflectivity = stepsLeft > 0 ? Math.min(1, Math.max(0, bestSphere.reflectivity || 0)) : 0;
    if (reflectivity <= 0)
        return color;
    const normal = vUnit(vDifference(bestSphere.origin, bestPoint));
    const reflected = vUnit(vAdd(dir, vScale(normal, -2 * vDot(dir, normal))));
    const bounced = traceRay(reflected, vAdd(bestPoint, vScale(normal, REFLECT_BIAS)), scene, base, stepsLeft - 1);
    const keep = 1 - reflectivity;
    return [
        color[0] * keep + bounced[0] * reflectivity,
        color[1] * keep + bounced[1] * reflectivity,
        color[2] * keep + bounced[2] * reflectivity,
        color[3]
    ];
};
const cast = (vector, scene, base) => {
    const miss = base || [
        Math.random(),
        Math.random(),
        Math.random(),
        1 - scene.camera.backgroundOpacity
    ];
    return traceRay(vector, scene.camera.origin, scene, miss, REFLECTION_STEPS);
};
const qDetInner = ([a, b, c, d]) => ({
    [a + b]: [a, b],
    [d + c]: [d, c],
    [d - c]: [d, c],
    [a - b]: [a, b]
});
console.log(qDetInner([1, Math.PI, Math.PI, Math.PI]));
const qAdd = ([a1, b1, c1, d1], [a2, b2, c2, d2]) => [a1 + a2, b1 + b2, c1 + c2, d1 + d2];
const qSub = ([a1, b1, c1, d1], [a2, b2, c2, d2]) => [a1 - a2, b1 - b2, c1 - c2, d1 - d2];
const qMul = ([a1, b1, c1, d1], [a2, b2, c2, d2]) => [
    a1 * a2 - b1 * b2 - c1 * c2 - d1 * d2,
    a1 * b2 + a2 * b1 + c1 * d2 - c2 * d1,
    a1 * c2 + a2 * c1 + d1 * b2 - d2 * b1,
    a1 * d2 + a2 * d1 + b1 * c2 - b2 * c1
];
const qScale = (s, [a, b, c, d]) => [s * a, s * b, s * c, s * d];
const qConjugate = ([a, b, c, d]) => [a, -b, -c, -d];
const qHamilton = ([a1, b1, c1, d1], [a2, b2, c2, d2]) => [
    a1 * a2 - b1 * b2 - c1 * c2 - d1 * d2,
    a1 * b2 + b1 * a2 + c1 * d2 - d1 * c2,
    a1 * c2 - b1 * d2 + c1 * a2 + d1 * b2,
    a1 * d2 + b1 * c2 - c1 * b2 + d1 * a2
];
const qDet = ([a, b, c, d]) => { }; //?
const qNorm = ([a, b, c, d]) => Math.sqrt(a * a + b * b + c * c + d * d);
const tagCam = (control, axis) => {
    const key = String(axis);
    control.input.dataset.cam = key;
    control.inputText.dataset.cam = key;
    return control;
};
const addPropertyControl = (el, getModifiedEl, getProperty, before, after, min = 1, max = 200, step = 1) => {
    const modifiedEl = getModifiedEl();
    const modifiedProperty = getProperty();
    const input = document.createElement('input');
    input.type = 'range';
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = modifiedEl !== undefined ? modifiedEl[modifiedProperty] : 10;
    const inputText = document.createElement('input');
    inputText.type = 'number';
    inputText.min = input.min;
    inputText.max = input.max;
    inputText.step = input.step;
    inputText.value = input.value;
    input.addEventListener('change', () => {
        const modifiedEl = getModifiedEl();
        const property = getProperty();
        const result = before ? before(modifiedEl) : undefined;
        inputText.value = input.value;
        modifiedEl[property] = parseFloat(input.value);
        after ? after(modifiedEl, result) : undefined;
    });
    inputText.addEventListener('change', () => {
        const modifiedEl = getModifiedEl();
        const property = getProperty();
        const result = before ? before(modifiedEl) : undefined;
        input.value = inputText.value;
        modifiedEl[property] = parseFloat(inputText.value);
        after ? after(modifiedEl, result) : undefined;
    });
    el.append(input);
    el.append(inputText);
    return { input, inputText };
};
const attachView = el => {
    const canvas = createCanvas(el);
    canvas.width = canvasParams.width;
    canvas.height = canvasParams.height;
    gpuPainter = createGpuPainter(canvas);
    if (gpuPainter)
        canvas.dataset.renderer = 'webgl2';
    else
        context = canvas.getContext('2d');
    el.append(canvas);
    const saveCanvasData = canvas => {
        const context = canvas.getContext('2d');
        return context.getImageData(0, 0, canvas.width, canvas.height);
    };
    const restoreCanvasData = (canvas, data) => {
        const context = canvas.getContext('2d');
        const lookup = {};
        for (let x = 0; x < data.width; x++) {
            for (let y = 0; y < data.height; y++) {
                const d = context.getImageData(x, y, 1, 1);
                const baseIndex = x * 4 + (y * data.width * 4);
                d.data[0] = data.data[baseIndex];
                d.data[1] = data.data[baseIndex + 1];
                d.data[2] = data.data[baseIndex + 2];
                d.data[3] = data.data[baseIndex + 3];
                context.putImageData(d, Math.round((x / data.width) * (context.canvas.width)), Math.round((y / data.height) * (context.canvas.height)));
            }
        }
    };
    const resizeBefore = gpuPainter ? undefined : saveCanvasData;
    const resizeAfter = gpuPainter ? undefined : restoreCanvasData;
    const { input } = addPropertyControl(el, () => canvas, () => 'width', resizeBefore, resizeAfter, 1, 1920);
    addPropertyControl(el, () => canvas, () => 'height', resizeBefore, resizeAfter, 1, 1920);
    addPropertyControl(el, () => viewParams, () => 'pointsPerRender', undefined, undefined, 1, 10000);
    addPropertyControl(el, () => scene.camera, () => 'fov');
    tagCam(addPropertyControl(el, () => scene.camera.origin, () => 0, undefined, undefined, -400, 400, 0.01), 0);
    tagCam(addPropertyControl(el, () => scene.camera.origin, () => 1, undefined, undefined, -400, 400, 0.01), 1);
    tagCam(addPropertyControl(el, () => scene.camera.origin, () => 2, undefined, undefined, -400, 400, 0.01), 2);
    addPropertyControl(el, () => scene.camera, () => 'backgroundOpacity', undefined, undefined, 0, 1, 0.01);
    const pauseButton = document.createElement('button');
    pauseButton.innerText = viewParams.running ? 'Pause' : 'Resume';
    pauseButton.addEventListener('click', () => {
        viewParams.running = !viewParams.running;
        if (viewParams.running) {
            pauseButton.innerText = 'Pause';
            animate();
        }
        else
            pauseButton.innerText = 'Resume';
    });
    el.append(pauseButton);
    const stateView = document.createElement('state-view');
    el.append(stateView);
    return { canvas, stateView, input };
};
let canvas;
let stateView;
let context;
let gpuPainter;
const render = (points, scene) => {
    const data = {};
    for (let i = 0; i < points; i++) {
        const x = Math.random();
        const y = Math.random();
        const vector = project(x, y, scene.camera);
        const colors = cast(vector, scene);
        data[x] = data[x] || {};
        data[x][y] = colors;
    }
    return data;
};
//const data = render(10000, scene);
let pixel;
const paint = (data, context) => {
    if (!pixel)
        pixel = new ImageData(1, 1);
    const maxX = context.canvas.width - 1;
    const maxY = context.canvas.height - 1;
    Object.keys(data).forEach(x => {
        const xData = data[x];
        Object.keys(xData).forEach(y => {
            const color = xData[y];
            pixel.data[0] = color[0] * 255;
            pixel.data[1] = color[1] * 255;
            pixel.data[2] = color[2] * 255;
            pixel.data[3] = color[3] * 255;
            context.putImageData(pixel, Math.round(parseFloat(x) * maxX), Math.round(parseFloat(y) * maxY));
        });
    });
};
let frame;
const MAX_SPHERES = 64;
const gpuSphereData = new Float32Array(MAX_SPHERES * 4);
const gpuColorData = new Float32Array(MAX_SPHERES * 4);
function createGpuPainter(canvas) {
    const gl = canvas.getContext('webgl2', {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: true
    });
    if (!gl)
        return null;
    const vert = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;
    // Same rays as project(), same quadratic as sphereRayIntersection(), closest hit wins.
    const fragSrc = `#version 300 es
precision highp float;
uniform vec3 uOrigin;
uniform vec4 uQ;
uniform float uFov;
uniform float uAspect;
uniform float uPlane;
uniform vec2 uRes;
uniform int uCount;
uniform sampler2D uSpheres;
uniform sampler2D uColors;
out vec4 fragColor;
vec3 rotateByQ(vec3 v, vec4 q) {
    float a = q.x;
    vec3 qv = q.yzw;
    return qv * (2.0 * dot(qv, v))
        + v * (a * a - dot(qv, qv))
        + cross(qv, v) * (2.0 * a);
}
void main() {
    float uu = gl_FragCoord.x / uRes.x;
    float vv = 1.0 - gl_FragCoord.y / uRes.y;
    float halfAngle = tan(uFov * 0.008726646259971648) * uPlane;
    vec3 rd = normalize(vec3((uu * 2.0 - 1.0) * uAspect * halfAngle, (1.0 - vv * 2.0) * halfAngle, uPlane));
    rd = rotateByQ(rd, uQ);
    vec3 ro = uOrigin;
    vec3 accum = vec3(0.0);
    float thru = 1.0;
    for (int bounce = 0; bounce < 5; bounce++) {
        float bestT = 1.0e30;
        vec3 hitP = ro;
        vec3 hitC = ro;
        vec3 hitRgb = vec3(0.0);
        float hitRef = 0.0;
        bool found = false;
        for (int i = 0; i < ${MAX_SPHERES}; i++) {
            if (i >= uCount)
                break;
            vec4 sphere = texelFetch(uSpheres, ivec2(i, 0), 0);
            vec3 oc = sphere.xyz - ro;
            float a = dot(rd, rd);
            float b = dot(rd, oc);
            float c = dot(oc, oc) - sphere.w * sphere.w;
            float delta = b * b - a * c;
            if (a == 0.0 || delta < 0.0)
                continue;
            float root = sqrt(delta);
            float t = (b - root) / a;
            if (t < 0.0)
                t = (b + root) / a;
            if (t < 0.0)
                continue;
            vec3 at = ro + rd * t;
            float dist = length(at - ro);
            if (dist < 0.02 || dist >= bestT)
                continue;
            bestT = dist;
            hitP = at;
            hitC = sphere.xyz;
            vec4 col = texelFetch(uColors, ivec2(i, 0), 0);
            hitRgb = col.rgb;
            hitRef = col.a;
            found = true;
        }
        if (!found)
            break;
        float mirror = bounce == 4 ? 0.0 : clamp(hitRef, 0.0, 1.0);
        accum += thru * hitRgb * (1.0 - mirror);
        thru *= mirror;
        if (thru <= 0.0)
            break;
        vec3 n = normalize(hitP - hitC);
        rd = normalize(reflect(rd, n));
        ro = hitP + n * 0.05;
    }
    fragColor = vec4(accum, 1.0);
}`;
    const compile = (type, src) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    };
    const vs = compile(gl.VERTEX_SHADER, vert);
    const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs)
        return null;
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.bindAttribLocation(program, 0, 'aPos');
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return null;
    }
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const sphereTex = gl.createTexture();
    const colorTex = gl.createTexture();
    const alloc = (tex, unit) => {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, MAX_SPHERES, 1, 0, gl.RGBA, gl.FLOAT, null);
    };
    alloc(sphereTex, 0);
    alloc(colorTex, 1);
    const loc = name => gl.getUniformLocation(program, name);
    const uOrigin = loc('uOrigin');
    const uQ = loc('uQ');
    const uFov = loc('uFov');
    const uAspect = loc('uAspect');
    const uPlane = loc('uPlane');
    const uRes = loc('uRes');
    const uCount = loc('uCount');
    gl.useProgram(program);
    gl.uniform1i(loc('uSpheres'), 0);
    gl.uniform1i(loc('uColors'), 1);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    return {
        gl,
        paint(scene) {
            const objects = scene.objects;
            const count = Math.min(objects.length, MAX_SPHERES);
            for (let i = 0; i < count; i++) {
                const sphere = objects[i][1];
                const o = sphere.origin;
                const color = sphere.color;
                gpuSphereData[i * 4] = o[0];
                gpuSphereData[i * 4 + 1] = o[1];
                gpuSphereData[i * 4 + 2] = o[2];
                gpuSphereData[i * 4 + 3] = sphere.radius;
                gpuColorData[i * 4] = color[0];
                gpuColorData[i * 4 + 1] = color[1];
                gpuColorData[i * 4 + 2] = color[2];
                gpuColorData[i * 4 + 3] = sphere.reflectivity || 0;
            }
            const q = qFromUnitVectors([0, 0, 1], vUnit(scene.camera.dir));
            gl.useProgram(program);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, sphereTex);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, MAX_SPHERES, 1, gl.RGBA, gl.FLOAT, gpuSphereData);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, colorTex);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, MAX_SPHERES, 1, gl.RGBA, gl.FLOAT, gpuColorData);
            gl.uniform3f(uOrigin, scene.camera.origin[0], scene.camera.origin[1], scene.camera.origin[2]);
            gl.uniform4f(uQ, q[0], q[1], q[2], q[3]);
            gl.uniform1f(uFov, scene.camera.fov);
            gl.uniform1f(uAspect, scene.camera.aspect);
            gl.uniform1f(uPlane, scene.camera.planeDistance);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.uniform1i(uCount, count);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            return true;
        }
    };
}
const paintFrame = (scene, context) => {
    if (gpuPainter && gpuPainter.paint(scene))
        return;
    const w = context.canvas.width;
    const h = context.canvas.height;
    if (!frame || frame.width !== w || frame.height !== h)
        frame = new ImageData(w, h);
    const data = frame.data;
    const miss = [0, 0, 0, 1];
    let i = 0;
    for (let y = 0; y < h; y++) {
        const v = (y + 0.5) / h;
        for (let x = 0; x < w; x++) {
            const u = (x + 0.5) / w;
            const color = cast(project(u, v, scene.camera), scene, miss);
            data[i++] = color[0] * 255;
            data[i++] = color[1] * 255;
            data[i++] = color[2] * 255;
            data[i++] = color[3] * 255;
        }
    }
    context.putImageData(frame, 0, 0);
};
let tps = 5;
let lastTick = new Date().getTime();
let currentTick = 0;
let started = false;
let paintedCam = '';
let raf = 0;
const animate = () => {
    try {
        if (!started)
            start();
        if (scene.runSim) {
            const now = new Date().getTime();
            const d = now - lastTick;
            if (d > (1000 / tps)) {
                tickScene(scene, d, currentTick);
                lastTick = now;
                currentTick++;
            }
            scene.runner();
        }
        syncSceneObjects(scene);
        paintFrame(scene, context);
        if (viewParams.running)
            raf = requestAnimationFrame(animate);
        const universe = scene.simState.universe;
        stateView.innerText = JSON.stringify({
            cam: scene.camera.origin.map(v => Math.round(v)),
            bodies: universe.map(m => [Math.round(m.size), m.position.map(v => Math.round(v))])
        });
    }
    catch (err) {
        viewParams.running = false;
        if (stateView)
            stateView.innerText = String(err && err.stack || err);
    }
};
function start() {
    started = true;
    scene.simState = window.createSim();
    frameCamera(scene);
    syncSceneObjects(scene);
    scene.runner = window.createRunner(scene.simState, new Clock(scene.simState), 1000 / 5, 1);
}
function syncSceneObjects(scene) {
    const universe = scene.simState && scene.simState.universe;
    if (!universe)
        return;
    const objects = [];
    for (let i = 0; i < universe.length; i++) {
        const mass = universe[i];
        const c = mass.color;
        objects.push(['sphere', {
            radius: mass.size,
            origin: mass.position,
            color: [c[0] / 255, c[1] / 255, c[2] / 255, c[3] > 1 ? c[3] / 255 : c[3]],
            reflectivity: mass.reflectivity || 0
        }]);
    }
    scene.objects = objects;
}
function frameCamera(scene) {
    const universe = scene.simState.universe;
    const sun = universe[0];
    const host = universe.length > 3 ? universe[3] : sun;
    const half = Math.tan((scene.camera.fov * Math.PI / 180) / 2);
    const span = half * scene.camera.aspect;
    const x = host.position[0] * 0.55;
    // Far enough that the sun and the outer planet both stay inside the frame.
    const z = -Math.max(sun.size * 1.5, Math.abs(x) / (span * 0.78), Math.abs(host.position[0] - x) / (span * 0.72));
    scene.camera.origin = [x, 8, z];
    scene.camera.dir = [0, 0, 1];
    syncCameraInputs();
}
function syncCameraInputs() {
    const origin = scene.camera.origin;
    for (let axis = 0; axis < 3; axis++) {
        const v = String(Math.round(origin[axis] * 100) / 100);
        document.querySelectorAll('[data-cam="' + axis + '"]').forEach(el => {
            el.value = v;
        });
    }
}
window.createSim = () => {
    const sun = new Mass(1000000, [255, 210, 40, 255]);
    sun.reflectivity = 0.45;
    const G = 6.67408e-7;
    const bodies = [sun];
    const orbits = [
        [sun.size + 50, 10, [70, 130, 255, 255], 0.35],
        [sun.size + 110, 14, [220, 80, 50, 255], 0.55],
        [sun.size + 260, 12, [230, 230, 235, 255], 0.8]
    ];
    for (let i = 0; i < orbits.length; i++) {
        const [distance, radius, color, reflectivity] = orbits[i];
        const mass = (4 / 3) * Math.PI * radius * radius * radius;
        const speed = Math.sqrt(G * sun.mass / distance);
        const body = new Mass(mass, color, [distance, 0, 0], [0, speed, 0]);
        body.reflectivity = reflectivity;
        bodies.push(body);
    }
    // Moon of the outer planet. A uniform-density planet this close to the sun
    // fills its own hill sphere, so the host is denser than it looks.
    const host = bodies[3];
    const hostRadius = host.size;
    const hostMass = 50000;
    const hostDistance = host.position[0];
    const vRel = Math.sqrt(G * (sun.mass + hostMass) / hostDistance);
    host.velocity[1] = vRel * sun.mass / (sun.mass + hostMass);
    sun.velocity[1] = -vRel * hostMass / (sun.mass + hostMass);
    host.mass = hostMass;
    host._sizeContainer[0] = hostRadius;
    const moonRadius = 6;
    const moonMass = (4 / 3) * Math.PI * moonRadius * moonRadius * moonRadius;
    const moonDist = 28;
    const moonSpeed = Math.sqrt(G * host.mass / moonDist);
    bodies.push(new Mass(moonMass, [150, 230, 255, 255], [host.position[0] + moonDist, host.position[1], 0], [0, host.velocity[1] + moonSpeed, 0]));
    bodies[bodies.length - 1].reflectivity = 0.6;
    const state = createUniverse(bodies);
    // v is distance per sim-step and G is tiny, so 1 step/second barely crawls.
    // 900 puts the inner orbit at about 8 seconds.
    state.stepsPerSecond = 900;
    return state;
};
window.createRunner = (state, clock = new Clock(state), maxRunTime = 1000 / 30, GUIUpdateRate = 100) => {
    const { startTime } = clock, { events, inputEvents, playback } = state;
    let currentTick = 0, lastGUIUpdate = 0, currentTime;
    return playback ? runnerWithPlayback(playback) : runner;
    function runner(runTime = clock.currentTime) {
        const t = clock.ticksTo(runTime);
        while (currentTick < t && ((currentTime = clock.currentTime) - runTime) < maxRunTime) {
            handleEvents(state);
            tick(state);
            currentTick++;
        }
        centerOn(state.currentCameraTarget, state.universe);
    }
    function runnerWithPlayback(playback) {
        let event = playback.shift();
        return (runTime = clock.currentTime) => {
            const t = clock.ticksTo(runTime);
            while (currentTick < t && ((currentTime = clock.currentTime) - runTime) < maxRunTime) {
                if (event && currentTick === event[0]) {
                    state.inputEvents = state.inputEvents.concat(event[1]);
                    event = playback.shift();
                }
                handleEvents(state);
                tick(state);
                currentTick++;
            }
            centerOn(state.currentCameraTarget, state.universe);
        };
    }
    function handleEvents(state) {
        const { eventLog, events, inputEvents } = state;
        if (events.length === 0 && inputEvents.length === 0)
            return;
        if (inputEvents.length !== 0)
            eventLog.push([currentTick, inputEvents.slice()]);
        for (let i = 0; i < inputEvents.length; i++) {
            const event = inputEvents[i];
            (eevents[event[0]] || defaultHandler(event))(event, state, clock, currentTick, currentTime);
        }
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            (eevents[event[0]] || defaultHandler(event))(event, state, clock, currentTick, currentTime);
        }
        inputEvents.splice(0);
        events.splice(0);
    }
    function centerOn(mass, universe) {
        if (!mass)
            return;
        const tp = mass.position.slice();
        for (let i = 0; i < universe.length; i++) {
            const { position: p } = universe[i];
            sub(p, p, tp);
        }
    }
    function defaultHandler(event) {
        console.log(`No eevents ${event[0]}!`);
        return emptyFn;
    }
    function emptyFn() { }
};
function createUniverse(existingMasses) {
    const universe = [...existingMasses], events = [], inputEvents = [], uievents = [], massPool = new Array(100);
    for (let i = 0; i < massPool.length; i++)
        massPool[i] = new Mass();
    const [positions, velocities, accelerations, gravities, masses, sizes, colors] = map(universe, ['position', 'velocity', 'acceleration', 'gravity', 'mass', 'size', 'color']);
    function map(list, properties) {
        return properties.map(p => list.map(item => item[p]));
    }
    return {
        universe,
        inputEvents,
        events,
        eevents,
        uievents,
        uuievents,
        massPool,
        positions,
        velocities,
        accelerations,
        gravities,
        masses,
        sizes,
        colors,
        currentCameraTarget: universe[0],
        currentTick: 0,
        collisionList: [],
        tick,
        ticksPerStep: 60,
        stepsPerSecond: 1,
        gravityConstant: 6.67408e-7,
        speedlimit: 300000,
        fieldOfView: 120,
        maximumMasses: 200,
        positionHistory: 0,
        eventLog: []
    };
}
function addMass(newMass, { universe, positions, velocities, accelerations, gravities, masses, sizes, colors, uievents, currentTick, maximumMasses }) {
    if (universe.length >= maximumMasses) {
        uievents.push(['tooManyMasses']);
        return undefined;
    }
    const { position, velocity, acceleration, gravity, mass, size, color } = newMass;
    newMass.created = currentTick;
    universe.push(newMass);
    positions.push(position);
    velocities.push(velocity);
    accelerations.push(acceleration);
    gravities.push(gravity);
    masses.push(mass);
    sizes.push(size);
    colors.push(color);
    uievents.push(['newmass']);
    return newMass;
}
function newMass([_, { position: p, velocity: v, mass, color }], state) {
    const { position: tp, velocity: tv } = state.universe[0] || { position: [0, 0, 0], velocity: [0, 0, 0] }, newMass = addMass(getNewMass(state, mass, color.slice(), [tp[0] + p[0], tp[1] + p[1], tp[2] + p[2]], [tv[0] + v[0], tv[1] + v[1], tv[2] + v[2]]), state);
    setStat('masses', state.universe.length);
}
function getNewMass({ massPool }, mass, color, position, velocity) {
    if (massPool.length > 0) {
        const m = massPool.pop();
        m.delayCreate(mass, color, position, velocity);
        return m;
    }
    else
        return new Mass(mass, color, position, velocity);
}
function absorbed(event, { uievents }) {
    uievents.push(event);
}
function poof([_, mass], state) {
    const { universe, positions, velocities, accelerations, gravities, masses, sizes, colors } = state;
    const index = universe.indexOf(mass);
    if (index < 0)
        return;
    universe.splice(index, 1);
    positions.splice(index, 1);
    velocities.splice(index, 1);
    accelerations.splice(index, 1);
    gravities.splice(index, 1);
    masses.splice(index, 1);
    sizes.splice(index, 1);
    colors.splice(index, 1);
    if (mass === state.currentCameraTarget)
        state.currentCameraTarget = getGreatestMass(state);
}
function tick(state) {
    state.currentTick++;
    positionHalfTick(state);
    updateGravities(state);
    updateVelocities(state);
    resolveCollisions(state);
    function positionHalfTick({ universe, ticksPerStep }) {
        for (let i = 0; i < universe.length; i++) {
            const mass = universe[i];
            mass.positionHalfTick(ticksPerStep);
            set(mass.gravity, 0, 0, 0);
        }
    }
    function updateGravities({ universe, collisionList, ticksPerStep, gravityConstant, speedlimit }) {
        for (let i = 0; i < universe.length; i++)
            updatePairs(i, universe, collisionList, ticksPerStep, gravityConstant, speedlimit);
    }
    function updatePairs(i, universe, collisionList, ticksPerStep, gravityConstant, speedlimit) {
        const { position: p1, velocity: v1, acceleration: a1, gravity: g1, mass: m1, collisionSize: s1, collisions } = universe[i];
        for (let j = i + 1; j < universe.length; j++)
            updatePair(p1, v1, a1, g1, m1, s1, i, j, collisions, collisionList, universe, ticksPerStep, gravityConstant, speedlimit); //
        if (collisions.length > 0) {
            for (let k = 0; k < collisions.length; k++)
                collisionList.push(collisions[k]);
            collisions.splice(0);
        }
        // F = ma ... a = F/m
        div(g1, g1, m1);
    }
    function updatePair(p1, v1, a1, g1, m1, s1, i, j, collisions, collisionList, universe, ticksPerStep, gravityConstant, speedlimit) {
        const { position: p2, velocity: v2, acceleration: a2, mass: m2, collisionSize: s2, gravity: g2 } = universe[j];
        sub(dd, p1, p2);
        const distance = magnitude(dd), t = -distance / (speedlimit * speedlimit), o = t / ticksPerStep;
        updatePositionAndGravity(o, a1, a2, v1, v2, p1, p2, g1, g2, m1 * m2 * gravityConstant);
        handleCollision(s1, s2, m1, m2, distance, i, j, collisionList, collisions, universe);
    }
    function updatePositionAndGravity(o, a1, a2, v1, v2, p1, p2, g1, g2, gravityScalar) {
        updatePosition(oldp1, o, a1, v1, p1);
        updatePosition(oldp2, o, a2, v2, p2);
        sub(pv1, oldp1, p2);
        sub(pv2, oldp2, p1);
        const d1 = dot(pv1, pv1), d2 = dot(pv2, pv2);
        updateGravity(d1, pv1, g2, gravityScalar);
        updateGravity(d2, pv2, g1, gravityScalar);
    }
    function updatePosition(oldp, o, a, v, p) {
        // p + (v + 0.5 * a * o) * o
        // The old expression added v twice, and every step shared `dd`.
        scale(dd, a, o);
        scale(dd, dd, 0.5);
        add(dd, v, dd);
        scale(dd, dd, o);
        return add(oldp, p, dd);
    }
    function updateGravity(d, pv, g, gravityScalar) {
        // d = |pv|^2. Newtonian acceleration uses r^3 = d * sqrt(d), not d.
        if (d > 0)
            add(g, g, scale(dd, pv, gravityScalar / (d * Math.sqrt(d))));
    }
    function handleCollision(s1, s2, m1, m2, distance, i, j, collisionList, collisions, universe) {
        const threshold = s1 + s2;
        if (distance < threshold) {
            // Always queue on the outer body. Pushing onto j's list never
            // flushed, because pairs are only visited with i < j.
            if (m1 <= m2)
                collisions.push([universe[i], universe[j], i, j]);
            else
                collisions.push([universe[j], universe[i], j, i]);
        }
    }
    function updateVelocities({ universe, ticksPerStep }) {
        universe.forEach(mass => updateMassVelocityAndPartialPosition(mass, ticksPerStep));
    }
    function updateMassVelocityAndPartialPosition(mass, ticksPerStep) {
        mass.velocityTick(ticksPerStep);
        mass.positionHalfTick(ticksPerStep);
    }
    function resolveCollisions(state) {
        const { universe, positions, velocities, accelerations, gravities, masses, sizes, colors, events, collisionList, currentCameraTarget } = state;
        const absorbed = new Set();
        for (let i = 0; i < collisionList.length; i++) {
            const [smallerMass, greaterMass] = collisionList[i];
            if (!smallerMass || !greaterMass)
                continue;
            if (absorbed.has(smallerMass) || absorbed.has(greaterMass))
                continue;
            if (universe.indexOf(smallerMass) < 0 || universe.indexOf(greaterMass) < 0)
                continue;
            const m1 = greaterMass.mass;
            const m2 = smallerMass.mass;
            const total = m1 + m2;
            if (!(total > 0))
                continue;
            const factor = m1 / total;
            const ratio = m2 / total;
            const mix = scale([0, 0, 0], smallerMass.color, ratio);
            scale(greaterMass.color, greaterMass.color, factor);
            add(greaterMass.color, greaterMass.color, mix);
            scale(greaterMass.velocity, greaterMass.velocity, m1);
            scale(dd, smallerMass.velocity, m2);
            add(greaterMass.velocity, greaterMass.velocity, dd);
            div(greaterMass.velocity, greaterMass.velocity, total);
            greaterMass.mass = total;
            const gi = universe.indexOf(greaterMass);
            if (gi >= 0) {
                masses[gi] = greaterMass.mass;
                sizes[gi] = greaterMass.size;
            }
            absorbed.add(smallerMass);
        }
        const removals = [];
        absorbed.forEach(smallerMass => {
            const smallerIndex = universe.indexOf(smallerMass);
            if (smallerIndex >= 0)
                removals.push([smallerMass, smallerIndex]);
        });
        removals.sort((a, b) => b[1] - a[1]);
        for (let i = 0; i < removals.length; i++) {
            const [smallerMass, smallerIndex] = removals[i];
            const greaterMass = collisionList.find(pair => pair[0] === smallerMass)?.[1];
            incrementStat(smallerMass.constructor.name, 'absorbedBy', greaterMass ? greaterMass.constructor.name : 'Mass');
            events.push(['absorbed', smallerMass, greaterMass]);
            universe.splice(smallerIndex, 1);
            positions.splice(smallerIndex, 1);
            velocities.splice(smallerIndex, 1);
            accelerations.splice(smallerIndex, 1);
            gravities.splice(smallerIndex, 1);
            masses.splice(smallerIndex, 1);
            sizes.splice(smallerIndex, 1);
            colors.splice(smallerIndex, 1);
            if (smallerMass === currentCameraTarget)
                state.currentCameraTarget = getGreatestMass(state);
        }
        collisionList.splice(0);
    }
}
function getGreatestMass(state) {
    const { universe } = state;
    let max = 0, maxMass;
    for (let i = 0; i < universe.length; i++) {
        const mass = universe[i];
        if (mass.mass > max) {
            max = mass.mass;
            maxMass = mass;
        }
    }
    return maxMass;
}
const eevents = {
    // external
    'newmass': newMass,
    // internal
    'absorbed': absorbed,
    'poof': poof,
    'gravityConstant': ([_, gravityConstant], state) => state.gravityConstant = gravityConstant,
    'speedlimit': ([_, speedlimit], state) => state.speedlimit = speedlimit,
    'ticksPerStep': ([_, ticksPerStep], state, clock, currentTick, currentTime) => {
        state.ticksPerStep = ticksPerStep;
        clock.setNewStartTime(currentTime, currentTick);
    },
    'stepsPerSecond': ([_, stepsPerSecond], state, clock, currentTick, currentTime) => {
        state.stepsPerSecond = stepsPerSecond;
        clock.setNewStartTime(currentTime, currentTick);
    },
    'maximumMasses': ([_, maximumMasses], state) => {
        state.maximumMasses = maximumMasses;
        const { universe, uievents } = state;
        if (universe.length > maximumMasses) {
            const over = universe.length - maximumMasses, index = universe.length - over, { positions, velocities, accelerations, gravities, masses, sizes, colors } = state;
            universe.splice(index, over);
            positions.splice(index, over);
            velocities.splice(index, over);
            accelerations.splice(index, over);
            gravities.splice(index, over);
            masses.splice(index, over);
            sizes.splice(index, over);
            colors.splice(index, over);
        }
        uievents.push(['maximumMasses']);
    },
    'fov': ([_, fov], state) => state.fieldOfView = fov,
    'positionHistory': ([_, positionHistory], state) => state.positionHistory = positionHistory,
    nextCameraTarget: (_, state) => {
        const { universe, currentCameraTarget } = state, { length } = universe, index = (universe.indexOf(currentCameraTarget) + 1) % length;
        state.currentCameraTarget = universe[index];
        console.log('current target', state.currentCameraTarget);
    },
    prevCameraTarget: (_, state) => {
        const { universe, currentCameraTarget } = state, { length } = universe, index = universe.indexOf(currentCameraTarget);
        state.currentCameraTarget = universe[(index === 0 ? length : index) - 1];
        console.log('current target', state.currentCameraTarget, index);
    },
    targetGreatestMass: (_, state) => state.currentCameraTarget = getGreatestMass(state)
};
const uuievents = {
    // 'connected': () => noticeEl.classList.add('connected'),
    // 'tweet': event => trumpTweetEl.classList.remove('show'),
    // 'absorbed': event => absorbedEl.classList.remove('show'),
    // 'absorbedBy': event => absorbedByEl.classList.remove('show'),
    // 'poof': event => poofEl.classList.remove('show'),
    'newmass': (event, view, { positions, colors, sizes }) => {
        // view.select('#positions').set('width', positions.length);
        // view.select('#colors').set('width', colors.length);
        // view.select('#sizes').set('width', sizes.length);
    },
    'maximumMasses': (event, view, { maximumMasses }) => {
        // view.select('#positions').set('width', maximumMasses);
        // view.select('#colors').set('width', maximumMasses);
        // view.select('#sizes').set('width', maximumMasses);
    },
    'tooManyMasses': (event, view, state, renderUI) => {
        state.tooManyMasses = true;
        // renderUI();
    },
    'log': ([log, ...args]) => console.log('log', ...args)
};
class Mass {
    constructor(mass, color = [255, 255, 255, 255], position = [0, 0, 0], velocity = [0, 0, 0], acceleration = [0, 0, 0], gravity = [0, 0, 0]) {
        this._sizeContainer = [];
        this.mass = mass;
        this.color = color;
        this.position = position;
        this.velocity = velocity;
        this.acceleration = acceleration;
        this.gravity = gravity;
        this.collisions = [];
    }
    delayCreate(mass, color, position, velocity) {
        this.mass = mass;
        this.color[0] = color[0];
        this.color[1] = color[1];
        this.color[2] = color[2];
        this.color[3] = color[3];
        this.position[0] = position[0];
        this.position[1] = position[1];
        this.position[2] = position[2];
        this.velocity[0] = velocity[0];
        this.velocity[1] = velocity[1];
        this.velocity[2] = velocity[2];
        this.acceleration[0] = 0;
        this.acceleration[1] = 0;
        this.acceleration[2] = 0;
        this.gravity[0] = 0;
        this.gravity[1] = 0;
        this.gravity[2] = 0;
        this.collisions.splice(0);
    }
    set mass(value) { this._mass = value; this._sizeContainer[0] = Math.pow((3 / (4 * Math.PI)) * value, 1 / 3); }
    get mass() { return this._mass; }
    get name() { return 'Mass'; }
    get size() { return this._sizeContainer[0]; }
    get collisionSize() { return this.size; }
    // get size() { return this.mass; }
    // get size() { return 800 * Math.log2(this.mass + 1); }
    positionHalfTick(ticksPerStep) {
        const { position: p, velocity: v } = this;
        add(p, p, div(dd, div(dd, v, ticksPerStep), 2));
    }
    velocityTick(ticksPerStep) {
        const { velocity: v, acceleration: a, gravity: g } = this;
        add(v, v, div(dd, add(dd, a, g), ticksPerStep));
    }
}
class Clock {
    constructor(state) {
        this.state = state;
        this.startTime = this.currentTime;
        this.currentTick = state.currentTick;
    }
    get currentTime() { return new Date().getTime(); }
    ticksTo(time) {
        return this.ticksFor(time - this.startTime) + this.currentTick;
    }
    ticksFor(dt) {
        return Math.floor((dt / 1000) * this.state.ticksPerStep * this.state.stepsPerSecond);
    }
    setNewStartTime(startTime, currentTick) {
        this.startTime = startTime;
        this.currentTick = currentTick;
    }
}
const stats = { totalSouls: 0 };
function incrementStat(target, relation, object) {
    stats[target] = stats[target] || {};
    stats[target][relation] = stats[target][relation] || {};
    return (stats[target][relation][object] = (stats[target][relation][object] || 0) + 1);
}
function setStat(target, value) {
    stats[target] = value;
}
function newv(s) {
    return copy([0, 0, 0], s);
}
function set(r, x, y, z) {
    r[0] = x;
    r[1] = y;
    r[2] = z;
    return r;
}
function copy(r, s) {
    r[0] = s[0];
    r[1] = s[1];
    r[2] = s[2];
    return r;
}
function add(r, u, v) {
    r[0] = u[0] + v[0];
    r[1] = u[1] + v[1];
    r[2] = u[2] + v[2];
    return r;
}
function sub(r, u, v) {
    r[0] = u[0] - v[0];
    r[1] = u[1] - v[1];
    r[2] = u[2] - v[2];
    return r;
}
function scale(r, v, s) {
    r[0] = v[0] * s;
    r[1] = v[1] * s;
    r[2] = v[2] * s;
    return r;
}
function div(r, v, d) {
    if (d === 0)
        return copy(r, v);
    r[0] = v[0] / d;
    r[1] = v[1] / d;
    r[2] = v[2] / d;
    return r;
}
function cross(r, u, v) {
    r[0] = u[1] * v[2] - u[2] * v[1];
    r[1] = u[2] * v[0] - u[0] * v[2];
    r[2] = u[0] * v[1] - u[1] * v[0];
    return r;
}
function dot(u, v) {
    return u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
}
function magnitude(v) {
    return Math.sqrt(v[0] * v[0] +
        v[1] * v[1] +
        v[2] * v[2]);
}
function normalize(r, v) {
    return div(r, v, magnitude(v));
}
// http://lolengine.net/blog/2013/09/18/beautiful-maths-quaternion-from-vectors
// http://web.archive.org/web/20161105145605/http://lolengine.net/blog/2014/02/24/quaternion-from-two-vectors-final
function orthogonalQuaternion(u) {
    // 180° when u and v are opposite. The old branches read `q` and `dd` before either existed.
    if (Math.abs(u[0]) > Math.abs(u[2]))
        return qunit([0, 0, 0, 0], [0, -u[1], u[0], 0]);
    return qunit([0, 0, 0, 0], [0, 0, -u[2], u[1]]);
}
function qFromVectors(u, v) {
    const n = Math.sqrt(dot(u, u) * dot(v, v));
    const real = n + dot(u, v);
    if (n === 0)
        return [1, 0, 0, 0];
    if (real < 1e-6 * n)
        return orthogonalQuaternion(u);
    cross(dd, u, v);
    const q = [real, dd[0], dd[1], dd[2]];
    return qunit(q, q);
}
function qFromVectors2(u, v) {
    return qFromVectors(u, v);
}
function qFromUnitVectors(u, v) {
    const real = 1 + dot(u, v);
    if (real < 1e-6)
        return orthogonalQuaternion(u);
    cross(dd, u, v);
    const q = [real, dd[0], dd[1], dd[2]];
    return qunit(q, q);
}
function qFromUnitVectors2(u, v) {
    return qFromUnitVectors(u, v);
}
//http://mathworld.wolfram.com/Quaternion.html
function qmult(r, q1, q2) {
    const v1 = [q1[1], q1[2], q1[3]], v2 = [q2[1], q2[2], q2[3]];
    const s1 = scale([0, 0, 0], v2, q1[0]);
    const s2 = scale([0, 0, 0], v1, q2[0]);
    const cx = v1[1] * v2[2] - v1[2] * v2[1];
    const cy = v1[2] * v2[0] - v1[0] * v2[2];
    const cz = v1[0] * v2[1] - v1[1] * v2[0];
    const vx = s1[0] + s2[0] + cx;
    const vy = s1[1] + s2[1] + cy;
    const vz = s1[2] + s2[2] + cz;
    const rw = q1[0] * q2[0] - (v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]);
    r[0] = rw;
    r[1] = vx;
    r[2] = vy;
    r[3] = vz;
    return r;
}
function qconj(r, q) {
    r[0] = q[0];
    r[1] = -q[1];
    r[2] = -q[2];
    r[3] = -q[3];
    return r;
}
// don't call with d = 0
function qdiv(r, q, d) {
    r[0] = q[0] / d;
    r[1] = q[1] / d;
    r[2] = q[2] / d;
    r[3] = q[3] / d;
    return r;
}
function qnorm(q) {
    return Math.sqrt(q[0] * q[0] +
        q[1] * q[1] +
        q[2] * q[2] +
        q[3] * q[3]);
}
// assumes unit q?
// function qinv(r, q) {
//   const s = 1 / (q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);
//   r[0] = q[0] * s
//   r[1] = -q[1] * s
//   r[2] = -q[2] * s
//   r[3] = -q[3] * s
//   return r;
// }
function qinv(r, q) {
    const n = qnorm(q);
    return qdiv(r, qconj(r, q), n * n);
}
function qunit(r, q) {
    return qdiv(r, q, qnorm(q));
}
const pv1 = [0, 0, 0], pv2 = [0, 0, 0], oldp1 = [0, 0, 0], oldp2 = [0, 0, 0], dd = [0, 0, 0];

let wired = false;
export function boot(root) {
    const el = root || document.getElementsByTagName('root')[0];
    if (!el)
        return;
    cancelAnimationFrame(raf);
    if (!wired) {
        wired = true;
        document.addEventListener('wheel', event => {
            if (event.deltaY > 0)
                scene.camera.moveOut = true;
            else if (event.deltaY < 0)
                scene.camera.moveIn = true;
            if (wheelTimeout)
                clearTimeout(wheelTimeout);
            // 30ms died before the 5 Hz tick, so the wheel never moved the camera.
            wheelTimeout = setTimeout(() => {
                scene.camera.moveOut = false;
                scene.camera.moveIn = false;
            }, Math.max(wheelTimeoutLength, 1000 / tps));
        });
        document.addEventListener('keydown', setBinaryKeys(true));
        document.addEventListener('keyup', setBinaryKeys(false));
    }
    // Dev strict-mode mounts twice. The first call can attach to a node that
    // is immediately replaced, so bind the view to whichever root is current.
    if (el.querySelector('canvas'))
        return;
    const view = attachView(el);
    canvas = view.canvas;
    stateView = view.stateView;
    if (!gpuPainter) {
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        context = ctx;
        context.imageSmoothingEnabled = false;
        const legacy = /** @type {any} */ (ctx);
        legacy.mozImageSmoothingEnabled = false;
        legacy.webkitImageSmoothingEnabled = false;
    }
    paintedCam = '';
    viewParams.running = true;
    const button = el.querySelector('button');
    if (button)
        button.innerText = 'Pause';
    animate();
}
