var IEvaluationLogic = function() {
    if (this.constructor === IEvaluationLogic) {
       throw new Error("Can't instantiate abstract class!");
     }       
};

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

            if(symbolID != mathData._wildSymbolID) {
                symbolID = configToEval[mathData._lineData[line][sequence]];
            }

            var consecutiveSymbolsEqual = configToEval[mathData._lineData[line][sequence]] == configToEval[mathData._lineData[line][sequence + 1]];
            var thecurrentSymbolAWild = (configToEval[mathData._lineData[line][sequence]] == mathData._wildSymbolID);
            var nextSymbolAWild = (configToEval[mathData._lineData[line][sequence + 1]] == mathData._wildSymbolID);

            if(consecutiveSymbolsEqual || thecurrentSymbolAWild || nextSymbolAWild)
                continue;
            else
                break;
        }

        var lineWin = mathData._payoutData[symbolID][sequence] * uParams._betAmount;

        if(sequence != -1 && lineWin > 0) {
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