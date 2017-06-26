var game = window.game || {items:{}};
game.items = (function () {
  'use strict';

  var T = THREE;
  var utils = game.utils;
  var core = game.core;

  // private items (not returned);

  var _items = {
    _cube: function () {
      // returns a basic cube
      return utils.build(
        'BoxGeometry', [1,1,1],
        'MeshPhongMaterial', [{
          color: utils.colors.dark_red,
        }]
      );
    },
  }
  var items = {
    gnome: function () {
      var item = utils.namedObject("gnome");

      var head = new T.Object3D();
      var hat = utils.build(
        'ConeGeometry', [1, 3, 8],
        'MeshPhongMaterial', [{
          color: utils.colors.light_red,
        }]
      );
      hat.rotation.x = utils.d2r(-15);
      var face = utils.build(
        'SphereGeometry', [1, 8, 8],
        'MeshPhongMaterial', [{
          color: utils.colors.yellow,
        }]
      );
      face.position.y = -2;
      face.position.z = .5;
      var eye = utils.build(
        'SphereGeometry',[.125, 4, 4],
        'MeshPhongMaterial',[{
          color: utils.colors.black,
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
        }]
      );
      beard.rotation.x = utils.d2r(-120);
      beard.position.y = -4.15;
      beard.position.z = 2;

      utils.append([hat, face, leye, reye, beard], head);

      var body = new T.Object3D();

      var torso = utils.build(
        'SphereGeometry', [1.5, 8, 4, 0, utils.pi],
        'MeshPhongMaterial', [{
          color: utils.colors.dark_blue,
        }]
      );
      torso.scale.z = 1.5;
      torso.rotation.x = utils.d2r(-90);

      var _arm = new T.Object3D();

      var arm = utils.build(
        'CylinderGeometry', [.5, .5, 2],
        'MeshPhongMaterial', [{
          color: utils.colors.dark_blue,
        }]
      );
      var hand = utils.build(
        'SphereGeometry', [.5, 4, 4],
        'MeshPhongMaterial', [{
          color: utils.colors.yellow,
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
        'SphereGeometry', [1.5, 8, 4],
        'MeshPhongMaterial', [{
          color: utils.colors.brown,
        }]
      );
      hips.scale.y = .5;

      var _leg = new T.Object3D();
      var leg = utils.build(
        'CylinderGeometry', [.5, .5, 1],
        'MeshPhongMaterial', [{
          color: utils.colors.brown,
        }]
      );

      var foot = utils.build(
        'SphereGeometry', [.5, 4, 4],
        'MeshPhongMaterial', [{
          color: utils.colors.dark_gray,
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

      // item.position.y = 20;
      return item;
    },
    cone: function () {
      var item = utils.namedObject("cone");
      var texture = new T.TextureLoader().load('assets/plastic.jpg');
      texture.wrapS = texture.wrapT = T.RepeatWrapping;
      texture.repeat.set(2, 1);
      var cone = new utils.build(
        'CylinderGeometry', [.6, 1.9, 5, 6],
        'MeshPhongMaterial', [{
          color: utils.colors.light_red,
          map: texture,
        }]
      );
      var base = new utils.build(
        'BoxGeometry', [5, .5, 5],
        'MeshPhongMaterial', [{
          color: utils.colors.light_red,
          map: texture,
        }]
      );
      base.position.y = -2.5;

      utils.append([cone, base], item);
      item.position.y = -3.75;
      return item;
    },
    dirtblock: function () {
      var item = utils.namedObject("dirtblock");

      var dirtblock = _items._cube().clone();
      dirtblock.scale.set(4,4,4);

      var textures = [
        'assets/side.jpg', 'assets/side.jpg',
        'assets/top.jpg', 'assets/bottom.jpg',
        'assets/side.jpg', 'assets/side.jpg'
      ];
      var mats = [];
      for (var i=0; i<textures.length;i++) {
        var texture = new T.TextureLoader().load(textures[i]);
        mats.push(new T.MeshBasicMaterial({
          color: utils.colors.white,
          map: texture,
        }));
      }
      dirtblock.material = mats;

      utils.append(dirtblock, item);
      item.position.y = -4.5;
      item.rotation.y = utils.d2r(45);
      return item;
    },
    crate: function () {
      var item = utils.namedObject("crate");

      var crate = _items._cube().clone();
      crate.scale.set(8,8,8);

      var texture = new T.TextureLoader().load('assets/crate.png');

      crate.material = new T.MeshBasicMaterial({
        color: utils.colors.white,
        map: texture,
      });

      utils.append(crate, item);
      item.position.y = -2.5;
      item.rotation.y = utils.d2r(45);
      return item;
    },
    printedsaveicons: function () {
      var item = utils.namedObject("printedsaveicons");

      var textures = [
        new T.MeshPhongMaterial({color:0x23373f}),
        new T.MeshPhongMaterial({color:0x23373f}),
        new T.MeshPhongMaterial({color:utils.colors.white, map: new T.TextureLoader().load('assets/floppyt.jpg')}),
        new T.MeshPhongMaterial({color:utils.colors.white, map: new T.TextureLoader().load('assets/floppyb.jpg')}),
        new T.MeshPhongMaterial({color:0x23373f}),
        new T.MeshPhongMaterial({color:0x23373f})
      ]

      var diskThickness = .1;
      var scale = 2;
      var numDisks = 15;

      var disk = utils.build(
        'BoxGeometry', [2, diskThickness, 2],
        'MeshPhongMaterial', [{}]
      );
      disk.material = textures;
      disk.scale.set(scale,scale,scale);

      var disks = [];
      for (var i=0; i<numDisks;i++) {
        var _disk = disk.clone();
        _disk.rotation.y = utils.getRandomItem([.1, .5, .3, .25, -.1]) * i;
        _disk.position.y = (i + 1) * (diskThickness * scale);
        disks.push(_disk);
      }
      var solodisk = disk.clone();
      solodisk.rotation.set(0, utils.d2r(4), utils.d2r(-107));
      solodisk.position.y = 2;
      solodisk.position.x = -3;

      disks.push(solodisk);

      utils.append(disks, item);

      // utils.append(diskette, item);
      item.position.y = -6.5;
      item.rotation.y = utils.pi * .75;
      return item;
    },
    ufo: function () {
      var item = utils.namedObject("ufo");

      var body = utils.build(
        'SphereGeometry', [1, 8, 4],
        'MeshPhongMaterial', [{
          color: utils.colors.light_green,
        }]
      );
      body.scale.x = body.scale.z = 2;
      body.scale.y = .5;

      var bubble = utils.build(
        'SphereGeometry', [1, 8, 4],
        'MeshPhongMaterial', [{
          color: utils.colors.white,
          opacity: .8,
          transparent: true,
        }]
      );
      bubble.position.y = .75;

      var leg = new T.Object3D();
      var _leg = utils.build(
        'CylinderGeometry', [.125, .125, 1],
        'MeshPhongMaterial', [{
          color: utils.colors.light_green,
        }]
      );
      var _foot = utils.build(
        'SphereGeometry', [.25, 4, 4],
        'MeshPhongMaterial', [{
          color: utils.colors.yellow,
        }]
      );
      _foot.position.y = -.5;
      utils.append([_leg, _foot], leg);

      var legs = [];
      for (var i=0; i<3; i++) {
        var __leg = leg.clone();
        __leg.position.x = Math.sin(utils.d2r(120) * i) * 1.25;
        __leg.position.z = Math.cos(utils.d2r(120) * i) * 1.25;
        __leg.position.y = -.5;
        __leg.lookAt(new T.Vector3(0,-1.5,0));

        legs.push(__leg);
      }

      utils.append(legs, item);

      utils.append([body, bubble], item);

      item.position.y = -3.8;

      item.scale.set(2.5,2.5,2.5);

      return item;
    },
    barrel: function () {
      var item = utils.namedObject('barrel');

      var sideTex = new T.TextureLoader().load('assets/barrelsides.jpg');
      sideTex.wrapS = sideTex.wrapT = T.RepeatWrapping;
      sideTex.repeat.set(2, 1);
      var barrel = utils.build(
        'CylinderGeometry', [3, 3, 8, 16, 1, true],
        'MeshPhongMaterial', [{
          map: sideTex,
        }]
      );
      var topTex = new T.TextureLoader().load('assets/barreltop.jpg');
      var barrelTop = utils.build(
        'CircleGeometry', [3, 16],
        'MeshPhongMaterial', [{
          map: topTex,
          side: T.DoubleSide,
        }]
      );
      barrelTop.rotation.x = -utils.tau;
      var barrelBottom = barrelTop.clone();

      barrelBottom.position.y = -4;
      barrelTop.position.y = 4;

      utils.append([barrel, barrelTop, barrelBottom], item);
      item.position.y = -2.5;
      return item;
    },
    moon: function () {
      var item = utils.namedObject('moon');

      var body = utils.build(
        'SphereGeometry', [3, 16, 16],
        'MeshPhongMaterial', [{
          color: utils.colors.white,
          map: new T.TextureLoader().load('assets/moon.jpg')
        }]
      );

      utils.append(body, item);

      item.position.y = -3.5;

      return item;
    },
  };

  return {
    gnome: items.gnome,
    cone: items.cone,
    dirtblock: items.dirtblock,
    crate: items.crate,
    printedsaveicons: items.printedsaveicons,
    ufo: items.ufo,
    barrel: items.barrel,
    moon: items.moon,
  };
}());
