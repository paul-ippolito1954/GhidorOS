///<reference path="../globals.ts" />
/* ------------
     memory.ts
     Requires global.ts.
     ------------ */
///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    class Memory {
        init() {
            //create a main memory array
            this.memArray = new Array();
            //making it size 768 in anticipation for project 3
            for (var i = 0; i < 768; i++) {
                //load the array with all 00
                this.memArray[i] = "00";
            }
            //console.log("Main mem initializer: " + this.mainMem);
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map