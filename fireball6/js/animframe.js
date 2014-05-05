function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == "undefined" ) {
    stroke = true;
  }
  if (typeof radius === "undefined") {
    radius = 4;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (stroke) {
    ctx.stroke();
  }
  if (fill) {
    ctx.fill();
  }        
}


var animate = window.requestAnimationFrame || // Firefox 23 / IE 10 / Chrome / Safari 7 (incl. iOS)
              window.webkitRequestAnimationFrame || // Older versions of Safari / Chrome
              window.mozRequestAnimationFrame || // Firefox < 23
              function(callback) { window.setTimeout(callback, 1000/60) }; // 60 fps

var canvas = document.getElementById('mainCanvas');
var context = canvas.getContext('2d');
var width = canvas.width;
var height = canvas.height;

window.onload = function() { // when the page loads, attach the canvas to the screen, call a step function using animate method
    document.body.appendChild(canvas);
    animate(step);
};

var player_score = 0;
var computer_score = 0;

var scoreboard_player=document.getElementById("player-score");
var scoreboard_computer=document.getElementById("computer-score");

var step = function() {
    update(); // update position
    if (player_score > 5 || computer_score > 5){
        stop_render();
    } else{
        render(); // render to the screen
        animate(step); // recursif
    }
};


/* our object */
/* Stick */
function Stick(x, y, width, height) {
    this.width = width;
    this.height = height;
    
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
}

Stick.prototype.render = function() {
    context.fillStyle = "#0096fd";
    roundRect(context, this.x, this.y, this.width, this.height, 3, true, false)
    //context.fillRect(this.x, this.y, this.width, this.height);
};

Stick.prototype.move = function(vx, vy) {
    this.vx = vx;
    this.vy = vy;
    
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0) { // max left
        this.x = 0;
        this.vx = 0;
    } else if (this.x + this.width > 400) { // max right
        this.x = 400 - this.width;
        this.vx = 0;
    }
}

/* Player and Computer */
function Player() {
    this.stick = new Stick(175, 580, 50, 10);
}

function Computer() {
    this.stick = new Stick(175, 10, 50, 10);
}

Player.prototype.render = function() {
    this.stick.render();
};

Computer.prototype.render = function() {
    this.stick.render();
};

/* Ball */
function FireBall(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 3;
    this.radius = 5;
}

FireBall.prototype.render = function() {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
    context.fillStyle = "#CC3333";
    context.fill();
};


/* ------------------------------------------------------------- */
/* init */
var player = new Player();
var computer = new Computer();
var ball = new FireBall(200, 300);

var render = function() { // render all
    context.fillStyle = "#f9ecb6";
    context.fillRect(0, 0, width, height);
    
    player.render();
    computer.render();
    ball.render();
};

var stop_render = function(){
    context.fillStyle = "#dcedcf";
    context.fillRect(0, 0, width, height);
    
    player.render();
    computer.render();
    
    context.font      = "40px Clear Sans, Helvetica Neue, Arial, sans-serif";
    context.fillStyle = "#636363";
    context.textAlign = "center";
    if (player_score > 5){
        context.fillText("You WIN!", 200, 250);
    } else{
        context.fillText("Computer WIN! :P", 200, 250);
    }
}


FireBall.prototype.update = function(stick1, stick2) {
    this.x += this.vx;
    this.y += this.vy;
    
    var top_x = this.x - 5; // x - radius
    var top_y = this.y - 5;
    var bottom_x = this.x + 5;
    var bottom_y = this.y + 5;

    if(this.x - 5 < 0) { // hitting the left wall
        this.x = 5; // shift (safety)
        this.vx = -this.vx;
    } else if(this.x + 5 > 400) { // hitting the right wall
        this.x = 395; 
        this.vx = -this.vx;
    }

    if(this.y < 0) { // a point was scored by Player
        player_score += 1;
        this.vx = 0; // restart
        this.vy = 3;
        this.x = 200;
        this.y = 300;

    }
    
    if(this.y > 600) { // a point was scored by Computer
        computer_score += 1;
        this.vx = 0;
        this.vy = 3;
        this.x = 200;
        this.y = 300;
    }
    
    //  Axis Aligned Bounding Boxes
    if(top_y > 300) {
        if(top_y < (stick1.y + stick1.height) && bottom_y > stick1.y && top_x < (stick1.x + stick1.width) && bottom_x > stick1.x) {
            // hit the player's stick
            this.vy = -3; 
            this.vx += (stick1.vx / 2);
            this.y += this.vy;
        }
    } else {
        if(top_y < (stick2.y + stick2.height) && bottom_y > stick2.y && top_x < (stick2.x + stick2.width) && bottom_x > stick2.x) {
            // hit the computer's stick
            this.vy = 3; 
            this.vx += (stick2.vx / 2);
            this.y += this.vy;
        }
    }
};

var keysDown = {};

window.addEventListener("keydown", function(event) {
    keysDown[event.keyCode] = true;
});

window.addEventListener("keyup", function(event) {
    delete keysDown[event.keyCode];
});


Player.prototype.update = function() {
    for (var key in keysDown) {
        var value = Number(key);
        if(value == 37) { // left arrow
            this.stick.move(-4, 0);
        } else if (value == 39) { // right arrow
            this.stick.move(4, 0);
        } else {
            this.stick.move(0, 0);
        }
    }
};

Computer.prototype.update = function(ball) {
    var x_pos = ball.x;
    var diff = -((this.stick.x + (this.stick.width / 2)) - x_pos);
    
    if (diff < 0 && diff < -6) { // max speed left
        diff = -8;
    } else if(diff > 0 && diff > 6) { // max speed right
        diff = 8;
    }
    this.stick.move(diff, 0);
};

var update = function() {
    player.update();
    computer.update(ball);
    ball.update(player.stick, computer.stick);
    scoreboard_player.innerHTML=player_score.toString();
    scoreboard_computer.innerHTML=computer_score.toString();
};
