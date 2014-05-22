(function () {
    'use strict';

    requirejs.config({
        baseUrl: "js/",
        
        paths: {
        	phaser:   'libs/phaser/phaser.min',
        },

        shim: {
        	'phaser': {
        		exports: 'Phaser'
        	}
        }
    });
 
    require(['phaser', 'game'], function (Phaser, Game) {
		var game = new Game();
		game.start();
    });
}());