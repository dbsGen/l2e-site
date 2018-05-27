
var abi = require('./abi');
var Alert = require('./alert');
var loc = require('./localization');
// var web3 = new Web3();
// web3.setProvider(new web3.providers.HttpProvider("https://ropsten.infura.io/QDtsUjyVAFY8i49NGymM"));
var address = '0x0d5195906c2093ba8994066604bc10a7eb69beee';

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

var web3js = null;
window.addEventListener('load', function() {

    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        web3js = new Web3(web3.currentProvider);
    } else {
        console.log('No web3? You should consider trying MetaMask!')
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        web3js = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/QDtsUjyVAFY8i49NGymM"));
    }

    startApp();

});

var buyToken = document.getElementById('buyToken');

function startApp() {

    var enter = 'enter', exit = 'exit';

    var contract = web3js.eth.contract(abi).at(address);


    var alert = new Alert(document.getElementsByClassName('alert-cover')[0]);
    buyToken.onclick = function () {
        cAnim(content0, 'up', enter);
        content1.style.display = 'none';
        content2.style.display = 'none';
        content3.style.display = 'none';
        content4.style.display = 'none';
        alert.show();


        try {
            myWallet.innerHTML = '';
            myAddress.innerHTML = '';
            myETHWallet.innerHTML = '';
            for (var i = 0, t = web3js.eth.accounts.length; i < t; ++i) {
                var option = document.createElement('option');
                option.value = option.innerText = web3js.eth.accounts[i];
                myWallet.appendChild(option);
                option = document.createElement('option');
                option.value = option.innerText = web3js.eth.accounts[i];
                myAddress.appendChild(option);
                option = document.createElement('option');
                option.value = option.innerText = web3js.eth.accounts[i];
                myETHWallet.appendChild(option);
            }
        }catch (e) {

        }
    };

    loc();

    function cAnim(content, from, action) {
        content.style.display = 'block';
        var need_remove = [];
        for (var i = 0, t = content.classList.length; i < t; ++i) {
            var cn = content.classList[i];
            if (cn.match(/(enter)|(exit)$/)) {
                need_remove.push(cn);
            }
        }
        for (i = 0, t = need_remove.length; i < t; ++i) {
            content.classList.remove(need_remove[i]);
        }
        content.classList.add('content_'+from+'_' + action);
        if (action === exit) {
            setTimeout(function () {
                content.style.display = 'none';
            }, 400);
        }else if (action === enter) {
            var size = parseInt(content.getAttribute('data-size')) || 3;
            alert.setHeight(size * 70);
        }
    }

    document.getElementById('l2eAddress').value = address;

    var checkButton = document.getElementsByClassName('check-balance')[0];
    var buyButton = document.getElementsByClassName('buy-token')[0];
    var content0 = document.getElementsByClassName('alert-content-0')[0];
    var content1 = document.getElementsByClassName('alert-content-1')[0];
    var content2 = document.getElementsByClassName('alert-content-2')[0];
    var content3 = document.getElementsByClassName('alert-content-3')[0];
    var content4 = document.getElementsByClassName('alert-content-4')[0];
    checkButton.onclick = function () {
        cAnim(content0, 'up', exit);
        cAnim(content1, 'down', enter);
    };
    buyButton.onclick = function () {
        cAnim(content0, 'up', enter);
        cAnim(content1, 'down', exit);
    };

    var myAddress = document.getElementById('myAddress'), balance = document.getElementById('balance');
    var buyForm = document.getElementById('buyForm'), amount = document.getElementById('amount');
    var buyAlert = document.getElementById('buyAlert'), vote = document.getElementById('vote');
    var myWallet = document.getElementById('myWallet'), voteBack = document.getElementById('voteBack');
    var voteForm = document.getElementById('voteForm'), mainnetWallet = document.getElementById('mainnetWallet');
    var confirmBack = document.getElementById('confirmBack'), voteAlert = document.getElementById('voteAlert');
    var confirmForm = document.getElementById('confirmForm'), myETHWallet = document.getElementById('myETHWallet');
    var infoForm = document.getElementById('infoForm'), infoText = document.getElementById('infoText');
    var progress = document.getElementsByClassName('m-progress')[0];
    var timerElem = document.getElementsByClassName('timer')[0];

    var infoNextTarget;

    function updateBalance() {
        contract.balanceOf(myAddress.value, function (err, res) {
            if (!err) {
                var n = new BigNumber(res);
                balance.value = n.toString();
            }
        });
    }

    myAddress.onchange = function () {
        updateBalance();
    };
    if (myAddress.value.length !== 0) {
        updateBalance();
    }

    buyForm.onsubmit = function () {
        var v = parseFloat(amount.value);
        if (v > 0.001) {
            try {
                web3js.eth.sendTransaction({
                    to: address,
                    value: web3js.toWei(v, 'ether'),
                },function (err, res) {
                    if (err) {
                        infoText.innerHTML = loc.loc('Transaction Error');
                        infoNextTarget = content0;
                    }else {
                        infoText.innerText = loc.loc('Buy Success') + '!';
                        infoNextTarget = function () {
                            alert.miss();
                        };
                    }
                    cAnim(content4, 'down', enter);
                    cAnim(content0, 'up', exit);
                });
            }catch (e) {
            }
            buyAlert.innerText = loc.loc('No plugin');
            buyAlert.classList.add('show');
            setTimeout(function () {
                buyAlert.classList.remove('show');
            }, 5000);
        }else {
            buyAlert.innerText = loc.loc('Invalid number');
            buyAlert.classList.add('show');
            setTimeout(function () {
                buyAlert.classList.remove('show');
            }, 5000);
        }
        return false;
    };

    vote.onclick = function () {
        cAnim(content2, 'down', enter);
        cAnim(content0, 'up', exit);
    };

    voteBack.onclick = function() {
        cAnim(content0, 'up', enter);
        cAnim(content2, 'down', exit);
    };

    var mainnetAddress=null, ethAddress;
    voteForm.onsubmit = function () {
        var add = mainnetWallet.value;
        var myAdd = myAddress.value;
        if (myAdd.length > 0) {
            ethAddress = myAdd;
        }else {
            voteAlert.classList.add('show');
            voteAlert.innerText = loc.loc('No wallet');
            setTimeout(function () {
                voteAlert.classList.remove('show');
            }, 5000);
            return false;
        }
        if (add.length > 0) {
            content3.querySelector('#confirmText').innerHTML = loc.loc('Transfer mainadd') + '<br><b>' + add + '</b>';
            mainnetAddress = add;
        }else {
            voteAlert.classList.add('show');
            voteAlert.innerText = loc.loc('Input wallet');
            setTimeout(function () {
                voteAlert.classList.remove('show');
            }, 5000);
            return false;
        }

        cAnim(content3, 'down', enter);
        cAnim(content2, 'up', exit);
        return false;
    };

    confirmBack.onclick = function () {
        cAnim(content3, 'down', exit);
        cAnim(content2, 'up', enter);
    };

    confirmForm.onsubmit = function () {
        contract.transferToMainnet(mainnetAddress, {
            from: ethAddress,
            to: mainnetAddress
        }, function (err, res) {
            console.log(err);
            console.log(res);
        });
        return false;
    };
    infoForm.onsubmit = function () {
        if (typeof infoNextTarget === 'function') {
            infoNextTarget();
        }else {
            cAnim(infoNextTarget, 'up', enter);
            cAnim(content4, 'down', exit);
        }
        return false;
    };

    var totalBalance;
    var percentBalance = 0;

    function updateInterval() {
        contract.balanceOf('0x0', function (err, res) {
            var got = new BigNumber(res);
            var ex = totalBalance.minus(got);
            percentBalance = parseFloat(ex.div(totalBalance).mul(100).toNumber());
            updateWidth();

        });
    }

    var title = document.getElementsByClassName('title')[0];
    title.classList.add('title-fade-appear');
    setTimeout(function () {
        var subtitle = document.getElementsByClassName('subtitle')[0];
        subtitle.classList.add('fade-appear');
        setTimeout(function () {
            var timer = document.getElementsByClassName('timer')[0];
            timer.classList.add('fade-appear');
            contract.totalSupply(function (err, res) {

                totalBalance = new BigNumber(res);
                contract.balanceOf('0x0', function (err, res) {
                    var got = new BigNumber(res);
                    var ex = totalBalance.minus(got);
                    percentBalance = parseFloat(ex.div(totalBalance).mul(100).toNumber());
                    updateWidth();

                    document.querySelector('.top .content').classList.add('fade-appear');
                    setInterval(updateInterval, 60000);
                });
            });
        }, 600);
    }, 800);

    var languageChange = document.getElementById('languageChange');
    if (loc.language === 'zh') {
        languageChange.innerText = 'E';
    }else {
        languageChange.innerText = '中';
    }

    languageChange.onclick = function () {
        if (loc.language === 'en') {
            loc.set('zh');
            loc();
        }else {
            loc.set('en');
            loc();
        }
        if (loc.language === 'zh') {
            languageChange.innerText = 'E';
        }else {
            languageChange.innerText = '中';
        }
    };

    progress.onclick = function () {
        if (progress.classList.contains('progress-select')) {
            progress.classList.remove('progress-select');
        }else {
            progress.classList.add('progress-select');
        }
        updateWidth();
    };

    function updateWidth() {
        if (progress.classList.contains('progress-select')) {
            var target = parseFloat(progress.getAttribute('data-target'));
            progressBar.style.width = (percentBalance / target * 100) + '%';
        }else {
            progressBar.style.width = percentBalance + '%';
        }
    }
    var dateFrom = new Date(timerElem.getAttribute('data-from')), dateEnd = new Date(timerElem.getAttribute('data-end'));
    var timer;
    if (new Date().getTime() > dateFrom.getTime()) {
        timer = new CountdownTimer(timerElem, dateEnd);
    }else {
        timer = new CountdownTimer(timerElem, dateFrom);
    }
}