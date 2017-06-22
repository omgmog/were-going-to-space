var game = (function () {
  'use strict';

  var core = {};
  var utils = {};

  var T = THREE; // Shorthand to THREE built-ins

  core.spinningItem = null;

  /////////////////////////////////////////////////////////////////////////////
  //// UTILS
  /////////////////////////////////////////////////////////////////////////////

  utils.pi = Math.PI;
  utils.tau =  Math.PI / 2;
  utils.pi2 = Math.PI * 2;


  // graphics update
  utils.render = function (delta) {
    TWEEN.update();
    // Per frame stuff here
    if (core.spinningItem) {
      core.spinningItem.rotation.y += 0.01;
    }
    // if we're holding something and it isn't paper
    if (core.cameraSlot.children.length > 0 && core.cameraSlot.children[0].name !== 'paper') {
      core.cameraSlot.rotation.y += 0.01;
      core.cameraSlot.rotation.x = (.33 * core.camera.rotation.x) - utils.d2r(utils.tau);
    } else {
      core.cameraSlot.rotation.y = 0;
      core.cameraSlot.rotation.x = 0;
    }

    core.controls.update();
    core.renderer.render(core.scene, core.camera);

    // if we've got an effect, render it
    if (core.effect !== null) {
      core.effect.render(core.scene, core.camera);
    }
  };

  // logic update
  utils.update = function (delta) {

  }

  utils.animate = function () {
    core.stats.begin();
    utils.update(core.clock.getDelta());
    utils.render(core.clock.getDelta());
    utils.updateRaycaster();
    core.stats.end();
    requestAnimationFrame(utils.animate);
  };

  utils.append = function (things, parent) {
    if (!(things instanceof Array)) {
      things = [things];
    }
    things.forEach(function (thing) {
      parent.add(thing);
    });
  };
  utils.haveHMD = function () {
    if ("getVRDisplays" in navigator) {
      navigator.getVRDisplays()
        .then(function (displays) {
          if (displays.length > 0) {
            return true;
          } else {
            // No HMDs detected
            return false;
          }
        })
        .catch(function (err) {
          // Something went wrong, so bail out
          return false;
        });

    } else {
      // WebVR not supported
      return false;
    }
  };

  utils.onMobileDevice = function () {
    return /Android/i.test(navigator.userAgent) || /iPhone|iPad|iPod/i.test(navigator.userAgent);
  };

  utils.onWindowResize = function () {
    var wiw = window.innerWidth;
    var wih = window.innerHeight;
    core.camera.aspect = wiw / wih;
    core.camera.updateProjectionMatrix();
    core.renderer.setSize(wiw, wih);

    if (core.effect !== null) {
      core.effect.setSize(wiw, wih);
    }
  };

  utils.construct = function (constructor, args) {
    function F() {return constructor.apply(this, args)};
    F.prototype = constructor.prototype;
    return new F();
  };

  utils.build = function (geotype, geoprops, mattype, matprops) {
    return new T.Mesh(
      utils.construct(T[geotype], geoprops),
      utils.construct(T[mattype], [Object.assign(
        {},
        {
          shading: T.SmoothShading,
        },
        matprops[0]
      )])
    );
  };

  // Convert deg to rad
  utils.d2r = function (degrees) {
    return degrees * utils.pi / 180;
  };

  utils.scaleVec2 = function (vec2, scale) {
    return new T.Vector2(vec2.x * scale, vec2.y * scale);
  };

  utils.scaleVec3 = function (vec3, scale) {
    return new T.Vector3(vec3.x * scale, vec3.y * scale, vec3.z * scale);
  };

  utils.flipVertical = function () {
    return new T.Matrix4().makeRotationX(utils.pi);
  };

  utils.debugAxis = function () {
    utils.append(new T.AxisHelper(100), core.scene);
  };
  utils.do = function (count, fn) {
    for (var i=0; i<count; i++) {
      fn(i);
    }
  };

  // return leg positions as x/z arrays
  utils.positionLegs = function (props) {
    var halfw = props.width / 2;
    var mhalfw = -1 * halfw;
    var halfd = props.depth / 2;
    var mhalfd = -1 * halfd;
    var leg = props.legThickness;

    return [
      [mhalfw + leg, mhalfd + leg],
      [mhalfw + leg, halfd - leg],
      [halfw - leg, mhalfd + leg],
      [halfw - leg, halfd - leg]
    ]
  };

  utils.colors = {
    black: 0x000000,
    white: 0xffffff,
    light_gray: 0xaaaaaa,
    dark_gray: 0x555555,
    yellow: 0xffff55,
    brown: 0xaa5500,
    light_red: 0xff5555,
    dark_red: 0xaa0000,
    light_green: 0x55ff55,
    dark_green: 0x00aa00,
    light_cyan: 0x55ffff,
    dark_cyan: 0x00aaaa,
    light_blue: 0x5555ff,
    dark_blue: 0x0000aa,
    light_magenta: 0xff55ff,
    dark_magenta: 0xaa00aa,
  };

  utils.namedObject = function (name) {
    var _object = new T.Group();
    _object.name = name;
    return _object;
  };

  utils.getNamedObject = function (parent, name) {
    return parent.getObjectByName(name);
  }
  utils.getChildren = function (parents) {
    var children = [];
    if (!(parents instanceof Array)) {
      parents = [parents];
    }

    parents.forEach(function (parent) {
      parent.traverse(function (child) {
        // only get named children, also not slot* objects
        if (child.name && !child.name.match(/^slot/)) {
          children.push(child);
        }
      });
    });
    return children;
  }

  utils.getRandomItem = function (items) {
    return items[Math.floor(Math.random() * items.length)];
  };

  utils.changematerial = function (obj, mat) {
    if (obj instanceof T.Mesh && mat != false) {
      obj.userData.material = obj.material;
      obj.material = mat;
    }
  };
  utils.wireframeify = function (obj) {
    var wf = new T.MeshBasicMaterial({color: utils.colors.light_green, wireframe: true});

    utils.changematerial(obj, wf);
    obj.traverse(function (child) {
      utils.changematerial(child, wf);
    });
  };
  utils.unwireframeify = function (obj) {
    utils.changematerial(obj, obj.userData.material || false);
    obj.traverse(function (child) {
      utils.changematerial(child, child.userData.material || false);
    });
  };

  utils.enterVR = function () {
    if (utils.onMobileDevice()) {
      core.effect = new T.StereoEffect(core.renderer);
      core.effect.setSize(window.innerWidth, window.innerHeight);
      core.effect.separation = 2.5 * 0.0254 / 2;
    }

    vrbutton.style.display = 'none';
  };
  utils.exitVR = function () {
    core.effect = null;
    vrbutton.style.display = 'block';
  };

  utils.onvrbuttonpress = function () {
    var canvas = document.querySelector('canvas');
    if ('mozRequestFullScreen' in canvas) {
      canvas.mozRequestFullScreen();
    } else if ('webkitRequestFullScreen' in canvas){
      canvas.webkitRequestFullScreen();
    } else {
      canvas.requestFullScreen();
    }
    utils.enterVR();
  };

  utils.setupVRMode = function () {
    var vrbutton = document.createElement('button');
    vrbutton.id = 'vrbutton';
    vrbutton.classList.add('btn');
    document.body.appendChild(vrbutton);
    vrbutton.innerText = `Enter ${utils.onMobileDevice()?'VR Mode':'Fullscreen'}`;
    vrbutton.addEventListener('click', utils.onvrbuttonpress, false);
    var fschangeEvents = ['webkitfullscreenchange', 'mozfullscreenchange', 'fullscreenchange'];
    var fsactiveEvents = ['webkitIsFullScreen', 'mozFullScreen', 'fullscreen'];
    fschangeEvents.forEach(function (event, i) {
      if (`on${event}` in document) {
        document.addEventListener(event, function (e) {
          if (!document[fsactiveEvents[i]]) {
            utils.exitVR();
          }
        });
      }
    });
  };

  utils.setupRaycaster = function () {
    core.raycaster = new T.Raycaster();
    // core.arrow = new T.ArrowHelper(
    //   core.raycaster.ray.direction,
    //   core.raycaster.ray.origin,
    //   200,
    //   utils.colors.light_red,
    //   20
    // );
    // core.scene.add(core.arrow);
  };

  // becuase the attach/detach from SceneUtils applies a matrix, lets not use that
  utils.attach = function (obj, parent) {
    core.scene.remove(obj);
    parent.add(obj);
  };
  utils.detach = function (obj, parent) {
    parent.remove(obj);
    core.scene.add(obj);
  }

  utils.pickUp = function (obj, from, to) {
    if (obj.userData.holding || core.camera.userData.heldObj) return;

    obj.userData.holding = true;
    core.camera.userData.heldObj = obj.name;
    core.camera.userData.heldObjFrom = from.name;

    utils.detach(obj, from);  // from original place
    utils.attach(obj, to);    // to camera

    document.addEventListener('click', function cb(event) {
      utils.putDown(
        obj,
        core.cameraSlot,
        utils.getNamedObject(core.scene, core.camera.userData.heldObjFrom)
      ); // put it back on click
      // unbind this listener
      event.currentTarget.removeEventListener(event.type, cb);
    });

  };

  utils.putDown = function (obj, from, to) {
    if (!obj.userData.holding) return;

    obj.userData.holding = false;
    core.camera.userData.heldObj = null;
    core.camera.userData.heldObjFrom = null;

    utils.detach(obj, from);  // from camera
    utils.attach(obj, to);    // to original place
  };

  core.intersectedObject = null;
  core.INTERSECTED = null;
  core.rayNow = 0;
  core.rayDelta = 0;
  core.rayThen = Date.now();
  core.rayTimeout = 2500; // 2.5s in ms
  core.rayOld = 0;

  core.vibrate = navigator.vibrate ? navigator.vibrate.bind(navigator) : function () {};
  utils.updateRaycaster = function () {
    core.rayNow = Date.now();
    core.rayDelta = core.rayNow - core.rayThen;

    // core.arrow.setDirection(core.raycaster.ray.direction);
    core.raycaster.set(core.camera.getWorldPosition(), core.camera.getWorldDirection());

    var intersects = core.raycaster.intersectObjects(core.interacts, true);

    core.intersectedObject = intersects;

    if (intersects.length > 0) {
      // do we want this or it's parent?
      var target = intersects[0].object;
      while (!(target instanceof T.Group)) {
        if (target.name === 'floor') break;
        target = target.parent;
      }
      var timeout = target.gazetimeout || core.rayTimeout;

      if (target.userData.gazeable) {
        if (target.userData && target.userData.holding) {
          // if we're holding something, hide the ray ring and get out of here
          core.rayfloor.material.opacity = 0;
          return;
        }
        if (core.INTERSECTED != null) {
          if (core.INTERSECTED == target) {
            // long gaze
            if (core.rayDelta >= timeout) {
              if (typeof core.INTERSECTED.ongazelong === 'function') {
                core.INTERSECTED.ongazelong();
                core.vibrate(100, 50);
              }
            }
          } else {
            // out gaze
            if (typeof core.INTERSECTED.ongazeout === 'function') {
              core.INTERSECTED.ongazeout();
            }
            core.INTERSECTED = null;
          }
        } else {
          // short gaze
          core.INTERSECTED = target;
          if (typeof core.INTERSECTED.ongazeover === 'function') {
            core.INTERSECTED.ongazeover();
            core.vibrate(50);
          }
        }
      }
      core.rayThen = core.rayNow - (core.rayDelta % timeout);

      // show hide floor marker
      core.rayfloor.material.opacity = .6;
      if (intersects[0].object.name == "floor") {
        core.rayfloor.rotation.set(-utils.tau, 0, 0);
        core.rayfloor.position.set(intersects[0].point.x, intersects[0].point.y + .1, intersects[0].point.z);
        core.rayfloor.scale.set(1,1,1);
        core.rayfloor.opacity = 1;
      } else {
        // core.rayfloor.material.opacity = 0;
        core.rayfloor.rotation.x = 0;
        core.rayfloor.lookAt(core.camera.position);
        core.rayfloor.position.set(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
        core.rayfloor.scale.set(.7, .7, .7);
        core.rayfloor.material.opacity = .9;
      }
    } else {
      core.rayfloor.scale.set(1,1,1);
      core.rayfloor.rotation.set(0,0,0);
    }
  };

  utils.gaze = function (objects, options) {
    var options = Object.assign({}, {
      timeout: core.rayTimeout,
      over: function () {},
      out: function () {},
      long: function () {},
    }, options || {});
    // have the object react when user looks at it
    if (!(objects instanceof Array)) {
      objects = [objects];
    }

    objects.forEach(function (obj) {
      obj.gazetimeout = options.timeout;
      console.log(obj.gazetimeout);
      obj.ongazeover = function (e) {
        options.over(obj);
      };
      obj.ongazeout = function (e) {
        options.out(obj);
      };
      obj.ongazelong = function (e) {
        options.long(obj);
      };
      obj.updateMatrixWorld();
      obj.userData.gazeable = true;
      core.interacts.push(obj);
    });

  };

  utils.showMenu = function () {
    var overlay = document.querySelector('.overlay');
    overlay.querySelector('.btn .action').innerText = utils.onMobileDevice()? 'Touch' : 'Click';

    overlay.addEventListener('click', function (e) {
      // when clicked, do the following
      if (core.currentGamePhase === 0) {
        utils.startGame();
        overlay.classList.remove('visible');
      }
    });


  };


  utils.startGame = function () {
      console.log('start game!');
      core.currentGamePhase++;
      core.stats = new Stats();
      core.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
      document.body.appendChild( core.stats.dom );

      utils.setupRaycaster();
      utils.setupVRMode();

      utils.animate();
  };

  /////////////////////////////////////////////////////////////////////////////
  //// CORE
  /////////////////////////////////////////////////////////////////////////////
  core.phases = [
    'menu',
    'level1',
    'level2',
    'finish'
  ];

  core.robot = null;

  core.makeRobot = function () {
    var robot = utils.namedObject('robot');
    var _sphere = utils.build(
      'SphereGeometry', [2, 16, 8, 0, utils.pi],
      'MeshPhongMaterial', [{
        color: utils.colors.dark_blue,
      }]
    );
    _sphere.rotation.x = -utils.tau;

    // bubble
    var _bubble = _sphere.clone();
    _bubble.material = _sphere.material.clone();
    _bubble.material.color.setHex(utils.colors.light_blue);
    _bubble.material.transparent = true;
    _bubble.material.opacity = .4;

    // head
    var _head = _sphere.clone();
    _head.material = _sphere.material.clone();
    _head.material.color.setHex(utils.colors.white);
    _head.scale.set(.5,.5,.5);
    _head.position.z = .5;
    _head.rotation.x = utils.pi2;

    var _eye = utils.build(
      'SphereGeometry', [.33, 8, 8],
      'MeshPhongMaterial', [{
        color: utils.colors.dark_blue
      }]
    );
    _eye.position.y = -1.5;
    _eye.position.z = 1;
    var _leye = _eye.clone();
    var _reye = _eye.clone();
    _reye.position.x = -.8;
    _leye.position.x = .8;
    utils.append([_leye,_reye], _head);

    var _headcap = utils.build(
      'CircleGeometry', [1, 16],
      'MeshPhongMaterial', [{
        side: T.DoubleSide,
        color: utils.colors.white,
      }]
    );
    _headcap.position.z = .5;

    var _neck = utils.build(
      'CylinderGeometry', [.5, .5, .5, 8],
      'MeshPhongMaterial', [{
        color: utils.colors.light_blue,
      }]
    );
    _neck.rotation.x = utils.tau;
    _neck.position.z = .25;

    utils.append([_head, _headcap, _neck], _bubble);

    // body
    var _body = _sphere.clone();
    _body.material = _sphere.material.clone();
    _body.material.color.setHex(utils.colors.white);
    _body.material.side = T.DoubleSide;
    _body.rotation.x = utils.tau;

    var _bodycap = utils.build(
      'CircleGeometry', [1.8, 16],
      'MeshPhongMaterial', [{
        side: T.DoubleSide,
        color: utils.colors.light_blue,
      }]
    );
    utils.append(_bodycap, _body);


    // wheels


    robot.scale.set(4,4,4);
    utils.append([_bubble, _body], robot);

    var bobMax = {
      y: 2
    };
    var bobMin = {
      y: -2
    };

    var bobRobot = new TWEEN.Tween(bobMin).to(bobMax, 1000)
    .onUpdate(function() {
      robot.position.y = bobMin.y
    })
    .yoyo(true)
    .repeat( Infinity )
    .start();

    core.robot = robot;
  }

  core.makeRobot();

  var init = function () {
    core.interacts = [];
    core.currentGamePhase = 0; // menu phase
    core.clock = new T.Clock();
    core.cameraHeight = 50;
    core.distance = 2000;
    core.fov = 50; // fov in Three is vertical, so 40-50 vfov is about 70 in hfov
    core.camera = new T.PerspectiveCamera(core.fov, window.innerWidth / window.innerHeight, 0.1, core.distance);
    core.effect = null;
    core.controls = null;
    core.scene = new T.Scene();
    core.scene.fog = new T.FogExp2(utils.colors.black, 0.001);
    core.renderer = new T.WebGLRenderer({
      antialias: true,
      gammaInput: true,
      gammaOutput: true
    });
    core.renderer.setClearColor(core.scene.fog.color);
    core.renderer.setPixelRatio(window.devicePixelRatio);
    core.renderer.setSize(window.innerWidth, window.innerHeight);


    core.rayfloor = utils.build(
      'RingGeometry', [6, 8, 24, 1],
      'MeshPhongMaterial', [{
        color: utils.colors.yellow,
        transparent: true,
        opacity: 0
      }]
    );
    utils.append([core.rayfloor], core.scene);

    if (utils.haveHMD()) {
      // get us in to a proper vr control then
      console.log('hmd');
      core.controls = new T.VRControls(core.camera, function (err) {console.error(err)});
    } else if (utils.onMobileDevice()) {
      // mobile
      console.log('mobile');
      core.controls = new T.DeviceOrientationControls(core.camera);
    } else {
      // everything else
      console.log('standard browser');
      core.controls = new T.OrbitControls(core.camera);
      // core.camera.position.z += 0.01;
      // core.camera.rotation.x = utils.d2r(-90);
    }
    core.camera.position.y = (core.controls.userHeight * 10) || core.cameraHeight;
    core.camera.updateProjectionMatrix();
    core.cameraSlot = utils.namedObject('cameraslot');
    core.cameraSlot.position.z = -25;
    core.cameraSlot.rotation.x = utils.d2r(-10);
    utils.append(core.cameraSlot, core.camera);
    core.scene.add(core.camera);

    // Shadow setup
    core.renderer.shadowMap.enabled = true;
    core.renderer.shadowMapSoft = true;
    core.renderer.shadowCameraNear = 3;
    core.renderer.shadowCameraFar = core.camera.far;
    core.renderer.shadowCameraFov = 50;
    core.renderer.shadowMapBias = 0.0039;
    core.renderer.shadowMapDarkness = 0.5;
    core.renderer.shadowMapWidth = 1024;
    core.renderer.shadowMapHeight = 1024;

    core.raycaster = null;


    // Initialise it
    window.addEventListener('resize', utils.onWindowResize, false);
    document.body.appendChild(core.renderer.domElement);

    // do something here to present overlay

    utils.showMenu();

  };

  init();

  return {
    core: core,
    utils: utils,
  }
})();
