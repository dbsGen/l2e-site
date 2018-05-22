
var abi = require('./abi');
var BigNumber = require('bignumber.js');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("https://ropsten.infura.io/QDtsUjyVAFY8i49NGymM"));
var address = '0x48cce49bea8cc043c8cbdbdbac2da6e410015df1';

var util = require('util');
var envColor = 0x001133;

function Ball(geo, material) {
    THREE.Mesh.call(this, geo, material);
    this.speed = Math.random() * 10;
    this.rotation_speed = 0.1 + 0.9 * Math.random();
    this.rotation.x = this.rotation.y = 0;
    this.rotation.z = Math.random() * Math.PI * 2;
    this.tmp = new THREE.Vector3();
    this.target = new THREE.Vector3();
}
util.inherits(Ball, THREE.Mesh);
Ball.prototype.update = function (delta, balls) {
    if (this.target.z === 0) {
        this.target.set(this.position.x, this.position.y, this.position.z);
    }
    this.tmp.z = 0;
    this.rotation.z += delta * this.rotation_speed;
    this.tmp.x = Math.sin(this.rotation.z) * this.speed * delta;
    this.tmp.y = Math.cos(this.rotation.z) * this.speed * delta;
    var vc = new THREE.Vector3();
    for (var i = 0, t = balls.length; i < t; ++i) {
        var b = balls[i];
        if (b !== this) {
            var len = this.position.distanceTo(b.position);
            if (len < 1) {
                len = 1;
            }
            if (len < 60) {
                vc.set(this.position.x - b.position.x,
                    this.position.y - b.position.y,
                    this.position.z - b.position.z);
                this.tmp.add(vc.divideScalar(len));
            }
        }
    }
    if (this.position.x > 300) {
        this.tmp.x -= (this.position.x - 300) * 0.1;
    }else if (this.position.x < -300) {
        this.tmp.x -= (this.position.x + 300) * 0.1;
    }
    if (this.position.y > 150) {
        this.tmp.y -= (this.position.y - 150) * 0.1;
    }else if (this.position.y < -150){
        this.tmp.y -= (this.position.y + 150) * 0.1;
    }
    this.target.add(this.tmp);

    if (!this.position.equals(this.target)) {
        this.position.lerp(this.target, 0.02);
        if (this.position.distanceTo(this.target) < 0.01) {
            this.position.set(this.target.x, this.target.y, this.target.z);
        }
    }
};

var container = document.getElementById('graph');
var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( container.clientWidth, container.clientHeight );
container.appendChild( renderer.domElement );

var camera = new THREE.PerspectiveCamera( 40, container.clientWidth / container.clientHeight, 1, 2000 );
camera.position.set( 0.0, 0.0, -300 );
camera.lookAt(new THREE.Vector3( 0, 0, 0 ));
scene.add(camera);

var cubeWidth = 400;
var numberOfSphersPerSide = 5;
var sphereRadius = ( cubeWidth / numberOfSphersPerSide ) * 0.8 * 0.5;
var stepSize = 1.0 / numberOfSphersPerSide;
scene.background = new THREE.Color(envColor);

var diffuseColor = new THREE.Color(0xffffff);

var imgTexture = new THREE.TextureLoader().load( "res/moon_1024.jpg" );
imgTexture.wrapS = imgTexture.wrapT = THREE.RepeatWrapping;
imgTexture.anisotropy = 16;
imgTexture = null;

// var material = new THREE.MeshPhysicalMaterial( {
//     color: diffuseColor,
//     metalness: 0,
//     roughness: 0.5,
//     clearCoat:  0.5,
//     clearCoatRoughness: 0.6,
//     reflectivity: 0.5,
// } );

var balls = [];
var material = new THREE.MeshLambertMaterial( {
    map: imgTexture,
    color: diffuseColor,
    reflectivity: 1
} );

var geometry = new THREE.SphereBufferGeometry( sphereRadius, 32, 32 );
for (var i = 0, t = 20; i < t; ++i) {
    var mesh = new Ball( geometry, material );
    scene.add( mesh );
    mesh.position.x = 600 * (Math.random() - 0.5);
    mesh.position.y = 300 * (Math.random() - 0.5);
    mesh.position.z = -10;

    var scale = 2 * Math.random();
    mesh.scale.x = scale;
    mesh.scale.y = scale;
    mesh.scale.z = scale;
    mesh.castShadow = true;
    balls.push(mesh);
}

var geoFloor = new THREE.PlaneBufferGeometry( 2000, 2000 );

var matFloor = new THREE.MeshPhongMaterial( { color: 0x808080, dithering: true } );

var mshFloor = new THREE.Mesh( geoFloor, matFloor );
mshFloor.rotation.x = Math.PI;
mshFloor.receiveShadow = true;
mshFloor.position.set(0,0,100);
scene.add(mshFloor);


var spotLight = new THREE.SpotLight( 0xaaaaff );
spotLight.position.set( 0, 0, -300 );

spotLight.castShadow = true;

spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;

spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 30;
spotLight.angle = Math.PI / 10;
spotLight.penumbra = 0.99;
scene.add(spotLight);

var directionalLight = new THREE.DirectionalLight( envColor, 1 );
directionalLight.position.set( 0, 1, -1 ).normalize();
scene.add( directionalLight );

scene.add( new THREE.AmbientLight( envColor ) );

var ZERO = new THREE.Vector3(0,0,0);
var cameraTarget = camera.position.clone();

var is_in = true;
function animate() {
    if (is_in) {
        requestAnimationFrame( animate );
        render();
    }
}
var old_time;
function render() {
    var time = Date.now();
    if (!old_time) old_time = time;

    for (var i = 0, t = balls.length; i < t; ++i) {
        balls[i].update((time - old_time)/1000.0, balls)
    }
    if (!cameraTarget.equals(camera.position)) {
        camera.position.lerp(cameraTarget, 0.02);
        if (camera.position.distanceTo(cameraTarget) < 0.01) {
            camera.position.copy(cameraTarget);
        }
        camera.lookAt(ZERO);
    }
    old_time = time;
    renderer.render( scene, camera );
}
animate();

window.onblur = function() {
    is_in = false;
};
window.onfocus = function() {
    is_in = true;
    old_time = null;
    requestAnimationFrame( animate );
};

window.addEventListener( 'resize', onWindowResize, false );
function onWindowResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( container.clientWidth, container.clientHeight );
}


var top = document.getElementsByClassName('top')[0];
top.onmousemove = function (e) {
    var px = e.clientX / top.clientWidth, py = e.clientY / top.clientHeight;
    cameraTarget.set((px - 0.5)*100, (py - 0.5) * 40, -300);
};

var progressBar = document.getElementsByClassName('m-progress-bar')[0];
var contract = web3.eth.contract(abi).at(address);
contract.totalSupply(function (err, res) {

    var total = new BigNumber(res);
    contract.balanceOf('0x0', function (err, res) {
        var got = new BigNumber(res);
        var ex = total.minus(got);
        progressBar.style.width = ex.div(total).toNumber() + '%';
    });
});

