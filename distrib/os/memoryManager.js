///<reference path="../globals.ts" />
/* ------------
     MemoryManager.ts
     Requires global.ts.
     ------------ */
var TSOS;
(function (TSOS) {
    class MemoryManager {
        static updateMemory(input) {
            console.log("Before: " + _Memory.memArray.toString());
            var position = 0;
            for (var i = 0; i < input.length; i++) {
                if (input.charAt(i) != " ") {
                    _Memory.memArray[position] = input.substring(i, i + 2).toUpperCase();
                    i += 2;
                    position++;
                }
            }
            this.endProgram = position;
            console.log("After: " + _Memory.memArray.toString() + " length: " + this.endProgram);
            //TSOS.Control.clearTable();
            TSOS.Control.loadTable();
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map