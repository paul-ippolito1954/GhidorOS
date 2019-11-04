///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    class MemoryManager {
        constructor() {
            //set bases for 3 sections
            this.base1 = 0;
            this.base2 = 256;
            this.base3 = 512;
            this.limitReg = 255;
        }
        loadMem(userProgram) {
            //put the program in the first available area of memory and return the base value
            //section 1 of memory
            if (_Memory.memArray[this.base1] == "00") {
                for (var i = 0; i < userProgram.length; i++) {
                    _Memory.memArray[this.base1 + i] = userProgram[i];
                }
                return this.base1;
                //section 2 of memory
            }
            else if (_Memory.memArray[this.base2] == "00") {
                for (var i = 0; i < userProgram.length; i++) {
                    _Memory.memArray[this.base2 + i] = userProgram[i];
                }
                return this.base2;
                //section 3 of memory
            }
            else if (_Memory.memArray[this.base3] == "00") {
                for (var i = 0; i < userProgram.length; i++) {
                    _Memory.memArray[this.base3 + i] = userProgram[i];
                }
                return this.base3;
            }
            else {
                //return -1 if no memory is available
                console.log("Out of memory space.");
                return -1;
            }
            //console.log("User program in memory: " + _Memory.mainMem[0]);
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map