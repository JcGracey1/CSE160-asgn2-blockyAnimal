// CREDIT: Eric Martinez
class Cylinder{
    constructor() {
      this.type = 'cylinder';
      this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 1.0, 1.0, 1.0];
      this.size = 5.0;
      this.segments = 10;
      this.matrix = new Matrix4();

      this.buffer = null;
    }
  
    render() {
      var xy = this.position;
      var rgba = this.color;
      var size = this.size;

      // Pass the color of a point to u_FragColor variable
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

      // Pass the matrix to a u_ModelMatrix attribute
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
      
      // Create a buffer object
      if (this.buffer === null) {
        this.buffer = gl.createBuffer();
        if (!this.buffer) {
          console.log('Failed to create the buffer object');
          return -1;
        }
      }

      // Similar to cirlce class:
      var d = size/200.0; // delta

      let angleStep = 360/this.segments;

      for (var angle = 0; angle < 360; angle = angle + angleStep) {
        let centerPt = [xy[0], xy[1]];
        let angle1 = angle;
        let angle2 = angle + angleStep;
        let vec1 = [Math.cos(angle1*Math.PI/180)*d, Math.sin(angle1*Math.PI/180)*d];
        let vec2 = [Math.cos(angle2*Math.PI/180)*d, Math.sin(angle2*Math.PI/180)*d];
        let pt1 = [centerPt[0] + vec1[0], centerPt[1] + vec1[1]];
        let pt2 = [centerPt[0] + vec2[0], centerPt[1] + vec2[1]];
        // Side of Cylinder
        gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
        // Use 3D triangles:
        drawTriangle3D( [pt2[0],pt2[1],0, pt1[0],pt1[1],0, pt2[0],pt2[1],1] , this.buffer);
        drawTriangle3D( [pt2[0],pt2[1],1, pt1[0],pt1[1],0, pt1[0],pt1[1],1] , this.buffer);
        // Top
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        drawTriangle3D( [xy[0],xy[1],0, pt1[0],pt1[1],0, pt2[0],pt2[1],0] , this.buffer);
        // Bottom
        gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
        drawTriangle3D ([xy[0],xy[1],1, pt1[0],pt1[1],1, pt2[0],pt2[1],1] , this.buffer);
      }
    }
  }