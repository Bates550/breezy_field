define(function() {

	console.log('Preload');

	return function(){
		this.game.load.image('grass', 'assets/grass_tile.png');
		this.game.load.image('menu', 'assets/menu.png');
		this.game.load.image('msg_box', 'assets/message_box.png');
		this.game.load.image('sign', 'assets/sign_post.png');
		this.game.load.image('dir_sign', 'assets/directional_sign_post.png');
		this.game.load.spritesheet('lucas_walk', 'assets/lucas_walk.png', 18, 28);
    }
});