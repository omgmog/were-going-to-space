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

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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


    // build things

    var floor = build(
      'PlaneGeometry', [1000,1000,10,10],
      'MeshPhongMaterial', [{
        color: 0x333333,
        shading: THREE.FlatShading,
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
        shading: THREE.FlatShading,
      }]
    );
    table.position.y = -5;

    var deskleg1 = build(
      'BoxGeometry', [1, 15, 1],
      'MeshPhongMaterial', [{
        color: 0x555555,
        shading: THREE.FlatShading,
      }]
    );
    var deskleg2 = build(
      'BoxGeometry', [1, 15, 1],
      'MeshPhongMaterial', [{
        color: 0x555555,
        shading: THREE.FlatShading,
      }]
    );
    var deskleg3 = build(
      'BoxGeometry', [1, 15, 1],
      'MeshPhongMaterial', [{
        color: 0x555555,
        shading: THREE.FlatShading,
      }]
    );
    var deskleg4 = build(
      'BoxGeometry', [1, 15, 1],
      'MeshPhongMaterial', [{
        color: 0x555555,
        shading: THREE.FlatShading,
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
        shading: THREE.FlatShading,
      }]
    );
    monitor.position.set(0,.5,0)
    monitor.rotation.set(-.2,0,0);

    var screenglass = build(
      'BoxGeometry', [9, 7, 1],
      'MeshPhongMaterial', [{
        color: 0x000000,
        shading: THREE.FlatShading,
      }]
    );
    screenglass.position.set(0, 0, 4);
    monitor.add(screenglass);

    var keyboard = build(
      'BoxGeometry', [12, 1, 3],
      'MeshPhongMaterial', [{
        color: 0xc7c79d,
        shading: THREE.FlatShading,
      }]
    );
    keyboard.position.set(0, -4, 7);



    computer.add(monitor, keyboard);

    // Eventually have some notes/drawings about the rocket
    var paper = build(
      'BoxGeometry', [8, .125, 10],
      'MeshPhongMaterial', [{
        color: 0xdddddd,
        shading: THREE.FlatShading,
      }]
    );
    paper.position.set(-8, -4.5, 0);
    paper.rotation.set(0,.2,0);

    desk.add(table,computer, paper);


    var cupboard1 = build(
      'BoxGeometry', [45, 40, 10],
      'MeshPhongMaterial', [{
        color: 0xffaaaa,
        shading: THREE.FlatShading,
      }]
    );
    var cupboard2 = build(
      'BoxGeometry', [45, 40, 10],
      'MeshPhongMaterial', [{
        color: 0xaaffaa,
        shading: THREE.FlatShading,
      }]
    );
    var cupboard3 = build(
      'BoxGeometry', [45, 40, 20],
      'MeshPhongMaterial', [{
        color: 0xaaaaff,
        shading: THREE.FlatShading,
      }]
    );

    var conveyor = build(
      'BoxGeometry', [170,2,10],
      'MeshPhongMaterial', [{
        color: 0x777777,
        shading: THREE.FlatShading,
      }]
    );
    conveyor.rotation.set(0,-.2,-.1);
    conveyor.position.set(-30,20,-80);

    scene.add(conveyor);


    var rocket = new THREE.Object3D();

    var rocketcone = build(
      'CylinderGeometry', [0,20,30,32],
      'MeshPhongMaterial', [{
        color: 0xaaffaa,
        shading: THREE.FlatShading,
      }]
    );
    var rocketbody = build(
      'CylinderGeometry', [20,20,60,32],
      'MeshPhongMaterial', [{
        color: 0xaaffaa,
        shading: THREE.FlatShading,
      }]
    );
    rocketcone.position.y = 45;
    rocket.add(rocketcone, rocketbody);

    rocket.position.set(-130,30,-100);
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
