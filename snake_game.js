
function Cube(vec, material, scene, geometry, renderWireframe) {
	this.geometry = typeof geometry === 'undefined' ? cube : geometry;
	this.mesh = new THREE.Mesh(this.geometry, material);

	if(typeof renderWireframe === 'undefined' || !renderWireframe){
		this.mesh.position.set(vec.x, vec.y, vec.z);
		scene.add(this.mesh);
	}
	else {
		var edges = new THREE.EdgesGeometry(this.mesh.geometry);
		scene.add(new THREE.LineSegments(edges, material));
	}
	this.setPosition = function(vec){
		this.mesh.position.set(vec.x, vec.y, vec.z);
	}
	
} 

function randInRange(a, b) {
	return a + Math.floor((b-a) * Math.random());
}

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;
var aspectRatio = WIDTH / HEIGHT;
var renderer = new THREE.WebGLRenderer();

var camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000);
var scene = new THREE.Scene();
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableKeys = false;

var mov = 5;
var delta = 1/mov;
var theta = 0.0;
var edgeSize = 20;
var padding = 0.15;
var cubeSize = edgeSize + (edgeSize-1)*padding;
var halfCubeSize = cubeSize/2;
var BACKGROUND_COLOR = 0x6200ee;
var BODY_COLOR = 0x388e3c;
var HEAD_COLOR = 0x004d40;
var APPLE_COLOR = 0xc62828;
var score = 0;
var lightPos = [new THREE.Vector3(0,50,20),new THREE.Vector3(0,15,-20),new THREE.Vector3(-20,15,20),new THREE.Vector3(20,-15,0)];
var end = false;
var keysQueue = [];
var snake = [];
var apple;
var cube = new THREE.BoxGeometry(1,1,1);
var sphere = new THREE.SphereGeometry(0.75);
var blackhole = new THREE.CircleGeometry(1);
var gameCube = new THREE.BoxGeometry(cubeSize,cubeSize,cubeSize);
var direction = new THREE.Vector3(1,0,0);
var text = document.createElement("div");
var speed = document.createElement("div");
var reset=document.createElement("button");
var slider = document.createElement("INPUT");
var scoreDisplay=document.createElement("div");
var clock = new THREE.Clock();

function init() {
	renderer.setSize( WIDTH, HEIGHT );
	create_slider();
    document.body.appendChild( renderer.domElement );
	scene.background = new THREE.Color(BACKGROUND_COLOR);
	camera.position.set(0,0,60);
	cube.center();
	var blackholematerial = new THREE.MeshBasicMaterial( { color: 0x000000 } );
	black1 = new Cube(new THREE.Vector3(5,5,5),blackholematerial,scene,blackhole);
	black2 = new Cube(new THREE.Vector3(-5,-5,-5),blackholematerial,scene,blackhole);
	// var circle = new THREE.Mesh( geometry, material );
	lightPos.forEach(function(v){
		var light = new THREE.PointLight(0xffffff, 1, 100);
		light.position.set(v.x,v.y,v.z);
		scene.add(light);
	});
	for (let i = 0; i < 5; i++) {
		var snakeMaterial = new THREE.MeshPhongMaterial({ color: i === 4 ? HEAD_COLOR : BODY_COLOR});
		snake.push(new Cube(new THREE.Vector3((i+i*padding) - halfCubeSize + 0.5, 0.5 + padding/2,  0.5 + padding/2), snakeMaterial,scene))		
	}
	var appleMaterial = new THREE.MeshPhongMaterial({color : APPLE_COLOR });
	apple = new Cube(spawnAppleVector(), appleMaterial, scene,sphere);
	var edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
	new Cube(new THREE.Vector3(0, 0, 0), edgesMaterial, scene, gameCube,true);
	text.style.position = "absolute";
	text.style.width = 200;
	text.style.height = 100;
	text.innerHTML = "Score: "+ score;
	text.style.top = 40+"px";
	text.style.left = 20+"px";
	text.style.font = 50+"px";	
	document.body.appendChild(text);
	clock.startTime = 0.0;
	render();
	
}

function create_slider() {
	slider.setAttribute("type","range");
	slider.setAttribute("min","0");
	slider.setAttribute("max","4");
	slider.setAttribute("value","1");
	slider.setAttribute("step","0.25");
	slider.style.width=33+"%";
	slider.style.height=20+"px"
	slider.style.color=BACKGROUND_COLOR;
	document.body.appendChild(slider);
	
}

function spawnAppleVector(){
	var x=randInRange(0,edgeSize-1);
	var y=randInRange(0,edgeSize-1);
	var z=randInRange(0,edgeSize-1);
	
	return new THREE.Vector3(x+x*padding-halfCubeSize+0.5,y+y*padding-halfCubeSize+0.5,z+z*padding-halfCubeSize+0.5)
}


function render() {
	requestAnimationFrame( render );
	let delta = clock.getDelta();
	theta = theta + delta;
	// theta += clock.getDelta();
	// text.innerHTML=theta;
	// snake.mesh.timeScale = 3;
	
	speed.style.position = "absolute";
	speed.style.width = 200;
	speed.style.height = 100;
	speed.innerHTML = "Score: "+ score;
	speed.style.top = 2+"px";
	speed.style.left = 50+"%";
	speed.style.font = 50+"px"
	document.body.appendChild(speed);
	speed.innerHTML = "Animation Speed is "+slider.value;
	delta=delta/(0.1*slider.value);
	for(i=0;i<snake.length;i++)
	{
		if(snake[i].mesh.position.distanceTo(black1.mesh.position) <1) {
			// snake[i].setPosition(new THREE.Vector3(-5,-5,-5));
			for(let j=0;j<(snake.length);j++){
				snake[j].setPosition(new THREE.Vector3(-5+(j*direction.x),-5+(j*direction.y),-5+(j*direction.z)));	
			}

		}
		else if(snake[i].mesh.position.distanceTo(black2.mesh.position) <1) {
			// snake[i].setPosition(new THREE.Vector3(5,5,5));
			for(let j=i;j<snake.length;j++){
				snake[j].setPosition(new THREE.Vector3(+5+(j*direction.x),5+(j*direction.y),5+(j*direction.z)));
			}
		}
	}
	if(theta > delta) {
		var tail = snake.shift();
		var head = snake[snake.length - 1];

		head.mesh.material.color.setHex(HEAD_COLOR);
		tail.mesh.material.color.setHex(BODY_COLOR);
		direction = keysQueue.length>0 ? keysQueue.pop():direction;
		var newPosition = new THREE.Vector3(head.mesh.position.x + direction.x + Math.sign(direction.x)*padding,head.mesh.position.y + direction.y + Math.sign(direction.y)*padding, head.mesh.position.z + direction.z + Math.sign(direction.z)*padding)
		tail.setPosition(newPosition);
		snake.push(tail);
		head=tail;
		for(var i= snake.length - 2;i>-1;i--) {
			if(head.mesh.position.distanceTo(snake[i].mesh.position) <1) {
				end=true;
				// console.log(i);
				break;
			}
		}
		if(head.mesh.position.distanceTo(apple.mesh.position) <1) {
			apple.setPosition(spawnAppleVector());
			text.innerHTML = "Score: "+(++score);
			//unshitf position should be direction +1
			snake.unshift(new Cube(new THREE.Vector3(snake[0].mesh.position.x,snake[0].mesh.position.y,snake[0].mesh.position.z), new THREE.MeshPhongMaterial({color:BODY_COLOR}),scene));
		}

		if(head.mesh.position.x< -halfCubeSize)
		head.mesh.position.x=halfCubeSize-0.5;
		else if(head.mesh.position.x> halfCubeSize)
		head.mesh.position.x=-halfCubeSize+0.5;
		else if(head.mesh.position.y< -halfCubeSize)
		head.mesh.position.y=halfCubeSize-0.5;
		else if(head.mesh.position.y> halfCubeSize)
		head.mesh.position.y=-halfCubeSize+0.5;
		else if(head.mesh.position.z< -halfCubeSize)
		head.mesh.position.z=halfCubeSize-0.5;
		else if(head.mesh.position.z> halfCubeSize)
		head.mesh.position.z=-halfCubeSize+0.5;
		
		if(end===true) {
			text.innerHTML="Game end";
			direction =new THREE.Vector3(0,0,0);
			reset.style.position = "absolute";
			reset.style.width = 400;
			reset.style.height = 200;
			reset.style.top = 40+"px";
			reset.style.left = 100+"px";
			reset.style.font = 50+"px";
			reset.innerHTML="restart";
			document.body.appendChild(reset);
			scoreDisplay.style.position = "absolute";
			scoreDisplay.style.width = 400;
			scoreDisplay.style.height = 200;
			scoreDisplay.style.top = 40+"px";
			scoreDisplay.style.left = 200+"px";
			scoreDisplay.style.font = 50+"px";
			document.body.appendChild(scoreDisplay);
			scoreDisplay.innerHTML = "Final Score is: "+ score;	
		}	
		else {
			var c = document.body.children;
			var flag=false;  
  			for (var i = 0; i < c.length; i++) {
				if(c[i] === reset) {
					document.body.removeChild(reset);
					document.body.removeChild(scoreDisplay);
					apple.setPosition(spawnAppleVector());
				}
			}
		}
		theta=0;
	}
	renderer.render(scene, camera);
}

window.onload = init();
reset.addEventListener("click",function(){
	end=false;
	while(snake.length>5)
	scene.remove(snake.shift().mesh);
	for (var i = 0; i < snake.length; i++) 
		snake[i].setPosition(new THREE.Vector3((i+i*padding) - halfCubeSize + 0.5, 0.5 + padding/2,  0.5 + padding/2));
	direction=new THREE.Vector3(1,0,0);
	score=0;
	text.innerHTML = "Score: "+score;	
});


document.addEventListener("keydown",function(e){
	if(!end) {
		switch (e.key) {
			case "ArrowDown":
				keysQueue.push(new THREE.Vector3(0,-1,0))
				break;
			case "ArrowUp":
				keysQueue.push(new THREE.Vector3(0,1,0))
				break;
			case "ArrowLeft":
				keysQueue.push(new THREE.Vector3(-1,0,0))
				break;
			case "ArrowRight":
				keysQueue.push(new THREE.Vector3(1,0,0))
				break;
			case "q":
				keysQueue.push(new THREE.Vector3(0,0,-1))
				break;
			case "a":
				keysQueue.push(new THREE.Vector3(0,0,1))
				break;
			default:
				break;
		}
	}
});

// var animation = THREE.AnimationMixer(snake.mesh ).timeScale = 3 ; // add this

function onWindowResize() {
    // Camera frustum aspect ratio
	camera.aspect = window.innerWidth / window.innerHeight;
	// After making changes to aspect
	camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener('resize', onWindowResize, false);
