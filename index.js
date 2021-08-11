const canvasWrapper = document.querySelector('.canvas_wrapper'),
  controlButton = document.querySelectorAll('.button-control'),
  levelButton = document.querySelectorAll('.button-level'),
  textLevelHTML = document.querySelector('.text');

const loader = new PIXI.Loader(),
  Application = PIXI.Application,
  Text = PIXI.Text,
  Sprite = PIXI.Sprite,
  Container = PIXI.Container;

const app = new Application({
  width: 608,
  height: 608,
  resolution: 1,
  backgroundAlpha: 0,
});
canvasWrapper.appendChild(app.view);

const gameConfig = {
  sizeCell: 32,
  count: 0,
  maxSnakeTails: 3,
};
const snakeConfig = {
  x: 8 * gameConfig.sizeCell,
  y: 10 * gameConfig.sizeCell,
  dx: gameConfig.sizeCell,
  dy: 0,
  snakeTails: [
    { x: 8 * gameConfig.sizeCell, y: 10 * gameConfig.sizeCell },
    { x: 7 * gameConfig.sizeCell, y: 10 * gameConfig.sizeCell },
    { x: 6 * gameConfig.sizeCell, y: 10 * gameConfig.sizeCell },
  ],
};

let carrotConfig = check();

let atlas, area, carrot, snake, container, textScore, levelGame;
let score = 0;
let startBoolean = false;

loader.add('atlas', 'assets/atlas.json').load(setup);

function setup() {
  if (startBoolean) {
    requestAnimationFrame(setup);

    if (++gameConfig.count < levelGame) {
      return;
    }
    gameConfig.count = 0;
  }

  atlas = loader.resources['atlas'].textures;
  // add new Container
  container = new Container();
  app.stage.addChild(container);

  //Draw Area Game
  area = new Sprite(atlas['area.png']);
  area.name = 'area';
  container.addChild(area);
  //Draw Carrot
  carrot = new Sprite(atlas['carrot.png']);
  carrot.width = gameConfig.sizeCell;
  carrot.height = gameConfig.sizeCell;
  carrot.x = carrotConfig.x;
  carrot.y = carrotConfig.y;
  container.addChild(carrot);

  //Draw Score
  textScore = new Text(`Count score: ${score}`, {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xffffff,
  });
  textScore.x = app.view.width / 3;
  textScore.y = 20;
  container.addChild(textScore);

  //* * *//
  snakeConfig.x += snakeConfig.dx;
  snakeConfig.y += snakeConfig.dy;

  collision();

  snakeConfig.snakeTails.unshift({ x: snakeConfig.x, y: snakeConfig.y });

  if (snakeConfig.snakeTails.length > gameConfig.maxSnakeTails) {
    snakeConfig.snakeTails.pop();
  }
  snakeConfig.snakeTails.forEach((el, index) => {
    drawSnake(el.x, el.y);

    if (el.x === carrot.x && el.y === carrot.y && index === 0) {
      gameConfig.maxSnakeTails += 4;
      carrotConfig = check();
      score++;
    }

    for (let i = index + 1; i < snakeConfig.snakeTails.length; i++) {
      if (el.x === snakeConfig.snakeTails[i].x && el.y === snakeConfig.snakeTails[i].y) {
        restartGame();
      }
    }
  });
  app.stage.children.forEach((el) => {
    if (app.stage.children.length > 1) {
      app.stage.removeChildren(0, 1);
    }
  });
}

function drawSnake(x, y) {
  snake = new PIXI.Sprite(atlas['snake2.png']);
  snake.width = gameConfig.sizeCell;
  snake.height = gameConfig.sizeCell;
  snake.x = x;
  snake.y = y;
  container.addChild(snake);
}

function collision() {
  if (
    snakeConfig.x < 0 + gameConfig.sizeCell ||
    snakeConfig.x >= app.view.width - gameConfig.sizeCell ||
    snakeConfig.y < 0 + gameConfig.sizeCell * 3 ||
    snakeConfig.y >= app.view.height - gameConfig.sizeCell
  ) {
    restartGame();
  }
}

function restartGame() {
  app.renderer.clear(app.stage);
  startBoolean = false;
  gameConfig.maxSnakeTails = 3;
  snakeConfig.x = 8 * gameConfig.sizeCell;
  snakeConfig.y = 10 * gameConfig.sizeCell;
  snakeConfig.dx = gameConfig.sizeCell;
  snakeConfig.dy = 0;
  snakeConfig.snakeTails = [
    { x: 8 * gameConfig.sizeCell, y: 10 * gameConfig.sizeCell },
    { x: 7 * gameConfig.sizeCell, y: 10 * gameConfig.sizeCell },
    { x: 6 * gameConfig.sizeCell, y: 10 * gameConfig.sizeCell },
  ];
  carrotConfig = check();
  score = 0;
}

function randomCoordination(max, min) {
  return Math.floor(Math.random() * max + min) * gameConfig.sizeCell;
}
function check() {
  let x = randomCoordination(17, 1);
  let y = randomCoordination(15, 3);

  for (let i = 1; i < snakeConfig.snakeTails.length; i++) {
    if (snakeConfig.snakeTails[i].x === x && snakeConfig.snakeTails[i].y === y) {
      x = randomCoordination(17, 1);
      y = randomCoordination(15, 3);
    }
  }

  return { x, y };
}

// Add Listener keydown
window.addEventListener('keydown', (e) => {
  // press W
  if (e.code === 'KeyW' && snakeConfig.dy === 0) {
    snakeConfig.dy = -gameConfig.sizeCell;
    snakeConfig.dx = 0;
  }
  // press A
  if (e.code === 'KeyA' && snakeConfig.dx === 0) {
    snakeConfig.dx = -gameConfig.sizeCell;
    snakeConfig.dy = 0;
  }
  //press D
  if (e.code === 'KeyD' && snakeConfig.dx === 0) {
    snakeConfig.dx = gameConfig.sizeCell;
    snakeConfig.dy = 0;
  }
  // press S
  if (e.code === 'KeyS' && snakeConfig.dy === 0) {
    snakeConfig.dy = gameConfig.sizeCell;
    snakeConfig.dx = 0;
  }
});

// settings buttons start, stop and restart
controlButton.forEach((btn, i) => {
  btn.disabled = true;
  btn.addEventListener('click', () => {
    if (btn.id === 'start') {
      startBoolean = true;
      setup();
    }
    if (btn.id === 'stop') {
      startBoolean = false;
    }
    if (btn.id === 'restart') {
      startBoolean = false;
      restartGame();
      setup();
    }
  });
});

// settings button level Game
levelButton.forEach((btn, i) => {
  btn.addEventListener('click', (e) => {
    if (btn.id === 'junior') {
      levelGame = 4;
      textLevelHTML.innerHTML = 'junior';
      textLevelHTML.style.color = '#15d1d8';
    }
    if (btn.id === 'middle') {
      levelGame = 2;
      textLevelHTML.innerHTML = 'middle';
      textLevelHTML.style.color = '#e1f00e';
    }
    if (btn.id === 'senior') {
      levelGame = 1;
      textLevelHTML.innerHTML = 'senior';
      textLevelHTML.style.color = '#e90f0f';
    }

    if (btn === e.target) {
      controlButton.forEach((controlBtn) => {
        controlBtn.disabled = false;
      });
    }
  });
});
