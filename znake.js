const util = require("util");
const consts = require("./constz");
const znake_renderer = require("./znake_renderer");

var date = new Date();

var nextBody = 0;
///////////////////// start game

function getEmptyGameData(ui) {
  var gameGrid = [];
  for (var i = 0; i < consts.size_y; i++) {
    gameGrid[i] = [];
    for (var j = 0; j < consts.size_x; j++) {
      gameGrid[i][j] = consts.EMPTY;
    }
  }
  //snake at 4x5
  gameGrid[4][4] = consts.HEAD;
  gameGrid[1][3] = consts.APPLE;

  var game = {
    grid: gameGrid,
    status: consts.STATUS_STARTED,
    ui: ui
  };

  consts.logGame(game);

  return game;
}

function getCheatGame(ui) {
  var gameGrid = [];
  for (var i = 0; i < consts.size_y; i++) {
    gameGrid[i] = [];
    for (var j = 0; j < consts.size_x; j++) {
      gameGrid[i][j] = consts.BODY;
    }
  }
  //snake at 4x5
  gameGrid[4][4] = consts.HEAD;
  gameGrid[3][4] = consts.APPLE;
  
  

  var game = {
    grid: gameGrid,
    status: consts.STATUS_STARTED,
    ui: ui
  };

  consts.logGame(game);

  return game;
}

function newGame(ui) {
  console.log("new game ui:" + ui);
  
  if (ui == true) {
    return {
      type: "postback",
      title: "ˢ New Game",
      payload: JSON.stringify({
        newGame: true,
        game: null,
        direction: "up",
        ui: ui
      })
    };
  } else {
    return {
      content_type: "text",
      title: "New Game",
      payload: JSON.stringify({
        newGame: true,
        game: null,
        direction: "up",
        ui: ui
      }),
      image_url:
        "https://cdn.glitch.com/15f9055e-ec24-42bd-9f11-b132413b5143%2Fsnake%201%20(1).png?v=1591296673865"
    };
  }
}

function left(game, ui) {
  console.log("left ui:" + ui);
  
  if (ui == true) {
    return {
      type: "postback",
      title: "˂ Left",
      payload: JSON.stringify({ direction: "left", game: game })
    };
  } else {
    return {
      content_type: "text",
      title: "Left",
      payload: JSON.stringify({ direction: "left", game: game }),
      image_url:
        "https://cdn.glitch.com/15f9055e-ec24-42bd-9f11-b132413b5143%2Fkeyboard_arrow_left_24px_outlined.svg?v=1591296680949"
    };
  }
}

function right(game, ui) {
  console.log("right ui:" + ui);
  
  if (ui == true) {
    return {
      type: "postback",
      title: "˃ Right",
      payload: JSON.stringify({ direction: "right", game: game })
    };
  } else {
    return {
      content_type: "text",
      title: "Right",
      payload: JSON.stringify({ direction: "right", game: game }),
      image_url:
        "https://cdn.glitch.com/15f9055e-ec24-42bd-9f11-b132413b5143%2Fkeyboard_arrow_left_24px_outlined.svg?v=1591296680949"
    };
  }
}

function up(game, ui) {
  console.log("up ui:" + ui);

  if (ui == true) {
    return {
      type: "postback",
      title: "˄ Up",
      payload: JSON.stringify({ direction: "up", game: game })
    };
  } else {
    return {
      content_type: "text",
      title: "Up",
      payload: JSON.stringify({ direction: "up", game: game }),
      image_url:
        "https://cdn.glitch.com/15f9055e-ec24-42bd-9f11-b132413b5143%2Fkeyboard_arrow_up_24px_outlined.svg?v=1591296680826"
    };
  }
}

function down(game, ui) {
  console.log("down ui:" + ui);
  if (ui == true) {
    return {
      type: "postback",
      title: "˅ Down",
      payload: JSON.stringify({ direction: "down", game: game })
    };
  } else {
    return {
      content_type: "text",
      title: "Down",
      payload: JSON.stringify({ direction: "down", game: game }),
      image_url:
        "https://cdn.glitch.com/15f9055e-ec24-42bd-9f11-b132413b5143%2Fkeyboard_arrow_down_24px_outlined.svg?v=1591296680917"
    };
  }
}

function startGame(sender, ui, cheat) {
  console.log("startGame ui:" + ui + " - cheat:" + cheat);

  if (cheat == true) {
    var gamex = getCheatGame(ui);
  } else {
    var gamex = getEmptyGameData(ui);
  }

  var game = JSON.stringify(gamex);
  
  if (ui == true) {
    var imgUrl =
      "https://mihe.glitch.me/znake?game=" + game + "&kur=" + date.getTime();

    console.log(">>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<");
    console.log("imgUrl:" + imgUrl);
    console.log(">>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<");

    return getResponse(
      sender,
      "New Game",
      "Press one of the buttons to move the snake.",
      imgUrl,
      getControlsForDirection(false, "up", game, true)
    );
  } else {
    
    return getTextResponse(
      sender,
      "New Game",
      "Press one of the buttons to move the snake.",
      getControlsForDirection(false, "up", game, false),
      znake_renderer.gametext(gamex)
    );
  }
}

//respinse for ui mode
function getResponse(sender, title, subtitle, image, directions) {
  var messageDataImg = JSON.stringify({
    recipient: {
      id: sender
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: title,
              image_url: image,
              subtitle: subtitle,
              buttons: directions
            }
          ]
        }
      }
    }
  });
  //console.log("game messageDataImg:" + JSON.stringify(messageDataImg));
  return messageDataImg;
}

//response for text mode
function getTextResponse(sender, title, subtitle, directions, gameText) {
  var messageDataImg = JSON.stringify({
    recipient: {
      id: sender
    },
    messaging_type: "RESPONSE",
    message: {
      text: gameText + "\n"+ title + "\n" + subtitle,
      quick_replies: directions
    }
  });
  console.log("game text msg:" + JSON.stringify(messageDataImg));
  return messageDataImg;
}

//the real game logic is in here
function playGame(sender, gameAction) {
  //console.log("playGame:" + JSON.stringify(gameAction));

  //console.log(util.inspect(gameAction, false, null, true))

  var game = JSON.parse(gameAction.game);

  console.log("game length y:" + game.grid.length);
  console.log("game length x:" + game.grid[0].length);
  console.log("game ui:" + game.ui);

  consts.logGame(game);

  var ui = game.ui;

  var isGameOver = false;

  var koka = findSnakeHeader(game);

  console.log("found snake:" + JSON.stringify(koka));
  console.log("direction:" + gameAction.direction );
  //found the snake head, check next position based on the direction
  //mbaj mend qe x dhe y jane reversed
  if (gameAction.direction == "up") {
    if (koka.x == 0) {
      isGameOver = true;
    } else {
      //replace these two cells
      isGameOver = isInValidMove(game, koka.x - 1, koka.y);
      game = replaceCells(game, koka.x, koka.y, koka.x - 1, koka.y);
    }
  } else if (gameAction.direction == "left") {
    if (koka.y == 0) {
      isGameOver = true;
    } else {
      //replace these two cells
      isGameOver = isInValidMove(game, koka.x, koka.y - 1);
      game = replaceCells(game, koka.x, koka.y, koka.x, koka.y - 1);
    }
  } else if (gameAction.direction == "right") {
    if (koka.y == consts.size_x - 1) {
      isGameOver = true;
    } else {
      //replace these two cells
      isGameOver = isInValidMove(game, koka.x, koka.y + 1);
      game = replaceCells(game, koka.x, koka.y, koka.x, koka.y + 1);
    }
  } else if (gameAction.direction == "down") {
    if (koka.x == consts.size_y - 1) {
      isGameOver = true;
    } else {
      //replace these two cells
      isGameOver = isInValidMove(game, koka.x + 1, koka.y);
      game = replaceCells(game, koka.x, koka.y, koka.x + 1, koka.y);
    }
  }else{
    console.log("UNKNOWN DIRECTION:" + gameAction.direction );
  }

  consts.logGame(game);
  
  if(game.won == true){
    isGameOver = true;   
  }
  
 
  if (isGameOver) {
    if(game.won){
       game.status = consts.STATUS_WON;
    }else{
      game.status = consts.STATUS_ENDED;
    }
  } else {
    game.status = consts.STATUS_PLAYING;
  }
  

  var gamez = JSON.stringify(game);
  //send the response

  if (ui) {
    var imgUrl =
      "https://mihe.glitch.me/znake?game=" + gamez + "&kur=" + date.getTime();
    console.log(">>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<");
    console.log("imgUrl:" + imgUrl);
    console.log(">>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<");

    return getResponse(
      sender,
      getTitle(isGameOver, game.won),
      getSubTitle(isGameOver, game.won),
      imgUrl,
      getControlsForDirection(isGameOver, gameAction.direction, gamez, true)
    );
  } else {
    return getTextResponse(
      sender,
      getTitle(isGameOver, game.won),
      getSubTitle(isGameOver, game.won),
      getControlsForDirection(isGameOver, gameAction.direction, gamez, false),
      znake_renderer.gametext(game)
    );
  }
}



function getNextBody() {
  nextBody++;
  return nextBody;
}

function isInValidMove(game, x2, y2) {
  console.log("isValidMove:" + x2 + "_" + y2 + " - " + game);
  var destination = game.grid[x2][y2];
  return destination.startsWith(consts.BODY) == true;
}

function replaceCells(game, x1, y1, x2, y2) {
  console.log(
    "replaceCells:" + x1 + "_" + y1 + " - " + x2 + "_" + y2 + " - " + game
  );

  var koka = game.grid[x1][y1];
  var target = game.grid[x2][y2];

  console.log("koka:" + koka + " - target: " + target);

  game.grid[x2][y2] = consts.HEAD;

  //eat the apple, the body gets longer
  if (target == consts.APPLE) {
    game.grid[x1][y1] = consts.BODY + "_" + getNextBody();
    var won = isWon(game);
    if(won){
      game.won= true
    }else{
      game = getNewApple(game);
    }
  } else if (getBodyLength(game) == 0) {
    //if the body is not empty, previous position becomes empty
    game.grid[x1][y1] = consts.EMPTY;
  } else {
    //body is not null, previous becomes body, and then delete the last body item

    game.grid[x1][y1] = consts.BODY + "_" + getNextBody();

    consts.logGame(game);

    game = removeTail(game);
  }

  return game;
}

function isWon(game){
  var length = getBodyLength(game);
  var maxSize = consts.size_x * consts.size_y -1;
  console.log("game won " + length + "=" + maxSize);
  return length == maxSize;
}

function getNewApple(game) {
  var created = false;
  while (created == false) {
    var x = Math.floor(Math.random() * Math.floor(consts.size_x - 1));
    var y = Math.floor(Math.random() * Math.floor(consts.size_y - 1));

    if (game.grid[x][y] == consts.EMPTY) {
      game.grid[x][y] = consts.APPLE;
      created = true;
    }
  }

  return game;
}

function getBodyLength(game) {
  //how many body boxes do i have = nr of apples yo got == points
  var length = 0;
  for (var i = 0; i < game.grid.length; i++) {
    for (var j = 0; j < game.grid[i].length; j++) {
      if (game.grid[i][j].startsWith(consts.BODY) == true) {
        length++;
      }
    }
  }
  return length;
}

function removeTail(game) {
  console.log("removeTail");
  //remove last body item, with no head neighbour or two other body neighbors
  var tail_x = -1;
  var tail_y = -1;
  var minVal = -1;

  for (var i = 0; i < game.grid.length; i++) {
    for (var j = 0; j < game.grid[i].length; j++) {
      if (game.grid[i][j].startsWith(consts.BODY) == true) {
        var nextVal = game.grid[i][j].split("_")[1];
        console.log("nextVal: " + nextVal);
        if (minVal === -1) {
          console.log("first min val: " + nextVal);
          minVal = nextVal;
          tail_y = j;
          tail_x = i;
        } else if (parseInt(nextVal) < minVal) {
          console.log("minVal: " + nextVal);
          minVal = nextVal;
          tail_y = j;
          tail_x = i;
        }
      }
    }
  }

  if (minVal != -1) {
    game.grid[tail_x][tail_y] = consts.EMPTY;
  }

  return game;
}

function findSnakeHeader(game) {
  console.log("findSnakeHeader");
  for (var i = 0; i < game.grid.length; i++) {
    for (var j = 0; j < game.grid[i].length; j++) {
      if (game.grid[i][j] == consts.HEAD) {
        return { x: i, y: j };
      }
    }
  }
}

function getControlsForDirection(isGameOver, direction, game, ui) {
  console.log(
    "getControlsForDirection isGameOver:" +
      isGameOver +
      " - direction: " +
      direction +
      " - ui: " +
      ui
  );
  if (isGameOver == true) {
    console.log("new game ui");
    return [newGame(ui)];
  }
  if (direction == "up") {
    console.log("up ui");
    return [up(game, ui), left(game, ui), right(game, ui)];
  }
  if (direction == "down") {
     console.log("down ui");
    return [left(game, ui), right(game, ui), down(game, ui)];
  }
  if (direction == "left") {
     console.log("left ui");
    return [up(game, ui), left(game, ui), down(game, ui)];
  } else {
    //right
     console.log("right ui");
    return [up(game, ui), right(game, ui), down(game, ui)];
  }
}

function getTitle(isGameOver, won) {
  console.log("getTitle isGameOver:" + isGameOver);
  if (isGameOver) {
    if(won){
      return "You Won !";
    }
    return "Game Over";
  } else {
    return "Make your move";
  }
}

function getSubTitle(isGameOver, won) {
  console.log("getSubTitle isGameOver:" + isGameOver);
  if (isGameOver) {
    if(won){
      return "Do you want to win again?";
    }
    return "Type anything to start a new game!";
  } else {
    return "Press one of the buttons to move the snake.";
  }
}

exports.startGame = startGame;
exports.playGame = playGame;
