define([
    'phaser', 'preload', 'create', 'update'
], function (Phaser, preload, create, update) { 
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

        preload: preload,

        create: create,

        update: update,
    };
    
    return Game;
});