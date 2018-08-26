//The gameplay scene just loads the machine and other game elements
// required in the scene
//The actual machine that gets loaded should be just an implementation of the
//machine interface 

var GameplayScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new Machine();
        this.addChild(layer);
    }
});

