var IEvaluationLogic = (function() {
    if (this.constructor === IEvaluationLogic) {
       throw new Error("Can't instantiate abstract class!");
     }       
});

IEvaluationLogic.prototype.evaluateMachineState = function(uParams, mathData, generatedIndices) {
   throw new Error("Abstract method!");
}

var DefaultEvaluation = function() {
   IReelPositionSelection.apply(this);
}

DefaultEvaluation.prototype = Object.create(IEvaluationLogic.prototype);
DefaultEvaluation.prototype.constructor = DefaultEvaluation;

DefaultEvaluation.prototype.evaluateMachineState = function(uParams, mathData, generatedIndices) {

    var configToEval = [];

    for(var col = 0; col < mathData._numCols; col++) {
        for(var row = 0; row < mathData._numRows; row++) {
            var index = (generatedIndices[col] + row) % mathData._reelData[col].length;
            configToEval[col + mathData._numCols * row] = mathData._reelData[col][index];
        }
    }

    var winnings = 0;
    var lineWins = [];

    //Looking for win sequences along the line specified in the line data
    for(var line = 0; line < uParams._numLines; line++) {
        var sequence = 0;
        var symbolID = -1;

        for(; sequence < mathData._numCols - 1; sequence++){

            var currentSymbolinLine = configToEval[mathData._lineData[line][sequence]];
            var nextSymbolInLine = configToEval[mathData._lineData[line][sequence + 1]];

            if(currentSymbolinLine != mathData._wildSymbolID && symbolID == -1) {
                symbolID = currentSymbolinLine;
            }

            var areConsecutiveSymbolsEqual = currentSymbolinLine == nextSymbolInLine;
            var isThecurrentSymbolAWild = currentSymbolinLine == mathData._wildSymbolID;
            var nextSymbolAWild = nextSymbolInLine == mathData._wildSymbolID;

            if(areConsecutiveSymbolsEqual || isThecurrentSymbolAWild || nextSymbolAWild)
                continue;
            else
                break;
        }

        var lineWin = 0;

        if(symbolID != -1) {
            lineWin = mathData._payoutData[symbolID][sequence] * uParams._betAmount;
        }
        
        if(lineWin > 0) {
            lineWins.push(new LineWin(line, sequence + 1, lineWin, symbolID));
            winnings += lineWin;
        }
    }

    var spinResult = new SpinResultParams(uParams, generatedIndices, winnings, lineWins);
    return spinResult;
}

function LineWin(line, numSymbols, winnings, symbol){
    this._line = line;
    this._numSymbols = numSymbols;
    this._amountWon = winnings;
    this._symbolID = symbol;
}

function SpinResultParams(uParams, generatedIndices, totalWin, lineWins) {
    this._userParams = uParams;
    this._generatedIndices = generatedIndices;
    this._totalWinAmount = totalWin;
    this._lineWins = lineWins;
}

// var LineWin = (function() {
//     var _line = 0;
//     var _numSymbols = 0;
//     var _amountWon = 0;
//     var _symbolID = 0;

//     function LineWin(line, numSymbols, winnings, symbol){
//         _line = line;
//         _numSymbols = numSymbols;
//         _amountWon = winnings;
//         _symbolID = symbol;
//     }

//     return {
//         LineWin: LineWin
//     };
// }());
