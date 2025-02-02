class Circle{

    constructor(){
        this.type = 'circle';
        this.position = [0.0, 0.0,0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5;
        this.segments = 10;
    }

    render(){
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        var d = size/200.0; // delta

        let angleStep = 360/this.segments;
        for(var angle = 0; angle < 360; angle += angleStep) {
            let centerPt = [xy[0], xy[1]];
            let angle1=angle;
            let angle2=angle+angleStep;
            let p1 = [centerPt[0]+Math.sin(angle1/180*Math.PI)*d, centerPt[1]-Math.cos(angle1/180*Math.PI)*d];
            let p2 = [centerPt[0]+Math.sin(angle2/180*Math.PI)*d, centerPt[1]-Math.cos(angle2/180*Math.PI)*d];
            
            //make this 3d
            drawTriangle([xy[0], xy[1], p1[0], p1[1], p2[0], p2[1]]);
        }

    }
}