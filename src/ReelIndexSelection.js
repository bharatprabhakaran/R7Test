//This file consists of an interface for the reelpositionSelection algo and a default implementation
//Instead of overriding methods, it just makes sense to encapuslate individual algorithms and provide a common interface
//Users can then create their own implementation of the IReelPositionSelection class.


var IReelPositionSelection = function() {
    if (this.constructor === IReelPositionSelection) {
       throw new Error("Can't instantiate abstract class!");
     }       
};

IReelPositionSelection.prototype.getReelIndices = function(reelData) {
   throw new Error("Abstract method!");
}

var DefaultReelPositionSelection = function() {
   IReelPositionSelection.apply(this);
}

DefaultReelPositionSelection.prototype = Object.create(IReelPositionSelection.prototype);
DefaultReelPositionSelection.prototype.constructor = DefaultReelPositionSelection;

DefaultReelPositionSelection.prototype.getReelIndices = function(reelData) {

   var generatedIndices = [];
   for(var i = 0; i < reelData.length; i++) {
       generatedIndices[i] = Math.floor(reelData[i].length * Math.random());
   }
   return generatedIndices;
}