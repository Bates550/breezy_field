define([
    'phaser'
], function (Phaser) { 
    'use strict';

    function Game() {    
        console.log('Making the Game');    
    }
    
    Game.prototype = {
    	constructor: Game,

        start: function() {
            this.game = new Phaser.Game(600, 600, Phaser.CANVAS, '', { 
                preload: this.preload, 
                create: this.create 
            });
        },

        preload: function() {
            this.game.load.image('grass', 'assets/grass_tile.png');
            this.game.load.image('menu', 'assets/menu.png');
            this.game.load.image('msg_box', 'assets/message_box.png');
            this.game.load.image('sign', 'assets/sign_post.png');
            this.game.load.image('dir_sign', 'assets/directional_sign_post.png');
            this.game.load.spritesheet('lucas_walk', 'assets/lucas_walk.png', 18, 28);
        },

        create: function() {
            var logo = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'grass');
            logo.anchor.setTo(0.5, 0.5);
        }
    };
    
    return Game;
});