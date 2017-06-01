(function() {
  'use strict';

  var camera, controls, scene, renderer;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.002);

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(scene.fog.color);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 0;
  camera.position.y = 50;

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  /*
    I've modified OrbitControls.js to addVectors to it's target upon initialization

    this is done by modifying line 26 to be:

    this.target = new THREE.Vector3().addVectors(
      object.position, object.getWorldDirection()
    );
  */

  init();

  function init() {
    var ambientLight = new THREE.AmbientLight(0xffffff, .8);
    scene.add(ambientLight);

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
    computer.position.set(0, 0, -2);

    var monitor = build(
      'BoxGeometry', [12, 10, 8],
      'MeshPhongMaterial', [{
        color: 0xc7c79d,
        shading: THREE.FlatShading,
      }]
    );
    monitor.rotation.set(-.2,0,0);

    var screenglass = build(
      'BoxGeometry', [8, 6, 1],
      'MeshPhongMaterial', [{
        color: 0x000000,
        shading: THREE.FlatShading,
      }]
    );
    screenglass.position.set(0, 0, 4);
    monitor.add(screenglass);

    var keyboard = build(
      'BoxGeometry', [12, 2, 3],
      'MeshPhongMaterial', [{
        color: 0xc7c79d,
        shading: THREE.FlatShading,
      }]
    );
    keyboard.position.set(0, -4, 7);



    computer.add(monitor, keyboard);

    desk.add(table,computer);


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
      'BoxGeometry', [45, 40, 10],
      'MeshPhongMaterial', [{
        color: 0xaaaaff,
        shading: THREE.FlatShading,
      }]
    );



    var sceneitems = [];

    sceneitems.push(desk, cupboard1, cupboard2, cupboard3);

    var radius = 70;
    var step = (2*Math.PI) / sceneitems.length;
    var angle = step * 3;

    [].forEach.call(sceneitems, function (item,i) {


      item.position.y = 20;
      item.position.x = Math.cos(angle) * radius;
      item.position.z = Math.sin(angle) * radius;
      console.log(i);
      scene.add(item);

      item.lookAt(new THREE.Vector3(0,20,0));

      angle += step;
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
