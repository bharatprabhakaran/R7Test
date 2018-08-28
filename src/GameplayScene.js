//The gameplay scene just loads the machine and other game elements
// required in the scene

var GameplayScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new Machine();
        this.addChild(layer);
    }
});

