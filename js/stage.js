(function () {
  'use strict';

  var T = THREE;
  var utils = game.utils;
  var core = game.core;
  var items = game.items;

  // utils.debugAxis();

  // floor

  var floor = utils.build(
    'CircleGeometry', [300, 300, 10, 10],
    'MeshLambertMaterial', [{
      side: T.DoubleSide,
      color: utils.colors.black,
    }]
  );
  floor.position.y = -20;
  floor.rotation.x = utils.tau;
  floor.name = "floor";

  utils.append(floor, core.scene);
  // setup floor gaze rejection
  utils.gaze(utils.getNamedObject(core.scene, 'floor'));


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
  rocket.position.set(-130, 105, -97);
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
  var metalTexture = new T.TextureLoader().load('assets/metal.jpg');
  metalTexture.wrapS = metalTexture.wrapT = T.RepeatWrapping;
  metalTexture.repeat.set(1, 2);

  var rocketBody = utils.build(
    'LatheGeometry', [rocketGeo, 16],
    'MeshPhongMaterial', [{
      color: utils.colors.white,
      map: metalTexture,
      // specular: utils.colors.white,
      // shininess: 90,
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

  utils.do(wingsTotal, function (i) {
    wings[i] = wing.clone();
    wings[i].rotation.y = wingStep * i;
    wings[i].position.y = -75;
  });

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
  conveyor.position.set(-30, 3, -77);

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

  utils.do(maxWheels + 1, function (i) {
    var _wheel = wheel.clone();
    _wheel.position.x = ((conveyorProps.length/2) - conveyorProps.length) + (i * (conveyorProps.length / maxWheels));
    wheels.push(_wheel);
  });

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
  table.position.y = tableProps.height - 20;
  table.position.z = -40;
  table.position.x = -20;

  var tableTopTexture = new T.TextureLoader().load('assets/wood.jpg');
  tableTopTexture.wrapS = tableTopTexture.wrapT = T.RepeatWrapping;
  tableTopTexture.repeat.set(4,1);
  var tableTop = utils.build(
    'BoxGeometry', [tableProps.width, tableProps.topThickness, tableProps.depth],
    'MeshPhongMaterial', [{
      color: tableProps.color,
      map: tableTopTexture,
    }]
  );
  utils.append(tableTop, table);

  var tableLegTexture = new T.TextureLoader().load('assets/cupboardLeg.jpg');
  tableLegTexture.wrapS = tableLegTexture.wrapT = T.RepeatWrapping;
  tableLegTexture.repeat.set(1, 4);
  var tableLeg = utils.build(
    'CylinderGeometry', [
      tableProps.legThickness,
      tableProps.legThickness,
      tableProps.height - tableProps.topThickness,
      8
    ],
    'MeshPhongMaterial', [{
      color: tableProps.color,
      map: tableLegTexture,
    }]
  );
  var tableLegs = [];

  utils.do(tableProps.legsCount, function (i) {
    var _tableLeg = tableLeg.clone();
    _tableLeg.position.set(
      utils.positionLegs(tableProps)[i][0],
      -1 * (tableProps.height / 2),
      utils.positionLegs(tableProps)[i][1]
    );
    tableLegs.push(_tableLeg);
  });
  utils.append(tableLegs, table);

    // computer

    var computer = new T.Object3D();

    computer.position.y = 1;
    computer.position.x = 8;
    var matdarkgray = new T.MeshPhongMaterial({color:utils.colors.dark_gray});
    var matblack = new T.MeshPhongMaterial({color:utils.colors.black});

    var monitor = new T.Object3D();
    var monitorShell = new T.Object3D();
    var _monitorTop = utils.build(
      'BoxGeometry', [16, 1, 8],
      'MeshPhongMaterial', [{
        color: utils.colors.dark_gray,
      }]
    );
    _monitorTop.material = [matdarkgray, matdarkgray, matdarkgray, matblack, matdarkgray, matdarkgray];
    _monitorTop.position.set(0,5.5,0);
    var _monitorBottom = utils.build(
      'BoxGeometry', [16, 1, 8],
      'MeshPhongMaterial', [{}]
    );
    _monitorBottom.material = [matdarkgray, matdarkgray, matblack, matdarkgray, matdarkgray, matdarkgray];
    _monitorBottom.position.set(0,-5.5,0);
    var _monitorLeft = utils.build(
      'BoxGeometry', [1, 12, 8],
      'MeshPhongMaterial', [{
        color: utils.colors.dark_gray,
      }]
    );
    _monitorLeft.material = [matblack, matdarkgray, matdarkgray, matdarkgray, matdarkgray, matdarkgray];
    _monitorLeft.position.set(-8,0,0);
    var _monitorRight = utils.build(
      'BoxGeometry', [1, 12, 8],
      'MeshPhongMaterial', [{
        color: utils.colors.dark_gray,
      }]
    );
    _monitorRight.material = [matdarkgray, matblack, matdarkgray, matdarkgray, matdarkgray, matdarkgray];
    _monitorRight.position.set(8,0,0);
    var _monitorBack = utils.build(
      'BoxGeometry', [16, 12, 1],
      'MeshPhongMaterial', [{
        color: utils.colors.dark_gray,
      }]
    );
    _monitorBack.material = [matdarkgray, matdarkgray, matdarkgray, matdarkgray, matblack, matdarkgray];
    _monitorBack.position.set(0,0,-4);
    utils.append([_monitorTop,_monitorBottom,_monitorLeft,_monitorRight,_monitorBack], monitorShell);

    var monitorStand = utils.build(
      'CylinderGeometry', [2, 2, 2, 8],
      'MeshPhongMaterial', [{
        color: utils.colors.dark_gray,
      }]
    );
    monitorStand.position.y = -7;

    var monitorScreen = utils.build(
      'PlaneGeometry', [16, 12, 1],
      'MeshPhongMaterial', [{
        color: utils.colors.black,
        opacity: 0.1,
        transparent: true,
      }]
    );
    monitorScreen.position.z = 3.8;
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

    utils.do(keyProps.total, function (i) {
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
    });
    utils.append(keys, keyboard);


    utils.append(keyboard, computer);

    utils.append(computer, table);


    // paper
    var paperSlot = utils.namedObject("paperslot");
    var paper = utils.namedObject("paper");
    var _page = utils.build(
      'PlaneGeometry', [10,15,1],
      'MeshPhongMaterial', [{
        side: T.DoubleSide,
        map: new T.TextureLoader().load('assets/paper.jpg'),
      }]
    );
    utils.append(_page, paper);
    utils.append(paper, paperSlot);
    paperSlot.rotation.x = -utils.tau;
    paperSlot.position.y = 1;
    paperSlot.position.x = -8;
    paperSlot.rotation.z = utils.d2r(10);
    utils.append(paperSlot, table);
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
  var shelfTexture = new T.TextureLoader().load('assets/cupboardShelf.jpg');
  shelfTexture.wrapS = shelfTexture.wrapT = T.RepeatWrapping;
  shelfTexture.repeat.set(4, 1);

  var shelf = utils.build(
    'BoxGeometry', [cupboardProps.width, 1, cupboardProps.depth],
    'MeshPhongMaterial', [{
      color: utils.colors.light_gray,
      map: shelfTexture,
    }]
  );
  var shelves = [];
  utils.do(cupboardProps.shelves, function (i) {
    var _shelf = shelf.clone();
    _shelf.position.y = 10 + (i * 10);
    shelves.push(_shelf);
  })
  utils.append(shelves, cupboard);

  var legTexture = new T.TextureLoader().load('assets/cupboardLeg.jpg');
  legTexture.wrapS = legTexture.wrapT = T.RepeatWrapping;
  legTexture.repeat.set(1, 4);

  var cupboardLeg = utils.build(
    'CylinderGeometry', [cupboardProps.legThickness, cupboardProps.legThickness, cupboardProps.height, 8],
    'MeshPhongMaterial', [{
      color: utils.colors.light_gray,
      map: legTexture,
    }]
  );
  var cupboardLegs = [];
  utils.do(cupboardProps.legs, function (i) {
    var _cupboardLeg = cupboardLeg.clone();
    _cupboardLeg.position.y = (cupboardProps.height / 2);
    _cupboardLeg.position.x = utils.positionLegs(cupboardProps)[i][0];
    _cupboardLeg.position.z = utils.positionLegs(cupboardProps)[i][1];

    shelves.push(_cupboardLeg);
  });
  utils.append(shelves, cupboard);
  utils.append(cupboardLegs, cupboard);


  var totalCupboards = 3;
  var cupboards = [];

  var cupboardRadius = 100;
  var cupboardStep = utils.d2r(30);
  var cupboardAngle = utils.d2r(120);

  utils.do(totalCupboards, function (i) {
    var _cupboard = cupboard.clone();
    _cupboard.position.y = -20;
    _cupboard.position.x = Math.cos(cupboardAngle) * cupboardRadius;
    _cupboard.position.z = Math.sin(cupboardAngle) * cupboardRadius;

    cupboardAngle += cupboardStep;

    _cupboard.lookAt(new T.Vector3(0,-20,0));
    cupboards.push(_cupboard);
  })
  utils.append(cupboards, core.scene);

  var items = ['cone', 'gnome', 'dirtblock', 'printedsaveicons', 'ufo', 'crate', 'barrel'];

  var positions = [
    new T.Vector3(-(cupboardProps.width / 3), 7, 0),
    new T.Vector3(0, 7, 0),
    new T.Vector3(cupboardProps.width / 3, 7, 0)
  ];
  // Stick some items on the shelves
  utils.do(cupboards.length, function (i) {
    utils.do(cupboardProps.shelves, function (j) {

      utils.do(3, function (k) {
        var shelf = cupboards[i].children[j];
        var slot = utils.namedObject(`slot_${i}_${j}_${k}`);
        slot.position.set(positions[k].x, positions[k].y, positions[k].z);
        utils.append(slot, shelf);


        var _obj = game.items[utils.getRandomItem(items)]().clone();
        utils.append(_obj, slot);
      });
    });
  });


  // dummy selection of target
  var target = utils.getNamedObject(cupboards[1].children[1], "slot_1_1_1");
  var targetItem = target.children[0].clone();

  utils.wireframeify(targetItem);
  targetItem.position.y = 0;
  if (targetItem.name === 'gnome') {
    targetItem.position.y = 2.5;
  }
  targetItem.position.z = -2;
  core.spinningItem = targetItem;

  var targetScreen = utils.getNamedObject(monitor, "screen");

  utils.append(targetItem, targetScreen);


  // example of gaze
  utils.gaze(
    utils.getChildren(cupboards),
    {
      over: function (obj) {
        obj.parent.scale.set(1.2,1.2,1.2);
      },
      out: function (obj) {
        obj.parent.scale.set(1,1,1);
      },
      long: function (obj) {
        utils.pickUp(obj, obj.parent, core.cameraSlot);
      }
    }
  );

  var paperSlot = utils.getNamedObject(core.scene, 'paperslot');
  utils.gaze(
    paperSlot.children[0],
    {
      timeout: 2000,
      long: function (obj) {
        utils.pickUp(obj, paperSlot, core.cameraSlot);
        core.currentRobotPhase = 2; // user found the paper, so dont need to prompt
      }
    }
  );

  // build out the robot then...

  var robotTrack = utils.namedObject('robottrack');
  robotTrack.position.set(40, 0, -30);
  utils.append(core.robot, robotTrack);
  robotTrack.lookAt(new T.Vector3(core.camera.position.x, 0, core.camera.position.z));
  utils.append(robotTrack, core.scene);

  utils.gaze(
    core.robot,
    {
      longsound: 'sounds/sfx_sound_nagger2.wav',
      long: function (obj) {
        if (core.currentRobotPhase === 0) {
          core.currentRobotPhase = 1;
        }
      }
    }
  );
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
