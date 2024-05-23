

"use strict";
class CubeLoader {
    constructor(entity, config) {
        this.gl = config.gl;
        this.entity = entity;
    }

    init() {

        this.initShaders();

        this.initBuffers();

        this.initPerspective();

        return this;
    }

    initShaders() {
        // Vertex shader program
        let VSHADER_SOURCE = `
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        attribute vec4 a_Normal;
        uniform mat4 u_MvpMatrix;
        uniform mat4 u_ModelMatrix;
        uniform mat4 u_NormalMatrix;
        varying vec4 v_Color;
        uniform vec3 u_Color;
        uniform vec3 u_LightDirection;
        uniform vec3 u_AmbientLight;
        void main() {
          gl_Position = u_MvpMatrix * a_Position;

          vec4 normal1 = u_NormalMatrix * a_Normal;

          vec3 normal = normalize(normal1.xyz);

          float nDotL = max(dot(u_LightDirection, normal), 0.0);
          vec3 u_DiffuseLight = vec3(1.0, 1.0, 1.0);
          vec3 diffuse = u_DiffuseLight * u_Color * nDotL;
          vec3 ambient = u_AmbientLight * u_Color;

          v_Color = a_Color;
        }`;

        // Fragment shader program
        let FSHADER_SOURCE = `
        #ifdef GL_ES
        precision mediump float;
        #endif
        varying vec4 v_Color;
        void main() {
          gl_FragColor = v_Color;
        }`;

        // Initialize shaders
        this.program = createProgram(this.gl, VSHADER_SOURCE, FSHADER_SOURCE);
        if (!this.program) {
            console.log('Failed to create program');
            return;
        }

        this.gl.enable(this.gl.DEPTH_TEST);

        // Get the storage locations of attribute and uniform variables
        this.a_Position = this.gl.getAttribLocation(this.program, 'a_Position');
        this.a_Color = this.gl.getAttribLocation(this.program, 'a_Color');
        this.a_Normal = this.gl.getAttribLocation(this.program, 'a_Normal');
        this.u_MvpMatrix = this.gl.getUniformLocation(this.program, 'u_MvpMatrix');
        this.u_NormalMatrix = this.gl.getUniformLocation(this.program, 'u_NormalMatrix');
        this.u_ModelMatrix = this.gl.getUniformLocation(this.program, 'u_ModelMatrix');


        this.u_LightDirection = this.gl.getUniformLocation(this.program, 'u_LightDirection');
        this.u_AmbientLight = this.gl.getUniformLocation(this.program, 'u_AmbientLight');
        this.u_Color = this.gl.getUniformLocation(this.program, 'u_Color');

        this.gl.useProgram(this.program);
        this.gl.program = this.program;
    }

    initPerspective() {
        this.gl.enable(this.gl.DEPTH_TEST);
        // Get the storage location of u_MvpMatrix
        this.u_MvpMatrix = this.gl.getUniformLocation(this.gl.program, 'u_MvpMatrix');
        if (!this.u_MvpMatrix) {
            console.log('Failed to get the storage location of u_MvpMatrix');
        }

        this.g_normalMatrix = new Matrix4();
        // Assign the buffer object to a_Position and enable the assignment
        this.a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');

        this.u_MvpMatrix = this.gl.getUniformLocation(this.program, 'u_MvpMatrix');
        this.g_modelMatrix = new Matrix4();
        this.g_modelMatrix.translate(this.entity.translate[0], this.entity.translate[1], this.entity.translate[2]);
        this.g_modelMatrix.scale(this.entity.scale[0], this.entity.scale[1], this.entity.scale[2]);
    }

    initBuffers() {
        // Write the vertex coordinates to the buffer object
        this.vertexBuffer = this.gl.createBuffer();

        // Write the indices to the buffer object
        this.vertexIndexBuffer = this.gl.createBuffer();
    }

    render() {
        this.gl.useProgram(this.program);

        // let lightDirection = new Vector3(sceneDirectionLight);
        // let ambientLight = new Vector3(sceneAmbientLight);
        // lightDirection.normalize();
        // this.gl.uniform3fv(this.u_LightDirection, lightDirection.elements);
        // this.gl.uniform3fv(this.u_AmbientLight, ambientLight.elements);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.entity.vertex), this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(this.a_Position, 3, this.gl.FLOAT, false,  6 * Float32Array.BYTES_PER_ELEMENT, 0);
        this.gl.vertexAttribPointer(this.a_Color, 3, this.gl.FLOAT, false,  6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
        this.gl.enableVertexAttribArray(this.a_Position);
        this.gl.enableVertexAttribArray(this.a_Color);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.entity.index), this.gl.STATIC_DRAW);

        // Set the eye point and the viewing volume
        this.mvpMatrix = Camera.getMatrix();
        this.mvpMatrix.concat(this.g_modelMatrix);

        // Pass the model view projection matrix to u_MvpMatrix
        this.gl.uniformMatrix4fv(this.u_MvpMatrix, false, this.mvpMatrix.elements);

        this.g_normalMatrix.setInverseOf(this.g_modelMatrix);
        this.g_normalMatrix.transpose();
        this.gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.g_normalMatrix.elements);
        this.gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.g_modelMatrix.elements);

        // Draw the texture
        this.gl.drawElements(this.gl.TRIANGLE_STRIP, this.entity.index.length, this.gl.UNSIGNED_SHORT, 0);
    }
}
