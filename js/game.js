var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', { preload: preload, create: create, update: update });

function preload() {
	game.load.image('sky', 'assets/sky.png');
	game.load.spritesheet('lucas_walk', 'assets/lucas_walk.png', 18, 28);

}

var lucas_walk;

//var cursors;

function create() {
	game.add.sprite(0, 0, 'sky');
	lucas_walk = game.add.sprite(game.width/2, game.height/2, 'lucas_walk');
	lucas_walk.current_direction = 'down';
	lucas_walk.scale.setTo(2, 2);

	lucas_walk.animations.add('down', 		[1, 2], 	8, true);
	lucas_walk.animations.add('down-left', 	[4, 5], 	8, true);
	lucas_walk.animations.add('down-right', [7, 8], 	8, true);
	lucas_walk.animations.add('left', 		[10, 11], 	8, true);
	lucas_walk.animations.add('right', 		[13, 14], 	8, true);
	lucas_walk.animations.add('up-left', 	[16, 17], 	8, true);
	lucas_walk.animations.add('up-right', 	[19, 20], 	8, true);
	lucas_walk.animations.add('up', 		[22, 23], 	8, true);


//lucas_walk.animations.play('down');
	//cursors = game.input.keyboard.createCursorKeys();

}

function update() {
	if (!( kb_input('down') && kb_input('up') || kb_input('left') && kb_input('right') )) {
		if (kb_input('down') && kb_input('left')) {
			lucas_walk.x -= 2;
			lucas_walk.y += 2;
			lucas_walk.current_direction = 'down-left';
			lucas_walk.animations.play('down-left');
		}
		else if (kb_input('down') && kb_input('right')) {
			lucas_walk.x += 2;
			lucas_walk.y += 2;
			lucas_walk.current_direction = 'down-right';
			lucas_walk.animations.play('down-right');
		}
		else if (kb_input('up') && kb_input('left')) {
			lucas_walk.x -= 2;
			lucas_walk.y -= 2;
			lucas_walk.current_direction = 'up-left';
			lucas_walk.animations.play('up-left');
		}
		else if (kb_input('up') && kb_input('right')) {
			lucas_walk.x += 2;
			lucas_walk.y -= 2;
			lucas_walk.current_direction = 'up-right';
			lucas_walk.animations.play('up-right');
		}
		else if (kb_input('down')) {
			lucas_walk.y += 2;
			lucas_walk.current_direction = 'down';
			lucas_walk.animations.play('down');
		}
		else if (kb_input('up')) {
			lucas_walk.y -= 2;
			lucas_walk.current_direction = 'up';
			lucas_walk.animations.play('up');
		}
		else if (kb_input('left')) {
			lucas_walk.x -= 2;
			lucas_walk.current_direction = 'left';
			lucas_walk.animations.play('left');
		}
		else if (kb_input('right')) {
			lucas_walk.x += 2;
			lucas_walk.current_direction = 'right';
			lucas_walk.animations.play('right');
		}

	}
	else {
		// walk in current direction.
		// lucas_walk.walk_current_direction();
	}

/*    else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
        lucas_walk.x += 2;
        lucas_walk.animations.play('right');
    }

	if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
		lucas_walk.y -= 2;
		lucas_walk.animations.play('up');
	}
	else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
		lucas_walk.y += 2;
		lucas_walk.animations.play('down');
	}
/*	else {
		lucas_walk.animations.stop();
		lucas_walk.frame = 5;
	}*/


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
    game.debug.spriteInfo(lucas_walk, 20, 32);

}