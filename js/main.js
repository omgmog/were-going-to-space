(function() {
  'use strict';

  var camera, controls, scene, renderer;

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
  camera.position.z = 0;
  camera.position.y = 25;

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  var lights = [];

  /*
    I've modified OrbitControls.js to addVectors to it's target upon initialization

    this is done by modifying line 26 to be:

    this.target = new THREE.Vector3().addVectors(
      object.position, object.getWorldDirection()
    );
  */

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
      'BoxGeometry', [45, 40, 20],
      'MeshPhongMaterial', [{
        color: 0xaaaaff,
        shading: THREE.SmoothShading,
      }]
    );

    var conveyor = buildconveyor(170, 10, 3, -30, 23, -77, 0, -.2, -.1); // todo
    scene.add(conveyor);


    var rocket = new THREE.Object3D();
    var rocketPoints = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0, 874),
      new THREE.Vector2(65, 874),
      new THREE.Vector2(65, 796),
      new THREE.Vector2(74, 799),
      new THREE.Vector2(126, 602),
      new THREE.Vector2(131, 577),
      new THREE.Vector2(137, 528),
      new THREE.Vector2(143, 470),
      new THREE.Vector2(143, 413),
      new THREE.Vector2(142, 344),
      new THREE.Vector2(131, 272),
      new THREE.Vector2(116, 213),
      new THREE.Vector2(100, 164),
      new THREE.Vector2(74, 106),
      new THREE.Vector2(57, 69),
      new THREE.Vector2(40, 35),
      new THREE.Vector2(22, 13),
      new THREE.Vector2(0, 0)
    ];

    var rocketbody = build(
      'LatheGeometry', [rocketPoints, 64],
      'MeshPhongMaterial', [{
        color: 0xeeeeee,
        shading: THREE.SmoothShading,
        specular: 0xffffff,
        shininess: 100,
        metal: true,
      }]
    );
    rocketbody.geometry.scale(.1,-.1,.1);


    // Totally temporary door thing
    var rocketDoorShape = new THREE.Shape();
    rocketDoorShape.moveTo(7, 168);
    rocketDoorShape.lineTo(135, 168);
    rocketDoorShape.lineTo(141, 93);
    rocketDoorShape.lineTo(142, 77);
    rocketDoorShape.lineTo(140, 58);
    rocketDoorShape.lineTo(134, 40);
    rocketDoorShape.lineTo(123, 25);
    rocketDoorShape.lineTo(109, 12);
    rocketDoorShape.lineTo(92, 2);
    rocketDoorShape.lineTo(71, 0);
    rocketDoorShape.lineTo(50, 2);
    rocketDoorShape.lineTo(33, 12);
    rocketDoorShape.lineTo(19, 25);
    rocketDoorShape.lineTo(8, 40);
    rocketDoorShape.lineTo(2, 58);
    rocketDoorShape.lineTo(0, 77);
    rocketDoorShape.lineTo(1, 93);

    var rocketDoor = build(
      'ExtrudeGeometry', [rocketDoorShape, {
        amount: 10,
        bevelEnabled: false,
      }],
      'MeshPhongMaterial', [{
        color: 0x333333,
        shading: THREE.SmoothShading,
      }]
    );

    rocketDoor.geometry.scale(.06,-.06,.06);
    rocketDoor.position.set(12,-55,8);
    rocketDoor.rotation.set(0,20,0);

    rocket.add(rocketDoor, rocketbody);

    rocket.position.set(-130,100,-100);

    scene.add(rocket);



    var sceneitems = [];

    desk.radius = 20;
    desk.step = -28;
    cupboard1.radius = cupboard2.radius = cupboard3.radius = 80;
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
    var roboBuddy = new THREE.Object3D();
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
    torsoShape.moveTo(0, 137);
    torsoShape.lineTo(59, 0);
    torsoShape.lineTo(157, 0);
    torsoShape.lineTo(157, 137);


    var torsoMesh = build(
      'ExtrudeGeometry', [torsoShape, {
        amount: 100,
        bevelEnabled: false,
      }],
      'MeshPhongMaterial', [{
        color: roboBuddyColor,
        shading: THREE.SmoothShading,
      }]
    );
    // torsoMesh.geometry.scale(.08,-.1,.12);
    torsoMesh.geometry.scale(.08,-.1,-.12);

    var roboBuddyTorso = new THREE.Object3D();
    roboBuddyTorso.rotation.y = Math.PI / 2;
    roboBuddyTorso.position.x = 6;
    roboBuddyTorso.position.z = 8.5;
    roboBuddyTorso.position.y = -3.5;

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

    roboBuddyArmL.position.set(3,-2,1);
    roboBuddyArmR.position.set(3,-2,-13);

    roboBuddyTorso.add(torsoMesh, roboBuddyArmL, roboBuddyArmR);

    roboBuddy.add(roboBuddyTorso,roboBuddyHead);

    roboBuddy.position.y = 20;
    roboBuddy.position.x = 40;
    roboBuddy.rotation.y = Math.PI / 3 * -1;

    scene.add(roboBuddy);




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


  function render() {
    // per frame stuff here
    renderer.render(scene, camera);
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render();
  };
  animate();

}());
