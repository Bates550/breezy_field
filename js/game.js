var window_width = document.documentElement.clientWidth; //window.screen.availWidth;
var window_height = document.documentElement.clientHeight; //window.screen.availHeight;
var game = new Phaser.Game(600, 600, Phaser.CANVAS, '', { preload: preload, create: create, update: update });

function preload() {
	game.load.image('grass', 'assets/grass_tile.png');
	game.load.image('menu', 'assets/menu.png');
	game.load.image('msg_box', 'assets/message_box.png');
	game.load.image('sign', 'assets/sign_post.png');
	game.load.image('dir_sign', 'assets/directional_sign_post.png');
	game.load.spritesheet('lucas_walk', 'assets/lucas_walk.png', 18, 28);
}

var cursors; 
var pause_key;
var interact_key;
var pause = false;
var lucas = {};
var grass;
var signs = {};
var menu = {};
var msg_box;
var main_group;

/* General function for box collision detection. 
 * Should be assigned as a method to an object with x, y, width, and height 
 * properties and passed in an object also containing said properties.
 * Padding is added to the object box dimensions such that the object
 * behaves as if it were bigger than it actually is. 
 * Additionally, caller and object should be anchored in their centers. 
 * SOMETHING ABOUT THE RETURN VALUE OF THIS MONSTER GOES HERE.
 */
function collide(object, xpad, ypad, wpad, hpad) {
	xpad = typeof xpad !== 'undefined' ? xpad : 0;
	ypad = typeof ypad !== 'undefined' ? ypad : 0;
	wpad = typeof wpad !== 'undefined' ? wpad : 0;
	hpad = typeof hpad !== 'undefined' ? hpad : 0;

	var up 			= false, 
		down 		= false, 
		left 		= false, 
		right 		= false, 
		inwidth 	= false, 
		inheight 	= false;
	var result = {
		up: 	false,
		down: 	false,
		left: 	false,
		right: 	false
	};

	var tx1 = (this.x-this.width/2); 			// Left edge of this
	var ox1 = (object.x-object.width/2-xpad);	// Left edge of object
	var tx2 = (this.x+this.width/2);			// Right edge of this
	var ox2 = (object.x+object.width/2+wpad);	// Left edge of object
	var ty1 = (this.y-this.height/2);			// Top edge of this
	var oy1 = (object.y-object.height/2-ypad);	// Top edge of object
	var ty2 = (this.y+this.height/2);			// Bottom edge of this
	var oy2 = (object.y+object.height/2+hpad);	// Bottom edge of object

	console.assert(tx2 > tx1, "Left edge of this is at a larger x coordinate than the right.");
	console.assert(ty2 > ty1, "Top edge of this is at a larger y coordinate than the bottom.");		
	console.assert(ox2 > ox1, "Left edge of object is at a larger x coordinate than the right.");
	console.assert(oy2 > oy1, "Top edge of object is at a larger y coordinate than the bottom.");

	/* Determine conditions for collision */
	if (ty1 <= oy2 && ty1 > oy1) { // Top edge of this <= bottom edge of object
		up = true;					// AND top edge of this >= top edge of object
	}
	if (ty2 > oy1 && ty2 <= oy2) { // Bottom edge of this >= top edge of object
		down = true;				// AND bottom edge of this <= bottom edge of object
	}
	if (tx1 <= ox2 && tx1 > ox1) { // Left edge of this <= right edge of object
		left = true;				// AND left edge of this >= left edge of object
	}
	if (tx2 > ox1 && tx2 <= ox2) { // Right edge of this >= left edge of object
		right = true;				// AND right edge of this <= right edge of object
	}
	if (tx1 <= ox1 && tx2 > ox2) { // Left edge of this <= left edge of object
		inwidth = true;				// AND right edge of this >= right edge of object
	}
	if (ty1 <= oy1 && ty2 > oy2) { // Top edge of this <= top edge of object
		inheight = true;			// Bottom edge of this >= bottom edge of object
	}

	/* Determine direction of collision */
	if ((up && (right || left)) || (up && inwidth)) {
		result.up = true; 
	}	
	if ((down && (right || left)) || (down && inwidth)) {
		result.down = true;
	}
	if ((left && (up || down)) || (left && inheight)) {
		result.left = true; 
	}
	if ((right && (up || down)) || (right && inheight)) {
		result.right = true;
	}

	if (result.up || result.down || result.left || result.right)
		this.colliding = {
			obj: object,
			direction: result
		}
	else 
		this.colliding = undefined;
	//console.log(this.colliding);

	/*if ( (result.up || result.down || result.left || result.right) && game.input.keyboard.justPressed(Phaser.Keyboard.A, 25) ) {
		if (typeof object.interact == 'function') { // Make sure object has an interact method
			object.interact(this);
		}
	}*/
	return result;
}

function create() {
	/* World Bounds */
	var world_bounds = { x: 0, y: 0, w: 1420, h: 1420 };
	game.world.setBounds(world_bounds.x, world_bounds.y, world_bounds.w, world_bounds.h);

	/* Keyboard Input */ 
	cursors = game.input.keyboard.createCursorKeys();
	pause_key = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	pause_key.onDown.add(function() {
		if (menu.found) {
			pause = !pause;
			menu.pause();
		}
	}, this);

	interact_key = game.input.keyboard.addKey(Phaser.Keyboard.A);
	interact_key.onDown.add(function() {
		if (game.input.keyboard.justPressed(Phaser.Keyboard.A, 25) && (lucas.colliding != undefined) ) {
			lucas.colliding.obj.interact(lucas, lucas.colliding.direction);
		}
	}, this);

	/* Grass */
	grass = game.add.tileSprite(game.world.x, game.world.y, game.world.width, game.world.height, 'grass');
	grass.scale.setTo(2, 2);

	/* Message Box */
	msg_box = game.add.sprite(game.width/2, game.height/2, 'msg_box');
	msg_box.anchor.setTo(0.5, 0.5);
	msg_box.exists = false;
	msg_box.text = game.add.text(0, 0, "Sometimes when you're stuck, the best thing to do is keep moving forward...", 
		{ 	font: "10pt Courier", 
			wordWrap: true,
			wordWrapWidth: msg_box.width
		});
	msg_box.text.anchor.setTo(0.5, 0.5);

	/* Main Group -- contains all interactive and collidable sprites */
	main_group = game.add.group();

	/* Signs */
	signs.sign1 = main_group.create(game.world.width/2+30, game.world.y+game.world.height/2, 'sign');
	signs.sign1.scale.setTo(2, 2);
	signs.sign1.anchor.setTo(0.5, 0.5);
	signs.sign1.interact = function(object, collision_direction) {
		if (collision_direction.up) {
			// Update message box coords
			msg_box.x = lucas.x;
			msg_box.y = lucas.y+237;
			msg_box.text.x = lucas.x;
			msg_box.text.y = lucas.y+237;

			if (msg_box.exists) {
				msg_box.exists = false;
				msg_box.text.setText("");
			}
			else {
				msg_box.exists = true;
				msg_box.text.setText("Sometimes when you're stuck, the best thing to do is keep moving forward...")
			}

			pause = !pause;
		}
	}

	signs.sign2 = main_group.create(game.world.width/2-30, game.world.y+game.world.height/2, 'dir_sign');
	signs.sign2.scale.setTo(2, 2);
	signs.sign2.anchor.setTo(0.5, 0.5);
	signs.sign2.interact = function(object, collision_direction) {
		if (collision_direction.up) {
			// Update message box coords
			msg_box.x = lucas.x;
			msg_box.y = lucas.y+237;
			msg_box.text.x = lucas.x;
			msg_box.text.y = lucas.y+237;

			if (msg_box.exists) {
				msg_box.exists = false;
				msg_box.text.setText("");
			}
			else {
				msg_box.exists = true;
				msg_box.text.setText("North: South\nEast: West\nSouth: North\nWest: East");
			}

			pause = !pause;
		}
	}

	/* Lucas */
	lucas.current_direction = 'none';
	lucas.colliding = undefined;
	lucas.collision = {up: false, down: false, left: false, right: false}
	lucas.update_threshold = 7;
	lucas.last_updated = 0;
	lucas.speed = 2;
	lucas.scale = 2;
	lucas.fps = 6;
	lucas.x = 690; //game.width/2;
	lucas.y = 650;//game.height/2;

	lucas.walk = main_group.create(lucas.x, lucas.y, 'lucas_walk');
	lucas.walk.scale.setTo(lucas.scale, lucas.scale);
	lucas.walk.anchor.setTo(0.5, 0.5);
	game.camera.follow(lucas.walk);

	lucas.width = lucas.walk.width;
	lucas.height = lucas.walk.height;

	lucas.walk.animations.add('down-left', 	[4, 3, 5, 3], 		lucas.fps, true);
	lucas.walk.animations.add('down', 		[1, 0, 2, 0], 		lucas.fps, true);
	lucas.walk.animations.add('down-right', [7, 6, 8, 6], 		lucas.fps, true);
	lucas.walk.animations.add('left', 		[10, 9, 11, 9], 	lucas.fps, true);
	lucas.walk.animations.add('right', 		[13, 12, 14, 12], 	lucas.fps, true);
	lucas.walk.animations.add('up-left', 	[16, 15, 17, 15], 	lucas.fps, true);
	lucas.walk.animations.add('up-right', 	[19, 18, 20, 18], 	lucas.fps, true);
	lucas.walk.animations.add('up', 		[22, 21, 23, 21], 	lucas.fps, true);

	lucas.collide = collide;

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
	menu.found = false; // Becomes true when the player finds the menu item and grants access to the menu.
	menu.appear = false; // Becomes true when the player walks in one direction for long enough; causes menu bot to appear.
	menu.x = game.width/2;
	menu.y = game.height/2;

	menu.spr = game.add.sprite(0, 0, 'menu');
	menu.spr.exists = false;

	menu.pause = function() {
		menu.spr.exists = !menu.spr.exists;
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
	main_group.sort('y', Phaser.Group.SORT_ASCENDING);
}

function update_menu(kb_in) {
	menu.x = lucas.x - game.width/2 + 100;
	menu.y = lucas.y - game.height/2 + 100;

	menu.spr.x = menu.x;
	menu.spr.y = menu.y;


}

function update_lucas(kb_in) {
	lucas.last_updated++;
	var update_direction = false;
	var wrap_overshoot = 36;

	if (!menu.found) {
		if (lucas.last_updated > 100) {
			menu.appear = true; 
			// Do some stuff to spawn the menu bot. 
		}
	}

	var collision = lucas.collision = lucas.collide(signs.sign1, -5, -15, -5, -35);

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
		if (!collision.down && !collision.left) {
			lucas.walk.x -= lucas.speed;
			lucas.walk.y += lucas.speed;
		}
		else if (collision.down) {
			lucas.walk.x -= lucas.speed;
		}
		else if (collision.left) {
			lucas.walk.y += lucas.speed;
		}
		if (update_direction) {
			lucas.current_direction = 'down-left';
			lucas.walk.animations.play('down-left');
		}
	}
	else if (kb_in == 'down-right') {
		if (!collision.down && !collision.right) {
			lucas.walk.x += lucas.speed;
			lucas.walk.y += lucas.speed;
		}
		else if (collision.down) {
			lucas.walk.x += lucas.speed;
		}
		else if (collision.right) {
			lucas.walk.y += lucas.speed;
		}
		if (update_direction) {
			lucas.current_direction = 'down-right';
			lucas.walk.animations.play('down-right');
		}
	}
	else if (kb_in == 'up-left') {
		if (!collision.up && !collision.left) {
			lucas.walk.x -= lucas.speed;
			lucas.walk.y -= lucas.speed;
		}
		else if (collision.up) {
			lucas.walk.x -= lucas.speed;
		}
		else if (collision.left) {
			lucas.walk.y -= lucas.speed;
		}
		if (update_direction) {	
			lucas.current_direction = 'up-left';
			lucas.walk.animations.play('up-left');
		}
	}
	else if (kb_in == 'up-right') {
		if (!collision.up && !collision.right) {
			lucas.walk.x += lucas.speed;
			lucas.walk.y -= lucas.speed;
		}
		else if (collision.up) {
			lucas.walk.x += lucas.speed;
		}
		else if (collision.right) {
			lucas.walk.y -= lucas.speed;
		}
		if (update_direction) {	
			lucas.current_direction = 'up-right';
			lucas.walk.animations.play('up-right');
		}
	}
	else if (kb_in == 'down') {
		if (!collision.down) 
			lucas.walk.y += lucas.speed;
		if (update_direction) {	
			lucas.current_direction = 'down';
			lucas.walk.animations.play('down');
		}
	}
	else if (kb_in == 'up') {
		if (!collision.up)
			lucas.walk.y -= lucas.speed;
		if (update_direction) {
			lucas.current_direction = 'up';
			lucas.walk.animations.play('up');
		}
	}
	else if (kb_in == 'left') {
		if (!collision.left)
			lucas.walk.x -= lucas.speed;
		if (update_direction) {	
			lucas.current_direction = 'left';
			lucas.walk.animations.play('left');
		}
	}
	else if (kb_in == 'right') {
		if (!collision.right)
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