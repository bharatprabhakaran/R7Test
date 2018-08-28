var IReelManager = function() {
    if (this.constructor === IReelManager) {
       throw new Error("Abstract class!");
     }
};

IReelManager.prototype.initializeReelManager = function(mathData, size) {
    throw new Error("Abstract method!");
 }
 
 IReelManager.prototype.initiateSpinWithParams = function(spinResult, mathData) {
    throw new Error("Abstract method!");
 }

 IReelManager.prototype.setupAndInitiateReelMotion = function(callback) {
    throw new Error("Abstract method!");
 }

 IReelManager.prototype.repopulateReels = function(spinResult, mathData) {
    throw new Error("Abstract method!");
 }

 //An implementation of the above reelmanager interface.

 var ReelManager = function(parent) {
    IReelManager.apply(this);
    this._symbolWidth = 0;
    this._symbolHeight = 0;
    this.numSymbolsAddedByCol = [];
    this._reelNodes = [];
    this._symbolsToCarryOver = [];  //This all the symbols that have to be carried over between spins.
    this.layerInstance = new cc.Layer();
    this.parentInstance = parent;
    this.layerInstance.setAnchorPoint(cc.p(0.5,0.5));
    this.layerInstance.setPosition(cc.p(cc.winSize.width/2, cc.winSize.height/2));
    this.parentInstance.addChild(this.layerInstance);
 }

ReelManager.prototype = Object.create(IReelManager.prototype);
ReelManager.prototype.constructor = ReelManager;

ReelManager.prototype.getLayer = function() {
    return this.layerInstance;
}

ReelManager.prototype.clearReelNodes = function(){
    for(var i = 0; i < this._reelNodes.length; i++) {
        this.layerInstance.removeChild(this._reelNodes[i], true);
    }
    this._reelNodes.length = 0;
}

ReelManager.prototype.initializeReelManager = function(mathData, symbolSize){

    this._symbolHeight = symbolSize.height;
    this._symbolWidth = symbolSize.width;

    for(var col = 0 ; col < mathData._numCols; col++) {
        //Create a node for each column and we'll be using these 
        this._reelNodes.push(new cc.Node());
        this._reelNodes[col].setPosition(this._symbolWidth * (col - mathData._numCols/2 + 0.5), this._symbolHeight * (mathData._numRows/2 + 0.5));
        this.layerInstance.addChild(this._reelNodes[col]);
        var symbolsInCol = [];      

        for(var i = 0; i < mathData._numRows + 2; i++){
            var indexToAdd = i % mathData._reelData[col].length;
            symbolId = mathData._reelData[col][indexToAdd];
            symbolsInCol[i] = symbolId;

            var symbol = new cc.Sprite(symbolRes.symbolTextures[symbolId]);
            symbol.setAnchorPoint(cc.p(0.5, 0.5));
            symbol.setPosition(0 , -this._symbolHeight * i);
            this._reelNodes[col].addChild(symbol);
        }
        this._symbolsToCarryOver[col] = symbolsInCol;
    }
}

ReelManager.prototype.initiateSpinWithParams = function(spinResult, mathData, callback) {
    this.clearReelNodes();
    this.numSymbolsAddedByCol = []
    
    this.repopulateReels(spinResult, mathData);
    this.setupAndInitiateReelMotion(callback);
}

ReelManager.prototype.repopulateReels = function(spinResult, mathData){ 
    
    //Multiple things happen within this one loop
    //For each colum:
    //1. we first create the reel node.
    //2. we add the symbol before the generated index for the peakin effect.
    //3. we add striplength + offset * colIndex to the node.
    //4. we add the symbols that are currently on screen to the reel.
    //5. we position the entire reelnode for the spin 
    //6. we update the list of symbols to be added in the next iteration's step 4

    for(var col = 0 ; col < mathData._numCols; col++) {
        //Create a node for each column and we'll be using these 
        this._reelNodes.push(new cc.Node());
        this.layerInstance.addChild(this._reelNodes[col]);            

        //We need to add the n + col * offset symbols after the generatedIndex.
        var stripLength = 20;
        var offset = 2;
        var symbolsInColToCarry = [];
        var totalSymbolsAdded = 0;

        var indexToAdd = (spinResult._generatedIndices[col] - 1) % mathData._reelData[col].length;
        indexToAdd = Math.abs(indexToAdd);
        symbolId = mathData._reelData[col][indexToAdd];

        //This is the peaking symbol added specifically for visuals, will have to be carried.
        //adding it here.
        symbolsInColToCarry[totalSymbolsAdded] = symbolId;

        var symbol = new cc.Sprite(symbolRes.symbolTextures[symbolId]);
        symbol.setAnchorPoint(cc.p(0.5, 0.5));
        symbol.setPosition(0 , -this._symbolHeight * -1);
        this._reelNodes[col].addChild(symbol);
        totalSymbolsAdded++;

        for(var i = 0; i < stripLength + col * offset; i++){
            var indexToAdd = (spinResult._generatedIndices[col] + i) % mathData._reelData[col].length;
            indexToAdd = Math.abs(indexToAdd);
            symbolId = mathData._reelData[col][indexToAdd];

            var symbol = new cc.Sprite(symbolRes.symbolTextures[symbolId]);
            symbol.setAnchorPoint(cc.p(0.5, 0.5));
            symbol.setPosition(0 , -this._symbolHeight * i);
            this._reelNodes[col].addChild(symbol);

            if(totalSymbolsAdded < mathData._numRows + 2) {
                symbolsInColToCarry[totalSymbolsAdded] = symbolId; 
            }

            totalSymbolsAdded++;
        }

        for(var i = 0; i < this._symbolsToCarryOver[col].length; i++ ) {
            var yPosition = -((totalSymbolsAdded - 1) * this._symbolHeight);
            var symbol = new cc.Sprite(symbolRes.symbolTextures[this._symbolsToCarryOver[col][i]]);
            symbol.setAnchorPoint(cc.p(0.5, 0.5));
            symbol.setPosition(0 ,yPosition);
            this._reelNodes[col].addChild(symbol);
            totalSymbolsAdded++;
        }
        
         //0.5 is not a magic number here. we have to shift by half the symbol width owing to the anchor position.
        var xPos = this._symbolWidth * (col - mathData._numCols/2 + 0.5);
        var yPos = this._symbolHeight * (totalSymbolsAdded) - cc.winSize.height; 
        this.numSymbolsAddedByCol[col] = totalSymbolsAdded;

        this._reelNodes[col].setPosition(xPos, yPos);
        this._symbolsToCarryOver[col] = symbolsInColToCarry;
    }
}

ReelManager.prototype.setupAndInitiateReelMotion = function(callback){
    //Now that the nodes with the right elements are set up, now we spawn multiple actions and move 
    //the elements in the reelstrip
    var timeOffset = 0.1;
    var reverseTime = 1;

    var peekRatio = 0.5; //Forgot what this term was actually called. It was used to describe the reels stopping 
                         //at a point below where it is supposed to stop and then reversing back.
    for(var i = 0 ; i < this._reelNodes.length; i++) {
        var dist = this._symbolHeight* -1 * (this.numSymbolsAddedByCol[i] - 1 + peekRatio * 2) + cc.winSize.height; //We need to consider the distance used for peeking. The -1 is to ignore the extra symboladded for peaking        
        var reverseAnticipation = new cc.EaseSineInOut(new cc.MoveBy(reverseTime + (i * 0.1), cc.p(0, this._symbolHeight * peekRatio)));
        var movePastTarget = new cc.EaseSineInOut(new cc.MoveBy(2 + i * timeOffset, cc.p(0, dist)));
        var reverseToTarget = new cc.EaseSineInOut(new cc.MoveBy(reverseTime, cc.p(0, this._symbolHeight * peekRatio)));

        if(i == this._reelNodes.length - 1)
            this._reelNodes[i].runAction(new cc.Sequence(reverseAnticipation, movePastTarget, reverseToTarget, callback));
        else 
            this._reelNodes[i].runAction(new cc.Sequence(reverseAnticipation, movePastTarget, reverseToTarget));
    }
}