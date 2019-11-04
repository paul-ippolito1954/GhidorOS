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
         * allocate allocates the different sections of memory.
         * it checks and returns the first free section it finds, or if they're
         * all full, returns 99, which is an error
         */
        static allocate() {
            if (_Memory.section0Free) {
                _Memory.section0Free = false;
                return 0;
            }
            else if (_Memory.section1Free) {
                _Memory.section1Free = false;
                return 1;
            }
            else if (_Memory.section2Free) {
                _Memory.section2Free = false;
                return 2;
            }
            else {
                return 99;
            }
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