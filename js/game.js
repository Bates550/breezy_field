var window_width = document.documentElement.clientWidth; //window.screen.availWidth;
var window_height = document.documentElement.clientHeight; //window.screen.availHeight;
var game = new Phaser.Game(600, 600, Phaser.CANVAS, '', { preload: preload, create: create, update: update });

function preload() {
	game.load.image('grass', 'assets/grass_tile.png');
	game.load.image('menu', 'assets/menu.png')
	/*
	game.load.image('menu_bg', 'assets/menu/bg.png');
	game.load.image('menu_active_a', 'assets/menu/active_a.png');
	game.load.image('menu_active_b', 'assets/menu/active_b.png');
	*/
	game.load.spritesheet('lucas_walk', 'assets/lucas_walk.png', 18, 28);
}

var cursors; 
var pause_key;
var pause = false;
var lucas = {};
var grass;
var menu = {};
/*
var menu_bg;
var menu_item_bg;
*/

function create() {
	/* World Bounds */
	var world_bounds = { x: 0, y: 0, w: 1420, h: 1420 };
	game.world.setBounds(world_bounds.x, world_bounds.y, world_bounds.w, world_bounds.h);

	/* Keyboard Input */ 
	cursors = game.input.keyboard.createCursorKeys();
	pause_key = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	console.log(game.input.keyboard.keys);
	pause_key.onDown.add(function() {
		pause = !pause;
		menu.pause();
	}, this);

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
	lucas.x = game.width/2;
	lucas.y = game.height/2;

	lucas.walk = game.add.sprite(lucas.x, lucas.y, 'lucas_walk');
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

	/* Menu Background */
	menu.exists = false;
	menu.x = game.width/2;
	menu.y = game.height/2;
	//menu.spr = {};

	/*
	// Doesn't matter where we intially place any of the menu sprites: 
	// their position will be updated in update_menu() before they are visible.
	var menu_bg = game.add.sprite(0, 0, 'menu_bg');
	menu_bg.exists = false;
	menu.spr['bg'] = menu_bg;

	var menu_active_a = game.add.sprite(0, 0, 'menu_active_a');
	menu_active_a.exists = false;
	menu.spr['menu_active_a'] = menu_active_a;

	var menu_active_b = game.add.sprite(0, 0, 'menu_active_b');
	menu_active_b.exists = false;
	menu.spr['menu_active_b'] = menu_active_b;
	*/

	menu.spr = game.add.sprite(0, 0, 'menu');
	menu.spr.exists = false;

	menu.pause = function() {
		menu.spr.exists = !menu.spr.exists;
		/*
		menu.spr['bg'].exists 	= !menu.spr['bg'].exists;
		menu.spr['menu_active_a'].exists	= !menu.spr['menu_active_a'].exists;
		menu.spr['menu_active_b'].exists	= !menu.spr['menu_active_b'].exists;
		*/
	}
}

function update() {
	var kb_in = kb_input();
	if (!pause) {
		update_lucas(kb_in);
	}
	else {
		update_menu(kb_in);
	}
}

function update_menu(kb_in) {
	menu.x = lucas.x - game.width/2 + 100;
	menu.y = lucas.y - game.height/2 + 100;

	menu.spr.x = menu.x;
	menu.spr.y = menu.y;
	 
	/*
	menu.spr['bg'].x = menu.x;
	menu.spr['bg'].y = menu.y;

	menu.spr['menu_active_a'].x = menu.x + 15;
	menu.spr['menu_active_a'].y = menu.y + 15;	

	menu.spr['menu_active_b'].x = menu.x + 15;
	menu.spr['menu_active_b'].y = menu.y + 145;	
	*/

	/*for (var key in menu.spr) {
		var sprite = menu.spr[key];
		sprite.x = menu.x;
		sprite.y = menu.y;
		//menu.spr[key].exists = menu.exists;
	}*/
}

function update_lucas(kb_in) {
	lucas.last_updated++;
	var update_direction = false;
	var wrap_overshoot = 36;

	/* Map wrapping */
	// If going farther would cause the camera to display something outside of the game world
	// put lucas on the opposite side of the world such that it loops (and there is no escaping!)
	if (lucas.walk.x <= (game.world.bounds.x+game.width/2) ) {
		lucas.walk.x = game.world.bounds.width-game.width/2-wrap_overshoot;
	}
	if (lucas.walk.x >= (game.world.bounds.width-game.width/2) ) {
		lucas.walk.x = game.world.bounds.x+game.width/2+wrap_overshoot;
	}
	if (lucas.walk.y <= game.world.bounds.y+game.height/2) {
		lucas.walk.y = game.world.bounds.height-game.height/2-wrap_overshoot;
	}
	if (lucas.walk.y >= game.world.bounds.height-game.height/2) {
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

	// Update lucas container coords
	lucas.x = lucas.walk.x;
	lucas.y = lucas.walk.y;
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