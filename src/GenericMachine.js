//The gameplay scene just loads the machine and other game elements
// required in the scene
//I initially wrote this file to contain a machine interface just like the eval and other elements.
//However, since the machine is just configuring the other elements to be used, it just made more sense 
//to not have this as an implementation of an interface.

//As mentioned in the comments below, the machine skin setup should be a moved to a different object altogether.

function UserParams(betAmount, numLines) {
    //This object contains all parameters that the user has control over
    //Wouldv been a const in cpp
    this._betAmount = betAmount;
    this._numLines = numLines;
}

var Machine = cc.Layer.extend({    
    ctor:function () {
        this._super();
        this._isSpinning = false;
        this._spinResult = null;
        this._scoreDisplay = null;
        this.setupLogicalComponents();
        this.setupMachineSkin();
        return true;    
    },

    setupMachineSkin:function(){

        //define symbol sizes here, Hardcoded for now, however the machine will skin will be read from a config file.
        var symbolSizes = new cc.Size(302,271);

        this._reelManager = new ReelManager(this);
        this._reelManager.initializeReelManager(this._math._machineData, symbolSizes);

        var bg = new cc.Sprite(res.bg_jpg);
        bg.setAnchorPoint(cc.p(0.5, 0.5));
        bg.setPosition(cc.p(cc.winSize.width/2, cc.winSize.height/2));
        this.addChild(bg);

        var border = new cc.Sprite(res.border_jpg);
        border.setAnchorPoint(cc.p(0.5, 0.5));
        border.setPosition(cc.p(cc.winSize.width/2, cc.winSize.height/2));
        this.addChild(border);


        var spinButton = new ccui.Button();
        spinButton.loadTextures(res.buttonSpin_jpg, res.buttonSpin_jpg);
        spinButton.setAnchorPoint(cc.p(0.5, 0.0)); //BottomCenter
        spinButton.x = cc.winSize.width/2;
        spinButton.y = 0;
        spinButton.addTouchEventListener(this.onSpinButtonPushed, this);
        this.addChild(spinButton);

        this._scoreDisplay = new cc.LabelTTF("Hit Spin!", "Arial");
        this._scoreDisplay.setFontSize(20);
        this._scoreDisplay.setAnchorPoint(cc.p(0, 1)); //Top left
        this._scoreDisplay.setPosition(cc.p(cc.winSize.width * 0.05,cc.winSize.height * 0.95));
        this._scoreDisplay.setColor(cc.color(255,0,0));
        this.addChild(this._scoreDisplay);

    },
    
    setupLogicalComponents:function(){
        //The basic reel math and other components, say minigame or bonus related?
        this._math = new MathLogic();
    },

    initiateSpinFlow:function() {
        this._isSpinning = true;
        this._spinResult = this._math.GenerateSpin(new UserParams(10, 7));
        this._reelManager.initiateSpinWithParams(this._spinResult, this._math._machineData, cc.callFunc(this.onSpinEnd, this));
    },

    onSpinEnd:function(){
        
        //Right now we just log the wins, however, we'll have to cycle through the wins here. 
        //Will have to draw the lines on top of the reels and possibly from points that are on the same z-depth as the machine skin BG.
        //This can be achieved by having another layer within the reelmanager that is added on top of the machine skin.
        //This is why the reelmanager has a _layerinstance instead of being a layer itself.
        
        this._isSpinning = false;
        this.logWins();
    },

    logWins:function() {
        if(this._spinResult._totalWinAmount > 0) {
            var text = "Total Win: " + this._spinResult._totalWinAmount;

            for(var winIndex = 0; winIndex <  this._spinResult._lineWins.length; winIndex++){
                text = text + "\n Line: " + this._spinResult._lineWins[winIndex]._line + " Winnings: " + this._spinResult._lineWins[winIndex]._amountWon;
            }

            this._scoreDisplay.setString(text);
        }
        else {
            this._scoreDisplay.setString("Hit Spin!");
        }
    },

    onSpinButtonPushed: function(sender, type){
        if(this._isSpinning) {
            return;
        }

        switch(type){
            case ccui.Widget.TOUCH_ENDED:
                this.initiateSpinFlow();
                break;
        }
    }
});
