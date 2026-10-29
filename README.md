# nbody-raycaster

A canvas raycaster looking at a small N-body system: a sun, three planets, and a moon on the outer planet.

The simulation starts on its own. Pause stops it. The sliders under the picture change the canvas size, field of view, and camera position. Arrow keys or WASD move the camera, Q and E turn it, and the mouse wheel dollies in and out.

## Demo

https://blakelapierre.github.io/nbody-raycaster/

## Run locally

Any static server works. From this directory:

```
python3 -m http.server 8080
```

Then open http://127.0.0.1:8080/
