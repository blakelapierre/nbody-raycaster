// @ts-nocheck
"use strict";
const canvasParams = {
    width: 960,
    height: 540
};
const viewParams = {
    pointsPerRender: 2000000,
    running: false,
    timeScale: 1,
    savedScale: 1,
    preset: 'system'
};
const resCap = { width: 3840, height: 2160 };
const adaptive = {
    rays: 4000,
    level: 4,
    samples: 0,
    interval: 1000 / 60,
    refresh: 1000 / 60,
    lastStamp: 0,
    key: '',
    wantClimb: false,
    forceDown: false,
    blocked: -1,
    slowLevel: -1,
    frames: 0
};
const rayUVs = new Float32Array(200000 * 2);
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
const shapeHit = (shape, ro, rd) => {
    const kind = shape.kind;
    if (kind === 'plane')
        return rayPlane(ro, rd, shape.a, shape.b);
    if (kind === 'disk')
        return rayDisk(ro, rd, shape.a, shape.b, shape.r);
    if (kind === 'box')
        return rayBox(ro, rd, shape.a, shape.b);
    if (kind === 'capsule')
        return rayRound(ro, rd, shape.a, shape.b, shape.r, false);
    if (kind === 'cylinder')
        return rayRound(ro, rd, shape.a, shape.b, shape.r, true);
    if (kind === 'triangle')
        return rayTri(ro, rd, shape.a, shape.b, shape.c);
};
const rayPlane = (ro, rd, point, normal) => {
    const denom = vDot(rd, normal);
    if (Math.abs(denom) < 1e-6)
        return;
    const t = vDot(vDifference(ro, point), normal) / denom;
    if (t < 0.02)
        return;
    return { t, at: vAdd(ro, vScale(rd, t)), n: denom > 0 ? vScale(normal, -1) : normal.slice() };
};
const rayDisk = (ro, rd, center, normal, radius) => {
    const hit = rayPlane(ro, rd, center, normal);
    if (!hit)
        return;
    const d = vDifference(center, hit.at);
    if (vDot(d, d) > radius * radius)
        return;
    return hit;
};
const rayBox = (ro, rd, center, half) => {
    let tmin = -1e30, tmax = 1e30, axis = 0, sign = 1;
    for (let a = 0; a < 3; a++) {
        if (Math.abs(rd[a]) < 1e-8) {
            if (ro[a] < center[a] - half[a] || ro[a] > center[a] + half[a])
                return;
            continue;
        }
        const inv = 1 / rd[a];
        let t1 = (center[a] - half[a] - ro[a]) * inv;
        let t2 = (center[a] + half[a] - ro[a]) * inv;
        let s1 = -1;
        if (t1 > t2) {
            const swap = t1;
            t1 = t2;
            t2 = swap;
            s1 = 1;
        }
        if (t1 > tmin) {
            tmin = t1;
            axis = a;
            sign = s1;
        }
        if (t2 < tmax)
            tmax = t2;
        if (tmax < tmin)
            return;
    }
    const t = tmin > 0.02 ? tmin : tmax;
    if (t < 0.02)
        return;
    const n = [0, 0, 0];
    n[axis] = sign;
    if (vDot(n, rd) > 0)
        n[axis] = -n[axis];
    return { t, at: vAdd(ro, vScale(rd, t)), n };
};
const rayRound = (ro, rd, pa, pb, ra, capped) => {
    const ba = vDifference(pa, pb);
    const oc = vDifference(pa, ro);
    const baba = vDot(ba, ba);
    const bard = vDot(ba, rd);
    const baoc = vDot(ba, oc);
    const k2 = baba - bard * bard;
    const k1 = baba * vDot(oc, rd) - baoc * bard;
    const k0 = baba * vDot(oc, oc) - baoc * baoc - ra * ra * baba;
    let best;
    const take = (t, n, at) => {
        if (t >= 0.02 && (!best || t < best.t))
            best = { t, at, n: vUnit(n) };
    };
    const h = k1 * k1 - k2 * k0;
    if (h >= 0 && Math.abs(k2) > 1e-8) {
        const s = Math.sqrt(h);
        const ts = [(-k1 - s) / k2, (-k1 + s) / k2];
        for (let i = 0; i < ts.length; i++) {
            const t = ts[i];
            const y = baoc + t * bard;
            if (t < 0.02 || y <= 0 || y >= baba)
                continue;
            take(t, vDifference(vScale(ba, y / baba), vAdd(oc, vScale(rd, t))), vAdd(ro, vScale(rd, t)));
        }
    }
    if (!capped) {
        const ends = [pa, pb];
        for (let i = 0; i < ends.length; i++) {
            const hit = sphereAt(ro, rd, ends[i], ra);
            if (hit)
                take(hit.t, hit.n, hit.at);
        }
    }
    else if (baba > 1e-8) {
        const na = vUnit(ba);
        const d0 = rayDisk(ro, rd, pa, vScale(na, -1), ra);
        const d1 = rayDisk(ro, rd, pb, na, ra);
        if (d0)
            take(d0.t, d0.n, d0.at);
        if (d1)
            take(d1.t, d1.n, d1.at);
    }
    return best;
};
const sphereAt = (ro, rd, c, ra) => {
    const oc = vDifference(ro, c);
    const b = vDot(rd, oc);
    const c0 = vDot(oc, oc) - ra * ra;
    const h = b * b - c0;
    if (h < 0)
        return;
    const s = Math.sqrt(h);
    let t = b - s;
    if (t < 0.02)
        t = b + s;
    if (t < 0.02)
        return;
    const at = vAdd(ro, vScale(rd, t));
    return { t, at, n: vUnit(vDifference(c, at)) };
};
const rayTri = (ro, rd, a, b, c) => {
    const e1 = vDifference(a, b), e2 = vDifference(a, c);
    const pvec = vCrossProduct(rd, e2);
    const det = vDot(e1, pvec);
    if (Math.abs(det) < 1e-8)
        return;
    const inv = 1 / det;
    const tvec = vDifference(a, ro);
    const u = vDot(tvec, pvec) * inv;
    if (u < 0 || u > 1)
        return;
    const qvec = vCrossProduct(tvec, e1);
    const v = vDot(rd, qvec) * inv;
    if (v < 0 || u + v > 1)
        return;
    const t = vDot(e2, qvec) * inv;
    if (t < 0.02)
        return;
    let n = vUnit(vCrossProduct(e1, e2));
    if (vDot(n, rd) > 0)
        n = vScale(n, -1);
    return { t, at: vAdd(ro, vScale(rd, t)), n };
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
const ATLAS = 1024;
const TEX_TILE = 128;
const ATLAS_TILES = ATLAS / TEX_TILE;
const sphereAlbedo = (sphere, point) => {
    const color = sphere.color;
    const tex = sphere.texture;
    if (!tex || !tex.data || !tex.width || !tex.height)
        return color;
    const n = vUnit(vDifference(sphere.origin, point));
    let u = Math.atan2(n[2], n[0]) / (Math.PI * 2) + 0.5;
    let v = Math.asin(Math.max(-1, Math.min(1, n[1]))) / Math.PI + 0.5;
    if (u < 0)
        u = 0;
    if (u >= 1)
        u = 0.999999;
    const x = Math.min(tex.width - 1, (u * tex.width) | 0);
    const y = Math.min(tex.height - 1, (v * tex.height) | 0);
    const i = (y * tex.width + x) * 4;
    const data = tex.data;
    return [data[i] / 255, data[i + 1] / 255, data[i + 2] / 255, color[3]];
};
const traceRay = (dir, origin, scene, base, stepsLeft) => {
    const ray = [dir[0], dir[1], dir[2]];
    ray.origin = origin;
    const objects = scene.objects;
    let bestSphere = null;
    let bestPoint = null;
    let bestT = Infinity;
    const root = scene._rayRoot;
    if (root >= 0) {
        const invX = 1 / (dir[0] || 1e-12);
        const invY = 1 / (dir[1] || 1e-12);
        const invZ = 1 / (dir[2] || 1e-12);
        let sp = 0;
        octStack[sp++] = root;
        while (sp > 0) {
            const id = octStack[--sp];
            const hx = nodeHalf[id] + nodeRad[id];
            let t1 = (nodeX[id] - hx - origin[0]) * invX;
            let t2 = (nodeX[id] + hx - origin[0]) * invX;
            let tmin = t1 < t2 ? t1 : t2;
            let tmax = t1 < t2 ? t2 : t1;
            t1 = (nodeY[id] - hx - origin[1]) * invY;
            t2 = (nodeY[id] + hx - origin[1]) * invY;
            const y0 = t1 < t2 ? t1 : t2, y1 = t1 < t2 ? t2 : t1;
            if (y0 > tmin) tmin = y0;
            if (y1 < tmax) tmax = y1;
            t1 = (nodeZ[id] - hx - origin[2]) * invZ;
            t2 = (nodeZ[id] + hx - origin[2]) * invZ;
            const z0 = t1 < t2 ? t1 : t2, z1 = t1 < t2 ? t2 : t1;
            if (z0 > tmin) tmin = z0;
            if (z1 < tmax) tmax = z1;
            if (tmax < (tmin > 0 ? tmin : 0) || tmin >= bestT)
                continue;
            const child = nodeChild[id];
            if (child < 0) {
                const st = nodeStart[id];
                const len = nodeLen[id];
                for (let k = 0; k < len; k++) {
                    const sphere = rayObjs[bodyIdx[st + k]];
                    const intersection = sphereRayIntersection(sphere, ray);
                    if (!intersection)
                        continue;
                    const t = vLength(vDifference(origin, intersection));
                    if (t < REFLECT_BIAS * 0.4 || t >= bestT)
                        continue;
                    bestT = t;
                    bestSphere = sphere;
                    bestPoint = intersection;
                }
            }
            else {
                for (let k = 0; k < 8; k++)
                    if (nodeLen[child + k] > 0 && sp < octStack.length)
                        octStack[sp++] = child + k;
            }
        }
    }
    else {
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
    }
    const shapes = scene.shapes;
    if (shapes) {
        for (let i = 0; i < shapes.length; i++) {
            const hit = shapeHit(shapes[i], origin, dir);
            if (!hit || hit.t < REFLECT_BIAS * 0.4 || hit.t >= bestT)
                continue;
            bestT = hit.t;
            bestPoint = hit.at;
            const shape = shapes[i];
            bestSphere = {
                origin: vAdd(hit.at, vScale(hit.n, -1)),
                color: shape.color,
                reflectivity: shape.reflectivity || 0
            };
        }
    }
    if (!bestSphere)
        return base;
    const color = sphereAlbedo(bestSphere, bestPoint);
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
    const frame = document.createElement('div');
    frame.className = 'view-frame';
    canvas.className = 'view';
    const overlay = document.createElement('canvas');
    overlay.className = 'trails';
    frame.append(canvas, overlay);
    el.append(frame);
    trailCanvas = overlay;
    trailCtx = overlay.getContext('2d');
    canvas.addEventListener('click', event => spawnFromClick(event));
    const bar = document.createElement('div');
    bar.className = 'row';
    const presets = [['system', 'System'], ['binary', 'Binary'], ['pair', 'Pair'], ['crowd', '1500'], ['shapes', 'Shapes']];
    for (let i = 0; i < presets.length; i++) {
        const button = document.createElement('button');
        button.innerText = presets[i][1];
        button.addEventListener('click', () => loadPreset(presets[i][0]));
        bar.append(button);
    }
    const timeLabel = document.createElement('span');
    timeLabel.className = 'tag';
    timeLabel.textContent = 'time';
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '20';
    slider.step = '0.5';
    slider.value = String(viewParams.timeScale);
    const read = document.createElement('span');
    read.className = 'tag';
    const syncScale = () => {
        read.textContent = viewParams.timeScale > 0 ? viewParams.timeScale + '×' : 'paused';
    };
    slider.addEventListener('input', () => {
        viewParams.timeScale = parseFloat(slider.value) || 0;
        if (viewParams.timeScale > 0)
            viewParams.savedScale = viewParams.timeScale;
        syncScale();
        pauseButton.innerText = viewParams.timeScale > 0 ? 'Pause' : 'Resume';
    });
    const pauseButton = document.createElement('button');
    pauseButton.className = 'pause';
    pauseButton.innerText = 'Pause';
    pauseButton.addEventListener('click', () => {
        if (viewParams.timeScale > 0) {
            viewParams.savedScale = viewParams.timeScale;
            viewParams.timeScale = 0;
        }
        else
            viewParams.timeScale = viewParams.savedScale || 1;
        slider.value = String(viewParams.timeScale);
        syncScale();
        pauseButton.innerText = viewParams.timeScale > 0 ? 'Pause' : 'Resume';
    });
    syncScale();
    bar.append(timeLabel, slider, read, pauseButton);
    el.append(bar);
    const stateView = document.createElement('state-view');
    el.append(stateView);
    return { canvas, stateView, input: slider };
};
let canvas;
let trailCanvas;
let trailCtx;
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
const MAX_RENDER = 2048;
const MAX_SHAPES = 8;
const MAX_GPU_NODES = 2048;
const gpuSphereData = new Float32Array(MAX_RENDER * 4);
const gpuColorData = new Float32Array(MAX_RENDER * 4);
const gpuTexRectData = new Float32Array(MAX_RENDER * 4);
const gpuShapeData = new Float32Array(MAX_SHAPES * 16);
const gpuNodeData = new Float32Array(MAX_GPU_NODES * 16);
const gpuAtlasData = new Uint8Array(ATLAS * ATLAS * 4);
const blitTexture = (tile, tex) => {
    const col = tile % ATLAS_TILES;
    const row = (tile / ATLAS_TILES) | 0;
    const x0 = col * TEX_TILE;
    const y0 = row * TEX_TILE;
    for (let y = 0; y < TEX_TILE; y++) {
        const sy = Math.min(tex.height - 1, (y * tex.height / TEX_TILE) | 0);
        const rowOff = (y0 + y) * ATLAS;
        const srcRow = sy * tex.width;
        for (let x = 0; x < TEX_TILE; x++) {
            const sx = Math.min(tex.width - 1, (x * tex.width / TEX_TILE) | 0);
            const si = (srcRow + sx) * 4;
            const di = (rowOff + x0 + x) * 4;
            gpuAtlasData[di] = tex.data[si];
            gpuAtlasData[di + 1] = tex.data[si + 1];
            gpuAtlasData[di + 2] = tex.data[si + 2];
            gpuAtlasData[di + 3] = tex.data[si + 3];
        }
    }
};
function createGpuPainter(canvas) {
    const gl = canvas.getContext('webgl2', {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: false
    });
    if (!gl)
        return null;
    const vert = `#version 300 es
in vec2 aPos;
out vec2 vRay;
void main() {
  vec2 uv = aPos * 0.5 + 0.5;
  vRay = vec2(uv.x, 1.0 - uv.y);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;
    const pointVert = `#version 300 es
in vec2 aRay;
out vec2 vRay;
void main() {
  vRay = aRay;
  gl_Position = vec4(aRay.x * 2.0 - 1.0, (1.0 - aRay.y) * 2.0 - 1.0, 0.0, 1.0);
  gl_PointSize = 1.0;
}`;
    const blitVert = `#version 300 es
in vec2 aPos;
out vec2 vUV;
void main() {
  vUV = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;
    const blitFrag = `#version 300 es
precision highp float;
uniform sampler2D uHold;
in vec2 vUV;
out vec4 fragColor;
void main() { fragColor = texture(uHold, vUV); }`;
    // Same rays as project(), same quadratic as sphereRayIntersection(), closest hit wins.
    const fragSrc = (tree) => `#version 300 es
#define TREE ${tree}
precision highp float;
uniform vec3 uOrigin;
uniform vec4 uQ;
uniform float uFov;
uniform float uAspect;
uniform float uPlane;
uniform vec2 uRes;
uniform int uCount;
#if TREE
uniform sampler2D uNodes;
#endif
uniform sampler2D uSpheres;
uniform sampler2D uColors;
uniform sampler2D uTexRects;
uniform sampler2D uAtlas;
uniform sampler2D uShapes;
uniform int uShapeCount;
bool gShape = false;
in vec2 vRay;
out vec4 fragColor;
vec3 rotateByQ(vec3 v, vec4 q) {
    float a = q.x;
    vec3 qv = q.yzw;
    return qv * (2.0 * dot(qv, v))
        + v * (a * a - dot(qv, qv))
        + cross(qv, v) * (2.0 * a);
}
vec3 albedo(vec3 n, int i) {
    vec4 col = texelFetch(uColors, ivec2(i, 0), 0);
    vec4 rect = texelFetch(uTexRects, ivec2(i, 0), 0);
    if (rect.w < 0.5)
        return col.rgb;
    float u = atan(n.z, n.x) * 0.15915494309189535 + 0.5;
    float v = asin(clamp(n.y, -1.0, 1.0)) * 0.3183098861837907 + 0.5;
    float pad = 0.5 / ${ATLAS}.0;
    vec2 uv = rect.xy + vec2(pad) + vec2(u, v) * (rect.z - pad * 2.0);
    return texture(uAtlas, uv).rgb;
}
#if TREE
bool nodeBox(vec3 ro, vec3 rd, vec3 c, float h, float limit) {
    vec3 inv = vec3(rd.x == 0.0 ? 1e30 : 1.0 / rd.x, rd.y == 0.0 ? 1e30 : 1.0 / rd.y, rd.z == 0.0 ? 1e30 : 1.0 / rd.z);
    vec3 t1 = (c - h - ro) * inv;
    vec3 t2 = (c + h - ro) * inv;
    vec3 tmin3 = min(t1, t2);
    vec3 tmax3 = max(t1, t2);
    float tEnter = max(max(tmin3.x, tmin3.y), tmin3.z);
    float tExit = min(min(tmax3.x, tmax3.y), tmax3.z);
    return tExit >= max(tEnter, 0.0) && tEnter < limit;
}
void considerSphere(int i, vec3 ro, vec3 rd, inout float bestT, inout vec3 hitP, inout vec3 hitC, inout float hitRef, inout int bestI, inout bool found) {
    if (i < 0 || i >= uCount)
        return;
    vec4 sphere = texelFetch(uSpheres, ivec2(i, 0), 0);
    vec3 oc = sphere.xyz - ro;
    float a = dot(rd, rd);
    float b = dot(rd, oc);
    float c = dot(oc, oc) - sphere.w * sphere.w;
    float delta = b * b - a * c;
    if (a == 0.0 || delta < 0.0)
        return;
    float root = sqrt(delta);
    float t = (b - root) / a;
    if (t < 0.0)
        t = (b + root) / a;
    if (t < 0.0)
        return;
    vec3 at = ro + rd * t;
    float dist = length(at - ro);
    if (dist < 0.02 || dist >= bestT)
        return;
    bestT = dist;
    hitP = at;
    hitC = sphere.xyz;
    hitRef = texelFetch(uColors, ivec2(i, 0), 0).a;
    bestI = i;
    found = true;
    gShape = false;
}
void walkSpheres(vec3 ro, vec3 rd, inout float bestT, inout vec3 hitP, inout vec3 hitC, inout float hitRef, inout int bestI, inout bool found) {
    int stack[96];
    int sp = 1;
    stack[0] = 0;
    for (int step = 0; step < 80; step++) {
        if (sp <= 0)
            break;
        sp -= 1;
        int id = stack[sp];
        vec4 box = texelFetch(uNodes, ivec2(0, id), 0);
        vec4 meta = texelFetch(uNodes, ivec2(1, id), 0);
        if (meta.y < 0.5 || !nodeBox(ro, rd, box.xyz, box.w, bestT))
            continue;
        if (meta.x < 0.0) {
            int len = int(meta.y + 0.5);
            vec4 extra = texelFetch(uNodes, ivec2(2, id), 0);
            vec4 tail = texelFetch(uNodes, ivec2(3, id), 0);
            if (len > 0) considerSphere(int(meta.z + 0.5), ro, rd, bestT, hitP, hitC, hitRef, bestI, found);
            if (len > 1) considerSphere(int(meta.w + 0.5), ro, rd, bestT, hitP, hitC, hitRef, bestI, found);
            if (len > 2) considerSphere(int(extra.x + 0.5), ro, rd, bestT, hitP, hitC, hitRef, bestI, found);
            if (len > 3) considerSphere(int(extra.y + 0.5), ro, rd, bestT, hitP, hitC, hitRef, bestI, found);
            if (len > 4) considerSphere(int(extra.z + 0.5), ro, rd, bestT, hitP, hitC, hitRef, bestI, found);
            if (len > 5) considerSphere(int(extra.w + 0.5), ro, rd, bestT, hitP, hitC, hitRef, bestI, found);
            if (len > 6) considerSphere(int(tail.x + 0.5), ro, rd, bestT, hitP, hitC, hitRef, bestI, found);
            if (len > 7) considerSphere(int(tail.y + 0.5), ro, rd, bestT, hitP, hitC, hitRef, bestI, found);
        } else {
            int child = int(meta.x + 0.5);
            for (int k = 0; k < 8; k++) {
                vec4 cbox = texelFetch(uNodes, ivec2(0, child + k), 0);
                vec4 cm = texelFetch(uNodes, ivec2(1, child + k), 0);
                if (cm.y > 0.5 && nodeBox(ro, rd, cbox.xyz, cbox.w, bestT) && sp < 96)
                    stack[sp++] = child + k;
            }
        }
    }
}
bool treeBlocks(vec3 sro, vec3 ld, float lightT) {
    int stack[96];
    int sp = 1;
    stack[0] = 0;
    for (int step = 0; step < 80; step++) {
        if (sp <= 0)
            break;
        sp -= 1;
        int id = stack[sp];
        vec4 box = texelFetch(uNodes, ivec2(0, id), 0);
        vec4 meta = texelFetch(uNodes, ivec2(1, id), 0);
        if (meta.y < 0.5 || !nodeBox(sro, ld, box.xyz, box.w, lightT))
            continue;
        if (meta.x < 0.0) {
            int len = int(meta.y + 0.5);
            vec4 extra = texelFetch(uNodes, ivec2(2, id), 0);
            vec4 tail = texelFetch(uNodes, ivec2(3, id), 0);
            int ids[8];
            ids[0] = int(meta.z + 0.5);
            ids[1] = int(meta.w + 0.5);
            ids[2] = int(extra.x + 0.5);
            ids[3] = int(extra.y + 0.5);
            ids[4] = int(extra.z + 0.5);
            ids[5] = int(extra.w + 0.5);
            ids[6] = int(tail.x + 0.5);
            ids[7] = int(tail.y + 0.5);
            for (int k = 0; k < 8; k++) {
                if (k >= len)
                    break;
                int j = ids[k];
                if (j <= 0 || j >= uCount)
                    continue;
                vec4 sph = texelFetch(uSpheres, ivec2(j, 0), 0);
                vec3 soc = sph.xyz - sro;
                float sb = dot(ld, soc);
                float sc = dot(soc, soc) - sph.w * sph.w;
                float sd = sb * sb - sc;
                if (sd < 0.0)
                    continue;
                float sroot = sqrt(sd);
                float st = sb - sroot;
                if (st < 0.0)
                    st = sb + sroot;
                if (st > 0.02 && st < lightT)
                    return true;
            }
        } else {
            int child = int(meta.x + 0.5);
            for (int k = 0; k < 8; k++) {
                vec4 cbox = texelFetch(uNodes, ivec2(0, child + k), 0);
                vec4 cm = texelFetch(uNodes, ivec2(1, child + k), 0);
                if (cm.y > 0.5 && nodeBox(sro, ld, cbox.xyz, cbox.w, lightT) && sp < 96)
                    stack[sp++] = child + k;
            }
        }
    }
    return false;
}
#endif
void acceptShape(float t, vec3 at, vec3 n, vec3 rgb, float ref, inout float bestT, inout vec3 hitP, inout vec3 hitN, inout vec3 shapeRgb, inout float hitRef, inout bool found) {
    if (t < 0.02 || t >= bestT)
        return;
    bestT = t;
    hitP = at;
    hitN = n;
    shapeRgb = rgb;
    hitRef = ref;
    found = true;
    gShape = true;
}
void considerShapes(vec3 ro, vec3 rd, inout float bestT, inout vec3 hitP, inout vec3 hitN, inout vec3 shapeRgb, inout float hitRef, inout bool found) {
    for (int i = 0; i < ${MAX_SHAPES}; i++) {
        if (i >= uShapeCount)
            return;
        vec4 row0 = texelFetch(uShapes, ivec2(i, 0), 0);
        vec4 row1 = texelFetch(uShapes, ivec2(i, 1), 0);
        vec4 row2 = texelFetch(uShapes, ivec2(i, 2), 0);
        vec4 row3 = texelFetch(uShapes, ivec2(i, 3), 0);
        int kind = int(row1.w + 0.5);
        vec3 rgb = row0.rgb;
        float ref = row0.a;
        vec3 a = row1.xyz;
        vec3 b = row2.xyz;
        vec3 c = row3.xyz;
        float rad = row2.w;
        if (kind == 1 || kind == 2) {
            vec3 pn = normalize(b);
            float denom = dot(rd, pn);
            if (abs(denom) < 1.0e-6)
                continue;
            float t = dot(a - ro, pn) / denom;
            if (t < 0.02)
                continue;
            vec3 at = ro + rd * t;
            if (kind == 2 && dot(at - a, at - a) > rad * rad)
                continue;
            acceptShape(t, at, denom > 0.0 ? -pn : pn, rgb, ref, bestT, hitP, hitN, shapeRgb, hitRef, found);
        } else if (kind == 3) {
            vec3 inv = vec3(abs(rd.x) < 1.0e-8 ? 1.0e16 : 1.0 / rd.x, abs(rd.y) < 1.0e-8 ? 1.0e16 : 1.0 / rd.y, abs(rd.z) < 1.0e-8 ? 1.0e16 : 1.0 / rd.z);
            vec3 t1 = (a - b - ro) * inv;
            vec3 t2 = (a + b - ro) * inv;
            vec3 tsm = min(t1, t2);
            vec3 tsM = max(t1, t2);
            float tmin = max(max(tsm.x, tsm.y), tsm.z);
            float tmax = min(min(tsM.x, tsM.y), tsM.z);
            if (tmax < tmin)
                continue;
            float t = tmin > 0.02 ? tmin : tmax;
            if (t < 0.02)
                continue;
            vec3 p = (ro + rd * t) - a;
            vec3 ap = abs(p) / max(b, vec3(1.0e-4));
            vec3 n = vec3(0.0);
            if (ap.x >= ap.y && ap.x >= ap.z)
                n.x = p.x < 0.0 ? -1.0 : 1.0;
            else if (ap.y >= ap.z)
                n.y = p.y < 0.0 ? -1.0 : 1.0;
            else
                n.z = p.z < 0.0 ? -1.0 : 1.0;
            if (dot(n, rd) > 0.0)
                n = -n;
            acceptShape(t, ro + rd * t, n, rgb, ref, bestT, hitP, hitN, shapeRgb, hitRef, found);
        } else if (kind == 4 || kind == 5) {
            vec3 ba = b - a;
            vec3 oc = ro - a;
            float baba = dot(ba, ba);
            float bard = dot(ba, rd);
            float baoc = dot(ba, oc);
            float k2 = baba - bard * bard;
            float k1 = baba * dot(oc, rd) - baoc * bard;
            float k0 = baba * dot(oc, oc) - baoc * baoc - rad * rad * baba;
            float h = k1 * k1 - k2 * k0;
            if (h >= 0.0 && abs(k2) > 1.0e-6) {
                float s = sqrt(h);
                for (int side = 0; side < 2; side++) {
                    float t = (-k1 + (side == 0 ? -s : s)) / k2;
                    float y = baoc + t * bard;
                    if (t < 0.02 || y <= 0.0 || y >= baba)
                        continue;
                    vec3 n = normalize(oc + rd * t - ba * y / baba);
                    acceptShape(t, ro + rd * t, n, rgb, ref, bestT, hitP, hitN, shapeRgb, hitRef, found);
                }
            }
            if (kind == 4) {
                vec3 caps[2];
                caps[0] = a;
                caps[1] = b;
                for (int cap = 0; cap < 2; cap++) {
                    vec3 cc = caps[cap];
                    vec3 soc = cc - ro;
                    float sb = dot(rd, soc);
                    float sc = dot(soc, soc) - rad * rad;
                    float sd = sb * sb - sc;
                    if (sd < 0.0)
                        continue;
                    float sroot = sqrt(sd);
                    float t = sb - sroot;
                    if (t < 0.02)
                        t = sb + sroot;
                    if (t < 0.02)
                        continue;
                    vec3 at = ro + rd * t;
                    acceptShape(t, at, normalize(at - cc), rgb, ref, bestT, hitP, hitN, shapeRgb, hitRef, found);
                }
            } else if (baba > 1.0e-6) {
                vec3 na = ba / sqrt(baba);
                vec3 ends[2];
                ends[0] = a;
                ends[1] = b;
                vec3 ns[2];
                ns[0] = -na;
                ns[1] = na;
                for (int cap = 0; cap < 2; cap++) {
                    float denom = dot(rd, ns[cap]);
                    if (abs(denom) < 1.0e-6)
                        continue;
                    float t = dot(ends[cap] - ro, ns[cap]) / denom;
                    if (t < 0.02)
                        continue;
                    vec3 at = ro + rd * t;
                    if (dot(at - ends[cap], at - ends[cap]) > rad * rad)
                        continue;
                    acceptShape(t, at, denom > 0.0 ? -ns[cap] : ns[cap], rgb, ref, bestT, hitP, hitN, shapeRgb, hitRef, found);
                }
            }
        } else if (kind == 6) {
            vec3 e1 = b - a;
            vec3 e2 = c - a;
            vec3 pvec = cross(rd, e2);
            float det = dot(e1, pvec);
            if (abs(det) < 1.0e-6)
                continue;
            float invDet = 1.0 / det;
            vec3 tvec = ro - a;
            float u = dot(tvec, pvec) * invDet;
            if (u < 0.0 || u > 1.0)
                continue;
            vec3 qvec = cross(tvec, e1);
            float v = dot(rd, qvec) * invDet;
            if (v < 0.0 || u + v > 1.0)
                continue;
            float t = dot(e2, qvec) * invDet;
            vec3 n = normalize(cross(e1, e2));
            if (dot(n, rd) > 0.0)
                n = -n;
            acceptShape(t, ro + rd * t, n, rgb, ref, bestT, hitP, hitN, shapeRgb, hitRef, found);
        }
    }
}
bool shapeBlocks(vec3 ro, vec3 rd, float limit) {
    float bestT = limit;
    vec3 hitP = ro;
    vec3 hitN = ro;
    vec3 shapeRgb = ro;
    float hitRef = 0.0;
    bool found = false;
    bool saved = gShape;
    considerShapes(ro, rd, bestT, hitP, hitN, shapeRgb, hitRef, found);
    gShape = saved;
    return found;
}
void main() {
    float uu = vRay.x;
    float vv = vRay.y;
    float halfAngle = tan(uFov * 0.008726646259971648) * uPlane;
    vec3 rd = normalize(vec3((uu * 2.0 - 1.0) * uAspect * halfAngle, (1.0 - vv * 2.0) * halfAngle, uPlane));
    rd = rotateByQ(rd, uQ);
    vec3 ro = uOrigin;
    vec3 accum = vec3(0.0);
    float thru = 1.0;
#if TREE
#define BOUNCES 2
#else
#define BOUNCES 5
#endif
    for (int bounce = 0; bounce < BOUNCES; bounce++) {
        float bestT = 1.0e30;
        vec3 hitP = ro;
        vec3 hitC = ro;
        vec3 hitN = vec3(0.0, 1.0, 0.0);
        vec3 shapeRgb = vec3(0.0);
        float hitRef = 0.0;
        int bestI = 0;
        bool found = false;
        gShape = false;
        considerShapes(ro, rd, bestT, hitP, hitN, shapeRgb, hitRef, found);
#if TREE
        walkSpheres(ro, rd, bestT, hitP, hitC, hitRef, bestI, found);
#else
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
            hitRef = texelFetch(uColors, ivec2(i, 0), 0).a;
            bestI = i;
            found = true;
            gShape = false;
        }
#endif
        if (!found)
            break;
        vec3 nrm = gShape ? hitN : normalize(hitP - hitC);
        vec3 hitRgb = gShape ? shapeRgb : albedo(nrm, bestI);
        if (bounce == 0 && uCount > 0 && (gShape || bestI != 0)) {
            vec4 sun = texelFetch(uSpheres, ivec2(0, 0), 0);
            vec3 toL = sun.xyz - hitP;
            float distL = length(toL);
            vec3 ld = toL / max(distL, 1.0e-4);
            float ndl = dot(nrm, ld);
            float shade = ndl < 0.0 ? 0.34 : 1.0;
            vec3 sro = hitP + ld * 0.05;
            float lightT = distL - sun.w - 0.05;
#if TREE
            if (treeBlocks(sro, ld, lightT))
                shade = min(shade, 0.28);
#else
            for (int j = 1; j < ${MAX_SPHERES}; j++) {
                if (j >= uCount)
                    break;
                vec4 sph = texelFetch(uSpheres, ivec2(j, 0), 0);
                vec3 soc = sph.xyz - sro;
                float sb = dot(ld, soc);
                float sc = dot(soc, soc) - sph.w * sph.w;
                float sd = sb * sb - sc;
                if (sd < 0.0)
                    continue;
                float sroot = sqrt(sd);
                float st = sb - sroot;
                if (st < 0.0)
                    st = sb + sroot;
                if (st > 0.02 && st < lightT) {
                    shade = min(shade, 0.28);
                    break;
                }
            }
#endif
            if (shapeBlocks(sro, ld, lightT))
                shade = min(shade, 0.28);
            hitRgb *= shade;
        }
        float mirror = bounce + 1 == BOUNCES ? 0.0 : clamp(hitRef, 0.0, 1.0);
        accum += thru * hitRgb * (1.0 - mirror);
        thru *= mirror;
        if (thru <= 0.0)
            break;
        rd = normalize(reflect(rd, nrm));
        ro = hitP + nrm * 0.05;
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
    const fs = compile(gl.FRAGMENT_SHADER, fragSrc(0));
    // Direct loop stays on the small scenes. Past 64 spheres that loop cannot
    // see the rest, so those scenes use the octree program.
    const treeFs = compile(gl.FRAGMENT_SHADER, fragSrc(1));
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
    let treeProgram = null;
    if (treeFs) {
        treeProgram = gl.createProgram();
        gl.attachShader(treeProgram, vs);
        gl.attachShader(treeProgram, treeFs);
        gl.bindAttribLocation(treeProgram, 0, 'aPos');
        gl.linkProgram(treeProgram);
        if (!gl.getProgramParameter(treeProgram, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(treeProgram));
            treeProgram = null;
        }
    }
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const sphereTex = gl.createTexture();
    const colorTex = gl.createTexture();
    const rectTex = gl.createTexture();
    const atlasTex = gl.createTexture();
    const alloc = (tex, unit) => {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, MAX_RENDER, 1, 0, gl.RGBA, gl.FLOAT, null);
    };
    alloc(sphereTex, 0);
    alloc(colorTex, 1);
    alloc(rectTex, 2);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, atlasTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, ATLAS, ATLAS, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    const nodeTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE5);
    gl.bindTexture(gl.TEXTURE_2D, nodeTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 4, MAX_GPU_NODES, 0, gl.RGBA, gl.FLOAT, null);
    const shapeTex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, shapeTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, MAX_SHAPES, 4, 0, gl.RGBA, gl.FLOAT, null);
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
    gl.uniform1i(loc('uTexRects'), 2);
    gl.uniform1i(loc('uAtlas'), 3);
    gl.uniform1i(loc('uShapes'), 4);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const boundTex = new Array(MAX_RENDER);
    const boundRev = new Array(MAX_RENDER).fill(0);
    let atlasDirty = false;
    const pointVs = compile(gl.VERTEX_SHADER, pointVert);
    if (!pointVs)
        return null;
    const pointProgram = gl.createProgram();
    gl.attachShader(pointProgram, pointVs);
    gl.attachShader(pointProgram, fs);
    gl.bindAttribLocation(pointProgram, 0, 'aRay');
    gl.linkProgram(pointProgram);
    if (!pointVs || !gl.getProgramParameter(pointProgram, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(pointProgram));
        return null;
    }
    const blitVs = compile(gl.VERTEX_SHADER, blitVert);
    const blitFs = compile(gl.FRAGMENT_SHADER, blitFrag);
    if (!blitVs || !blitFs)
        return null;
    const blitProgram = gl.createProgram();
    gl.attachShader(blitProgram, blitVs);
    gl.attachShader(blitProgram, blitFs);
    gl.bindAttribLocation(blitProgram, 0, 'aPos');
    gl.linkProgram(blitProgram);
    if (!blitVs || !blitFs || !gl.getProgramParameter(blitProgram, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(blitProgram));
        return null;
    }
    const ploc = name => gl.getUniformLocation(pointProgram, name);
    const pOrigin = ploc('uOrigin');
    const pQ = ploc('uQ');
    const pFov = ploc('uFov');
    const pAspect = ploc('uAspect');
    const pPlane = ploc('uPlane');
    const pRes = ploc('uRes');
    const pCount = ploc('uCount');
    const blitSampler = gl.getUniformLocation(blitProgram, 'uHold');
    const rayBuffer = gl.createBuffer();
    const holdTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, holdTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const SHAPE_KIND = { plane: 1, disk: 2, box: 3, capsule: 4, cylinder: 5, triangle: 6 };
    const packShapes = (shapes) => {
        gpuShapeData.fill(0);
        const n = Math.min(shapes.length, MAX_SHAPES);
        for (let i = 0; i < n; i++) {
            const s = shapes[i];
            const put = (row, x, y, z, w) => {
                const o = (row * MAX_SHAPES + i) * 4;
                gpuShapeData[o] = x;
                gpuShapeData[o + 1] = y;
                gpuShapeData[o + 2] = z;
                gpuShapeData[o + 3] = w;
            };
            const color = s.color;
            put(0, color[0], color[1], color[2], s.reflectivity || 0);
            put(1, s.a[0], s.a[1], s.a[2], SHAPE_KIND[s.kind] || 0);
            put(2, s.b[0], s.b[1], s.b[2], s.r || 0);
            const c = s.c || [0, 0, 0];
            put(3, c[0], c[1], c[2], 0);
        }
        return n;
    };
    const upload = (prog, scene) => {
        const objects = scene.objects;
        const count = Math.min(objects.length, MAX_RENDER);
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
            const tex = sphere.texture;
            const col = i % ATLAS_TILES;
            const row = (i / ATLAS_TILES) | 0;
            gpuTexRectData[i * 4] = col / ATLAS_TILES;
            gpuTexRectData[i * 4 + 1] = row / ATLAS_TILES;
            gpuTexRectData[i * 4 + 2] = 1 / ATLAS_TILES;
            gpuTexRectData[i * 4 + 3] = tex && tex.data && i < ATLAS_TILES * ATLAS_TILES ? 1 : 0;
            const rev = tex ? tex.revision || 0 : 0;
            if (boundTex[i] !== tex || boundRev[i] !== rev) {
                if (tex && tex.data && i < ATLAS_TILES * ATLAS_TILES)
                    blitTexture(i, tex);
                boundTex[i] = tex;
                boundRev[i] = rev;
                atlasDirty = true;
            }
        }
        for (let i = count; i < MAX_RENDER; i++)
            gpuTexRectData[i * 4 + 3] = 0;
        const shapeCount = packShapes(scene.shapes || []);
        const q = qFromUnitVectors([0, 0, 1], vUnit(scene.camera.dir));
        const treeOn = count > MAX_SPHERES && !!(treeProgram && packGpuNodes(count));
        const active = prog === pointProgram ? pointProgram : (treeOn ? treeProgram : program);
        const drawCount = treeOn ? count : Math.min(count, MAX_SPHERES);
        const U = name => gl.getUniformLocation(active, name);
        gl.useProgram(active);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, sphereTex);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, MAX_RENDER, 1, gl.RGBA, gl.FLOAT, gpuSphereData);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, colorTex);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, MAX_RENDER, 1, gl.RGBA, gl.FLOAT, gpuColorData);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, rectTex);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, MAX_RENDER, 1, gl.RGBA, gl.FLOAT, gpuTexRectData);
        if (atlasDirty) {
            gl.activeTexture(gl.TEXTURE3);
            gl.bindTexture(gl.TEXTURE_2D, atlasTex);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, ATLAS, ATLAS, gl.RGBA, gl.UNSIGNED_BYTE, gpuAtlasData);
            atlasDirty = false;
        }
        gl.uniform1i(U('uSpheres'), 0);
        gl.uniform1i(U('uColors'), 1);
        gl.uniform1i(U('uTexRects'), 2);
        gl.uniform1i(U('uAtlas'), 3);
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, shapeTex);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, MAX_SHAPES, 4, gl.RGBA, gl.FLOAT, gpuShapeData);
        gl.uniform1i(U('uShapes'), 4);
        gl.uniform1i(U('uShapeCount'), shapeCount);
        gl.uniform3f(U('uOrigin'), scene.camera.origin[0], scene.camera.origin[1], scene.camera.origin[2]);
        gl.uniform4f(U('uQ'), q[0], q[1], q[2], q[3]);
        gl.uniform1f(U('uFov'), scene.camera.fov);
        gl.uniform1f(U('uAspect'), scene.camera.aspect);
        gl.uniform1f(U('uPlane'), scene.camera.planeDistance);
        gl.uniform2f(U('uRes'), canvas.width, canvas.height);
        gl.uniform1i(U('uCount'), drawCount);
        if (treeOn) {
            gl.activeTexture(gl.TEXTURE5);
            gl.bindTexture(gl.TEXTURE_2D, nodeTex);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 4, nodeN, gl.RGBA, gl.FLOAT, gpuNodeData);
            gl.uniform1i(U('uNodes'), 5);
        }
        return count;
    };
    let fence = null;
    const timerExt = gl.getExtension('EXT_disjoint_timer_query_webgl2');
    let rayQuery = null;
    let rayQueryRays = 0;
    let rayQueryAt = 0;
    const beginRayQuery = () => {
        if (!timerExt || rayQuery)
            return false;
        try {
            rayQuery = gl.createQuery();
            gl.beginQuery(timerExt.TIME_ELAPSED_EXT, rayQuery);
            rayQueryAt = performance.now();
            return true;
        }
        catch (err) {
            rayQuery = null;
            return false;
        }
    };
    const endRayQuery = (rays) => {
        if (!timerExt || !rayQuery)
            return;
        try {
            gl.endQuery(timerExt.TIME_ELAPSED_EXT);
            rayQueryRays = rays;
        }
        catch (err) {
            try { gl.deleteQuery(rayQuery); } catch (ignore) { /* already gone */ }
            rayQuery = null;
        }
    };
    const takeRayTiming = () => {
        if (!timerExt || !rayQuery)
            return null;
        try {
            if (gl.getParameter(timerExt.GPU_DISJOINT_EXT)) {
                gl.deleteQuery(rayQuery);
                rayQuery = null;
                return null;
            }
            if (!gl.getQueryParameter(rayQuery, gl.QUERY_RESULT_AVAILABLE))
                return null;
            const ns = gl.getQueryParameter(rayQuery, gl.QUERY_RESULT);
            const rays = rayQueryRays;
            gl.deleteQuery(rayQuery);
            rayQuery = null;
            if (!(ns > 0))
                return null;
            return { rays, ms: ns / 1e6, gpu: true };
        }
        catch (err) {
            rayQuery = null;
            return null;
        }
    };
    const gpuPending = () => {
        if (!fence)
            return false;
        try {
            const status = gl.clientWaitSync(fence, 0, 0);
            if (status === gl.TIMEOUT_EXPIRED || status === gl.WAIT_FAILED)
                return true;
            gl.deleteSync(fence);
            fence = null;
            return false;
        }
        catch (err) {
            fence = null;
            return false;
        }
    };
    const waitUpTo = (ms) => {
        if (!fence)
            return true;
        try {
            const status = gl.clientWaitSync(fence, gl.SYNC_FLUSH_COMMANDS_BIT, Math.max(0, ms) * 1e6);
            if (status === gl.TIMEOUT_EXPIRED || status === gl.WAIT_FAILED)
                return false;
            gl.deleteSync(fence);
            fence = null;
            return true;
        }
        catch (err) {
            fence = null;
            return true;
        }
    };
    const gpuMark = () => {
        try {
            if (fence)
                gl.deleteSync(fence);
            fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
            gl.flush();
        }
        catch (err) {
            fence = null;
        }
    };
    let lastRayMs = 0;
    const rayPixel = new Uint8Array(4);
    let traceW = 0;
    let traceH = 0;
    const traceTex = gl.createTexture();
    const traceFbo = gl.createFramebuffer();
    gl.bindTexture(gl.TEXTURE_2D, traceTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const paintFit = (scene, tw, th) => {
        tw = Math.max(2, tw);
        th = Math.max(2, th);
        if (traceW !== tw || traceH !== th) {
            gl.bindTexture(gl.TEXTURE_2D, traceTex);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tw, th, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, traceFbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, traceTex, 0);
            traceW = tw;
            traceH = th;
            if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                traceW = 0;
                return false;
            }
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, traceFbo);
        upload(program, scene);
        gl.viewport(0, 0, tw, th);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        const queried = beginRayQuery();
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        if (queried)
            endRayQuery(tw * th);
        const readStart = performance.now();
        // Mobile GPUs are tiled. A 1-pixel readPixels only waits for one
        // tile, so the rate looks huge and the next frame fills the screen.
        gl.finish();
        lastRayMs = performance.now() - readStart;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(blitProgram);
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, traceTex);
        gl.uniform1i(blitSampler, 4);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        return true;
    };
    return {
        gl,
        hold() {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindTexture(gl.TEXTURE_2D, holdTex);
            gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, canvas.width, canvas.height, 0);
        },
        drawHold(w, h) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, w, h);
            gl.useProgram(blitProgram);
            gl.activeTexture(gl.TEXTURE4);
            gl.bindTexture(gl.TEXTURE_2D, holdTex);
            gl.uniform1i(blitSampler, 4);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        },
        clear(w, h) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, w, h);
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
        },
        paint(scene) {
            upload(program, scene);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            return true;
        },
        paintFit,
        pending: gpuPending,
        waitUpTo,
        mark: gpuMark,
        takeRayTiming,
        rayMs: () => lastRayMs,
        rayTimingPending: () => !!rayQuery,
        hasRayTimer: () => !!timerExt,
        paintRandom(scene, count) {
            const n = Math.max(0, Math.min(count, rayUVs.length / 2));
            if (!n)
                return 0;
            upload(pointProgram, scene);
            gl.bindBuffer(gl.ARRAY_BUFFER, rayBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, rayUVs.subarray(0, n * 2), gl.DYNAMIC_DRAW);
            gl.enableVertexAttribArray(0);
            gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.POINTS, 0, n);
            return n;
        }
    };
}
const sizeAt = (level, targetW, targetH) => {
    const scale = 1 / (2 ** level);
    let w = Math.max(2, Math.round(targetW * scale));
    let h = Math.max(2, Math.round(targetH * scale));
    if (w % 2)
        w -= 1;
    if (h % 2)
        h -= 1;
    return { w: Math.max(2, w), h: Math.max(2, h) };
};
const coverLevel = (target, rays) => {
    const budget = Math.max(80, rays);
    let level = 0;
    while (level < 8) {
        const size = sizeAt(level, target.w, target.h);
        if (size.w * size.h <= budget)
            return level;
        level++;
    }
    return 8;
};
const touchDevice = () => {
    const touch = (navigator.maxTouchPoints || 0) > 0;
    if (!touch || typeof window.matchMedia !== 'function')
        return false;
    return window.matchMedia('(pointer: coarse)').matches;
};
const nativeSize = (canvasEl) => {
    const rect = canvasEl.getBoundingClientRect();
    // Phone pixels are already 2–3× the layout size. Tracing that buffer
    // is what locks the tab. The picture still fills the window.
    const dpr = touchDevice() ? 1 : Math.min(window.devicePixelRatio || 1, 3);
    let w = Math.round(rect.width * dpr);
    let h = Math.round(rect.height * dpr);
    if (w < 2 || h < 2) {
        w = canvasParams.width;
        h = canvasParams.height;
    }
    w = Math.min(w, resCap.width || w);
    h = Math.min(h, resCap.height || h);
    return { w: Math.max(2, w), h: Math.max(2, h) };
};
const sceneSignature = (scene) => {
    const cam = scene.camera;
    const o = cam.origin;
    const d = cam.dir;
    let s = (o[0] | 0) + ',' + (o[1] | 0) + ',' + (o[2] | 0) + '/' + d[0].toFixed(2) + d[1].toFixed(2) + d[2].toFixed(2) + '/' + cam.fov;
    const bodies = scene.simState.universe;
    for (let i = 0; i < bodies.length; i++) {
        const p = bodies[i].position;
        s += '|' + (p[0] | 0) + ',' + (p[1] | 0) + ',' + (p[2] | 0);
    }
    return s;
};
const fillRandomUVs = (count, w, h) => {
    const n = Math.max(0, Math.min(count | 0, rayUVs.length / 2));
    for (let i = 0; i < n; i++) {
        let u;
        let v;
        // Most rays land near the middle, where the bodies are, so that
        // part of the window sharpens first. The rest cover the edges.
        if ((i & 3) !== 0) {
            u = 0.5 + (Math.random() + Math.random() + Math.random() - 1.5) * 0.28;
            v = 0.5 + (Math.random() + Math.random() + Math.random() - 1.5) * 0.28;
        }
        else {
            u = Math.random();
            v = Math.random();
        }
        u = Math.min(0.999, Math.max(0, u));
        v = Math.min(0.999, Math.max(0, v));
        rayUVs[i * 2] = (Math.min(w - 1, u * w) + 0.5) / w;
        rayUVs[i * 2 + 1] = (Math.min(h - 1, v * h) + 0.5) / h;
    }
    return n;
};
let scratch;
const applySize = (w, h, mode) => {
    if (mode === 'keep' && canvas.width === w && canvas.height === h)
        return;
    canvas.style.imageRendering = adaptive.level === 0 ? 'auto' : 'pixelated';
    if (gpuPainter) {
        const prevW = canvas.width;
        const prevH = canvas.height;
        if (mode === 'upscale' && prevW > 0 && prevH > 0)
            gpuPainter.hold();
        canvas.width = w;
        canvas.height = h;
        if (mode === 'upscale' && prevW > 0)
            gpuPainter.drawHold(w, h);
        else
            gpuPainter.clear(w, h);
        return;
    }
    if (!context)
        return;
    if (mode === 'upscale' && frame && frame.width > 0) {
        if (!scratch)
            scratch = document.createElement('canvas');
        scratch.width = frame.width;
        scratch.height = frame.height;
        const scratchCtx = scratch.getContext('2d');
        scratchCtx.putImageData(frame, 0, 0);
        canvas.width = w;
        canvas.height = h;
        context.imageSmoothingEnabled = false;
        context.drawImage(scratch, 0, 0, w, h);
        frame = context.getImageData(0, 0, w, h);
        return;
    }
    canvas.width = w;
    canvas.height = h;
    frame = context.createImageData(w, h);
    context.putImageData(frame, 0, 0);
};
const paintRandomCPU = (scene, count) => {
    prepareRayTree(scene);
    if (!frame || frame.width !== canvas.width || frame.height !== canvas.height)
        frame = context.createImageData(canvas.width, canvas.height);
    const w = frame.width;
    const h = frame.height;
    const data = frame.data;
    const miss = [0, 0, 0, 1];
    const limit = Math.max(4, adaptive.refresh * 0.75);
    const t0 = performance.now();
    let n = 0;
    const cap = Math.min(count, rayUVs.length / 2);
    for (; n < cap; n++) {
        if ((n & 15) === 15 && performance.now() - t0 > limit)
            break;
        const u = Math.random();
        const v = Math.random();
        const color = cast(project(u, v, scene.camera), scene, miss);
        const x = Math.min(w - 1, (u * w) | 0);
        const y = Math.min(h - 1, (v * h) | 0);
        const p = (y * w + x) * 4;
        data[p] = color[0] * 255;
        data[p + 1] = color[1] * 255;
        data[p + 2] = color[2] * 255;
        data[p + 3] = (color[3] * 255) | 0;
    }
    context.putImageData(frame, 0, 0);
    return n;
};
const sizeForPixels = (pixels, target) => {
    const aspect = target.w / Math.max(1, target.h);
    const maxPx = target.w * target.h;
    const n = Math.max(800, Math.min(maxPx, pixels));
    let w = Math.sqrt(n * aspect);
    let h = w / aspect;
    w = Math.max(16, Math.min(target.w, Math.round(w)));
    h = Math.max(16, Math.min(target.h, Math.round(h)));
    if (w % 2)
        w -= 1;
    if (h % 2)
        h -= 1;
    return { w: Math.max(16, w), h: Math.max(16, h) };
};
const noteRayRate = (rays, ms) => {
    // Anything under a third of a millisecond didn't wait for the GPU.
    if (!(rays > 0) || !(ms >= 0.35))
        return;
    const rate = rays / (ms / 1000);
    adaptive.raysPerSec = adaptive.raysPerSec ? adaptive.raysPerSec * 0.4 + rate * 0.6 : rate;
};
const paintAdaptive = (scene) => {
    const target = nativeSize(canvas);
    const nativePx = Math.max(1, target.w * target.h);
    scene.camera.aspect = target.h > 0 ? target.w / target.h : 16 / 9;
    if (Math.abs(canvas.width - target.w) > 24 || Math.abs(canvas.height - target.h) > 24) {
        canvas.width = target.w;
        canvas.height = target.h;
    }
    const heavy = scene.objects && scene.objects.length > MAX_SPHERES;
    const initial = touchDevice() ? 2400 : (heavy ? 3000 : 16000);
    if (!(adaptive.cap > 0))
        adaptive.cap = Math.min(nativePx, initial);
    // One display frame. A faster measured refresh wins; never budget more than 60Hz.
    const vsyncMs = Math.min(adaptive.refresh > 8 ? adaptive.refresh : 1000 / 60, 1000 / 60);
    let affordable = adaptive.raysPerSec > 0
        ? adaptive.raysPerSec * (vsyncMs / 1000)
        : adaptive.cap;
    if (adaptive.ceiling > 0)
        affordable = Math.min(affordable, adaptive.ceiling);
    const minRays = adaptive.raysPerSec > 0 ? 800 : Math.min(nativePx, initial);
    affordable = Math.max(minRays, Math.min(nativePx, affordable));
    adaptive.cap = affordable;
    const size = sizeForPixels(adaptive.cap, target);
    adaptive.cap = size.w * size.h;
    adaptive.traceW = size.w;
    adaptive.traceH = size.h;
    adaptive.level = Math.max(0, Math.round(Math.log2(nativePx / Math.max(1, adaptive.cap))));
    const rayCount = size.w * size.h;
    const traceStart = performance.now();
    if (gpuPainter && gpuPainter.paintFit)
        gpuPainter.paintFit(scene, size.w, size.h);
    else if (gpuPainter)
        gpuPainter.paint(scene);
    else if (context)
        paintRandomCPU(scene, Math.min(adaptive.rays, rayCount));
    adaptive.submittedRays = rayCount;
    adaptive.submittedAt = traceStart;
    if (gpuPainter && gpuPainter.mark)
        gpuPainter.mark();
    const timed = gpuPainter && gpuPainter.takeRayTiming && gpuPainter.takeRayTiming();
    if (timed)
        noteRayRate(timed.rays, timed.ms);
    else if (gpuPainter && gpuPainter.rayMs)
        noteRayRate(rayCount, gpuPainter.rayMs());
    else if (adaptive.paintMs > 0)
        noteRayRate(rayCount, adaptive.paintMs);
    const gpuMs = gpuPainter && gpuPainter.rayMs ? gpuPainter.rayMs() : 0;
    if (gpuMs > vsyncMs * 1.3) {
        adaptive.ceiling = Math.max(800, rayCount * (vsyncMs / gpuMs));
    }
    else if (gpuMs >= 0.35 && gpuMs < vsyncMs * 0.7 && adaptive.ceiling > 0 && rayCount >= adaptive.ceiling * 0.85) {
        adaptive.ceiling = 0;
    }
    adaptive.samples += rayCount;
};
const tuneAdaptive = (paintMs) => {
    adaptive.paintMs = paintMs;
    adaptive.frames++;
    const missed = adaptive.frames > 4 && (adaptive.frameDt || 0) > adaptive.refresh * 1.6;
    const cap = 14000;
    if (missed || paintMs > 16)
        adaptive.rays = Math.max(1200, adaptive.rays * 0.65);
    else if (paintMs > 0 && paintMs < 8)
        adaptive.rays = Math.min(cap, adaptive.rays * 1.12 + 400);
};
const paintFrame = (scene) => paintAdaptive(scene);
let tps = 5;
let lastTick = new Date().getTime();
let currentTick = 0;
let started = false;
let paintedCam = '';
let raf = 0;
const animate = (stamp) => {
    if (!viewParams.running)
        return;
    const frameStart = performance.now();
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
        const paintStart = performance.now();
        syncSceneObjects(scene);
        paintAdaptive(scene);
        const paintMs = performance.now() - paintStart;
        const elapsed = performance.now() - frameStart;
        if (stamp && adaptive.lastStamp) {
            const dt = stamp - adaptive.lastStamp;
            if (dt > 5 && dt < 80)
                adaptive.refresh = adaptive.refresh * 0.85 + Math.min(dt, 34) * 0.15;
            adaptive.frameDt = dt;
        }
        if (stamp)
            adaptive.lastStamp = stamp;
        tuneAdaptive(paintMs);
        adaptive.elapsed = elapsed;
        sampleTrails();
        paintTrails();
        const scale = viewParams.timeScale;
        const bodies = scene.simState.universe.length;
        const target = nativeSize(canvas);
        const tw = adaptive.traceW || canvas.width;
        const th = adaptive.traceH || canvas.height;
        const atWindow = Math.abs(tw - target.w) <= 8 && Math.abs(th - target.h) <= 8;
        const rate = adaptive.raysPerSec || 0;
        const rateText = rate >= 1e6 ? (rate / 1e6).toFixed(1) + 'M/s'
            : rate >= 1000 ? Math.round(rate / 1000) + 'k/s'
            : rate > 0 ? Math.round(rate) + '/s' : '';
        stateView.innerText = tw + '×' + th
            + (atWindow ? '' : ' / ' + target.w + '×' + target.h)
            + (rateText ? '  ' + rateText : '')
            + '  ' + Math.round(adaptive.frameDt || adaptive.paintMs || 0) + 'ms  '
            + (scale > 0 ? scale + '×' : 'paused')
            + '  ' + bodies;
    }
    catch (err) {
        if (stateView)
            stateView.innerText = String(err && err.message || err);
    }
};
let pump = 0;
function startLoop() {
    clearInterval(pump);
    cancelAnimationFrame(raf);
    pump = setInterval(() => animate(performance.now()), 33);
    animate(performance.now());
}
function start() {
    started = true;
    scene.simState = window.createSim(viewParams.preset || 'system');
    frameCamera(scene);
    syncSceneObjects(scene);
    scene.runner = window.createRunner(scene.simState, new Clock(scene.simState), 1000 / 5, 1);
}
function loadPreset(kind) {
    viewParams.preset = kind;
    if (!started)
        return;
    scene.simState = window.createSim(kind);
    adaptive.ceiling = 0;
    adaptive.raysPerSec = 0;
    adaptive.cap = 0;
    scene.runner = window.createRunner(scene.simState, new Clock(scene.simState), 1000 / 5, 1);
    frameCamera(scene);
    syncSceneObjects(scene);
}
function syncSceneObjects(scene) {
    const universe = scene.simState && scene.simState.universe;
    if (!universe)
        return;
    const objects = [];
    for (let i = 0; i < universe.length && i < MAX_RENDER; i++) {
        const mass = universe[i];
        const c = mass.color;
        objects.push(['sphere', {
            radius: mass.size,
            origin: mass.position,
            color: [c[0] / 255, c[1] / 255, c[2] / 255, c[3] > 1 ? c[3] / 255 : c[3]],
            reflectivity: mass.reflectivity || 0,
            texture: mass.texture || null
        }]);
    }
    scene.objects = objects;
    scene.shapes = (scene.simState && scene.simState.shapes) || [];
}
function frameCamera(scene) {
    const universe = scene.simState.universe;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < universe.length; i++) {
        const mass = universe[i];
        minX = Math.min(minX, mass.position[0] - mass.size);
        maxX = Math.max(maxX, mass.position[0] + mass.size);
        minY = Math.min(minY, mass.position[1] - mass.size);
        maxY = Math.max(maxY, mass.position[1] + mass.size);
    }
    const shapes = scene.simState.shapes || [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const pad = shape.r || 0;
        const pts = [shape.a, shape.b, shape.c];
        for (let k = 0; k < pts.length; k++) {
            const p = pts[k];
            if (!p)
                continue;
            if (shape.kind === 'plane' && k > 0)
                continue;
            if (shape.kind === 'disk' && k > 0)
                continue;
            if (shape.kind === 'box' && k > 0)
                continue;
            minX = Math.min(minX, p[0] - pad);
            maxX = Math.max(maxX, p[0] + pad);
            minY = Math.min(minY, p[1] - pad);
            maxY = Math.max(maxY, p[1] + pad);
        }
        if (shape.kind === 'box') {
            minX = Math.min(minX, shape.a[0] - shape.b[0]);
            maxX = Math.max(maxX, shape.a[0] + shape.b[0]);
            minY = Math.min(minY, shape.a[1] - shape.b[1]);
            maxY = Math.max(maxY, shape.a[1] + shape.b[1]);
        }
    }
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    const span = Math.max(80, maxX - minX, maxY - minY);
    const half = Math.tan((scene.camera.fov * Math.PI / 180) / 2);
    const wide = half * scene.camera.aspect;
    const z = -Math.max(span / (wide * 1.35), span / (half * 1.35), 80);
    scene.camera.origin = [midX, midY, z];
    scene.camera.dir = [0, 0, 1];
    syncCameraInputs();
}
function worldToScreen(point, camera, w, h) {
    const rel = vDifference(camera.origin, point);
    const q = qFromUnitVectors(vUnit(camera.dir), [0, 0, 1]);
    const cam = rotateVectorByQ(rel, q);
    if (cam[2] < 0.05)
        return null;
    const half = Math.tan((camera.fov * Math.PI / 180) / 2) * camera.planeDistance;
    const px = cam[0] / cam[2] * camera.planeDistance;
    const py = cam[1] / cam[2] * camera.planeDistance;
    const u = (px / (camera.aspect * half) + 1) / 2;
    const v = (1 - py / half) / 2;
    return [u * w, v * h];
}
function sampleTrails() {
    const bodies = scene.simState && scene.simState.universe;
    if (!bodies || bodies.length > MAX_SPHERES)
        return;
    for (let i = 0; i < bodies.length; i++) {
        const mass = bodies[i];
        if (!mass.trail)
            mass.trail = [];
        const p = mass.position;
        const last = mass.trail[mass.trail.length - 1];
        if (!last || Math.hypot(p[0] - last[0], p[1] - last[1], p[2] - last[2]) > 0.35)
            mass.trail.push([p[0], p[1], p[2]]);
        if (mass.trail.length > 80)
            mass.trail.shift();
    }
}
function paintTrails() {
    if (!trailCtx || !trailCanvas || !canvas)
        return;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(2, Math.round(rect.width));
    const h = Math.max(2, Math.round(rect.height));
    if (Math.abs(trailCanvas.width - w) > 8 || Math.abs(trailCanvas.height - h) > 8) {
        trailCanvas.width = w;
        trailCanvas.height = h;
    }
    trailCtx.clearRect(0, 0, w, h);
    const bodies = scene.simState && scene.simState.universe;
    if (!bodies || bodies.length > MAX_SPHERES)
        return;
    trailCtx.lineWidth = 2;
    trailCtx.lineJoin = 'round';
    for (let i = 0; i < bodies.length; i++) {
        const mass = bodies[i];
        const trail = mass.trail;
        if (!trail || trail.length < 2)
            continue;
        trailCtx.beginPath();
        let moved = false;
        for (let j = 0; j < trail.length; j++) {
            const screen = worldToScreen(trail[j], scene.camera, w, h);
            if (!screen) {
                moved = false;
                continue;
            }
            if (!moved)
                trailCtx.moveTo(screen[0], screen[1]);
            else
                trailCtx.lineTo(screen[0], screen[1]);
            moved = true;
        }
        const c = mass.color;
        trailCtx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.8)';
        trailCtx.stroke();
        const here = worldToScreen(mass.position, scene.camera, w, h);
        if (!here)
            continue;
        trailCtx.beginPath();
        trailCtx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.95)';
        trailCtx.arc(here[0], here[1], Math.max(2, mass.size * 0.15), 0, Math.PI * 2);
        trailCtx.fill();
    }
}
function spawnFromClick(event) {
    if (!scene.simState)
        return;
    const rect = canvas.getBoundingClientRect();
    const u = (event.clientX - rect.left) / Math.max(1, rect.width);
    const v = (event.clientY - rect.top) / Math.max(1, rect.height);
    const dir = project(u, v, scene.camera);
    if (Math.abs(dir[2]) < 1e-4)
        return;
    const origin = scene.camera.origin;
    const t = -origin[2] / dir[2];
    if (!(t > 0))
        return;
    const point = [origin[0] + dir[0] * t, origin[1] + dir[1] * t, 0];
    const state = scene.simState;
    let host = state.universe[0];
    let nearest = Infinity;
    for (let i = 0; i < state.universe.length; i++) {
        const mass = state.universe[i];
        const d = Math.hypot(point[0] - mass.position[0], point[1] - mass.position[1], point[2] - mass.position[2]);
        if (d < mass.size * 1.15)
            return;
        if (d < nearest) {
            nearest = d;
            host = mass;
        }
    }
    const relX = point[0] - host.position[0];
    const relY = point[1] - host.position[1];
    const dist = Math.hypot(relX, relY) || 1;
    const speed = Math.sqrt(state.gravityConstant * host.mass / dist);
    const tangent = Math.hypot(relY, relX) || 1;
    const radius = 8;
    const mass = (4 / 3) * Math.PI * radius * radius * radius;
    const palette = [[180, 220, 120, 255], [255, 170, 70, 255], [170, 140, 255, 255], [255, 120, 170, 255]];
    const body = new Mass(mass, palette[state.universe.length % palette.length], point, [
        host.velocity[0] - relY / tangent * speed,
        host.velocity[1] + relX / tangent * speed,
        host.velocity[2]
    ]);
    body.reflectivity = 0.35;
    body.texture = planetTexture(state.universe.length % 3);
    addMass(body, state);
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
const texHash = (x, y) => {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
    return n - Math.floor(n);
};
const texNoise = (x, y) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;
    const a = texHash(x0, y0);
    const b = texHash(x0 + 1, y0);
    const c = texHash(x0, y0 + 1);
    const d = texHash(x0 + 1, y0 + 1);
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
};
function makeTexture(width, height, fill) {
    const data = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const px = fill(x, y, width, height);
            const i = (y * width + x) * 4;
            data[i] = px[0];
            data[i + 1] = px[1];
            data[i + 2] = px[2];
            data[i + 3] = px.length > 3 ? px[3] : 255;
        }
    }
    return { width, height, data, revision: 0 };
}
function textureFromImage(source) {
    const width = source.naturalWidth || source.width;
    const height = source.naturalHeight || source.height;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(source, 0, 0, width, height);
    const image = ctx.getImageData(0, 0, width, height);
    return { width, height, data: image.data, revision: 0 };
}
function planetTexture(index) {
    if (index === 0)
        return makeTexture(128, 128, (x, y, w, h) => {
            const band = Math.sin((y / h) * Math.PI * 7 + texNoise(x / 18, y / 8) * 2.2);
            return band > 0 ? [150, 196, 255, 255] : [18, 42, 130, 255];
        });
    if (index === 1)
        return makeTexture(128, 128, (x, y) => {
            const land = texNoise(x / 18, y / 18) > 0.52;
            return land ? [92, 28, 18, 255] : [214, 96, 48, 255];
        });
    return makeTexture(128, 128, (x, y) => {
        const n = texNoise(x / 14, y / 14);
        return Math.abs(n - 0.5) < 0.045 ? [36, 44, 64, 255] : [232, 236, 244, 255];
    });
}
window.makeTexture = makeTexture;
window.textureFromImage = textureFromImage;
function sunTexture() {
    return makeTexture(128, 128, (x, y) => {
        const grain = texNoise(x / 14, y / 14);
        const fine = texNoise(x / 5, y / 5);
        const hot = grain * 0.75 + fine * 0.25;
        return [150 + hot * 105, 40 + hot * 170, 10 + hot * 50, 255];
    });
}
function moonTexture() {
    return makeTexture(128, 128, (x, y) => {
        let shade = 168;
        const craters = [[36, 40, 22], [88, 74, 16], [28, 96, 12], [78, 28, 10], [60, 60, 7]];
        for (let i = 0; i < craters.length; i++) {
            const dx = x - craters[i][0];
            const dy = y - craters[i][1];
            const d = Math.sqrt(dx * dx + dy * dy);
            const r = craters[i][2];
            if (d < r)
                shade = 96;
            else if (d < r + 3)
                shade = 214;
        }
        return [shade, shade + 8, shade + 18, 255];
    });
}
function systemBodies() {
    const sun = new Mass(1000000, [255, 210, 40, 255]);
    sun.reflectivity = 0.45;
    sun.texture = sunTexture();
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
        body.texture = planetTexture(i);
        bodies.push(body);
    }
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
    const moon = new Mass(moonMass, [150, 230, 255, 255], [host.position[0] + moonDist, host.position[1], 0], [0, host.velocity[1] + moonSpeed, 0]);
    moon.reflectivity = 0.6;
    moon.texture = moonTexture();
    bodies.push(moon);
    return bodies;
}
function binaryBodies() {
    const G = 6.67408e-7;
    const mass = 400000;
    const dist = 90;
    const speed = Math.sqrt(G * (mass + mass) / dist) / 2;
    const a = new Mass(mass, [255, 200, 80, 255], [-dist / 2, 0, 0], [0, speed, 0]);
    const b = new Mass(mass, [140, 180, 255, 255], [dist / 2, 0, 0], [0, -speed, 0]);
    a.reflectivity = 0.4;
    b.reflectivity = 0.4;
    a.texture = sunTexture();
    b.texture = makeTexture(128, 128, (x, y) => {
        const hot = texNoise(x / 12, y / 12);
        return [40 + hot * 80, 80 + hot * 100, 180 + hot * 60, 255];
    });
    return [a, b];
}
function pairBodies() {
    const G = 6.67408e-7;
    const mass = 8000;
    const dist = 150;
    const speed = Math.sqrt(G * (mass + mass) / dist) / 2;
    const a = new Mass(mass, [150, 170, 190, 255], [-dist / 2, 0, 0], [0, speed, 0]);
    const b = new Mass(mass, [90, 110, 140, 255], [dist / 2, 0, 0], [0, -speed, 0]);
    a.reflectivity = 0.2;
    b.reflectivity = 0.25;
    a.texture = planetTexture(2);
    b.texture = planetTexture(1);
    return [a, b];
}
function crowdBodies() {
    // Stronger than the solar-system constant so a mid-disk orbit takes a few
    // seconds. The crowd only gets one or two steps a frame.
    const G = 6.67408e-7 * 1.28e7;
    const sun = new Mass(2000000, [255, 214, 90, 255]);
    sun.reflectivity = 0.25;
    const bodies = [sun];
    const count = 1499;
    const inner = sun.size + 18;
    const outer = 560;
    const radius = 4.5;
    const particle = (4 / 3) * Math.PI * radius * radius * radius;
    const palette = [[176, 198, 255, 255], [255, 176, 114, 255], [226, 228, 236, 255]];
    for (let i = 0; i < count; i++) {
        const dist = inner + (outer - inner) * Math.sqrt((i + 0.5) / count);
        const ang = i * 2.399963229728653;
        const lift = Math.sin(i * 12.9898) * dist * 0.05;
        const enclosed = sun.mass + particle * count * ((i + 0.5) / count) * 0.55;
        const speed = Math.sqrt(G * enclosed / dist) * (0.94 + (i % 5) * 0.025);
        const climb = Math.cos(i * 4.37) * speed * 0.035;
        const body = new Mass(particle, palette[i % 3], [Math.cos(ang) * dist, Math.sin(ang) * dist, lift], [-Math.sin(ang) * speed, Math.cos(ang) * speed, climb]);
        body.reflectivity = 0;
        bodies.push(body);
    }
    return bodies;
}
function shapeBodies() {
    const G = 6.67408e-7;
    const K = 40000;
    const core = new Mass(20000, [90, 150, 255, 255]);
    core.charge = -4;
    core.reflectivity = 0.35;
    const bodies = [core];
    const moons = [
        [70, 1, 0.4, [255, 96, 64, 255]],
        [70, 1, 2.6, [255, 176, 64, 255]],
        [108, -1, 4.4, [150, 230, 255, 255]]
    ];
    for (let i = 0; i < moons.length; i++) {
        const dist = moons[i][0], q = moons[i][1], ang = moons[i][2], color = moons[i][3];
        const mass = 4000;
        const toward = (G * core.mass - K * q * core.charge / mass) / (dist * dist);
        const speed = Math.sqrt(Math.max(0, toward) * dist);
        const body = new Mass(mass, color, [Math.cos(ang) * dist, Math.sin(ang) * dist, 0], [-Math.sin(ang) * speed, Math.cos(ang) * speed, 0]);
        body.charge = q;
        body.reflectivity = 0.4;
        bodies.push(body);
    }
    const left = new Mass(3000, [255, 70, 110, 255], [-28, 52, 0], [0, 0.12, 0]);
    const right = new Mass(3000, [255, 70, 110, 255], [28, 52, 0], [0, 0.12, 0]);
    left.charge = 2;
    right.charge = 2;
    left.reflectivity = 0.25;
    right.reflectivity = 0.25;
    bodies.push(left, right);
    return bodies;
}
function shapePrimitives() {
    const disk = { kind: 'disk', mass: 6000, charge: 1, velocity: [0.35, 0.02, -0.08], a: [-90, 0, 36], b: [0, 0, 1], r: 22, color: [0.95, 0.5, 0.15, 1], reflectivity: 0.2 };
    const box = { kind: 'box', mass: 10000, charge: -1, velocity: [0.15, 0.04, -0.12], a: [-20, 8, 48], b: [16, 16, 16], color: [0.3, 0.78, 0.38, 1], reflectivity: 0.15 };
    const capsule = { kind: 'capsule', mass: 5000, charge: 1, velocity: [-0.22, 0.05, -0.05], a: [40, -28, 36], b: [40, 32, 36], r: 10, color: [0.3, 0.85, 0.92, 1], reflectivity: 0.2 };
    const cylinder = { kind: 'cylinder', mass: 8000, charge: 0, velocity: [-0.05, -0.85, 0.04], a: [100, -32, 28], b: [100, 36, 28], r: 12, color: [0.58, 0.36, 0.92, 1], reflectivity: 0.15 };
    const triangle = { kind: 'triangle', mass: 3500, charge: 2, velocity: [-0.28, -0.12, -0.04], a: [20, 55, 20], b: [78, 70, 8], c: [36, 28, 52], color: [0.9, 0.9, 0.84, 1], reflectivity: 0.5 };
    const shapes = [
        { kind: 'plane', fixed: true, a: [0, -90, 0], b: [0, 1, 0], color: [0.16, 0.18, 0.22, 1], reflectivity: 0.08 },
        disk, box, capsule, cylinder, triangle
    ];
    for (let i = 0; i < shapes.length; i++) {
        if (!shapes[i].velocity)
            shapes[i].velocity = [0, 0, 0];
        shapes[i].gravity = [0, 0, 0];
    }
    return shapes;
}
function centerUniverse(state) {
    const mass = state.currentCameraTarget;
    if (!mass)
        return;
    const tp = mass.position.slice();
    const universe = state.universe;
    for (let i = 0; i < universe.length; i++) {
        const p = universe[i].position;
        p[0] -= tp[0];
        p[1] -= tp[1];
        p[2] -= tp[2];
    }
}
window.createSim = (kind) => {
    const builders = { system: systemBodies, binary: binaryBodies, pair: pairBodies, crowd: crowdBodies, shapes: shapeBodies };
    const state = createUniverse((builders[kind] || systemBodies)());
    state.stepsPerSecond = 900;
    state.coulombConstant = kind === 'shapes' ? 40000 : 0;
    state.shapes = kind === 'shapes' ? shapePrimitives() : [];
    if (kind === 'crowd')
        state.gravityConstant = 6.67408e-7 * 1.28e7;
    centerUniverse(state);
    return state;
};
window.createRunner = (state, clock = new Clock(state), maxRunTime = 1000 / 30, GUIUpdateRate = 100) => {
    const { startTime } = clock, { events, inputEvents, playback } = state;
    let currentTick = 0, lastGUIUpdate = 0, currentTime;
    return playback ? runnerWithPlayback(playback) : runner;
    function runner(runTime = clock.currentTime) {
        const scale = viewParams.timeScale || 0;
        if (!(scale > 0))
            return;
        const saved = state.ticksPerStep;
        state.ticksPerStep = Math.max(2, Math.round(saved / Math.min(scale, 12)));
        const t0 = performance.now();
        let steps = 0;
        while (steps < 100 && performance.now() - t0 < 10) {
            handleEvents(state);
            tick(state);
            currentTick++;
            steps++;
        }
        state.ticksPerStep = saved;
        const shift = state.currentCameraTarget && state.currentCameraTarget.position.slice();
        centerOn(state.currentCameraTarget, state.universe);
        shiftShapes(state.shapes, shift);
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
            const shift = state.currentCameraTarget && state.currentCameraTarget.position.slice();
            centerOn(state.currentCameraTarget, state.universe);
            shiftShapes(state.shapes, shift);
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
    function shiftShapes(shapes, delta) {
        if (!shapes || !delta)
            return;
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            const pts = shapePoints(shape);
            for (let k = 0; k < pts.length; k++) {
                const p = pts[k];
                if (!p)
                    continue;
                p[0] -= delta[0];
                p[1] -= delta[1];
                p[2] -= delta[2];
            }
        }
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
        coulombConstant: 0,
        speedlimit: 300000,
        fieldOfView: 120,
        maximumMasses: 8192,
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
const GRAVITY_OCTREE_AT = 1000;
const RAY_OCTREE_AT = 32;
const OCTREE_THETA2 = 0.36;
const MAX_OCTREE_BODIES = 8192;
const MAX_OCTREE_NODES = 32768;
const bodyX = new Float64Array(MAX_OCTREE_BODIES);
const bodyY = new Float64Array(MAX_OCTREE_BODIES);
const bodyZ = new Float64Array(MAX_OCTREE_BODIES);
const bodyM = new Float64Array(MAX_OCTREE_BODIES);
const bodyR = new Float64Array(MAX_OCTREE_BODIES);
const bodyIdx = new Int32Array(MAX_OCTREE_BODIES);
const rayObjs = new Array(MAX_OCTREE_BODIES);
const nodeX = new Float64Array(MAX_OCTREE_NODES);
const nodeY = new Float64Array(MAX_OCTREE_NODES);
const nodeZ = new Float64Array(MAX_OCTREE_NODES);
const nodeHalf = new Float64Array(MAX_OCTREE_NODES);
const nodeMass = new Float64Array(MAX_OCTREE_NODES);
const nodeComX = new Float64Array(MAX_OCTREE_NODES);
const nodeComY = new Float64Array(MAX_OCTREE_NODES);
const nodeComZ = new Float64Array(MAX_OCTREE_NODES);
const nodeRad = new Float64Array(MAX_OCTREE_NODES);
const nodeStart = new Int32Array(MAX_OCTREE_NODES);
const nodeLen = new Int32Array(MAX_OCTREE_NODES);
const nodeChild = new Int32Array(MAX_OCTREE_NODES);
const nodeIds = new Int16Array(MAX_OCTREE_NODES * 8);
const octStack = new Int32Array(4096);
let nodeN = 0;
function buildOctree(n) {
    nodeN = 0;
    if (n < 1)
        return -1;
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (let i = 0; i < n; i++) {
        const x = bodyX[i], y = bodyY[i], z = bodyZ[i];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
        bodyIdx[i] = i;
    }
    const root = nodeN++;
    nodeHalf[root] = Math.max(maxX - minX, maxY - minY, maxZ - minZ) / 2 + 1;
    nodeX[root] = (minX + maxX) / 2;
    nodeY[root] = (minY + maxY) / 2;
    nodeZ[root] = (minZ + maxZ) / 2;
    nodeStart[root] = 0;
    nodeLen[root] = n;
    nodeChild[root] = -1;
    const stack = [root];
    while (stack.length) {
        const id = stack.pop();
        if (nodeLen[id] <= 8 || nodeHalf[id] < 4 || nodeN + 8 > MAX_OCTREE_NODES)
            continue;
        const h = nodeHalf[id] / 2;
        const base = nodeN;
        nodeChild[id] = base;
        for (let k = 0; k < 8; k++) {
            const c = nodeN++;
            nodeHalf[c] = h;
            nodeChild[c] = -1;
            nodeLen[c] = 0;
            nodeX[c] = nodeX[id] + (k & 1 ? h : -h);
            nodeY[c] = nodeY[id] + (k & 2 ? h : -h);
            nodeZ[c] = nodeZ[id] + (k & 4 ? h : -h);
        }
        const st = nodeStart[id];
        const len = nodeLen[id];
        const counts = [0, 0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < len; i++) {
            const bi = bodyIdx[st + i];
            const oct = (bodyX[bi] >= nodeX[id] ? 1 : 0) | (bodyY[bi] >= nodeY[id] ? 2 : 0) | (bodyZ[bi] >= nodeZ[id] ? 4 : 0);
            counts[oct]++;
        }
        let run = st;
        for (let k = 0; k < 8; k++) {
            nodeStart[base + k] = run;
            nodeLen[base + k] = counts[k];
            run += counts[k];
        }
        const tmp = new Int32Array(len);
        const fill = counts.slice();
        for (let k = 0; k < 8; k++)
            fill[k] = nodeStart[base + k] - st;
        for (let i = 0; i < len; i++) {
            const bi = bodyIdx[st + i];
            const oct = (bodyX[bi] >= nodeX[id] ? 1 : 0) | (bodyY[bi] >= nodeY[id] ? 2 : 0) | (bodyZ[bi] >= nodeZ[id] ? 4 : 0);
            tmp[fill[oct]++] = bi;
        }
        for (let i = 0; i < len; i++)
            bodyIdx[st + i] = tmp[i];
        for (let k = 0; k < 8; k++)
            if (nodeLen[base + k] > 0)
                stack.push(base + k);
    }
    const order = [];
    const walk = [root];
    while (walk.length) {
        const id = walk.pop();
        order.push(id);
        const base = nodeChild[id];
        if (base >= 0)
            for (let k = 0; k < 8; k++)
                if (nodeLen[base + k] > 0)
                    walk.push(base + k);
    }
    for (let i = order.length - 1; i >= 0; i--) {
        const id = order[i];
        const base = nodeChild[id];
        let mass = 0, cx = 0, cy = 0, cz = 0, rad = 0;
        if (base < 0) {
            for (let j = 0; j < nodeLen[id]; j++) {
                const bi = bodyIdx[nodeStart[id] + j];
                const mm = bodyM[bi];
                mass += mm;
                cx += bodyX[bi] * mm;
                cy += bodyY[bi] * mm;
                cz += bodyZ[bi] * mm;
                if (bodyR[bi] > rad)
                    rad = bodyR[bi];
            }
        }
        else {
            for (let k = 0; k < 8; k++) {
                if (nodeLen[base + k] <= 0)
                    continue;
                const c = base + k;
                mass += nodeMass[c];
                cx += nodeComX[c] * nodeMass[c];
                cy += nodeComY[c] * nodeMass[c];
                cz += nodeComZ[c] * nodeMass[c];
                if (nodeRad[c] > rad)
                    rad = nodeRad[c];
            }
        }
        nodeMass[id] = mass;
        nodeRad[id] = rad;
        nodeComX[id] = mass ? cx / mass : nodeX[id];
        nodeComY[id] = mass ? cy / mass : nodeY[id];
        nodeComZ[id] = mass ? cz / mass : nodeZ[id];
    }
    for (let id = 0; id < nodeN; id++) {
        if (nodeChild[id] >= 0)
            continue;
        const st = nodeStart[id];
        const len = nodeLen[id] < 8 ? nodeLen[id] : 8;
        for (let k = 0; k < len; k++)
            nodeIds[id * 8 + k] = bodyIdx[st + k];
    }
    return root;
}
function exactBodyForces(state) {
    // The octree sorts bodies and answers ray queries. It does not
    // approximate forces. Gravity and Coulomb are the exact pair formula.
    const universe = state.universe;
    const n = universe.length;
    const G = state.gravityConstant;
    const K = state.coulombConstant || 0;
    for (let i = 0; i < n; i++) {
        const a = universe[i];
        const pa = a.position;
        const ga = a.gravity;
        const qa = a.charge || 0;
        const ma = a.mass;
        const sa = a.collisionSize;
        for (let j = i + 1; j < n; j++) {
            const b = universe[j];
            const pb = b.position;
            const dx = pb[0] - pa[0];
            const dy = pb[1] - pa[1];
            const dz = pb[2] - pa[2];
            const d2 = dx * dx + dy * dy + dz * dz;
            const gb = b.gravity;
            const reach = sa + b.collisionSize;
            if (!(d2 > 1e-8)) {
                applySphereContact(pa, pb, a.velocity, b.velocity, sa, b.collisionSize, ma, b.mass, ga, gb, state.ticksPerStep);
                continue;
            }
            const inv = (G * ma * b.mass - K * qa * (b.charge || 0)) / (d2 * Math.sqrt(d2));
            ga[0] += dx * inv;
            ga[1] += dy * inv;
            ga[2] += dz * inv;
            gb[0] -= dx * inv;
            gb[1] -= dy * inv;
            gb[2] -= dz * inv;
            if (d2 < reach * reach)
                applySphereContact(pa, pb, a.velocity, b.velocity, sa, b.collisionSize, ma, b.mass, ga, gb, state.ticksPerStep);
        }
        const invM = 1 / ma;
        ga[0] *= invM;
        ga[1] *= invM;
        ga[2] *= invM;
    }
}
function prepareRayTree(scene) {
    const objects = scene.objects;
    let n = 0;
    for (let i = 0; i < objects.length && n < MAX_OCTREE_BODIES; i++) {
        const item = objects[i];
        if (item[0] !== 'sphere')
            continue;
        const sphere = item[1];
        const p = sphere.origin;
        bodyX[n] = p[0];
        bodyY[n] = p[1];
        bodyZ[n] = p[2];
        bodyM[n] = 1;
        bodyR[n] = sphere.radius;
        rayObjs[n] = sphere;
        n++;
    }
    if (n < RAY_OCTREE_AT) {
        scene._rayRoot = -1;
        return;
    }
    scene._rayRoot = buildOctree(n);
    scene._rayN = n;
}
function packGpuNodes(count) {
    for (let i = 0; i < count; i++) {
        bodyX[i] = gpuSphereData[i * 4];
        bodyY[i] = gpuSphereData[i * 4 + 1];
        bodyZ[i] = gpuSphereData[i * 4 + 2];
        bodyR[i] = gpuSphereData[i * 4 + 3];
        bodyM[i] = 1;
    }
    const root = buildOctree(count);
    if (root < 0 || nodeN > MAX_GPU_NODES || nodeN < 1)
        return false;
    for (let id = 0; id < nodeN; id++) {
        if (nodeChild[id] < 0 && nodeLen[id] > 8)
            return false;
    }
    for (let id = 0; id < nodeN; id++) {
        const o = id * 16;
        const ids = id * 8;
        gpuNodeData[o] = nodeX[id];
        gpuNodeData[o + 1] = nodeY[id];
        gpuNodeData[o + 2] = nodeZ[id];
        gpuNodeData[o + 3] = nodeHalf[id] + nodeRad[id];
        gpuNodeData[o + 4] = nodeChild[id];
        gpuNodeData[o + 5] = nodeLen[id];
        gpuNodeData[o + 6] = nodeChild[id] < 0 ? nodeIds[ids] : 0;
        gpuNodeData[o + 7] = nodeChild[id] < 0 ? nodeIds[ids + 1] : 0;
        gpuNodeData[o + 8] = nodeChild[id] < 0 ? nodeIds[ids + 2] : 0;
        gpuNodeData[o + 9] = nodeChild[id] < 0 ? nodeIds[ids + 3] : 0;
        gpuNodeData[o + 10] = nodeChild[id] < 0 ? nodeIds[ids + 4] : 0;
        gpuNodeData[o + 11] = nodeChild[id] < 0 ? nodeIds[ids + 5] : 0;
        gpuNodeData[o + 12] = nodeChild[id] < 0 ? nodeIds[ids + 6] : 0;
        gpuNodeData[o + 13] = nodeChild[id] < 0 ? nodeIds[ids + 7] : 0;
    }
    return true;
}
function shapePoints(shape) {
    if (shape.kind === 'plane' || shape.kind === 'disk' || shape.kind === 'box')
        return [shape.a];
    if (shape.kind === 'triangle')
        return [shape.a, shape.b, shape.c];
    return [shape.a, shape.b];
}
function shapeCenter(shape, out) {
    const c = out || [0, 0, 0];
    if (shape.kind === 'capsule' || shape.kind === 'cylinder') {
        c[0] = (shape.a[0] + shape.b[0]) * 0.5;
        c[1] = (shape.a[1] + shape.b[1]) * 0.5;
        c[2] = (shape.a[2] + shape.b[2]) * 0.5;
        return c;
    }
    if (shape.kind === 'triangle') {
        c[0] = (shape.a[0] + shape.b[0] + shape.c[0]) / 3;
        c[1] = (shape.a[1] + shape.b[1] + shape.c[1]) / 3;
        c[2] = (shape.a[2] + shape.b[2] + shape.c[2]) / 3;
        return c;
    }
    c[0] = shape.a[0];
    c[1] = shape.a[1];
    c[2] = shape.a[2];
    return c;
}
function translateShape(shape, delta) {
    const pts = shapePoints(shape);
    for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (!p)
            continue;
        p[0] += delta[0];
        p[1] += delta[1];
        p[2] += delta[2];
    }
}
function shapeHalf(shapes, ticksPerStep) {
    if (!shapes)
        return;
    const dt = 1 / ticksPerStep;
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shape.fixed || !(shape.mass > 0))
            continue;
        const v = shape.velocity;
        translateShape(shape, [v[0] * dt * 0.5, v[1] * dt * 0.5, v[2] * dt * 0.5]);
        shape.gravity[0] = 0;
        shape.gravity[1] = 0;
        shape.gravity[2] = 0;
    }
}
function shapeKick(shapes, ticksPerStep) {
    if (!shapes)
        return;
    const dt = 1 / ticksPerStep;
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        if (shape.fixed || !(shape.mass > 0))
            continue;
        const v = shape.velocity;
        const g = shape.gravity;
        v[0] += g[0] * dt;
        v[1] += g[1] * dt;
        v[2] += g[2] * dt;
        translateShape(shape, [v[0] * dt * 0.5, v[1] * dt * 0.5, v[2] * dt * 0.5]);
    }
}
function shapeForces(state) {
    const shapes = state.shapes;
    if (!shapes || !shapes.length)
        return;
    const universe = state.universe;
    const G = state.gravityConstant;
    const K = state.coulombConstant || 0;
    const center = [0, 0, 0];
    const otherCenter = [0, 0, 0];
    for (let s = 0; s < shapes.length; s++) {
        const shape = shapes[s];
        if (!(shape.mass > 0) || shape.fixed)
            continue;
        shapeCenter(shape, center);
        const ms = shape.mass;
        const qs = shape.charge || 0;
        for (let i = 0; i < universe.length; i++) {
            const body = universe[i];
            const p = body.position;
            const dx = center[0] - p[0];
            const dy = center[1] - p[1];
            const dz = center[2] - p[2];
            const d2 = dx * dx + dy * dy + dz * dz;
            if (!(d2 > 1e-6))
                continue;
            const force = (G * body.mass * ms - K * (body.charge || 0) * qs) / (d2 * Math.sqrt(d2));
            const im = 1 / body.mass;
            const sm = 1 / ms;
            body.gravity[0] += dx * force * im;
            body.gravity[1] += dy * force * im;
            body.gravity[2] += dz * force * im;
            shape.gravity[0] -= dx * force * sm;
            shape.gravity[1] -= dy * force * sm;
            shape.gravity[2] -= dz * force * sm;
        }
        for (let t = s + 1; t < shapes.length; t++) {
            const other = shapes[t];
            if (!(other.mass > 0) || other.fixed)
                continue;
            shapeCenter(other, otherCenter);
            const dx = otherCenter[0] - center[0];
            const dy = otherCenter[1] - center[1];
            const dz = otherCenter[2] - center[2];
            const d2 = dx * dx + dy * dy + dz * dz;
            if (!(d2 > 1e-6))
                continue;
            const mo = other.mass;
            const force = (G * ms * mo - K * qs * (other.charge || 0)) / (d2 * Math.sqrt(d2));
            shape.gravity[0] += dx * force / ms;
            shape.gravity[1] += dy * force / ms;
            shape.gravity[2] += dz * force / ms;
            other.gravity[0] -= dx * force / mo;
            other.gravity[1] -= dy * force / mo;
            other.gravity[2] -= dz * force / mo;
        }
    }
}
function unit3(x, y, z) {
    const len = Math.hypot(x, y, z) || 1;
    return [x / len, y / len, z / len];
}
function sphereShapeContact(body, shape) {
    const p = body.position;
    const rad = body.size;
    if (shape.kind === 'plane' || shape.kind === 'disk') {
        const n = unit3(shape.b[0], shape.b[1], shape.b[2]);
        const relX = p[0] - shape.a[0];
        const relY = p[1] - shape.a[1];
        const relZ = p[2] - shape.a[2];
        const along = relX * n[0] + relY * n[1] + relZ * n[2];
        const px = relX - n[0] * along;
        const py = relY - n[1] * along;
        const pz = relZ - n[2] * along;
        const planar = Math.hypot(px, py, pz);
        if (shape.kind === 'disk' && planar > shape.r) {
            const scale = shape.r / planar;
            const cx = shape.a[0] + px * scale;
            const cy = shape.a[1] + py * scale;
            const cz = shape.a[2] + pz * scale;
            const dx = p[0] - cx, dy = p[1] - cy, dz = p[2] - cz;
            const dist = Math.hypot(dx, dy, dz);
            if (!(dist < rad) || dist < 1e-8)
                return null;
            return { n: [dx / dist, dy / dist, dz / dist], pen: rad - dist };
        }
        if (Math.abs(along) >= rad)
            return null;
        const sign = along >= 0 ? 1 : -1;
        return { n: [n[0] * sign, n[1] * sign, n[2] * sign], pen: rad - Math.abs(along) };
    }
    if (shape.kind === 'box') {
        const c = shape.a;
        const h = shape.b;
        const q0 = p[0] - c[0], q1 = p[1] - c[1], q2 = p[2] - c[2];
        const c0 = Math.max(-h[0], Math.min(h[0], q0));
        const c1 = Math.max(-h[1], Math.min(h[1], q1));
        const c2 = Math.max(-h[2], Math.min(h[2], q2));
        const inside = q0 === c0 && q1 === c1 && q2 === c2;
        if (!inside) {
            const dx = q0 - c0, dy = q1 - c1, dz = q2 - c2;
            const dist = Math.hypot(dx, dy, dz);
            if (!(dist < rad) || dist < 1e-8)
                return null;
            return { n: [dx / dist, dy / dist, dz / dist], pen: rad - dist };
        }
        const faces = [[h[0] - q0, 0, 1], [q0 + h[0], 0, -1], [h[1] - q1, 1, 1], [q1 + h[1], 1, -1], [h[2] - q2, 2, 1], [q2 + h[2], 2, -1]];
        let best = faces[0];
        for (let i = 1; i < faces.length; i++)
            if (faces[i][0] < best[0])
                best = faces[i];
        const n = [0, 0, 0];
        n[best[1]] = best[2];
        return { n, pen: best[0] + rad };
    }
    if (shape.kind === 'capsule')
        return segmentContact(p, rad, shape.a, shape.b, shape.r);
    if (shape.kind === 'cylinder')
        return cylinderContact(p, rad, shape.a, shape.b, shape.r);
    if (shape.kind === 'triangle')
        return triangleContact(p, rad, shape.a, shape.b, shape.c);
    return null;
}
function segmentContact(p, rad, a, b, extra) {
    const abx = b[0] - a[0], aby = b[1] - a[1], abz = b[2] - a[2];
    const ab2 = abx * abx + aby * aby + abz * abz || 1e-8;
    let t = ((p[0] - a[0]) * abx + (p[1] - a[1]) * aby + (p[2] - a[2]) * abz) / ab2;
    if (t < 0)
        t = 0;
    else if (t > 1)
        t = 1;
    const cx = a[0] + abx * t, cy = a[1] + aby * t, cz = a[2] + abz * t;
    const dx = p[0] - cx, dy = p[1] - cy, dz = p[2] - cz;
    const dist = Math.hypot(dx, dy, dz);
    const reach = rad + extra;
    if (!(dist < reach))
        return null;
    if (dist < 1e-6)
        return { n: [0, 1, 0], pen: reach };
    return { n: [dx / dist, dy / dist, dz / dist], pen: reach - dist };
}
function cylinderContact(p, rad, a, b, radius) {
    const abx = b[0] - a[0], aby = b[1] - a[1], abz = b[2] - a[2];
    const abLen = Math.hypot(abx, aby, abz) || 1e-8;
    const nx = abx / abLen, ny = aby / abLen, nz = abz / abLen;
    const apx = p[0] - a[0], apy = p[1] - a[1], apz = p[2] - a[2];
    const axial = apx * nx + apy * ny + apz * nz;
    const rx = apx - nx * axial, ry = apy - ny * axial, rz = apz - nz * axial;
    const radLen = Math.hypot(rx, ry, rz);
    if (axial >= 0 && axial <= abLen) {
        if (radLen > radius) {
            const dist = radLen - radius;
            if (!(dist < rad) || radLen < 1e-8)
                return null;
            return { n: [rx / radLen, ry / radLen, rz / radLen], pen: rad - dist };
        }
        const n = radLen > 1e-6 ? [rx / radLen, ry / radLen, rz / radLen] : [1, 0, 0];
        return { n, pen: rad + (radius - radLen) };
    }
    const cap = axial < 0 ? a : b;
    const ox = axial < 0 ? -nx : nx, oy = axial < 0 ? -ny : ny, oz = axial < 0 ? -nz : nz;
    const tx = p[0] - cap[0], ty = p[1] - cap[1], tz = p[2] - cap[2];
    const along = tx * ox + ty * oy + tz * oz;
    const ix = tx - ox * along, iy = ty - oy * along, iz = tz - oz * along;
    const inLen = Math.hypot(ix, iy, iz);
    let cx, cy, cz;
    if (inLen > radius && inLen > 1e-8) {
        const s = radius / inLen;
        cx = cap[0] + ix * s;
        cy = cap[1] + iy * s;
        cz = cap[2] + iz * s;
    }
    else {
        cx = cap[0] + ix;
        cy = cap[1] + iy;
        cz = cap[2] + iz;
    }
    const dx = p[0] - cx, dy = p[1] - cy, dz = p[2] - cz;
    const dist = Math.hypot(dx, dy, dz);
    if (!(dist < rad) || dist < 1e-8)
        return null;
    return { n: [dx / dist, dy / dist, dz / dist], pen: rad - dist };
}
function triangleContact(p, rad, a, b, c) {
    const closest = closestOnTriangle(p, a, b, c);
    const dx = p[0] - closest[0], dy = p[1] - closest[1], dz = p[2] - closest[2];
    const dist = Math.hypot(dx, dy, dz);
    if (!(dist < rad))
        return null;
    if (dist < 1e-6) {
        const e1x = b[0] - a[0], e1y = b[1] - a[1], e1z = b[2] - a[2];
        const e2x = c[0] - a[0], e2y = c[1] - a[1], e2z = c[2] - a[2];
        const n = unit3(e1y * e2z - e1z * e2y, e1z * e2x - e1x * e2z, e1x * e2y - e1y * e2x);
        return { n, pen: rad };
    }
    return { n: [dx / dist, dy / dist, dz / dist], pen: rad - dist };
}
function closestOnTriangle(p, a, b, c) {
    const abx = b[0] - a[0], aby = b[1] - a[1], abz = b[2] - a[2];
    const acx = c[0] - a[0], acy = c[1] - a[1], acz = c[2] - a[2];
    const apx = p[0] - a[0], apy = p[1] - a[1], apz = p[2] - a[2];
    const d1 = abx * apx + aby * apy + abz * apz;
    const d2 = acx * apx + acy * apy + acz * apz;
    if (d1 <= 0 && d2 <= 0)
        return [a[0], a[1], a[2]];
    const bpx = p[0] - b[0], bpy = p[1] - b[1], bpz = p[2] - b[2];
    const d3 = abx * bpx + aby * bpy + abz * bpz;
    const d4 = acx * bpx + acy * bpy + acz * bpz;
    if (d3 >= 0 && d4 <= d3)
        return [b[0], b[1], b[2]];
    const vc = d1 * d4 - d3 * d2;
    if (vc <= 0 && d1 >= 0 && d3 <= 0) {
        const v = d1 / (d1 - d3);
        return [a[0] + abx * v, a[1] + aby * v, a[2] + abz * v];
    }
    const cpx = p[0] - c[0], cpy = p[1] - c[1], cpz = p[2] - c[2];
    const d5 = abx * cpx + aby * cpy + abz * cpz;
    const d6 = acx * cpx + acy * cpy + acz * cpz;
    if (d6 >= 0 && d5 <= d6)
        return [c[0], c[1], c[2]];
    const vb = d5 * d2 - d1 * d6;
    if (vb <= 0 && d2 >= 0 && d6 <= 0) {
        const w = d2 / (d2 - d6);
        return [a[0] + acx * w, a[1] + acy * w, a[2] + acz * w];
    }
    const va = d3 * d6 - d5 * d4;
    if (va <= 0 && d4 >= d3 && d5 >= d6) {
        const w = (d4 - d3) / ((d4 - d3) + (d5 - d6));
        return [b[0] + (c[0] - b[0]) * w, b[1] + (c[1] - b[1]) * w, b[2] + (c[2] - b[2]) * w];
    }
    const denom = 1 / (va + vb + vc);
    const v = vb * denom;
    const w = vc * denom;
    return [a[0] + abx * v + acx * w, a[1] + aby * v + acy * w, a[2] + abz * v + acz * w];
}
function shapeSupport(shape, n) {
    if (shape.kind === 'disk') {
        const dn = unit3(shape.b[0], shape.b[1], shape.b[2]);
        const axial = n[0] * dn[0] + n[1] * dn[1] + n[2] * dn[2];
        const tx = n[0] - dn[0] * axial;
        const ty = n[1] - dn[1] * axial;
        const tz = n[2] - dn[2] * axial;
        const tl = Math.hypot(tx, ty, tz);
        if (tl < 1e-8)
            return [shape.a[0], shape.a[1], shape.a[2]];
        const s = shape.r / tl;
        return [shape.a[0] - tx * s, shape.a[1] - ty * s, shape.a[2] - tz * s];
    }
    if (shape.kind === 'box') {
        const h = shape.b;
        return [
            shape.a[0] - Math.sign(n[0]) * h[0],
            shape.a[1] - Math.sign(n[1]) * h[1],
            shape.a[2] - Math.sign(n[2]) * h[2]
        ];
    }
    if (shape.kind === 'cylinder') {
        const abx = shape.b[0] - shape.a[0], aby = shape.b[1] - shape.a[1], abz = shape.b[2] - shape.a[2];
        const abLen = Math.hypot(abx, aby, abz) || 1;
        const ax = abx / abLen, ay = aby / abLen, az = abz / abLen;
        const da = shape.a[0] * n[0] + shape.a[1] * n[1] + shape.a[2] * n[2];
        const db = shape.b[0] * n[0] + shape.b[1] * n[1] + shape.b[2] * n[2];
        const end = da < db ? shape.a : shape.b;
        const axial = n[0] * ax + n[1] * ay + n[2] * az;
        const tx = n[0] - ax * axial, ty = n[1] - ay * axial, tz = n[2] - az * axial;
        const tl = Math.hypot(tx, ty, tz);
        if (tl < 1e-8)
            return [end[0], end[1], end[2]];
        const s = shape.r / tl;
        return [end[0] - tx * s, end[1] - ty * s, end[2] - tz * s];
    }
    if (shape.kind === 'capsule') {
        const da = shape.a[0] * n[0] + shape.a[1] * n[1] + shape.a[2] * n[2];
        const db = shape.b[0] * n[0] + shape.b[1] * n[1] + shape.b[2] * n[2];
        const end = da < db ? shape.a : shape.b;
        return [end[0] - n[0] * shape.r, end[1] - n[1] * shape.r, end[2] - n[2] * shape.r];
    }
    if (shape.kind === 'triangle') {
        const pts = [shape.a, shape.b, shape.c];
        let best = pts[0];
        let bestD = best[0] * n[0] + best[1] * n[1] + best[2] * n[2];
        for (let i = 1; i < pts.length; i++) {
            const d = pts[i][0] * n[0] + pts[i][1] * n[1] + pts[i][2] * n[2];
            if (d < bestD) {
                best = pts[i];
                bestD = d;
            }
        }
        return [best[0], best[1], best[2]];
    }
    return [shape.a[0], shape.a[1], shape.a[2]];
}
const CONTACT_RESTITUTION = 0.72;
function contactForce(m1, m2, pen, vn, ticks) {
    if (!(pen > 0) || !(m1 > 0) || !(ticks > 0))
        return 0;
    const mu = m2 > 0 ? (m1 * m2) / (m1 + m2) : m1;
    if (!(mu > 0))
        return 0;
    let impulse = 0;
    if (vn < 0)
        impulse = -(1 + CONTACT_RESTITUTION) * vn * mu;
    else {
        const need = Math.min(0.75, pen * ticks / 40);
        if (vn < need)
            impulse = (need - vn) * mu;
    }
    return impulse * ticks;
}
function applyNormal(g, nx, ny, nz, scale) {
    g[0] += nx * scale;
    g[1] += ny * scale;
    g[2] += nz * scale;
}
function applySphereContact(p1, p2, v1, v2, r1, r2, m1, m2, g1, g2, ticks) {
    let dx = p1[0] - p2[0], dy = p1[1] - p2[1], dz = p1[2] - p2[2];
    let dist = Math.hypot(dx, dy, dz);
    const reach = r1 + r2;
    if (!(dist < reach))
        return;
    let nx, ny, nz;
    if (!(dist > 1e-8)) {
        nx = 0;
        ny = 1;
        nz = 0;
        dist = 0;
    } else {
        nx = dx / dist;
        ny = dy / dist;
        nz = dz / dist;
    }
    const vn = (v1[0] - v2[0]) * nx + (v1[1] - v2[1]) * ny + (v1[2] - v2[2]) * nz;
    const force = contactForce(m1, m2, reach - dist, vn, ticks);
    if (!(force > 0))
        return;
    applyNormal(g1, nx, ny, nz, force);
    applyNormal(g2, nx, ny, nz, -force);
}
function shapeSupportDir(shape, dx, dy, dz, out) {
    const skin = 0.15;
    if (shape.kind === 'box') {
        const h = shape.b, c = shape.a;
        out[0] = c[0] + (dx < 0 ? -h[0] : h[0]);
        out[1] = c[1] + (dy < 0 ? -h[1] : h[1]);
        out[2] = c[2] + (dz < 0 ? -h[2] : h[2]);
        return;
    }
    if (shape.kind === 'disk') {
        const len = Math.hypot(shape.b[0], shape.b[1], shape.b[2]) || 1;
        const nx = shape.b[0] / len, ny = shape.b[1] / len, nz = shape.b[2] / len;
        const axial = dx * nx + dy * ny + dz * nz;
        const tx = dx - nx * axial, ty = dy - ny * axial, tz = dz - nz * axial;
        const tl = Math.hypot(tx, ty, tz);
        if (tl > 1e-8) {
            const s = shape.r / tl;
            out[0] = shape.a[0] + tx * s;
            out[1] = shape.a[1] + ty * s;
            out[2] = shape.a[2] + tz * s;
        } else {
            out[0] = shape.a[0];
            out[1] = shape.a[1];
            out[2] = shape.a[2];
        }
        const side = axial >= 0 ? skin : -skin;
        out[0] += nx * side;
        out[1] += ny * side;
        out[2] += nz * side;
        return;
    }
    if (shape.kind === 'capsule') {
        const da = shape.a[0] * dx + shape.a[1] * dy + shape.a[2] * dz;
        const db = shape.b[0] * dx + shape.b[1] * dy + shape.b[2] * dz;
        const end = da > db ? shape.a : shape.b;
        const len = Math.hypot(dx, dy, dz) || 1;
        out[0] = end[0] + dx / len * shape.r;
        out[1] = end[1] + dy / len * shape.r;
        out[2] = end[2] + dz / len * shape.r;
        return;
    }
    if (shape.kind === 'cylinder') {
        const abx = shape.b[0] - shape.a[0], aby = shape.b[1] - shape.a[1], abz = shape.b[2] - shape.a[2];
        const abLen = Math.hypot(abx, aby, abz) || 1;
        const ax = abx / abLen, ay = aby / abLen, az = abz / abLen;
        const da = shape.a[0] * dx + shape.a[1] * dy + shape.a[2] * dz;
        const db = shape.b[0] * dx + shape.b[1] * dy + shape.b[2] * dz;
        const end = da > db ? shape.a : shape.b;
        const axial = dx * ax + dy * ay + dz * az;
        const rx = dx - ax * axial, ry = dy - ay * axial, rz = dz - az * axial;
        const rl = Math.hypot(rx, ry, rz);
        out[0] = end[0];
        out[1] = end[1];
        out[2] = end[2];
        if (rl > 1e-8) {
            const s = shape.r / rl;
            out[0] += rx * s;
            out[1] += ry * s;
            out[2] += rz * s;
        }
        return;
    }
    if (shape.kind === 'triangle') {
        const pts = [shape.a, shape.b, shape.c];
        let best = pts[0];
        let bestD = best[0] * dx + best[1] * dy + best[2] * dz;
        for (let i = 1; i < 3; i++) {
            const d = pts[i][0] * dx + pts[i][1] * dy + pts[i][2] * dz;
            if (d > bestD) {
                best = pts[i];
                bestD = d;
            }
        }
        const e1x = shape.b[0] - shape.a[0], e1y = shape.b[1] - shape.a[1], e1z = shape.b[2] - shape.a[2];
        const e2x = shape.c[0] - shape.a[0], e2y = shape.c[1] - shape.a[1], e2z = shape.c[2] - shape.a[2];
        let nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x;
        const nl = Math.hypot(nx, ny, nz) || 1;
        nx /= nl;
        ny /= nl;
        nz /= nl;
        const side = (dx * nx + dy * ny + dz * nz) >= 0 ? skin : -skin;
        out[0] = best[0] + nx * side;
        out[1] = best[1] + ny * side;
        out[2] = best[2] + nz * side;
        return;
    }
    out[0] = shape.a[0];
    out[1] = shape.a[1];
    out[2] = shape.a[2];
}
function minkowskiSupport(a, b, dx, dy, dz) {
    const pa = [0, 0, 0], pb = [0, 0, 0];
    shapeSupportDir(a, dx, dy, dz, pa);
    shapeSupportDir(b, -dx, -dy, -dz, pb);
    return [pa[0] - pb[0], pa[1] - pb[1], pa[2] - pb[2]];
}
function contactCross(ax, ay, az, bx, by, bz) {
    return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
}
function ensureSearchDir(dir, ax, ay, az) {
    if (Math.hypot(dir[0], dir[1], dir[2]) > 1e-8)
        return;
    if (Math.abs(ax) < 0.9) {
        dir[0] = 0;
        dir[1] = -az;
        dir[2] = ay;
    } else {
        dir[0] = -ay;
        dir[1] = ax;
        dir[2] = 0;
    }
}
function nextContactSimplex(simplex, dir) {
    const n = simplex.length;
    const a = simplex[n - 1];
    const aox = -a[0], aoy = -a[1], aoz = -a[2];
    if (n === 2) {
        const b = simplex[0];
        const abx = b[0] - a[0], aby = b[1] - a[1], abz = b[2] - a[2];
        if (abx * aox + aby * aoy + abz * aoz > 0) {
            const c = contactCross(abx, aby, abz, aox, aoy, aoz);
            const d = contactCross(c[0], c[1], c[2], abx, aby, abz);
            dir[0] = d[0];
            dir[1] = d[1];
            dir[2] = d[2];
            ensureSearchDir(dir, abx, aby, abz);
        } else {
            simplex[0] = a;
            simplex.length = 1;
            dir[0] = aox;
            dir[1] = aoy;
            dir[2] = aoz;
        }
        return false;
    }
    if (n === 3) {
        const b = simplex[1];
        const c = simplex[0];
        const abx = b[0] - a[0], aby = b[1] - a[1], abz = b[2] - a[2];
        const acx = c[0] - a[0], acy = c[1] - a[1], acz = c[2] - a[2];
        const abc = contactCross(abx, aby, abz, acx, acy, acz);
        const acN = contactCross(abc[0], abc[1], abc[2], acx, acy, acz);
        if (acN[0] * aox + acN[1] * aoy + acN[2] * aoz > 0) {
            if (acx * aox + acy * aoy + acz * aoz > 0) {
                simplex[0] = c;
                simplex[1] = a;
                simplex.length = 2;
                const cr = contactCross(acx, acy, acz, aox, aoy, aoz);
                const d = contactCross(cr[0], cr[1], cr[2], acx, acy, acz);
                dir[0] = d[0];
                dir[1] = d[1];
                dir[2] = d[2];
                ensureSearchDir(dir, acx, acy, acz);
            } else {
                simplex[0] = b;
                simplex[1] = a;
                simplex.length = 2;
                return nextContactSimplex(simplex, dir);
            }
        } else {
            const abN = contactCross(abx, aby, abz, abc[0], abc[1], abc[2]);
            if (abN[0] * aox + abN[1] * aoy + abN[2] * aoz > 0) {
                simplex[0] = b;
                simplex[1] = a;
                simplex.length = 2;
                return nextContactSimplex(simplex, dir);
            }
            if (abc[0] * aox + abc[1] * aoy + abc[2] * aoz > 0) {
                dir[0] = abc[0];
                dir[1] = abc[1];
                dir[2] = abc[2];
            } else {
                simplex[0] = b;
                simplex[1] = c;
                simplex[2] = a;
                dir[0] = -abc[0];
                dir[1] = -abc[1];
                dir[2] = -abc[2];
            }
        }
        return false;
    }
    const b = simplex[2];
    const c = simplex[1];
    const d = simplex[0];
    const abx = b[0] - a[0], aby = b[1] - a[1], abz = b[2] - a[2];
    const acx = c[0] - a[0], acy = c[1] - a[1], acz = c[2] - a[2];
    const adx = d[0] - a[0], ady = d[1] - a[1], adz = d[2] - a[2];
    const abc = contactCross(abx, aby, abz, acx, acy, acz);
    const acd = contactCross(acx, acy, acz, adx, ady, adz);
    const adb = contactCross(adx, ady, adz, abx, aby, abz);
    if (abc[0] * aox + abc[1] * aoy + abc[2] * aoz > 0) {
        simplex[0] = c;
        simplex[1] = b;
        simplex[2] = a;
        simplex.length = 3;
        dir[0] = abc[0];
        dir[1] = abc[1];
        dir[2] = abc[2];
        return false;
    }
    if (acd[0] * aox + acd[1] * aoy + acd[2] * aoz > 0) {
        simplex[0] = d;
        simplex[1] = c;
        simplex[2] = a;
        simplex.length = 3;
        dir[0] = acd[0];
        dir[1] = acd[1];
        dir[2] = acd[2];
        return false;
    }
    if (adb[0] * aox + adb[1] * aoy + adb[2] * aoz > 0) {
        simplex[0] = b;
        simplex[1] = d;
        simplex[2] = a;
        simplex.length = 3;
        dir[0] = adb[0];
        dir[1] = adb[1];
        dir[2] = adb[2];
        return false;
    }
    return true;
}
function contactFace(verts, i, j, k) {
    const a = verts[i], b = verts[j], c = verts[k];
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const len = Math.hypot(nx, ny, nz);
    if (!(len > 1e-10))
        return null;
    nx /= len;
    ny /= len;
    nz /= len;
    let dist = nx * a[0] + ny * a[1] + nz * a[2];
    if (dist < 0)
        return { i, j: k, k: j, nx: -nx, ny: -ny, nz: -nz, dist: -dist };
    return { i, j, k, nx, ny, nz, dist };
}
function addContactEdge(edges, a, b) {
    for (let i = 0; i < edges.length; i++) {
        if (edges[i][0] === b && edges[i][1] === a) {
            edges.splice(i, 1);
            return;
        }
    }
    edges.push([a, b]);
}
function convexContact(a, b) {
    const support = (dx, dy, dz) => minkowskiSupport(a, b, dx, dy, dz);
    const dir = [1, 0, 0];
    const simplex = [support(dir[0], dir[1], dir[2])];
    dir[0] = -simplex[0][0];
    dir[1] = -simplex[0][1];
    dir[2] = -simplex[0][2];
    let hit = false;
    for (let iter = 0; iter < 32; iter++) {
        if (!(Math.hypot(dir[0], dir[1], dir[2]) > 1e-12))
            return null;
        const p = support(dir[0], dir[1], dir[2]);
        if (p[0] * dir[0] + p[1] * dir[1] + p[2] * dir[2] < 0)
            return null;
        simplex.push(p);
        if (nextContactSimplex(simplex, dir)) {
            hit = true;
            break;
        }
    }
    if (!hit || simplex.length < 4)
        return null;
    const verts = simplex.slice(0, 4);
    let faces = [contactFace(verts, 0, 1, 2), contactFace(verts, 0, 2, 3), contactFace(verts, 0, 3, 1), contactFace(verts, 1, 3, 2)].filter(Boolean);
    let best = null;
    for (let iter = 0; iter < 24 && faces.length; iter++) {
        let closest = faces[0];
        for (let i = 1; i < faces.length; i++)
            if (faces[i].dist < closest.dist)
                closest = faces[i];
        best = closest;
        const p = support(closest.nx, closest.ny, closest.nz);
        const proj = p[0] * closest.nx + p[1] * closest.ny + p[2] * closest.nz;
        if (proj - closest.dist < 1e-4)
            break;
        verts.push(p);
        const idx = verts.length - 1;
        const edges = [];
        const next = [];
        for (let i = 0; i < faces.length; i++) {
            const f = faces[i];
            const dx = p[0] - verts[f.i][0], dy = p[1] - verts[f.i][1], dz = p[2] - verts[f.i][2];
            if (dx * f.nx + dy * f.ny + dz * f.nz > 1e-6) {
                addContactEdge(edges, f.i, f.j);
                addContactEdge(edges, f.j, f.k);
                addContactEdge(edges, f.k, f.i);
            } else
                next.push(f);
        }
        for (let i = 0; i < edges.length; i++) {
            const f = contactFace(verts, edges[i][0], edges[i][1], idx);
            if (f)
                next.push(f);
        }
        faces = next;
    }
    if (!best || !(best.dist > 0))
        return null;
    return { n: [-best.nx, -best.ny, -best.nz], pen: best.dist };
}
function pushAccel(g, nx, ny, nz, force, mass) {
    if (!g || !(mass > 0) || !(force !== 0))
        return;
    const s = force / mass;
    g[0] += nx * s;
    g[1] += ny * s;
    g[2] += nz * s;
}
function shapeContacts(state) {
    const shapes = state.shapes;
    if (!shapes || !shapes.length)
        return;
    const ticks = state.ticksPerStep;
    const universe = state.universe;
    const zero = [0, 0, 0];
    for (let s = 0; s < shapes.length; s++) {
        const shape = shapes[s];
        const shapeV = shape.fixed ? zero : shape.velocity;
        const shapeM = shape.fixed ? 0 : shape.mass;
        for (let i = 0; i < universe.length; i++) {
            const body = universe[i];
            const hit = sphereShapeContact(body, shape);
            if (!hit)
                continue;
            const vn = (body.velocity[0] - shapeV[0]) * hit.n[0] + (body.velocity[1] - shapeV[1]) * hit.n[1] + (body.velocity[2] - shapeV[2]) * hit.n[2];
            const force = contactForce(body.mass, shapeM, hit.pen, vn, ticks);
            pushAccel(body.gravity, hit.n[0], hit.n[1], hit.n[2], force, body.mass);
            if (!shape.fixed)
                pushAccel(shape.gravity, hit.n[0], hit.n[1], hit.n[2], -force, shape.mass);
        }
    }
    for (let s = 0; s < shapes.length; s++) {
        const shape = shapes[s];
        if (shape.fixed || !(shape.mass > 0))
            continue;
        for (let p = 0; p < shapes.length; p++) {
            const plane = shapes[p];
            if (plane.kind !== 'plane')
                continue;
            const n = unit3(plane.b[0], plane.b[1], plane.b[2]);
            const support = shapeSupport(shape, n);
            const gap = (support[0] - plane.a[0]) * n[0] + (support[1] - plane.a[1]) * n[1] + (support[2] - plane.a[2]) * n[2];
            if (!(gap < 0))
                continue;
            const vn = shape.velocity[0] * n[0] + shape.velocity[1] * n[1] + shape.velocity[2] * n[2];
            const force = contactForce(shape.mass, 0, -gap, vn, ticks);
            pushAccel(shape.gravity, n[0], n[1], n[2], force, shape.mass);
        }
        for (let t = s + 1; t < shapes.length; t++) {
            const other = shapes[t];
            if (other.kind === 'plane' || other.fixed || !(other.mass > 0))
                continue;
            const hit = convexContact(shape, other);
            if (!hit)
                continue;
            const vn = (shape.velocity[0] - other.velocity[0]) * hit.n[0] + (shape.velocity[1] - other.velocity[1]) * hit.n[1] + (shape.velocity[2] - other.velocity[2]) * hit.n[2];
            const force = contactForce(shape.mass, other.mass, hit.pen, vn, ticks);
            pushAccel(shape.gravity, hit.n[0], hit.n[1], hit.n[2], force, shape.mass);
            pushAccel(other.gravity, hit.n[0], hit.n[1], hit.n[2], -force, other.mass);
        }
    }
}
function tick(state) {
    state.currentTick++;
    positionHalfTick(state);
    updateGravities(state);
    updateVelocities(state);
    resolveCollisions(state);
    function positionHalfTick({ universe, ticksPerStep, shapes }) {
        for (let i = 0; i < universe.length; i++) {
            const mass = universe[i];
            mass.positionHalfTick(ticksPerStep);
            set(mass.gravity, 0, 0, 0);
        }
        shapeHalf(shapes, ticksPerStep);
    }
    function updateGravities(stateParts) {
        if (stateParts.universe.length >= GRAVITY_OCTREE_AT) {
            exactBodyForces(state);
            shapeForces(stateParts);
            shapeContacts(stateParts);
            return;
        }
        const { universe, collisionList, ticksPerStep, gravityConstant, coulombConstant, speedlimit } = stateParts;
        for (let i = 0; i < universe.length; i++)
            updatePairs(i, universe, collisionList, ticksPerStep, gravityConstant, coulombConstant || 0, speedlimit);
        shapeForces(stateParts);
        shapeContacts(stateParts);
    }
    function updatePairs(i, universe, collisionList, ticksPerStep, gravityConstant, coulombConstant, speedlimit) {
        const { position: p1, velocity: v1, acceleration: a1, gravity: g1, mass: m1, collisionSize: s1, collisions } = universe[i];
        const q1 = universe[i].charge || 0;
        for (let j = i + 1; j < universe.length; j++)
            updatePair(p1, v1, a1, g1, m1, s1, q1, i, j, collisions, collisionList, universe, ticksPerStep, gravityConstant, coulombConstant, speedlimit);
        // F = ma ... a = F/m
        div(g1, g1, m1);
    }
    function updatePair(p1, v1, a1, g1, m1, s1, q1, i, j, collisions, collisionList, universe, ticksPerStep, gravityConstant, coulombConstant, speedlimit) {
        const { position: p2, velocity: v2, acceleration: a2, mass: m2, collisionSize: s2, gravity: g2 } = universe[j];
        const q2 = universe[j].charge || 0;
        sub(dd, p1, p2);
        const distance = magnitude(dd), t = -distance / (speedlimit * speedlimit), o = t / ticksPerStep;
        updatePositionAndGravity(o, a1, a2, v1, v2, p1, p2, g1, g2, m1 * m2 * gravityConstant - coulombConstant * q1 * q2);
        applySphereContact(oldp1, oldp2, v1, v2, s1, s2, m1, m2, g1, g2, ticksPerStep);
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
    function updateVelocities({ universe, ticksPerStep, shapes }) {
        universe.forEach(mass => updateMassVelocityAndPartialPosition(mass, ticksPerStep));
        shapeKick(shapes, ticksPerStep);
    }
    function updateMassVelocityAndPartialPosition(mass, ticksPerStep) {
        mass.velocityTick(ticksPerStep);
        mass.positionHalfTick(ticksPerStep);
    }
    function resolveCollisions(state) {
        state.collisionList.splice(0);
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
        this.charge = 0;
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
        this.charge = 0;
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
    cancelAnimationFrame(raf);
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
    const button = el.querySelector('button.pause');
    if (button)
        button.innerText = 'Pause';
    startLoop();
}
