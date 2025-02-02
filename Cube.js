class Cube{
    constructor(){
        this.type = 'cube';
        //this.position = [0.0, 0.0,0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        //this.size = 5;
        this.matrix = new Matrix4();
    }

    // render(){
    //     var rgba = this.color;

    //     gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    //     gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    //     drawTriangle3D([0.0, 0.0, 0.0,  1.0, 1.0, 0.0,  1.0, 0.0, 0.0]);
    //     drawTriangle3D([0.0, 0.0, 0.0,  0.0, 1.0, 0.0,  1.0, 1.0, 0.0]);

    //     // make "fake" lighting
    //     gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    // }
    render() {
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;
        
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of Cube
        drawTriangle3D([0,0,0, 1,1,0, 1,0,0]);
        drawTriangle3D([0,0,0, 0,1,0, 1,1,0]);

        // Back of the Cube
        drawTriangle3D([0,0,-1, 1,1,-1, 1,0,-1]);
        drawTriangle3D([0,0,-1, 0,1,-1, 1,1,-1]);

        // Top of the Cube
        drawTriangle3D([0,1,0, 1,1,-1, 1,1,0]);
        drawTriangle3D([0,1,0, 0,1,-1, 1,1,-1]);

        // Bottom of the Cube
        gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
        drawTriangle3D([0,0,0, 1,0,-1, 1,0,0]);
        drawTriangle3D([0,0,0, 0,0,-1, 1,0,-1]);

        // Left Side of the Cube
        gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
        drawTriangle3D([0,0,0, 0,1,0, 0,0,-1]);
        drawTriangle3D([0,0,-1, 0,1,0, 0,1,-1]);

        // Right Side of the Cube
        drawTriangle3D([1,0,0, 1,1,0, 1,0,-1]);
        drawTriangle3D([1,0,-1, 1,1,0, 1,1,-1]);
    }
}