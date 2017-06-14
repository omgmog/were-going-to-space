var game = window.game || {items:{}};
game.items = (function () {
  'use strict';

  var T = THREE;
  var utils = game.utils;
  var core = game.core;



  var items = {
    gnome: function () {
      var item = new T.Object3D();

      var head = new T.Object3D();
      var hat = utils.build(
        'ConeGeometry', [1, 3, 8],
        'MeshPhongMaterial', [{
          color: utils.colors.light_red,
          shading: T.SmoothShading,
        }]
      );
      hat.rotation.x = utils.d2r(-15);
      var face = utils.build(
        'SphereGeometry', [1, 16, 16],
        'MeshPhongMaterial', [{
          color: utils.colors.yellow,
          shading: T.SmoothShading,
        }]
      );
      face.position.y = -2;
      face.position.z = .5;
      var eye = utils.build(
        'SphereGeometry',[.125, 8, 8],
        'MeshPhongMaterial',[{
          color: utils.colors.black,
          shading: T.SmoothShading,
        }]
      );
      eye.position.z = 1.5;
      eye.position.y = -1.75;
      var leye = eye.clone();
      leye.position.x = -.35;
      var reye = eye.clone();
      reye.position.x = .35;

      var beard = utils.build(
        'CylinderGeometry', [2, 2, .2, 3, 1, false, 5.8, 1],
        'MeshPhongMaterial', [{
          color: utils.colors.light_gray,
          shading: T.SmoothShading,
        }]
      );
      beard.rotation.x = utils.d2r(-120);
      beard.position.y = -4.15;
      beard.position.z = 2;

      utils.append([hat, face, leye, reye, beard], head);

      var body = new T.Object3D();

      var torso = utils.build(
        'SphereGeometry', [1.5, 16, 8, 0, utils.pi],
        'MeshPhongMaterial', [{
          color: utils.colors.dark_blue,
          shading: T.SmoothShading,
        }]
      );
      torso.scale.z = 1.5;
      torso.rotation.x = utils.d2r(-90);

      var _arm = new T.Object3D();

      var arm = utils.build(
        'CylinderGeometry', [.5, .5, 2],
        'MeshPhongMaterial', [{
          color: utils.colors.dark_blue,
          shading: T.SmoothShading,
        }]
      );
      var hand = utils.build(
        'SphereGeometry', [.5, 8, 8],
        'MeshPhongMaterial', [{
          color: utils.colors.yellow,
          shading: T.SmoothShading,
        }]
      );
      hand.position.y = -1;
      utils.append([arm, hand], _arm);


      _arm.position.y = 1;
      var larm = _arm.clone();
      larm.rotation.z = utils.d2r(-30);
      larm.position.x = -1;
      var rarm = _arm.clone();
      rarm.rotation.z = utils.d2r(30);
      rarm.position.x = 1;

      utils.append([larm, rarm], body);

      body.position.y = -4.5;

      var hips = utils.build(
        'SphereGeometry', [1.5, 16, 8],
        'MeshPhongMaterial', [{
          color: utils.colors.brown,
          shading: T.SmoothShading,
        }]
      );
      hips.scale.y = .5;

      var _leg = new T.Object3D();
      var leg = utils.build(
        'CylinderGeometry', [.5, .5, 1],
        'MeshPhongMaterial', [{
          color: utils.colors.brown,
          shading: T.SmoothShading,
        }]
      );

      var foot = utils.build(
        'SphereGeometry', [.5, 8, 8],
        'MeshPhongMaterial', [{
          color: utils.colors.dark_gray,
          shading: T.SmoothShading,
        }]
      );
      foot.position.y = -.5;
      foot.scale.z = 2;
      foot.position.z = .25;

      utils.append([leg, foot], _leg);
      _leg.position.y = -1;

      var lleg = _leg.clone();
      lleg.position.x = -.5;
      lleg.rotation.y = utils.d2r(-10);
      var rleg = _leg.clone();
      rleg.position.x = .5;
      rleg.rotation.y = utils.d2r(10);

      utils.append([torso, hips, lleg, rleg], body);

      utils.append([head, body], item);

      item.position.y = 20;
      item.rotation.y = utils.d2r(90);
      return item;
    }
  };

  return {
    gnome: items.gnome(),
  };
}());