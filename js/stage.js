(function () {
  'use strict';

  var T = THREE;
  var utils = game.utils;
  var core = game.core;
  var items = game.items;

  utils.debugAxis();

  // floor
  var floorTexture = new T.TextureLoader().load('assets/dn.jpg');
  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(8, 8);

  var floor = utils.build(
    'PlaneGeometry', [3000, 3000, 10, 10],
    'MeshLambertMaterial', [{
      map: floorTexture,
      side: T.DoubleSide,
    }]
  );
  floor.position.y = 0;
  floor.rotation.x = utils.tau;

  utils.append(floor, core.scene);


  // sky
  var background = new T.CubeTextureLoader()
  .load([
    'assets/bk.jpg', 'assets/ft.jpg',
    'assets/up.jpg', 'assets/dn.jpg',
    'assets/lf.jpg', 'assets/rt.jpg'
  ]);

  core.scene.background = background;


  // rocket
  var rocket = new T.Object3D();
  rocket.position.set(-130, 125, -97);
  // rocket.position.set(0, 125, 0);
  // rocket.rotation.set(0, 19.9, 0); // do this with matrix transform?
  rocket.rotation.y = utils.d2r(45);
  var rocketGeo = [
    new T.Vector2(0, 0),
    new T.Vector2(0.5, 0.2),
    new T.Vector2(1.29992285, 1.43232647),
    new T.Vector2(2.14964952, 3.30962958),
    new T.Vector2(2.76224316, 5.44382679),
    new T.Vector2(2.9796151, 6.86662493),
    new T.Vector2(2.99937619, 8.23013982),
    new T.Vector2(2.99937619, 9.35652168),
    new T.Vector2(2.72027206, 11.6990187),
    new T.Vector2(2.27251293, 13.3075548),
    new T.Vector2(1.61962198, 14.6639325),
    new T.Vector2(1.45801153, 17.3400002),
    new T.Vector2(0, 17.3400002)
  ];
  var rocketBody = utils.build(
    'LatheGeometry', [rocketGeo, 16],
    'MeshPhongMaterial', [{
      color: utils.colors.light_gray,
      specular: utils.colors.white,
      shininess: 90,
    }]
  );
  rocketBody.geometry.applyMatrix(utils.flipVertical());
  rocketBody.geometry.scale(7,7,7);

  utils.append(rocketBody, rocket);

  var wingGeo = new T.Shape();
  wingGeo.moveTo(0, 0);
  wingGeo.lineTo(0.881591797, 0.325592041);
  wingGeo.lineTo(1.67909632, 0.998413443);
  wingGeo.lineTo(2.30402536, 1.8873078);
  wingGeo.lineTo(2.65497254, 2.78481932);
  wingGeo.lineTo(2.78297804, 3.8601981);
  wingGeo.lineTo(2.78297804, 5);
  wingGeo.lineTo(2.04452515, 3.91278076);
  wingGeo.lineTo(1.4347229, 3.29016113);
  wingGeo.lineTo(0.75402832, 2.84954834);
  wingGeo.lineTo(0.00935368156, 2.68509582);

  var wing = utils.build(
    'ExtrudeGeometry', [wingGeo, {
      amount: .2,
      bevelEnabled: false,
    }],
    'MeshPhongMaterial', [{
      color: utils.colors.light_red,
    }]
  );
  wing.geometry.applyMatrix(utils.flipVertical());
  wing.scale.set(10,10,10);


  var wings = Array(3);
  var wingsTotal = wings.length;
  var wingStep = utils.d2r(360 / wingsTotal);

  for (var i=0; i<wingsTotal; i++) {
    wings[i] = wing.clone();
    wings[i].rotation.y = wingStep * i;
    wings[i].position.y = -75;
  }

  utils.append(wings, rocket);

  // door?

  utils.append(rocket, core.scene);


  // conveyor
  var conveyor = new T.Object3D();
  var conveyorProps = {
    length: 170,
    width: 10,
    wheelSize: 3
  };
  // Could this be done with a matrix transform?
  conveyor.rotation.set(0, -.2, -.1);
  conveyor.position.set(-30, 23, -77);

  var belt = utils.build(
    'BoxGeometry', [conveyorProps.length, 1, conveyorProps.width],
    'MeshPhongMaterial', [{
      color: utils.colors.dark_gray,
    }]
  );
  var belts = [];
  belts.push(belt.clone());
  belts.push(belt.clone());

  belts[0].position.y = conveyorProps.wheelSize;
  belts[1].position.y = -conveyorProps.wheelSize;

  var wheel = utils.build(
    'CylinderGeometry', [conveyorProps.wheelSize, conveyorProps.wheelSize, conveyorProps.width - 2, 16],
    'MeshPhongMaterial', [{
      color: utils.colors.light_gray,
    }]
  );
  wheel.rotation.x = utils.tau;

  var maxWheels = Math.floor(conveyorProps.length / (conveyorProps.wheelSize * 4));
  var wheels = [];

  for (var i=0; i<=maxWheels; i++) {
    var _wheel = wheel.clone();
    _wheel.position.x = ((conveyorProps.length/2) - conveyorProps.length) + (i * (conveyorProps.length / maxWheels));
    wheels.push(_wheel);
  }

  utils.append(belts, conveyor);
  utils.append(wheels, conveyor);

  utils.append(conveyor, core.scene);


  // table

  var table = new T.Object3D();

  var tableProps = {
    width: 45,
    height: 20,
    depth: 15,
    topThickness: 1,
    legThickness: 1,
    legsCount: 4,
    color: utils.colors.light_gray,
  };
  table.position.y = tableProps.height;
  table.position.z = -40;
  table.position.x = -20;

  var tableTop = utils.build(
    'BoxGeometry', [tableProps.width, tableProps.topThickness, tableProps.depth],
    'MeshPhongMaterial', [{
      color: tableProps.color,
    }]
  );
  utils.append(tableTop, table);
  var tableLeg = utils.build(
    'CylinderGeometry', [
      tableProps.legThickness,
      tableProps.legThickness,
      tableProps.height - tableProps.topThickness,
      8
    ],
    'MeshPhongMaterial', [{
      color: tableProps.color,
    }]
  );
  var tableLegs = [];

  for (var i=0; i<tableProps.legsCount; i++) {
    var _tableLeg = tableLeg.clone();
    _tableLeg.position.set(
      utils.positionLegs(tableProps)[i][0],
      -1 * (tableProps.height / 2),
      utils.positionLegs(tableProps)[i][1]
    );
    tableLegs.push(_tableLeg);
  }
  utils.append(tableLegs, table);

    // computer

    var computer = new T.Object3D();

    computer.position.y = 1;
    computer.position.x = 8;

    var monitor = new T.Object3D();
    var monitorShell = utils.build(
      'BoxGeometry', [16, 12, 5],
      'MeshPhongMaterial', [{
        color: utils.colors.dark_gray,
      }]
    );
    var monitorStand = utils.build(
      'CylinderGeometry', [2, 2, 2, 8],
      'MeshPhongMaterial', [{
        color: utils.colors.dark_gray,
      }]
    );
    monitorStand.position.y = -7;

    var monitorScreen = utils.build(
      'PlaneGeometry', [14, 10, 1],
      'MeshPhongMaterial', [{
        color: utils.colors.black,
      }]
    );
    monitorScreen.position.z = 2.6;
    monitorScreen.name = "screen";


    monitor.position.x = 1;
    monitor.position.y = 7;
    monitor.position.z = -3;
    monitor.rotation.y = utils.d2r(-8);

    utils.append(monitorShell, monitor);
    utils.append(monitorScreen, monitor);
    utils.append(monitorStand, monitor);

    utils.append(monitor, computer);


    var keyboard = new T.Object3D();
    var keyProps = {
      total: 70,
      wrap: 14,
      width: .6,
      height: .5,
      gutter: .4,
    };

    var keyboardProps = {
      depth: 1 + ((keyProps.total / keyProps.wrap) * (keyProps.width + keyProps.gutter)),
      width: 1 + (keyProps.wrap * (keyProps.width + keyProps.gutter)),
      color: utils.colors.dark_gray,
    };
    keyboard.position.z = 3;
    keyboard.rotation.y = utils.d2r(-10);

    var keyboardBase = utils.build(
      'BoxGeometry', [keyboardProps.width, 1, keyboardProps.depth],
      'MeshPhongMaterial', [{
        color: keyboardProps.color,
      }]
    );
    utils.append(keyboardBase, keyboard);

    var key = utils.build(
      'CylinderGeometry', [keyProps.width * .66, keyProps.width, keyProps.height, 4],
      'MeshPhongMaterial', [{
        color: keyboardProps.color,
      }]
    );
    key.rotation.y = utils.d2r(45);
    key.updateMatrix();

    var keys = [];
    var rowCount = 0;
    var colCount = 0;

    for (var i=0; i<keyProps.total; i++) {
      var _key = key.clone();
      if (i % keyProps.wrap === 0) {
        rowCount++;
        colCount = 0;
      } else {
        colCount++;
      }

      var singleKey = keyProps.width + keyProps.gutter;

      _key.position.set(
        (colCount * singleKey) - ((keyboardProps.width / 2) - singleKey),
        .75,
        rowCount + singleKey - (keyboardProps.depth * .65)
      );

      // Make ESC red
      if (i === 0) {
        _key.material = key.material.clone();
        _key.material.color.setHex(utils.colors.dark_red);
      }
      // Make a space bar
      if (i === 60) {
        _key.geometry = new T.BoxGeometry((6 * singleKey) - .2,.5,.7);
        _key.position.x = _key.position.x + (singleKey * 2.5);
        _key.position.z = _key.position.z + .05;
        _key.rotation.y = utils.d2r(0)
        _key.rotation.x = utils.d2r(-10);
      }
      // destroy these
      if (i > 60 && i < 66) {
        _key = new T.Object3D();
      }
      keys.push(_key);
    }
    utils.append(keys, keyboard);


    utils.append(keyboard, computer);

    utils.append(computer, table);


    // paper

    utils.append(table, core.scene);

  // cupboards

  var cupboard = new T.Object3D();
  var cupboardProps = {
    shelves: 3,
    width: 45,
    depth: 10,
    height: 30,
    legs: 4,
    legThickness: 1,
  };

  var shelf = utils.build(
    'BoxGeometry', [cupboardProps.width, 1, cupboardProps.depth],
    'MeshPhongMaterial', [{
      color: utils.colors.light_gray,
    }]
  );
  var shelves = [];
  for (var i=0; i <cupboardProps.shelves; i++) {
    var _shelf = shelf.clone();
    _shelf.position.y = 10 + (i * 10);

    utils.append([
      utils.namedObject("slot0"),
      utils.namedObject("slot1"),
      utils.namedObject("slot2")
    ], _shelf);

    var ypos = 7;

    _shelf.children[0].position.set(-(cupboardProps.width / 3), ypos, 0);
    _shelf.children[1].position.set(0, ypos, 0);
    _shelf.children[2].position.set(cupboardProps.width / 3, ypos, 0);

    shelves.push(_shelf);
  }
  utils.append(shelves, cupboard);


  var cupboardLeg = utils.build(
    'CylinderGeometry', [cupboardProps.legThickness, cupboardProps.legThickness, cupboardProps.height, 8],
    'MeshPhongMaterial', [{
      color: utils.colors.light_gray,
    }]
  );
  var cupboardLegs = [];
  for (var i=0; i <cupboardProps.legs; i++) {
    var _cupboardLeg = cupboardLeg.clone();
    _cupboardLeg.position.y = (cupboardProps.height / 2);
    _cupboardLeg.position.x = utils.positionLegs(cupboardProps)[i][0];
    _cupboardLeg.position.z = utils.positionLegs(cupboardProps)[i][1];

    shelves.push(_cupboardLeg);
  }
  utils.append(shelves, cupboard);
  utils.append(cupboardLegs, cupboard);


  var totalCupboards = 3;
  var cupboards = [];

  var cupboardRadius = 100;
  var cupboardStep = utils.d2r(30);
  var cupboardAngle = utils.d2r(120);

  for (var i=0; i<totalCupboards; i++) {
    var _cupboard = cupboard.clone();
    _cupboard.position.y = 1;
    _cupboard.position.x = Math.cos(cupboardAngle) * cupboardRadius;
    _cupboard.position.z = Math.sin(cupboardAngle) * cupboardRadius;

    cupboardAngle += cupboardStep;

    _cupboard.lookAt(new T.Vector3(0,0,0));
    cupboards.push(_cupboard);
  }
  utils.append(cupboards, core.scene);



  // Stick some items on the shelves
  for (var i=0; i<cupboards.length; i++) {
    for (var j=0; j<cupboardProps.shelves; j++) {
      for (var k=0; k<3; k++) {
        var _obj = game.items[utils.getRandomItem(['cone', 'gnome', 'dirtblock', 'printedsaveicons'])]().clone();
        // utils.wireframeify(_obj);
        // utils.unwireframeify(_obj);
        utils.append(_obj, utils.getNamedObject(cupboards[i].children[j], `slot${k}`));
      }
    }
  }
  var targetItem = (utils.getNamedObject(cupboards[1].children[1], "slot1")).clone();
  utils.wireframeify(targetItem);
  targetItem.position.y = 3.5;
  core.spinningItem = targetItem;

  var targetScreen = utils.getNamedObject(monitor, "screen");

  utils.append(targetItem, targetScreen);



  // lights
  var ambient = new T.AmbientLight(utils.colors.light_gray);
  utils.append(ambient, core.scene);

  var directional = new T.DirectionalLight(utils.colors.white, .4);
  directional.castShadow = true;
  directional.position.z = -10;
  directional.position.y = 50;
  directional.lookAt(rocket);

  utils.append(directional, core.scene);

}());
