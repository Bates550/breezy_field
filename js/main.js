(function () {
    'use strict';

    requirejs.config({
        baseUrl: "js/",
        
        paths: {
        	phaser:    'libs/phaser/phaser.min',
            preload:   'include/preload',
            create:    'include/create',
            update:    'include/update',   
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