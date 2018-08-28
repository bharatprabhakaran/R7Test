
//Loading the correct assets can be handle by organising assets with in
// the following manner: res/textureScheme/machineName/RESOURCE
//pick out the correct format depending on the requirements.

// var textureScheme = {
//     Folders:[
//         "FullHDTextures",
//         "iPadRetinaTextures"
//     ]
// }

// var machineName = {
//     MachineNames:[
//         "DogeMachine"
//     ]
// }

var res = {
    bg_jpg: "res/DogeMachine/bg.png",
    border_jpg: "res/DogeMachine/Border.png",
    buttonSpin_jpg: "res/DogeMachine/spinBtn.png"
};

var symbolRes = {
    symbolTextures: [
    "res/DogeMachine/0.jpg",
    "res/DogeMachine/1.jpg",
    "res/DogeMachine/2.jpg",
    "res/DogeMachine/3.jpg",
    "res/DogeMachine/4.jpg",
    "res/DogeMachine/5.jpg",
    "res/DogeMachine/wild.jpg"
    ]
}

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}

for (var i in symbolRes.symbolTextures) {
    g_resources.push(symbolRes.symbolTextures[i]);
}
