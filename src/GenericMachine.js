//The gameplay scene just loads the machine and other game elements
// required in the scene
//The actual machine that gets loaded should be just an implementation of the
//machine interface 
//Write eveything here and then lets move them to different files and organise

function UserParams(betAmount, numLines) {
    //This object contains all parameters that the user has control over
    //Wouldv been a const in cpp
    this._betAmount = betAmount;
    this._numLines = numLines;
}

function MachineMathConfig() {
    this._bonusID = -1,
    this._wildSymbolID = -1,
    this._numRows = 0,
    this._numColumns = 0,
    this._payoutData = [],
    this._symbolCount = 0;
    this._reelData = []
}

var MathLogic = cc.Node.extend({

    //TODO: find out if this is an actual accepted method of short hand initialisation and property decl.
    ctor:function(){
        this._super();
        this._machineData = this.fetchMathDataFromFile();
   },

    //The following data will be retrieved from the files that pertain to 
    // the mathlogic. This container will merely contain the payout data, 
    //the actual math reels, the lines, and indicate which the special symbols 
    //are. We store the paytable and the reel data in 2d arrays. The symbol id is 
    //used directly to index the payout data.

    //I'd like to store the reelstrips here, because I'd like this class to have
    //complete ownership over all the math, including evaluation so that the RTP simulation
    //can be localised.

    fetchMathDataFromFile:function() {
        
        this._mathConfig = new MachineMathConfig();
        this._mathConfig._numRows = 3;
        this._mathConfig._numCols = 5;
        this._mathConfig._symbolCount = 7;
        this._mathConfig._wildSymbolID = 6;
        this._mathConfig._payoutData = [
            [0,5,8,12,50],
            [0,5,8,12,50],
            [0,5,8,12,50],
            [0,5,8,12,50],
            [0,5,8,12,50],
            [0,5,8,12,50],
            [0,0,0,0,0]
        ];

        this._mathConfig._reelData = [
            [0,1,6,2,5,0,1,2,4,3,3,4,6,5],
            [0,1,0,2,5,0,1,2,4,3,3,4,2,5],
            [0,6,0,2,5,0,6,2,4,3,3,6,2,5],
            [0,1,0,2,5,0,1,2,4,3,3,4,2,5],
            [0,1,0,2,6,0,1,2,4,6,3,4,2,5],
        ];

        this._mathConfig._lineData = [
            [0,1,2,3,4],
            [5,6,7,8,9],
            [10,11,12,13,14],
            [0,6,7,8,4],
            [10,6,7,8,14],
            [10,6,2,8,14],
            [0,6,12,8,4]
        ]

        return this._mathConfig;
    },
    
    GenerateSpin:function(uParams) {

        //Generate the actual indices 
        var genObj = new DefaultReelPositionSelection();
        var evalObj = new DefaultEvaluation();
        var generatedIndices = genObj.getReelIndices(this._mathConfig._reelData);
        var spinResults = evalObj.evaluateMachineState(uParams, this._mathConfig, generatedIndices);

        return spinResults;
    }
});

var ReelManager = cc.Layer.extend({
    _reelNodes:[],
    ctor:function() {
        this._super();
    },

    initializeNodes:function(mathData){
        for(var col = 0 ; col < mathData._numCols; col++) {
            //Create a node for each column and we'll be using these 
            this._reelNodes.push(new cc.Node());
            this._reelNodes[col].setPosition(300 * (col - mathData._numCols/2 + 0.5), -271 * (mathData._numRows/2 + 0.5));
            this.addChild(this._reelNodes[col]);            

            for(var i = 0; i < mathData._numCols + 2; i++){
                var indexToAdd = i % mathData._reelData[col].length;
                symbolId = mathData._reelData[col][indexToAdd];

                var symbol = new cc.Sprite(symbolRes.symbolTextures[symbolId]);
                symbol.setAnchorPoint(cc.p(0.5, 0.5));
                symbol.setPosition(0 , 271 * i);
                this._reelNodes[col].addChild(symbol);
            }
        }        
    },
 
    displayConfig:function(spinResult, mathData){
        //Function just to debug
        var reels = [];
        for(var col = 0 ; col < mathData._numCols; col++) {
            var reelStrip = [];

            for(var row = 0 ; row < mathData._numRows; row++) {
                reelStrip[row] = mathData._reelData[col][(spinResult._generatedIndices[col] + row) % mathData._reelData[col].length];
            }
            reels[col] = reelStrip;            
        }

        for(var col = 0 ; col < mathData._numCols; col++) {
            for(var row = 0 ;  row < mathData._numRows; row++) {
                var symbolId = reels[col][row];
                console.log(symbolId);
                var symbol = new cc.Sprite(symbolRes.symbolTextures[symbolId]);
                symbol.setAnchorPoint(cc.p(0.5, 0.5));
                symbol.setPosition( 300 * (col - mathData._numCols/2 + 0.5) ,271 * (mathData._numRows/2 - row - 0.5));
                this.addChild(symbol);
            }
        }
    },

    clearReelNodes:function(){
        for(var i in this._reelNodes) {
            this.removeChild(i);
        }
        this._reelNodes.length = 0;
    },
    
    initiateSpinWithParams:function(spinResult, mathData) {
        
        this.clearReelNodes();

        for(var col = 0 ; col < mathData._numCols; col++) {
            //Create a node for each column and we'll be using these 
            this._reelNodes.push(new cc.Node());
            this._reelNodes[col].setPosition(300 * (col - mathData._numCols/2 + 0.5), 271 * (mathData._numRows/2 + 0.5));
            this.addChild(this._reelNodes[col]);            

            //We need to add the n + col * offset symbols after the generatedIndex.
            var stripLength = 20;
            var offset = 1;

            for(var i = 0; i < stripLength + col * offset; i++){
                var indexToAdd = (spinResult._generatedIndices[col] + i) % mathData._reelData[col].length;
                symbolId = mathData._reelData[col][indexToAdd];

                var symbol = new cc.Sprite(symbolRes.symbolTextures[symbolId]);
                symbol.setAnchorPoint(cc.p(0.5, 0.5));
                symbol.setPosition(0 , 271 * i);
                this._reelNodes[col].addChild(symbol);
            }
        }

        //Now that the nodes with the right elements are set up, now we spawn multiple actions and move 
        //the elements in the reelstrip

        var timeOffset = 0.1;
        var reverseTime = 1;
        var symbolHeight = 271;
        var peekRatio = 0.5; //Forgot what this term was actually called. It was used to describe the reels stopping 
                             //at a point below where it is supposed to stop and then reversing back.

        for(var i = 0 ; i < this._reelNodes.length; i++) {
            var dist = -271 * (stripLength + i * offset + peekRatio * 2); //We need to consider the distance used for peeking
            
            var reverseAnticipation = new cc.EaseSineInOut(new cc.MoveBy(reverseTime + (i * 0.1), cc.p(0, symbolHeight * peekRatio)));
            var movePastTarget = new cc.EaseSineInOut(new cc.MoveBy(2 + i * timeOffset, cc.p(0, dist)));
            var reverseToTarget = new cc.EaseSineInOut(new cc.MoveBy(reverseTime, cc.p(0, symbolHeight * peekRatio)));
            this._reelNodes[i].runAction(new cc.Sequence(reverseAnticipation, movePastTarget, reverseToTarget));
        }
    }
});

var Machine = cc.Layer.extend({
    ctor:function () {
        this._super();
        var math = new MathLogic();
        var reelManager = new ReelManager();
        reelManager.setAnchorPoint(cc.p(0.5,0.5));
        reelManager.setPosition(cc.p(cc.winSize.width/2, cc.winSize.height/2));
        
        this.addChild(reelManager); 
        var generatedObj = math.GenerateSpin(new UserParams(10, 7));

        reelManager.initializeNodes(math._machineData);
        // reelManager.initiateSpinWithParams(generatedObj, math._machineData);

        var bgOverlay = new cc.Sprite(res.bg_jpg);
        bgOverlay.setAnchorPoint(cc.p(0.5, 0.5));
        bgOverlay.setPosition(cc.p(cc.winSize.width/2, cc.winSize.height/2));
        // this.addChild(bgOverlay);

        console.log(generatedObj);
        return true;    
    }
});
