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
                    _Memory.memArray[_CPU.program.segment][position] = input.substring(i, i + 2).toUpperCase();
                    i += 2;
                    position++;
                }
            }
            this.endProgram = position;
            console.log("After: " + _Memory.memArray.toString() + " length: " + this.endProgram);
            TSOS.Control.clearTable();
            TSOS.Control.loadTable();
        }
        /**
         * scanMemory
         * This method checks the three sections of memory to see
         * whether or not they can be loaded into or not. This will
         * also check if memory is full. This will be called upon
         * a shell load command. If any sections are free, the program
         * will be loaded into there. If none of the sections are free,
         * the user will be informed that memory is full
         */
        static scanMemory() {
            if (_Memory.section0Free || _Memory.section1Free || _Memory.section2Free) {
                return true;
            }
            else {
                _StdOut.putText("Memory is full, loading failed");
                return false;
            }
        }
    }
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryManager.js.map