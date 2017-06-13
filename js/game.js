var game = (function () {
  'use strict';

  /////////////////////////////////////////////////////////////////////////////
  //// UTILS
  /////////////////////////////////////////////////////////////////////////////
  var utils = {};

  utils.pi = Math.PI;
  utils.tau =  Math.PI / 2;
  utils.pi2 = Math.PI * 2;


  // graphics update
  utils.render = function (delta) {
    core.controls.update(delta);
    TWEEN.update();
    // Per frame stuff here


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
    requestAnimationFrame(utils.animate);
    utils.update(core.clock.getDelta());
    utils.render(core.clock.getDelta());
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
    try{ document.createEvent("TouchEvent"); return true; }
    catch(e){ return false; }
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
      utils.construct(T[mattype], matprops)
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



  /////////////////////////////////////////////////////////////////////////////
  //// CORE
  /////////////////////////////////////////////////////////////////////////////
  var core = {};

  var T = THREE; // Shorthand to THREE built-ins

  var init = function () {
    core.clock = new T.Clock();
    core.cameraHeight = 50;
    core.distance = 2000;
    core.fov = 50; // fov in Three is vertical, so 40-50 vfov is about 70 in hfov
    core.camera = new T.PerspectiveCamera(core.fov, window.innerWidth / window.innerHeight, 0.1, core.distance);
    core.effect = null;
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

    if (utils.haveHMD()) {
      core.controls = new T.VRControls(core.camera);
      console.log('Using HMD');
    } else if (utils.onMobileDevice()) {
      core.effect = new T.StereoEffect(core.renderer);
      core.controls = new T.DeviceOrientationControls(core.camera, true);
      console.log('Using DeviceOrientationControls');
    } else {
      // OrbitControls for the peasants.
      core.controls = new T.OrbitControls(core.camera, core.renderer.domElement);
      console.log('Using mouse');
    }
    core.camera.position.y = core.cameraHeight;
    if (typeof core.controls.userHeight !== "undefined") {
      console.log("Setting camera height using userHeight");
      core.camera.position.y = core.controls.userHeight;
    }
    core.camera.updateProjectionMatrix();

    // Initialise it
    window.addEventListener('resize', utils.onWindowResize, false);
    document.body.appendChild(core.renderer.domElement);
    utils.animate();
  };

  init();

  return {
    core: core,
    utils: utils,
  }
})();
