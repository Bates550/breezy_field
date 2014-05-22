define(function() {

	console.log('Create');

	return function(){
		var logo = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'grass');
		logo.anchor.setTo(0.5, 0.5);
	}
});