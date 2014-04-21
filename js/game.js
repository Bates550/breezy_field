var window_width = document.documentElement.clientWidth; //window.screen.availWidth;
var window_height = document.documentElement.clientHeight; //window.screen.availHeight;
var game = new Phaser.Game(600, 600, Phaser.CANVAS, '', { preload: preload, create: create, update: update });

function preload() {
	game.load.image('grass', 'assets/grass_tile.png');
	game.load.spritesheet('lucas_walk', 'assets/lucas_walk.png', 18, 28);
}

var lucas = {};
var grass;
var cursors; 

function create() {
	var world_bounds = { x: 0, y: 0, w: 1421, h: 1421 };
	/*var camera_bounds = {	x: world_bounds.x-game.width/2,
							y: world_bounds.y-game.height/2,
							w: world_bounds.w+game.height/2,
							h: world_bounds.h+game.height/2 };
	*/
	game.world.setBounds(world_bounds.x, world_bounds.y, world_bounds.w, world_bounds.h);
	//game.camera.bounds = new Phaser.Rectangle(camera_bounds.x, camera_bounds.y, camera_bounds.w, camera_bounds.h);

	/* Keyboard Input */ 
	cursors = game.input.keyboard.createCursorKeys();

	/* Grass */
	grass = game.add.tileSprite(game.world.x, game.world.y, game.world.width, game.world.height, 'grass');
	grass.scale.setTo(2, 2);

	/* Lucas */
	lucas.current_direction = 'none';
	lucas.update_threshold = 7;
	lucas.last_updated = 0;
	lucas.speed = 2;
	lucas.scale = 2;
	lucas.fps = 6;

	lucas.walk = game.add.sprite(game.width/2+50, game.height/2+50, 'lucas_walk');
	lucas.walk.scale.setTo(lucas.scale, lucas.scale);
	lucas.walk.anchor.setTo(0.5, 0.5);
	game.camera.follow(lucas.walk);

	lucas.walk.animations.add('down-left', 	[4, 3, 5, 3], 		lucas.fps, true);
	lucas.walk.animations.add('down', 		[1, 0, 2, 0], 		lucas.fps, true);
	lucas.walk.animations.add('down-right', [7, 6, 8, 6], 		lucas.fps, true);
	lucas.walk.animations.add('left', 		[10, 9, 11, 9], 	lucas.fps, true);
	lucas.walk.animations.add('right', 		[13, 12, 14, 12], 	lucas.fps, true);
	lucas.walk.animations.add('up-left', 	[16, 15, 17, 15], 	lucas.fps, true);
	lucas.walk.animations.add('up-right', 	[19, 18, 20, 18], 	lucas.fps, true);
	lucas.walk.animations.add('up', 		[22, 21, 23, 21], 	lucas.fps, true);

	lucas.face_current_direction = function() {
		switch(lucas.current_direction) {
			case 'down':
				lucas.walk.animations.frame = 0;
				break;
			case 'down-left':
				lucas.walk.animations.frame = 3;
				break;
			case 'down-right':
				lucas.walk.animations.frame = 6;			
				break;
			case 'left':
				lucas.walk.animations.frame = 9;
				break;
			case 'right':
				lucas.walk.animations.frame = 12;
				break;
			case 'up-left':
				lucas.walk.animations.frame = 15;
				break;
			case 'up-right':
				lucas.walk.animations.frame = 18;
				break;
			case 'up':
				lucas.walk.animations.frame = 21;
				break;
		}
	}
}

function update() {
	var kb_in = kb_input();
	update_lucas(kb_in);
}

function update_lucas(kb_in) {
	lucas.last_updated++;
	var update_direction = false;
	var wrap_overshoot = 36;

	/* Map wrapping */
	// If going farther would cause the camera to display something outside of the game world
	// put lucas on the opposite side of the world such that it loops (and there is no escaping!)
	if (lucas.walk.x <= (game.world.bounds.x+game.width/2) ) {
		console.log(lucas.walk.x, game.world.bounds.x);
		lucas.walk.x = game.world.bounds.width-game.width/2-wrap_overshoot;
	}
	if (lucas.walk.x >= (game.world.bounds.width-game.width/2) ) {
		console.log(lucas.walk.x, game.world.bounds.width);
		lucas.walk.x = game.world.bounds.x+game.width/2+wrap_overshoot;
	}
	if (lucas.walk.y <= game.world.bounds.y+game.height/2) {
		console.log(lucas.walk.y, game.world.bounds.y);
		lucas.walk.y = game.world.bounds.height-game.height/2-wrap_overshoot;
	}
	if (lucas.walk.y >= game.world.bounds.height-game.height/2) {
		console.log(lucas.walk.y, game.world.bounds.height);
		lucas.walk.y = game.world.bounds.y+game.height/2+wrap_overshoot;
	}

	// Potential error condition if a player moves in the same direction for a REALLY long time (like 4.8 million years)
	// 9007199254740992*(1/60)*(1/3600)*(1/24)*(1/7)*(1/52)
	// ^-max safe int-^^1/fps^ ^-s/h-^  ^h/dy^^dy/wk^^wk/yr^
	if (lucas.last_updated == Number.MAX_SAFE_INTEGER) {
		lucas.last_updated = 0;
	}

	// If keyboard input is in a different direction than the current direction 
	// AND the object has not been recently updated:
	// update the position, current direction, and animation
	// Else update only the position
	if ( (kb_in != lucas.current_direction) && (lucas.last_updated % lucas.update_threshold == 0) ) {
		update_direction = true;
		lucas.last_updated = 0;
	}
	if (kb_in == 'down-left') {
		lucas.walk.x -= lucas.speed;
		lucas.walk.y += lucas.speed;
		if (update_direction) {
			lucas.current_direction = 'down-left';
			lucas.walk.animations.play('down-left');
		}
	}
	else if (kb_in == 'down-right') {
		lucas.walk.x += lucas.speed;
		lucas.walk.y += lucas.speed;
		if (update_direction) {
			lucas.current_direction = 'down-right';
			lucas.walk.animations.play('down-right');
		}
	}
	else if (kb_in == 'up-left') {
		lucas.walk.x -= lucas.speed;
		lucas.walk.y -= lucas.speed;
		if (update_direction) {	
			lucas.current_direction = 'up-left';
			lucas.walk.animations.play('up-left');
		}
	}
	else if (kb_in == 'up-right') {
		lucas.walk.x += lucas.speed;
		lucas.walk.y -= lucas.speed;
		if (update_direction) {	
			lucas.current_direction = 'up-right';
			lucas.walk.animations.play('up-right');
		}
	}
	else if (kb_in == 'down') {
		lucas.walk.y += lucas.speed;
		if (update_direction) {	
			lucas.current_direction = 'down';
			lucas.walk.animations.play('down');
		}
	}
	else if (kb_in == 'up') {
		lucas.walk.y -= lucas.speed;
		if (update_direction) {
			lucas.current_direction = 'up';
			lucas.walk.animations.play('up');
		}
	}
	else if (kb_in == 'left') {
		lucas.walk.x -= lucas.speed;
		if (update_direction) {	
			lucas.current_direction = 'left';
			lucas.walk.animations.play('left');
		}
	}
	else if (kb_in == 'right') {
		lucas.walk.x += lucas.speed;
		if (update_direction) {	
			lucas.current_direction = 'right';
			lucas.walk.animations.play('right');
		}
	}
	else {
		lucas.face_current_direction();
	}
}

// If both left and right or both up and down are pressed kb_input will return a nonsense value. 
function kb_input() {
	var result 	= "";
	var right 	= cursors.right.isDown;	//game.input.keyboard.isDown(Phaser.Keyboard.RIGHT);
	var left 	= cursors.left.isDown;	//game.input.keyboard.isDown(Phaser.Keyboard.LEFT);
	var down 	= cursors.down.isDown;	//game.input.keyboard.isDown(Phaser.Keyboard.DOWN);
	var up 		= cursors.up.isDown;	//game.input.keyboard.isDown(Phaser.Keyboard.UP);

	if (up) {
		if (result !== "") {
			result += '-';
		}
		result += 'up';
	}
	if (down) {
		if (result !== "") {
			result += '-';
		}
		result += 'down';
	}
	if (left) {
		if (result !== "") {
			result += '-';
		}
		result += 'left';
	} 
	if (right) {
		if (result !== "") {
			result += '-';
		}
		result += 'right';
	}

	return result;
}

function render() {
    game.debug.spriteInfo(lucas.walk, 20, 32);

}