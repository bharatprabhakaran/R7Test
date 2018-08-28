function MachineMathConfig() {
    this._bonusID = -1;
    this._wildSymbolID = -1;
    this._numRows = 0;
    this._numColumns = 0;
    this._payoutData = [];
    this._lineData = [];
    this._symbolCount = 0;
    this._reelData = [];
}

var MathLogic = cc.Node.extend({

    //TODO: find out if this is an actual accepted method of short hand initialisation and property decl.
    ctor:function(){
        this._super();
        this._machineData = this.fetchMathDataFromFile();
   },

    //The following data will be retrieved from the files that pertain to 
    // the mathlogic. This container will  contain the payout data, 
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
            [0,0,0,0,500]
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
        
        //This is where the custom objects can be instantiated.
        //Generate the actual indices 
        var genObj = new DefaultReelPositionSelection();
        var evalObj = new DefaultEvaluation();
        var generatedIndices = genObj.getReelIndices(this._mathConfig._reelData);
        var spinResults = evalObj.evaluateMachineState(uParams, this._mathConfig, generatedIndices);

        return spinResults;
    }
});