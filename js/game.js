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
    var _object = new T.Object3D();
    _object.name = name;
    return _object;
  };

  utils.getNamedObject = function (parent, name) {
    return parent.getObjectByName(name);
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
    core.arrow = new T.ArrowHelper(
      core.raycaster.ray.direction,
      core.raycaster.ray.origin,
      500,
      utils.colors.light_red
    );
    core.scene.add(core.arrow);
  };

  core.intersectedObject = null;
  core.INTERSECTED = null;
  core.rayNow = 0;
  core.rayDelta = 0;
  core.rayThen = Date.now();
  core.rayTimeout = 2500; // 2.5s in ms
  core.rayOld = 0;

  utils.updateRaycaster = function () {
    core.rayNow = Date.now();
    core.rayDelta = core.rayNow - core.rayThen;

    core.arrow.setDirection(core.raycaster.ray.direction);
    core.raycaster.set(core.camera.getWorldPosition(), core.camera.getWorldDirection());

    var intersects = core.raycaster.intersectObjects(core.interacts, true);

    core.intersectedObject = intersects;

    if (intersects.length > 0) {

      if (core.INTERSECTED != intersects[0].object) {
        core.INTERSECTED = intersects[0].object;
        if (typeof core.INTERSECTED.parent.ongazeover === 'function') {
          core.INTERSECTED.parent.ongazeover();
        }
      } else {
        if (core.rayDelta > core.rayTimeout) {
          if (typeof core.INTERSECTED.parent.ongazelong === 'function') {
            core.INTERSECTED.parent.ongazelong();
          }
          core.rayThen = core.rayNow - (core.rayDelta % core.rayTimeout);
        }
      }
    } else {
      if (core.INTERSECTED) {
        if (typeof core.INTERSECTED.parent.ongazeout === 'function') {
          core.INTERSECTED.parent.ongazeout();
        }
        core.INTERSECTED = null;
      }
    }
  };

  utils.gaze = function (obj, over, out, long) {
    // have the object react when user looks at it
    obj.ongazeover = function (e) {
      over(obj);
    };
    obj.ongazeout = function (e) {
      out(obj);
    };
    obj.ongazelong = function (e) {
      long(obj);
    };
    core.interacts.push(obj);
  };



  /////////////////////////////////////////////////////////////////////////////
  //// CORE
  /////////////////////////////////////////////////////////////////////////////

  var init = function () {
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
      console.log('pleb');
      core.controls = new T.OrbitControls(core.camera);
      // core.camera.position.z += 0.01;
      // core.camera.rotation.x = utils.d2r(-90);
    }
    // core.camera.position.y = (core.controls.userHeight * 10) || core.cameraHeight;
    core.camera.updateProjectionMatrix();
    core.camera.position.y = 100;
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
    core.arrow = null;
    core.interacts = [];
    utils.setupRaycaster();


    // Initialise it
    window.addEventListener('resize', utils.onWindowResize, false);
    document.body.appendChild(core.renderer.domElement);

    core.stats = new Stats();
    core.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( core.stats.dom );

    utils.setupVRMode();


    utils.animate();
  };

  init();

  return {
    core: core,
    utils: utils,
  }
})();
