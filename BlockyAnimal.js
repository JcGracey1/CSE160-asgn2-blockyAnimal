// ColoredPoints.js
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
	// Retrieve <canvas> element
	canvas = document.getElementById('webgl');

	// Get the rendering context for WebGL
	//gl = getWebGLContext(canvas);
  gl = canvas.getContext('webgl', {preserveDrawingBuffer: true});
	if (!gl) {
		console.log('Failed to get the rendering context for WebGL');
		return;
	}	

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablestoGLSL() {
	// Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
	console.log('Failed to intialize shaders.');
	return;
	}

	// // Get the storage location of a_Position
	a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if (a_Position < 0) {
	console.log('Failed to get the storage location of a_Position');
	return;
	}

	// Get the storage location of u_FragColor
	u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
	if (!u_FragColor) {
	console.log('Failed to get the storage location of u_FragColor');
	return;
	}

  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, "u_GlobalRotateMatrix");
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  // u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  // if (!u_Size){
  //   console.log('Failed to get the storage location of u_Size');
  //   return;    
  // }
	
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;


let g_globalAngle = 0;
let g_jointAngle = 0;
let g_headAngle = 0;
//let g_tailAngle = 0;
let g_animate = false;
let tail_animate = false;

function addActionsForHtmlUI(){

  document.getElementById('animateOn').addEventListener('click', function() { g_animate = true;});
  document.getElementById('animateOff').addEventListener('click', function() { g_animate = false;});

  document.getElementById('jointSlide').addEventListener('mousemove', function() { g_jointAngle = this.value; renderAllShapes();});
  document.getElementById('headSlide').addEventListener('mousemove', function() { g_headAngle = this.value; renderAllShapes();});
  // // size slider events
  // document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value;});

  //angle slider:
  document.getElementById('angleSlide').addEventListener('mousemove', function() {
     g_globalAngle = parseFloat(this.value); 
     startingMouseX = null;
     renderAllShapes();
    });
}

let startingMouseX = 0;
let startingMouseY = 0;
let dragging = false;

//poke animation variables:
let g_pokeAnimation = false;
let g_pokeStartTime = 0;
let g_fedoraVisible = false;
let g_tippingAngle = 0;
let g_displayText = false;

function triggerPokeAnimation() {
  console.log("Triggering poke animation");
  g_pokeAnimation = true;
  g_pokeStartTime = performance.now() / 1000; // Record time
  g_fedoraVisible = true;  // Show the fedora
  g_displayText = true;     // Show text "M'lady"
}



function main() {
	setupWebGL();
	connectVariablestoGLSL();

  addActionsForHtmlUI();

  // rotate with mouse control:
  canvas.onmousedown = function(ev) {
    if(ev.shiftKey){
      triggerPokeAnimation();
    } else{
      startingMouseX = ev.clientX;
      startingMouseY = ev.clientY;
      dragging = true;
    }
  }

  if(event.shiftKey){
    triggerPokeAnimation();
  }

  canvas.onmousemove = function(ev) {
    if (dragging) { // Only track if mouse is pressed
      let deltaX = ev.clientX - startingMouseX;
      //let deltaY = ev.clientY - startingMouseY;
  
      let turnSpeed = 0.4; // Adjust sensitivity
  
      g_globalAngle += deltaX * turnSpeed; // Rotate globally based on mouse X movement
      document.getElementById('angleSlide').value = g_globalAngle;

      startingMouseX = ev.clientX;
      startingMouseY = ev.clientY;
  
      renderAllShapes(); // Update the scene
    }
  };
  
  canvas.onmouseup = function() {
    dragging = false; // Stop tracking movement
  }


  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  requestAnimationFrame(tick);
}



function convertCoordinatesEventToGL(ev){
	var x = ev.clientX; // x coordinate of a mouse pointer
	var y = ev.clientY; // y coordinate of a mouse pointer
	var rect = ev.target.getBoundingClientRect();
  
	x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
	y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

	return ([x, y]);  
}

var g_startTime = performance.now()/100.0; 
var g_seconds = performance.now()/1000.0*g_startTime;
function tick(){
  // debug
  let currentTime = performance.now() / 1000;
  let deltaTime = currentTime - g_startTime;
  g_startTime = currentTime;
 // console.log(g_seconds);

  updateAnimationAngles(deltaTime);
  // draw everything
  renderAllShapes();

  // tell browser to update again when it has time
  requestAnimationFrame(tick);
}

let g_tailBaseAngle = 0;
let g_tailMidAngle = 0;
let g_tailTipAngle = 0;
let g_specialAnimate = false;
function updateAnimationAngles(deltaTime){
  let currentTime = performance.now() / 1000;
  g_seconds += deltaTime;
  if(g_animate){
    g_jointAngle =(15*Math.sin(g_seconds));
  }
  if(g_animate){
    let baseAngle = 20 * Math.sin(g_seconds); // Base moves less
    let midAngle = 30 * Math.sin(g_seconds - 0.2); // Midsection lags behind
    let tipAngle = 5 * Math.sin(g_seconds - 0.4); // Tip moves most

    g_tailBaseAngle = baseAngle;
    g_tailMidAngle = midAngle;
    g_tailTipAngle = tipAngle;
  }
  if (g_pokeAnimation) {
    let elapsed = currentTime - g_pokeStartTime;
    
    if (elapsed < 1.15) {
        // First second: Tilt head slightly down and to the side
        g_tippingAngle = -15 * Math.sin(elapsed * Math.PI);
    } 
    // else if (elapsed < 2) {
    //     // Second second: Tip back up
    //     g_tippingAngle = -15 * Math.sin((2 - elapsed) * Math.PI);
    //} 
    else {
        // Reset animation after 2 seconds
        g_pokeAnimation = false;
        g_fedoraVisible = false; 
        g_displayText = false;
        g_tippingAngle = 0;
    }
  }
}

let headCoordsMat;
function drawGiraffe(){
  const gColor = [255/255, 180/255, 52/255, 1];
  const tColor = [89/255, 66/255, 39/255, 1];

  var backLeg1 = new Cube();
  backLeg1.color = gColor;
  backLeg1.matrix.translate(-.55, -.75, 0.0);
 // backLeg1.matrix.rotate(-5, 1, 0, 0);
  backLeg1.matrix.scale(0.05, .4, 0.05);
  backLeg1.render();

  var backFoot1 = new Cube();
  backFoot1.color = tColor;
  backFoot1.matrix.set(backLeg1.matrix);
  backFoot1.matrix.scale(1, .2, 1);
  backFoot1.matrix.translate(0, -.3, 0);
  backFoot1.render();

  var backLeg2 = new Cube();
  backLeg2.color = gColor;
  backLeg2.matrix.set(backLeg1.matrix);
  backLeg2.matrix.translate(0, 0, -5);
  backLeg2.render();

  var backFoot2 = new Cube();
  backFoot2.color = tColor;
  backFoot2.matrix.set(backFoot1.matrix);
  backFoot2.matrix.translate(0, 0, -5);
  backFoot2.render();

  var frontLeg1 = new Cube();
  frontLeg1.color = gColor;
  frontLeg1.matrix.set(backLeg1.matrix);
  frontLeg1.matrix.translate(10, 0, 0);
  frontLeg1.render();

  var frontFoot1 = new Cube();
  frontFoot1.color = tColor;
  frontFoot1.matrix.set(backFoot1.matrix);
  frontFoot1.matrix.translate(10, 0, 0);
  frontFoot1.render();

  var frontLeg2 = new Cube();
  frontLeg2.color = gColor;
  frontLeg2.matrix.set(frontLeg1.matrix);
  frontLeg2.matrix.translate(0, 0, -5);
  frontLeg2.render();

  var frontFoot2 = new Cube();
  frontFoot2.color = tColor;
  frontFoot2.matrix.set(frontFoot1.matrix);
  frontFoot2.matrix.translate(0, 0, -5);
  frontFoot2.render();

  var body = new Cube();
  body.color = gColor;
  body.matrix.translate(-.554, -.38, 0.0);
  var shearX = 0.1;  // Adjust this value to control the triangle slope
  body.matrix.elements[1] = shearX;
  body.matrix.translate(0, -shearX * 0.3, 0);
  body.matrix.scale(0.56, .3, 0.3);
  body.render();

  // neck 
  var neck = new Cube();
  neck.color = gColor;
  neck.matrix.setTranslate(-.15, -.1, -.065);
  // var shearX = 0.3;  // Adjust this value to control the triangle slope
  // neck.matrix.elements[4] = shearX;
  neck.matrix.rotate(-g_jointAngle, 0, 0, 1);
  // poke animation:
  if( g_pokeAnimation ){
    neck.matrix.rotate(g_tippingAngle, 0, 0, 1);
  }
  neck.matrix.rotate(-5,0,0,1);
  var neckCoordsPre = new Matrix4(neck.matrix);
  neck.matrix.scale(0.15, 0.6, 0.15);
  var neckCoordsMat = new Matrix4(neck.matrix);
  neck.render();

  //mane:
  var mane = new Cube();
  mane.color = tColor;
  mane.matrix = new Matrix4(neckCoordsMat); //neckCoordsMat;
  mane.matrix.translate(-.5, 0, -.25);
  mane.matrix.scale(1, 1, .5);
  mane.render();

  // Head
  var head = new Cube();
  head.color = gColor;
  head.matrix = neckCoordsPre;
  head.matrix.translate(0, 0.58, 0);
  //head.matrix.translate(0, 0.5, 0);
  head.matrix.rotate(-g_headAngle, 0, 0, 1);
  // poke animation:
  if( g_pokeAnimation ){
    head.matrix.rotate(-15 + g_tippingAngle, 0, 0, 1);
  }
  headCoordsMat = new Matrix4(head.matrix);
  head.matrix.rotate(-5, 0, 0, 1);
  head.matrix.scale(0.3, 0.15, 0.15);
  head.render();

  var horn1 = new Cube();
  horn1.color = gColor;
  horn1.matrix = neckCoordsPre;
  horn1.matrix.translate(0, 1, -.065);
  //horn1.matrix.rotate(-15, 0, 0, 1);
  //horn1.matrix.scale(0.05, 0.1, 0.05);
  horn1.matrix.scale(.2,.5,.3);
  horn1.render();

  var hornTip1 = new Cube();
  hornTip1.color = tColor;
  hornTip1.matrix.set(horn1.matrix);
  hornTip1.matrix.translate(0, 1, 0);
  hornTip1.matrix.scale(1, .3, 1);
  hornTip1.render();

  var horn2 = new Cube();
  horn2.color = gColor;
  horn2.matrix.set(horn1.matrix);
  horn2.matrix.translate(0, 0, -2);
  horn2.render();

  var hornTip2 = new Cube();
  hornTip2.color = tColor;
  hornTip2.matrix.set(horn2.matrix);
  hornTip2.matrix.translate(0, 1, 0);
  hornTip2.matrix.scale(1, .3, 1);
  hornTip2.render();

  // closest to body
  var tail = new Cylinder();
  tail.color = gColor;
  tail.matrix.translate(-.59, -.32, -.15);
  tail.matrix.rotate(g_tailBaseAngle,0,1,0);
  tail.matrix.rotate(90,0, 1, 0);
  tail.matrix.rotate(-75, 1, 0, 0);
  var tailCoordsMat = new Matrix4(tail.matrix);
  tail.matrix.scale(1, 1, 0.2);
  tail.render();

  // mid tail
  var tailHalf = new Cylinder();
  tailHalf.color = gColor;
  tailHalf.matrix = tailCoordsMat;
  tailHalf.matrix.rotate(g_tailMidAngle, 0, 1, 0);
  tailHalf.matrix.translate(0, 0, -.2);
  tailHalf.matrix.scale(1, 1, .2);
  tailHalf.render();

  // tail tip
  var tailBottom = new Cylinder();
  tailBottom.color = tColor;
  tailBottom.matrix.set(tailHalf.matrix);
  tailBottom.matrix.rotate(g_tailTipAngle, 0, 1, 0);
  tailBottom.matrix.translate(0, 0, -.3);
  tailBottom.matrix.scale(1, 1, .3);
  tailBottom.render();

  var eye = new Cube();
  eye.color = [0, 0, 0, 1];
  eye.matrix = neckCoordsPre;
  eye.matrix.translate(1, -1.1, 1);
  eye.matrix.scale(.6,.5,5)
  eye.render();

}

function drawFedora(){
  const grey = [0.5, 0.5, 0.5, 1];
  if(!g_fedoraVisible)return;

  var fedoraBase = new Cylinder();
  fedoraBase.color = grey;
  fedoraBase.matrix = headCoordsMat;
  fedoraBase.matrix.rotate(90, 1, 0, 0);
  //fedoraBase.matrix.rotate(-2, 0, 1, 0);
  fedoraBase.matrix.translate(.1, -.08, -.18);
  fedoraBase.matrix.scale(6, 5, .05);
  fedoraBase.render();

  var fedoraTop = new Cube();
  fedoraTop.color = grey;
  fedoraTop.matrix = headCoordsMat;
  fedoraTop.matrix.translate(-.015, -0.018, 0.1);
  fedoraTop.matrix.scale(.03, .035, 2);
  fedoraTop.render();

  var hatStrap = new Cube();
  hatStrap.color = [0,0,0,1];
  hatStrap.matrix.set(fedoraTop.matrix);
  hatStrap.matrix.scale(1.1,1.1,.2);
  // ()left/right (front/back) (up/down)
  hatStrap.matrix.translate(-.09,-.09,0);
  hatStrap.render();
}

function drawText(text, x, y, duration = 1000) {
  let canvas2 = document.getElementById('overlay');
  let ctx = canvas2.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "30px Arial";
  ctx.fillStyle = "white";
  ctx.fillText(text, x, y);

  setTimeout(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, duration);
}

function renderAllShapes() {

  var startTime = performance.now();

  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  drawGiraffe();
  drawFedora();

  if (g_displayText) {
    drawText("M'lady", 300, 100); // Adjust position as needed
  }

  var duration = performance.now() - startTime;
  sendTextToHtml(' fps: ' + Math.floor(1000 / duration)/10, "numdot");
}

function sendTextToHtml(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm){
    console.log('No html element with id=' + htmlID);
    return;
  }
  htmlElm.innerHTML = text;
}
