"use strict";

let usePhongShading = false;

window.onload = () => {
    let canvas = document.getElementById('webgl');
    let position_text = document.getElementById('position');
    let lookat_text = document.getElementById('lookat');
    canvas.setAttribute("width", 500);
    canvas.setAttribute("height", 500);
    window.ratio = canvas.width / canvas.height;
    let gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Load a new scene
    new SceneLoader(gl, position_text, lookat_text).init();
};

class SceneLoader {
    constructor(gl, position_text, lookat_text) {
        this.gl = gl;
        this.position_text = position_text;
        this.lookat_text = lookat_text;
        this.loaders = [];
        this.keyboardController = new KeyboardController();
    }

    init() {

        this.initKeyController();

        this.initLoaders();

        let render = (timestamp) => {
            this.initWebGL();

            this.initCamera(timestamp);

            for (let loader of this.loaders) {
                loader.render(timestamp);
            }

            requestAnimationFrame(render, this.gl);
        };

        render();
    }


    initWebGL() {
        // Set clear color and enable hidden surface removal
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

        // Clear color and depth buffer
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    initKeyController() {
        Camera.init();
        let cameraMap = new Map();
        cameraMap.set('w', 'posUp');
        cameraMap.set('s', 'posDown');
        cameraMap.set('a', 'posLeft');
        cameraMap.set('d', 'posRight');

        cameraMap.set('i', 'rotUp');
        cameraMap.set('k', 'rotDown');
        cameraMap.set('j', 'rotLeft');
        cameraMap.set('l', 'rotRight');

        cameraMap.set('f', 'light');
        cameraMap.set('r', 'fog');

        cameraMap.forEach((val, key) => {
                if (key === 'r') {
                    this.keyboardController.bind(key, {
                        on: (() => {
                            Camera.state[val] = Camera.state[val] === 0 ? 1 : 0;
                        }),
                        off: (() => {

                        })
                    });
                } else {
                    this.keyboardController.bind(key, {
                        on: (() => {
                            Camera.state[val] = 1;
                        }),
                        off: (() => {
                            Camera.state[val] = 0;
                        })
                    });
                }
            }
        )
    }

    initCamera(timestamp) {
        let elapsed = timestamp - this.keyboardController.last;
        this.keyboardController.last = timestamp;

        let posY = (Camera.state.posRight - Camera.state.posLeft) * MOVE_VELOCITY * elapsed / 1000;
        let posZ = (Camera.state.posUp - Camera.state.posDown) * MOVE_VELOCITY * elapsed / 1000;
        let rotY = (Camera.state.rotRight - Camera.state.rotLeft) * ROT_VELOCITY * elapsed / 1000 / 180 * Math.PI;
        let rotZ = (Camera.state.rotUp - Camera.state.rotDown) * ROT_VELOCITY * elapsed / 1000 / 180 * Math.PI;

        if (posY) Camera.move(0, posY, this.position_text, this.lookat_text);
        if (rotY) Camera.rotate(0, rotY, this.position_text, this.lookat_text);
        if (posZ) Camera.move(posZ, 0, this.position_text, this.lookat_text);
        if (rotZ) Camera.rotate(rotZ, 0, this.position_text, this.lookat_text);
    }

    initLoaders() {
        // Load floor
        let floorLoader = new TextureLoader(floorRes, {
            'gl': this.gl,
            'activeTextureIndex': 0,
            'enableLight': true
        }).init();
        this.loaders.push(floorLoader);

        // Load box
        let boxLoader = new TextureLoader(boxRes, {
            'gl': this.gl,
            'activeTextureIndex': 1,
            'enableLight': true
        }).init();
        this.loaders.push(boxLoader);

        // load cube
        let cubeLoader = new CubeLoader(cubeRes, {
            'gl': this.gl,
        }).init()
        this.loaders.push(cubeLoader)

        // Load objects
        for (let o of ObjectList) {
            let loader;
            if (o.objFilePath === './model/bird.obj') {
                if(usePhongShading)
                    loader = new ObjectLoaderPhong(o, {'gl': this.gl}, 'bird anim').init();
                else
                    loader = new ObjectLoader(o, {'gl': this.gl}, 'bird anim').init();
            } else {
                if(usePhongShading)
                    loader = new ObjectLoaderPhong(o, {'gl': this.gl}, null).init();
                else
                    loader = new ObjectLoader(o, {'gl': this.gl}, null).init();
            }
            this.loaders.push(loader);
        }
    }


}