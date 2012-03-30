///////////////////////////////////////////
// Functions -- Kept in a JQuery namespace
$.pong = {
	setup: function(){
		$.pong.table		= {	el:	$('#table')};
		$.pong.player		= {	el:				$('#player'),
								position:		{x:false,y:0}},
		$.pong.computer		= {	el:				$('#computer'),
								position:		{x:false,y:0},
								velocity:		0.2};
		$.pong.ball			= {	el:				$('#ball1'),
								velocity:		{x:false,y:false},
								position:		{x:false,y:false},
								acceleration:	{x:0.0005,y:0.0005},
								velocity_start:	0.5,
								velocity_max:	3};

		$.pong.player.height		= $.pong.player.el.height();
		$.pong.player.width			= $.pong.player.el.width();
		$.pong.player.position.x	= $.pong.player.el.position().left;
    // # of pixels to move on key press.
		$.pong.player.yInterval	= 50;
		$.pong.player.leftedge		= $.pong.player.position.x;
		$.pong.player.rightedge		= $.pong.player.position.x + $.pong.player.width;

		$.pong.computer.height	= $.pong.computer.el.height();
		$.pong.computer.width	= $.pong.computer.el.width();
		$.pong.computer.position.x	= $.pong.computer.el.position().left;
		$.pong.computer.leftedge	= $.pong.computer.position.x;
		$.pong.computer.rightedge	= $.pong.computer.position.x + $.pong.computer.width;

		$.pong.ball.width		= $.pong.ball.el.width();
		$.pong.ball.height		= $.pong.ball.el.height();

		//$('#table').mousemove($.pong.mouseMoved);
	},

	startRound: function(){
		// Set ball in middle of screen
		$.pong.ball.position = {	x: Math.floor($.pong.table.el.width()/2),
									y: Math.floor($.pong.table.el.height()/2)};


		// Set ball direction randomly with weight to x direction and constant starting velocity
		var totalVelocity = $.pong.ball.velocity_start;
		$.pong.ball.velocity.x = Math.random() * totalVelocity*.5 + totalVelocity*.5;
		$.pong.ball.velocity.y = Math.pow(Math.pow(totalVelocity,2) - Math.pow($.pong.ball.velocity.x,2),0.5);
		if(Math.random() > 0.5)	$.pong.ball.velocity.y *= -1;
		if(Math.random() > 0.5)	$.pong.ball.velocity.x *= -1;

		// Set computer level display
		$('#computer_level').html(Math.floor($.pong.computer.velocity*10 - 1).toFixed(0));

		$.pong.redraw();

		$.pong.ball.el.show();
		$.pong.lastUpdate = $.pong.getTime();

		$.pong.table.height	= $.pong.table.el.height();
		$.pong.table.width	= $.pong.table.el.width();
	},

	keyPressed: function(digit){
		var playerHeight		= $.pong.player.height;
		var tableHeight			= $.pong.table.height;
    var increment = 0;

    if (digit == '2') {
      increment -= $.pong.player.yInterval;
    }
    else if (digit == '8') {
      increment = $.pong.player.yInterval;
    }

		var y = $.pong.player.position.y + increment;
		if(y < 0)								y = 0;
		if((y + playerHeight) > tableHeight)	y = tableHeight - playerHeight;

		$.pong.player.position.y = y;
	},

	mouseMoved: function(e){
		var playerHeight		= $.pong.player.height;
		var tableHeight			= $.pong.table.height;

		var y = e.clientY - (playerHeight / 2);
		if(y < 0)								y = 0;
		if((y + playerHeight) > tableHeight)	y = tableHeight - playerHeight;

		$.pong.player.position.y = y;
	},

	update: function(){
		var t = $.pong.getTime();
		var diff = t - $.pong.lastUpdate;
		var coeff = diff/3;

		///////////////////////
		// Move ball
		var new_x	= $.pong.ball.position.x + $.pong.ball.velocity.x*coeff;
		var new_y	= $.pong.ball.position.y + $.pong.ball.velocity.y*coeff;

		// Check for collisions with top / bottom wall
		if((new_y+$.pong.ball.height) > $.pong.table.height){
			// Bottom
			$.pong.ball.velocity.y = Math.abs($.pong.ball.velocity.y)*-1;
			new_y = $.pong.table.height - $.pong.ball.height;
		} else if(new_y < 0){
			// Top
			$.pong.ball.velocity.y = Math.abs($.pong.ball.velocity.y);
			new_y = 0;
		}

		// Check for collisions with paddles
		//console.log('cl:'+$.pong.computer.leftedge);
		//console.log('cr:'+$.pong.computer.rightedge);
		if(new_x >= $.pong.computer.leftedge && new_x <= $.pong.computer.rightedge){
			// Right (computer)
			if(($.pong.computer.position.y < new_y) && ($.pong.computer.height+$.pong.computer.position.y > new_y)){
				$.pong.ball.velocity.x = -1*Math.abs($.pong.ball.velocity.x);
				new_x = $.pong.computer.leftedge;
			}
		} else if(new_x <= $.pong.player.rightedge && new_x >= $.pong.player.leftedge){
			// Left (player)
			if(($.pong.player.position.y < new_y) && ($.pong.player.height+$.pong.player.position.y > new_y)){
				$.pong.ball.velocity.x = Math.abs($.pong.ball.velocity.x);
				new_x = $.pong.player.rightedge;
			}
		}

		// Check for win / loss
		if(new_x < 0){
			// Player loss
			$('#computer_score').html(Math.floor($('#computer_score').html())+1);
			$.pong.computer.velocity = Math.max(0.1, $.pong.computer.velocity-0.1);
			$.pong.startRound();
			setTimeout('$.pong.update();', 20);
			return;

			// Computer loss
		} else if(new_x > ($.pong.table.width - 20)){
			$('#player_score').html(Math.floor($('#player_score').html())+1);
			$.pong.computer.velocity = $.pong.computer.velocity+0.1;
			$.pong.startRound();
			setTimeout('$.pong.update();', 20);
			return;
		}

		$.pong.ball.position = {	x: new_x,
									y: new_y };

		// END: Move ball
		///////////////////////

		///////////////////////
		// Move computer
		var midComputer	= $.pong.computer.position.y + ($.pong.computer.height / 2);
		var midBall		= $.pong.ball.position.y + ($.pong.ball.height / 2);
		var new_y;
		if(midComputer < midBall){
			new_y = $.pong.computer.position.y + $.pong.computer.velocity * coeff;
			if((new_y + ($.pong.computer.height / 2)) > midBall)	new_y = midBall - ($.pong.computer.height / 2);	// Don't pass the ball
		}else if(midComputer >= midBall){
			new_y = $.pong.computer.position.y - $.pong.computer.velocity * coeff;
			if((new_y + ($.pong.computer.height / 2)) < midBall)	new_y = midBall - ($.pong.computer.height / 2);	// Don't pass the ball
		}

		// Make sure not off the edge
		if(new_y < 0)												new_y = 0;
		if((new_y + $.pong.computer.height) > $.pong.table.height)	new_y = $.pong.table.height - $.pong.computer.height;

		$.pong.computer.position.y = new_y;

		// END: Move computer
		///////////////////////

		/////////////////////
		// Accellerate balli
		var velocity = Math.pow(Math.pow($.pong.ball.velocity.x, 2) + Math.pow($.pong.ball.velocity.y, 2), 0.5);
		if(velocity < $.pong.ball.velocity_max){
			if($.pong.ball.velocity.x >= 0){
				$.pong.ball.velocity.x += $.pong.ball.acceleration.x*coeff;
			} else {
				$.pong.ball.velocity.x -= $.pong.ball.acceleration.x*coeff;
			}
			if($.pong.ball.velocity.y >= 0){
				$.pong.ball.velocity.y += $.pong.ball.acceleration.y*coeff;
			} else {
				$.pong.ball.velocity.y -= $.pong.ball.acceleration.y*coeff;
			}
		}
		// Accellerate ball
		/////////////////////

		$.pong.redraw();

		$.pong.lastUpdate = t;
		setTimeout('$.pong.update();', 20);
	},

	redraw: function(){
		$.pong.ball.el.css('left',	$.pong.ball.position.x);
		$.pong.ball.el.css('top',	$.pong.ball.position.y);

		$.pong.player.el.css('top', $.pong.player.position.y);
		$.pong.computer.el.css('top', $.pong.computer.position.y);
	},

	getTime: function(){
		var d = new Date();
		return d.getTime();
	},

	viewSource: function(){
		alert('Not yet implemented');
	}
};
// END: Functions
///////////////////////////////////////////

$(document).ready(function(){
	$('#viewSource').click($.pong.viewSource);

  var socket = io.connect();

  var log_server_response = function (data) {
    console.log(data);
  }
  socket.on('status', log_server_response);
  socket.on('answered', log_server_response);
  var key_pressed = function (data) {
    console.log(data);
    socket.emit('key press received', { digit: data.digit });
    $.pong.keyPressed(data.digit);
  }
  socket.on('keyPressed', key_pressed);

	$.pong.setup();
	$.pong.startRound();
	$(window).resize($.pong.startRound);
	$.pong.update();
});

