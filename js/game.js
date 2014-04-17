var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', { preload: preload, create: create, update: update });

function preload() {
	game.load.image('grass', 'assets/grass_tile.png');
	game.load.spritesheet('lucas_walk', 'assets/lucas_walk.png', 18, 28);

}

var lucas = {};
//var lucas_walk;
var grass;
//var cursors;

function create() {
	/* Grass */
	grass = game.add.tileSprite(0, 0, game.width, game.height, 'grass');
	grass.scale.setTo(2, 2);

	/* Lucas */
	lucas.current_direction = 'down';
	lucas.update_threshold = 5;
	lucas.last_updated = lucas.update_threshold;
	lucas.speed = 2;
	lucas.scale = 2;
	lucas.fps = 6;

	lucas.walk = game.add.sprite(game.width/2, game.height/2, 'lucas_walk');
	lucas.walk.scale.setTo(lucas.scale, lucas.scale);

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
	lucas.last_updated++;
	console.log(lucas.current_direction);

	if (!( kb_input('down') && kb_input('up') || kb_input('left') && kb_input('right') )) {
		if (kb_input('down') && kb_input('left')) {
			lucas.walk.x -= lucas.speed;
			lucas.walk.y += lucas.speed;
			if (lucas.last_updated > lucas.update_threshold && lucas.current_direction != 'down-left') {			
				lucas.current_direction = 'down-left';
				lucas.last_updated = 0;
				lucas.walk.animations.play('down-left');
			}
		}
		else if (kb_input('down') && kb_input('right')) {
			lucas.walk.x += lucas.speed;
			lucas.walk.y += lucas.speed;
			if (lucas.last_updated > lucas.update_threshold && lucas.current_direction != 'down-right') {	
				lucas.current_direction = 'down-right';
				lucas.last_updated = 0;
				lucas.walk.animations.play('down-right');
			}
		}
		else if (kb_input('up') && kb_input('left')) {
			lucas.walk.x -= lucas.speed;
			lucas.walk.y -= lucas.speed;
			if (lucas.last_updated > lucas.update_threshold && lucas.current_direction != 'up-left') {	
				lucas.current_direction = 'up-left';
				lucas.last_updated = 0;
				lucas.walk.animations.play('up-left');
			}
		}
		else if (kb_input('up') && kb_input('right')) {
			lucas.walk.x += lucas.speed;
			lucas.walk.y -= lucas.speed;
			if (lucas.last_updated > lucas.update_threshold && lucas.current_direction != 'up-right') {	
				lucas.current_direction = 'up-right';
				lucas.last_updated = 0;
				lucas.walk.animations.play('up-right');
			}
		}
		else if (kb_input('down')) {
			lucas.walk.y += lucas.speed;
			if (lucas.last_updated > lucas.update_threshold && lucas.current_direction != 'down') {	
				lucas.current_direction = 'down';
				lucas.last_updated = 0;
				lucas.walk.animations.play('down');
			}
		}
		else if (kb_input('up')) {
			lucas.walk.y -= lucas.speed;
			if (lucas.last_updated > lucas.update_threshold && lucas.current_direction != 'up') {
				lucas.current_direction = 'up';
				lucas.last_updated = 0;
				lucas.walk.animations.play('up');
			}
		}
		else if (kb_input('left')) {
			lucas.walk.x -= lucas.speed;
			if (lucas.last_updated > lucas.update_threshold && lucas.current_direction != 'left') {	
				lucas.last_updated = 0;
				lucas.current_direction = 'left';
				lucas.walk.animations.play('left');
			}
		}
		else if (kb_input('right')) {
			lucas.walk.x += lucas.speed;
			if (lucas.last_updated > lucas.update_threshold && lucas.current_direction != 'right') {	
				lucas.last_updated = 0;
				lucas.current_direction = 'right';
				lucas.walk.animations.play('right');
			}
		}
		else {
			// walk in current direction.
			
			lucas.face_current_direction();
		}
	}
}

function kb_input(direction) {
	switch (direction) {
	case 'left':
		return game.input.keyboard.isDown(Phaser.Keyboard.LEFT);
		break;
	case 'right':
		return game.input.keyboard.isDown(Phaser.Keyboard.RIGHT);
		break;
	case 'up':
		return game.input.keyboard.isDown(Phaser.Keyboard.UP);
		break;
	case 'down':
		return game.input.keyboard.isDown(Phaser.Keyboard.DOWN);
		break;
	}
}

function render() {
    game.debug.spriteInfo(lucas.walk, 20, 32);

}