"use strict";

class ObjectLoaderPhong {
    constructor(entity, config, nextFrame = null) {
        this.gl = config.gl;
        this.entity = entity;
        this.nextFrame = nextFrame;
        this.first = true;
    }

    init() {
        this.initBirdAnim();

        this.initShaders();

        this.initPerspective();

        this.g_objDoc = null;      // The information of OBJ file
        this.g_drawingInfo = null; // The information for drawing 3D model


        // Prepare empty buffer objects for vertex coordinates, colors, and normals
        this.initBuffers();
        if (!this.buffers) {
            console.log('Failed to set the vertex information');
            return;
        }

        // Start reading the OBJ file
        this.readOBJFile(`${this.entity.objFilePath}`, this.buffers, 1, true);

        return this;
    }

    initBirdAnim(){
        // bird anim
        this.ANGLE_STEP = 240;      // 旋转速度
        this.currentAngle = 0.0;     // 当前旋转角度
        this.UP_DOWN_STEP = 0.5;       // 上下平移速度
        this.UP_MAX = 1;            // 上下平移上限
        this.DOWN_MAX = -0.5;         // 上下平移下限
        this.currentPosition = 0.0;    // 当前上下位置
        this.currentDirection = 1.0;   // 当前上下方向
        this.lastRender = 0.0;         // 上次渲染时间
        this.centerPosition = [-1,2,0];
        // console.log(this.centerPosition)
    }

    initShaders() {
        // Vertex shader program
        let VSHADER_SOURCE = `
        attribute vec4 a_Position;
        attribute vec4 a_Color;
        attribute vec4 a_Normal;
        
        uniform mat4 u_MvpMatrix;
        uniform mat4 u_MvMatrix;
        uniform mat4 u_ModelMatrix;
        uniform mat4 u_NormalMatrix;
        
        varying vec4 v_Color;
        varying vec3 v_Normal;
        varying vec3 v_Position;
        
        void main() {
            gl_Position = u_MvpMatrix * a_Position;
        
            // Transform the normal to world space and normalize it
            v_Normal = normalize(mat3(u_NormalMatrix) * a_Normal.xyz);
        
            // Transform vertex position to world space
            v_Position = (u_MvMatrix * a_Position).xyz;
        
            // Pass color to fragment shader
            v_Color = a_Color;
        }
        `
        ;

        // Fragment shader program
        let FSHADER_SOURCE = `
        precision mediump float;

        uniform vec3 u_PointLightPosition;
        uniform vec3 u_PointLightColor;
        uniform vec3 u_LightDirection;
        uniform vec3 u_AmbientLight;
        uniform vec3 u_Color;
        
        varying vec4 v_Color;
        varying vec3 v_Normal;
        varying vec3 v_Position;
        
        void main() {
            // Normalize interpolated normal
            vec3 normal = normalize(v_Normal);
        
            // Calculate light direction for point light
            vec3 pointLightDirection = normalize(u_PointLightPosition - v_Position);
        
            // Calculate diffuse and specular reflection components
            float diffuseStrength = max(dot(normal, pointLightDirection), 0.0);
            vec3 u_DiffuseLight = vec3(1.0, 1.0, 1.0);
            vec3 diffuse = u_DiffuseLight * u_Color.rgb * diffuseStrength;
        
            vec3 viewDirection = normalize(-v_Position);
            vec3 reflectDirection = reflect(-pointLightDirection, normal);
            float specularStrength = pow(max(dot(viewDirection, reflectDirection), 0.0), 80.0);
            vec3 specular = u_PointLightColor * specularStrength;
        
            // Increase ambient light intensity
            vec3 ambient = u_AmbientLight * u_Color.rgb; // Adjust the coefficient
        
            // Combine all lighting components
            vec3 lighting = ambient + diffuse + specular;
        
            gl_FragColor = vec4(lighting, v_Color.a);
        }
        `;

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
        this.u_MvMatrix = this.gl.getUniformLocation(this.program, 'u_MvMatrix');
        this.u_NormalMatrix = this.gl.getUniformLocation(this.program, 'u_NormalMatrix');
        this.u_ModelMatrix = this.gl.getUniformLocation(this.program, 'u_ModelMatrix');

        // point light
        this.u_PointLightPosition = this.gl.getUniformLocation(this.program, 'u_PointLightPosition');
        this.u_PointLightColor = this.gl.getUniformLocation(this.program, 'u_PointLightColor');

        // parallel light and ambient light
        this.u_LightDirection = this.gl.getUniformLocation(this.program, 'u_LightDirection');
        this.u_AmbientLight = this.gl.getUniformLocation(this.program, 'u_AmbientLight');
        this.u_Color = this.gl.getUniformLocation(this.program, 'u_Color');

        // fog
        this.u_FogColor = this.gl.getUniformLocation(this.program, 'u_FogColor');
        this.u_FogDist = this.gl.getUniformLocation(this.program, 'u_FogDist');

        this.gl.useProgram(this.program);
        this.gl.program = this.program;
    }

    initPerspective() {
        this.g_modelMatrix = new Matrix4();
        this.g_normalMatrix = new Matrix4();
        for (let t of this.entity.transform) {
            this.g_modelMatrix[t.type].apply(this.g_modelMatrix, t.content);
        }
    }

    initBuffers() {
        // Create a buffer object, assign it to attribute variables, and enable the assignment
        this.buffers = {
            vertexBuffer: this.gl.createBuffer(),
            normalBuffer: this.gl.createBuffer(),
            colorBuffer: this.gl.createBuffer(),
            indexBuffer: this.gl.createBuffer()
        };
    }

    readOBJFile(fileName, model, scale, reverse) {
        let request = new XMLHttpRequest();

        request.onreadystatechange = () => {
            if (request.readyState === 4 && (request.status == 200 || request.status == 0)) {
                this._onReadOBJFile(request.responseText, fileName, model, scale, reverse);
            }
        };
        request.open('GET', fileName, true);
        request.send();
    }


    _onReadOBJFile(fileString, fileName, o, scale, reverse) {
        let objDoc = new OBJDoc(fileName);  // Create a OBJDoc object
        let result = objDoc.parse(fileString, scale, reverse); // Parse the file
        if (!result) {
            this.g_objDoc = null;
            this.g_drawingInfo = null;
            console.log("OBJ file parsing error.");
            return;
        }
        this.g_objDoc = objDoc;
    }

    render(timestamp) {
        this.gl.useProgram(this.program);
        this.gl.program = this.program;

        if (this.g_objDoc != null && this.g_objDoc.isMTLComplete()) {
            this.onReadComplete();
        }
        if (!this.g_drawingInfo) return;

        this.initPerspective();

        if (this.nextFrame === 'bird anim') {
            this.g_modelMatrix = this.bird_animate(timestamp, this.g_modelMatrix);
        }


        // parallel light and ambient light
        let lightDirection = new Vector3(sceneDirectionLight);
        let ambientLight = new Vector3(sceneAmbientLight);
        lightDirection.normalize();
        this.gl.uniform3fv(this.u_LightDirection, lightDirection.elements);
        this.gl.uniform3fv(this.u_AmbientLight, ambientLight.elements);

        // point light
        let pointLightPosition = Camera.eye;
        // let pointLightPosition = new Vector3(CameraPara.eye);
        let pointLightColor;
        if (Camera.state.light)
            pointLightColor = new Vector3(scenePointLightColor);
        else
            pointLightColor = new Vector3([0, 0, 0]);
        this.gl.uniform3fv(this.u_PointLightPosition, pointLightPosition.elements);
        this.gl.uniform3fv(this.u_PointLightColor, pointLightColor.elements);
        this.gl.uniform3fv(this.u_Color, new Vector3(this.entity.color).elements);

        // fog
        if(Camera.state.fog){
            this.gl.uniform3fv(this.u_FogColor, fogColor);
            this.gl.uniform2fv(this.u_FogDist, fogDist);
        }else{
            this.gl.uniform3fv(this.u_FogColor, [1,1,1]);
            this.gl.uniform2fv(this.u_FogDist, [CameraPara.far, CameraPara.far+1]);
        }

        this.g_normalMatrix.setInverseOf(this.g_modelMatrix);
        this.g_normalMatrix.transpose();
        this.gl.uniformMatrix4fv(this.u_NormalMatrix, false, this.g_normalMatrix.elements);
        this.gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.g_modelMatrix.elements);

        let g_mvpMatrix = Camera.getMatrix();
        g_mvpMatrix.concat(this.g_modelMatrix);

        this.gl.uniformMatrix4fv(this.u_MvpMatrix, false, g_mvpMatrix.elements);

        let g_mvMatrix = Camera.getViewMatrix();
        g_mvMatrix.concat(this.g_modelMatrix);
        this.gl.uniformMatrix4fv(this.u_MvMatrix, false, g_mvMatrix.elements);
        // Draw
        this.gl.drawElements(this.gl.TRIANGLES, this.g_drawingInfo.indices.length, this.gl.UNSIGNED_SHORT, 0);
    }

    onReadComplete() {
        // Acquire the vertex coordinates and colors from OBJ file
        this.g_drawingInfo = this.g_objDoc.getDrawingInfo();

        // Write date into the buffer object
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.g_drawingInfo.vertices, this.gl.STATIC_DRAW);

        this.gl.vertexAttribPointer(this.a_Position, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.a_Position);


        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.g_drawingInfo.normals, this.gl.STATIC_DRAW);

        this.gl.vertexAttribPointer(this.a_Normal, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.a_Normal);


        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.g_drawingInfo.colors, this.gl.STATIC_DRAW);

        this.gl.vertexAttribPointer(this.a_Color, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.a_Color);

        // Write the indices to the buffer object
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.g_drawingInfo.indices, this.gl.STATIC_DRAW);

    }

    bird_animate(timestamp, model_matrix) {
        let elapsed = timestamp - this.lastRender;
        this.lastRender = timestamp;

        this.currentAngle = this.currentAngle + (this.ANGLE_STEP * elapsed) / 1000.0;
        this.currentAngle = this.currentAngle % 360;

        this.currentPosition += (this.UP_DOWN_STEP * elapsed) / 1000.0 * this.currentDirection;
        if (this.currentPosition > this.UP_MAX) {
            this.currentPosition = this.UP_MAX;
            this.currentDirection = -1;
        }
        else if(this.currentPosition < this.DOWN_MAX){
            this.currentPosition = this.DOWN_MAX;
            this.currentDirection = 1;
        }

        // Translate the model matrix to the center position
        model_matrix.translate(this.centerPosition[0], this.centerPosition[1], this.centerPosition[2]);

        // Rotate the model matrix around the center position
        model_matrix.rotate(this.currentAngle, 0, 1, 0);

        // Translate back to the original position
        model_matrix.translate(-this.centerPosition[0], -this.centerPosition[1], -this.centerPosition[2]);

        model_matrix.rotate(90, 0, 1 , 0)

        // Translate the model matrix to the current position
        model_matrix.translate(0, this.currentPosition, 0);

        return model_matrix;
    }
}
