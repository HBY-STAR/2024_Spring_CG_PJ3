"use strict";

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

        // bird anim
        this.ANGLE_STEP = 45.0;      // 旋转速度
        this.currentAngle = 0.0;     // 当前旋转角度
        this.UP_DOWN_STEP = 5;       // 上下平移速度
        this.UP_MAX = 10;            // 上限
        this.DOWN_MAX = -10;         // 下限
        this.currentPosition = 0;    // 当前上下位置
        this.currentDirection = 1;   // 当前上下方向
        this.lastRender = 0;         // 上次渲染时间
        this.centerPosition = ObjectList[5].transform.translate // 环绕中心
    }

    init() {

        this.initKeyController();

        this.initLoaders();

        let render = (timestamp) => {
            this.initWebGL();

            this.initCamera(timestamp);

            for (let loader of this.loaders) {
                if(loader.entity.objFilePath.indexOf('bird') > 0){
                    this.bird_animate(timestamp, loader)
                }else{
                    loader.render(timestamp);
                }
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

        cameraMap.forEach((val, key) => {
                this.keyboardController.bind(key, {
                    on: (() => {
                        Camera.state[val] = 1;
                    }),
                    off: (() => {
                        Camera.state[val] = 0;
                    })
                });

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
            let loader = new ObjectLoader(o, {'gl': this.gl}).init();
            this.loaders.push(loader);
        }

        this.lastRender = Date.now();
    }

    bird_animate(timestamp, loader){
        let elapsed = timestamp - this.lastRender;
        this.lastRender = timestamp;

        this.currentAngle += (this.ANGLE_STEP * elapsed) / 1000.0;
        this.currentAngle = this.currentAngle % 360;
        this.currentPosition += (this.UP_DOWN_STEP * elapsed) / 1000.0 * this.currentDirection;
        if(this.currentPosition > this.UP_MAX || this.currentPosition < this.DOWN_MAX){
            this.currentDirection *= -1;
        }



    }
}