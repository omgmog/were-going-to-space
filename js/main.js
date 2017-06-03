(function() {
  'use strict';

  var camera, controls, scene, renderer;

  var clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.002);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    gammaInput: true,
    gammaOutput: true,
  });
  renderer.setClearColor(scene.fog.color);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  var distance = 1000;
  var FOV = 2 * Math.atan( window.innerHeight / ( 2 * distance ) ) * 180 / Math.PI;
  camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 0.1, distance);
  camera.position.y = 25;

  // Control setup...
  if ("getVRDisplays" in navigator) {
    // VRControls if we've got an HMD and the browser can get it
    controls = new THREE.VRControls(camera, function () {});
  } else if ("orientation" in window) {
    // DeviceOrientationControls if we're on a mobile device with gyroscope
    controls = new THREE.DeviceOrientationControls(camera, true);
  } else {
    // OrbitControls for the peasants
    controls = new THREE.OrbitControls(camera, renderer.domElement);
  }
  camera.position.z = 0;
  if (typeof controls.userHeight !== "undefined") {
    // If we've got the userHeight, use it.
    camera.position.y = controls.userHeight;
  }

  var lights = [];

  /*
    I've modified OrbitControls.js to addVectors to it's target upon initialization

    this is done by modifying line 26 to be:

    this.target = new THREE.Vector3().addVectors(
      object.position, object.getWorldDirection()
    );
  */

  var roboBuddy;

  init();

  function init() {

    function construct(constructor, args) {
      function F() {
        return constructor.apply(this, args);
      };
      F.prototype = constructor.prototype;
      return new F();
    };

    function build(geoType, geoProps, matType, matProps) {
      var geo = construct(THREE[geoType], geoProps);
      var mat = construct(THREE[matType], matProps);
      var mesh = new THREE.Mesh(geo, mat);
      return mesh;
    };

    function buildconveyor(length,width,wheelSize,x,y,z,ax,ay,az) {
      var conveyor = new THREE.Object3D();
      conveyor.rotation.set(ax, ay, az);
      conveyor.position.set(x,y,z);

      var belts = [];
      belts.push(build(
        'BoxGeometry', [length,1,width],
        'MeshPhongMaterial', [{
          color: 0x777777,
          shading: THREE.SmoothShading,
        }]
      ));
      belts.push(belts[0].clone());
      belts[0].position.y = wheelSize;
      belts[1].position.y = -1 * wheelSize;

      var wheels = [];
      var primeWheel = build(
        'CylinderGeometry', [wheelSize, wheelSize, width - 2, 16],
        'MeshPhongMaterial', [{
          color: 0xeeeeee,
          shading: THREE.SmoothShading,
        }]
      );
      primeWheel.rotation.x = Math.PI / 2;

      var maxWheels = Math.floor(length / (wheelSize * 4));
      var halfLength = length / 2;

      // we give an extra wheel
      for (var i=0; i<=maxWheels;i++) {
        var newWheel = primeWheel.clone();
        newWheel.position.x = (halfLength - length) + i * (length / maxWheels);
        wheels.push(newWheel);
      }


      belts.forEach(function (belt) {
        conveyor.add(belt);
      });
      wheels.forEach(function (wheel) {
        conveyor.add(wheel);
      })

      return conveyor;
    }


    // build things

    var floor = build(
      'PlaneGeometry', [1000,1000,10,10],
      'MeshPhongMaterial', [{
        color: 0x333333,
        shading: THREE.SmoothShading,
        side: THREE.DoubleSide
      }]
    );
    floor.position.y = 0;
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);

    var desk = new THREE.Object3D();
    var table = build(
      'BoxGeometry', [45, 1, 15],
      'MeshPhongMaterial', [{
        color: 0xaaaaaa,
        shading: THREE.SmoothShading,
      }]
    );
    table.position.y = -5;

    var deskleg1 = build(
      'BoxGeometry', [1, 15, 1],
      'MeshPhongMaterial', [{
        color: 0x555555,
        shading: THREE.SmoothShading,
      }]
    );
    var deskleg2 = build(
      'BoxGeometry', [1, 15, 1],
      'MeshPhongMaterial', [{
        color: 0x555555,
        shading: THREE.SmoothShading,
      }]
    );
    var deskleg3 = build(
      'BoxGeometry', [1, 15, 1],
      'MeshPhongMaterial', [{
        color: 0x555555,
        shading: THREE.SmoothShading,
      }]
    );
    var deskleg4 = build(
      'BoxGeometry', [1, 15, 1],
      'MeshPhongMaterial', [{
        color: 0x555555,
        shading: THREE.SmoothShading,
      }]
    );
    deskleg1.position.set(-21, -7.5, 5);
    deskleg2.position.set(-21, -7.5, -5);
    deskleg3.position.set(21, -7.5, 5);
    deskleg4.position.set(21, -7.5, -5);

    table.add(deskleg1, deskleg2, deskleg3, deskleg4);


    var computer = new THREE.Object3D();
    computer.position.set(8, 0, -3);
    computer.rotation.set(0,-.2,0);

    var monitor = build(
      'BoxGeometry', [12, 10, 8],
      'MeshPhongMaterial', [{
        color: 0xc7c79d,
        shading: THREE.SmoothShading,
      }]
    );
    monitor.position.set(0,.5,0)
    monitor.rotation.set(-.2,0,0);

    var screenglass = build(
      'BoxGeometry', [9, 7, 1],
      'MeshPhongMaterial', [{
        color: 0x000000,
        shading: THREE.SmoothShading,
      }]
    );
    screenglass.position.set(0, 0, 4);
    monitor.add(screenglass);

    var keyboard = build(
      'BoxGeometry', [12, 1, 3],
      'MeshPhongMaterial', [{
        color: 0xc7c79d,
        shading: THREE.SmoothShading,
      }]
    );
    keyboard.position.set(0, -4, 7);



    computer.add(monitor, keyboard);

    // Eventually have some notes/drawings about the rocket
    var paper = build(
      'BoxGeometry', [8, .125, 10],
      'MeshPhongMaterial', [{
        color: 0xdddddd,
        shading: THREE.SmoothShading,
      }]
    );
    paper.position.set(-8, -4.5, 0);
    paper.rotation.set(0,.2,0);

    desk.add(table,computer, paper);


    var cupboard1 = build(
      'BoxGeometry', [45, 40, 10],
      'MeshPhongMaterial', [{
        color: 0xffaaaa,
        shading: THREE.SmoothShading,
      }]
    );
    var cupboard2 = build(
      'BoxGeometry', [45, 40, 10],
      'MeshPhongMaterial', [{
        color: 0xaaffaa,
        shading: THREE.SmoothShading,
      }]
    );
    var cupboard3 = build(
      'BoxGeometry', [45, 40, 10],
      'MeshPhongMaterial', [{
        color: 0xaaaaff,
        shading: THREE.SmoothShading,
      }]
    );

    var conveyor = buildconveyor(170, 10, 3, -30, 23, -77, 0, -.2, -.1); // todo
    scene.add(conveyor);

    var flipVertical = new THREE.Matrix4().makeRotationX(Math.PI);

    var rocket = new THREE.Object3D();

    var rocketPoints = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.5, 0.4),
      new THREE.Vector2(1.29992285, 1.43232647),
      new THREE.Vector2(2.14964952, 3.30962958),
      new THREE.Vector2(2.76224316, 5.44382679),
      new THREE.Vector2(2.9796151, 6.86662493),
      new THREE.Vector2(2.99937619, 8.23013982),
      new THREE.Vector2(2.99937619, 9.35652168),
      new THREE.Vector2(2.72027206, 11.6990187),
      new THREE.Vector2(2.27251293, 13.3075548),
      new THREE.Vector2(1.61962198, 14.6639325),
      new THREE.Vector2(1.45801153, 17.3400002),
      new THREE.Vector2(0, 17.3400002)
    ];

    var rocketBody = build(
      'LatheGeometry', [rocketPoints, 64, 0 , 400],
      'MeshPhongMaterial', [{
        color: 0xeeeeee,
        shading: THREE.SmoothShading,
        specular: 0xffffff,
        shininess: 100,
        // metal: true,
      }]
    );
    rocketBody.geometry.applyMatrix(flipVertical);
    rocketBody.geometry.scale(7,7,7);


    // Totally temporary door thing
    var rocketDoorShape = new THREE.Shape();

    rocketDoorShape.moveTo(0.147916665, 4);
    rocketDoorShape.lineTo(2.85267853, 4);
    rocketDoorShape.lineTo(3.0005952, 1.62708331);
    rocketDoorShape.lineTo(2.95833329, 1.22559522);
    rocketDoorShape.lineTo(2.83154758, 0.845238084);
    rocketDoorShape.lineTo(2.30327378, 0.253571425);
    rocketDoorShape.lineTo(1.94404759, 0.0422619042);
    rocketDoorShape.lineTo(1.5002976, 0);
    rocketDoorShape.lineTo(1.0565476, 0.0422619042);
    rocketDoorShape.lineTo(0.697321419, 0.253571425);
    rocketDoorShape.lineTo(0.169047617, 0.845238084);
    rocketDoorShape.lineTo(0.0422619042, 1.22559522);
    rocketDoorShape.lineTo(0, 1.62708331);

    var rocketDoor = build(
      'ExtrudeGeometry', [rocketDoorShape, {
        amount: 5,
        bevelEnabled: false,
      }],
      'MeshPhongMaterial', [{
        color: 0x333333,
        shading: THREE.SmoothShading,
      }]
    );
    rocketDoor.geometry.applyMatrix(flipVertical);

    rocketDoor.geometry.scale(4,4,4);
    rocketDoor.position.set(0,-75,22);


    // Wings
    var wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0);
    wingShape.lineTo(0.881591797, 0.325592041);
    wingShape.lineTo(1.67909632, 0.998413443);
    wingShape.lineTo(2.30402536, 1.8873078);
    wingShape.lineTo(2.65497254, 2.78481932);
    wingShape.lineTo(2.78297804, 3.8601981);
    wingShape.lineTo(2.78297804, 5);
    wingShape.lineTo(2.04452515, 3.91278076);
    wingShape.lineTo(1.4347229, 3.29016113);
    wingShape.lineTo(0.75402832, 2.84954834);
    wingShape.lineTo(0.00935368156, 2.68509582);

    var wing = build(
      'ExtrudeGeometry', [wingShape, {
        amount: .2,
        bevelEnabled: false,
      }],
      'MeshPhongMaterial', [{
        color: 0xff0000,
        shading: THREE.SmoothShading,
      }]
    );
    wing.geometry.applyMatrix(flipVertical);
    wing.scale.set(10,10,10);
    wing.position.y = -75;

    var numWings = 3;
    var wings = [];
    var wingsRadius = 11;
    var wingsStep = (2*Math.PI) / numWings;
    var wingsAngle = wingsStep * 3;

    for (var i=0; i<numWings; i++) {
      var _wing = wing.clone();

      _wing.position.x = Math.cos(wingsAngle) * wingsRadius;
      _wing.position.z = Math.sin(wingsAngle) * wingsRadius;

      // This is terrible... but it works?.. MATHS!
      if (i === 0) {
        _wing.rotation.y = wingsAngle;
      }
      if (i === 1) {
        _wing.rotation.y = wingsAngle * 2;
      }
      if (i === 2) {
        _wing.rotation.y = wingsAngle * -1;
      }

      rocket.add(_wing);
      wingsAngle += wingsStep;
    }

    rocket.add(rocketDoor, rocketBody);

    rocket.position.set(-130,125,-97);
    rocket.rotation.set(0,19.9,0);

    scene.add(rocket);

    var sceneitems = [];

    desk.radius = 20;
    desk.step = -28;
    cupboard1.radius = cupboard2.radius = cupboard3.radius = 100;
    cupboard1.step = cupboard2.step = cupboard3.step = (.8 * Math.PI) / 3;
    sceneitems.push(desk, cupboard1, cupboard2, cupboard3);

    var angle = -90;

    [].forEach.call(sceneitems, function (item,i) {
      item.position.y = 20;
      item.position.x = Math.cos(angle) * item.radius;
      item.position.z = Math.sin(angle) * item.radius;
      scene.add(item);

      item.lookAt(new THREE.Vector3(0,20,0));

      angle += item.step;
    });

    var roboBuddyColor = 0xaaaaff;
    roboBuddy = new THREE.Object3D();
    var roboBuddyHead = new THREE.Object3D();

    var roboBuddyHeadMesh = build(
    'BoxGeometry', [8,6,6],
    'MeshPhongMaterial', [{
      color: roboBuddyColor,
      shading: THREE.SmoothShading,
    }]);
    // Ears
    var earMeshL = build(
      'SphereGeometry', [1.4,16,16],
      'MeshPhongMaterial', [{
        color: roboBuddyColor,
        shading: THREE.SmoothShading,
      }]
    );
    earMeshL.position.y = .5;
    var earMeshR = earMeshL.clone();
    earMeshL.position.x = -4;
    earMeshR.position.x = 4;
    roboBuddyHeadMesh.add(earMeshL,earMeshR);

    // Eyes
    var eyeMeshL = build(
      'CylinderGeometry', [1,1,2,32],
      'MeshPhongMaterial', [{
        color: 0xffffff,
        shading: THREE.SmoothShading,
      }]
    );
    eyeMeshL.rotation.x = Math.PI / 2;
    eyeMeshL.position.z = 2.5;
    eyeMeshL.position.y = 1;

    var eyeMeshR = eyeMeshL.clone();
    eyeMeshL.position.x = -2;
    eyeMeshR.position.x = 2;

    roboBuddyHeadMesh.add(eyeMeshL, eyeMeshR);

    // Mouth
    var mouthMesh = build(
      'BoxGeometry', [4,.5,1],
      'MeshPhongMaterial', [{
        color: 0xffffff,
        shading: THREE.SmoothShading,
      }]
    );
    mouthMesh.position.y = -1.5;
    mouthMesh.position.z = 3;

    roboBuddyHeadMesh.add(mouthMesh);


    roboBuddyHead.add(roboBuddyHeadMesh);

    // Torso

    var torsoShape = new THREE.Shape();

    torsoShape.moveTo(0,8);
    torsoShape.lineTo(3,0);
    torsoShape.lineTo(8,0);
    torsoShape.lineTo(8,8);


    var torsoMesh = build(
      'ExtrudeGeometry', [torsoShape, {
        amount: 10,
        bevelEnabled: false,
      }],
      'MeshPhongMaterial', [{
        color: roboBuddyColor,
        shading: THREE.SmoothShading,
      }]
    );

    var roboBuddyTorso = new THREE.Object3D();
    roboBuddyTorso.rotation.x = Math.PI;
    roboBuddyTorso.rotation.y = -Math.PI /2;
    roboBuddyTorso.position.x = 5;
    roboBuddyTorso.position.z = 5.5;
    roboBuddyTorso.position.y = -3.25;

    var roboBuddyArmL = new THREE.Object3D();
    var roboBuddyArmMesh = build(
      'BoxGeometry', [1,2,12],
      'MeshPhongMaterial', [{
        color: roboBuddyColor,
        shading: THREE.SmoothShading,
      }]
    );
    roboBuddyArmL.rotation.y = Math.PI / 2;
    roboBuddyArmL.add(roboBuddyArmMesh);

    var roboBuddyArmR = roboBuddyArmL.clone();

    roboBuddyArmL.position.set(0,2,-.5);
    roboBuddyArmR.position.set(0,2,10.5);

    roboBuddyTorso.add(torsoMesh, roboBuddyArmL, roboBuddyArmR);

    roboBuddy.add(roboBuddyTorso,roboBuddyHead);

    roboBuddy.position.y = 20;
    roboBuddy.position.x = 40;
    roboBuddy.rotation.y = Math.PI / 3 * -1;

    scene.add(roboBuddy);


    // var position = { y: 20 };
    // var position_to = { y: 40 };
    // var position_tween = new TWEEN
    //   .Tween(position)
    //   .to(position_to, 1000)
    //   .onUpdate(function() {
    //     roboBuddy.position.y = position.y;
    //     console.log('moved');
    //   })
    //   .yoyo(true)
    //   .repeat( Infinity )
    //   .start();


    var randomPoints = [];
    for ( var i = 0; i < 10; i ++ ) {
      randomPoints.push(
        new THREE.Vector3(i, 20, 2 * i)
      );
    }
    var notrandompoints = [];
    var y = 12;
    var scale = .3;
    var offsetX = 38;
    var offsetZ = -40;

    notrandompoints.push(new THREE.Vector3(offsetX + 8.34765625 * scale, y, offsetZ + 0 * scale)); // conveyor
    notrandompoints.push(new THREE.Vector3(offsetX + 45.7421875 * scale, y, offsetZ + 13.9453125 * scale));
    notrandompoints.push(new THREE.Vector3(offsetX + 68.1992188 * scale, y, offsetZ + 69.078125 * scale));
    notrandompoints.push(new THREE.Vector3(offsetX + 80.8671875 * scale, y, offsetZ + 136.664062 * scale));
    notrandompoints.push(new THREE.Vector3(offsetX + 78.96875 * scale, y, offsetZ + 226.472656 * scale));
    notrandompoints.push(new THREE.Vector3(offsetX + 53.7070312 * scale, y, offsetZ + 295.054688 * scale));
    notrandompoints.push(new THREE.Vector3(offsetX + 13.6132812 * scale, y, offsetZ + 378.972656 * scale)); // shelf
    notrandompoints.push(new THREE.Vector3(offsetX + 0 * scale, y, offsetZ + 338.460938 * scale));
    notrandompoints.push(new THREE.Vector3(offsetX + 33.3203125 * scale, y, offsetZ + 273.269531 * scale));
    notrandompoints.push(new THREE.Vector3(offsetX + 56.734375 * scale, y, offsetZ + 194.066406 * scale));
    notrandompoints.push(new THREE.Vector3(offsetX + 53.4179688 * scale, y, offsetZ + 117.113281 * scale));
    notrandompoints.push(new THREE.Vector3(offsetX + 37.0703125 * scale, y, offsetZ + 48.3789063 * scale));
    notrandompoints.push(new THREE.Vector3(offsetX + 8.34765625 * scale, y, offsetZ + 0 * scale));

    var spline = new THREE.CatmullRomCurve3(notrandompoints, {closed:true});

    console.log(spline.points[0]);


    var t = {t:0};
    var _t = {t:1};

    var matrix = new THREE.Matrix4();
    var up = new THREE.Vector3( 0, 0, 1 );
    var axis = new THREE.Vector3( );
    var radians;

    var postween = new TWEEN
      .Tween(t)
      .to(_t, 5000)
      .delay(500)
      .onUpdate(function() {
        // make robo face the right direction
        var tangent = spline.getTangent(t.t).normalize();
        axis.crossVectors( up, tangent ).normalize();
        radians = Math.acos( up.dot( tangent ) );
        roboBuddy.quaternion.setFromAxisAngle( axis, radians );

        // move along spline
        var pos = spline.getPointAt(t.t);
        roboBuddy.position.set(pos.x, pos.y, pos.z);
        roboBuddy.updateMatrix();
      })
      .yoyo(false)
      .repeat( Infinity )
      .start();






    // Ambient light
    lights.push(new THREE.AmbientLight(0xaaaaaa));

    // Light at desk
    lights.push(new THREE.PointLight(0xffffff,0.5,80));
    lights[1].lookAt(desk);

    // Light at rocket
    lights.push(new THREE.PointLight(0xffffff,1,100));
    lights[2].position.set(rocket.position.x - 20, rocket.position.y, rocket.position.z - 20);
    lights[2].lookAt(rocket.position);

    // Light it up
    [].forEach.call(lights, function (light) {
      scene.add(light);
    });

    window.addEventListener('resize', onWindowResize, false);

  }












  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

  }


  function render(dt) {
    controls.update(dt);
    TWEEN.update();
    // per frame stuff here


    renderer.render(scene, camera);
  }

  function animate() {
    requestAnimationFrame(animate);
    render(clock.getDelta());
  };
  animate();

}());
