///<reference path="../globals.ts" />
/* ------------
     MemoryAccessor.ts
     Requires global.ts.
     ------------ */
var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        static readMemory(position) {
            return _Memory.memArray[position];
        }
        static writeMemory(position, val) {
            console.log("Current val: " + _Memory.memArray[position] + ", pos: " + position + ", updated val: " + val);
            _Memory.memArray[position] = val;
            console.log("Update mem: " + _Memory.memArray.toString());
            TSOS.Control.loadTable();
        }
        static clearMem() {
            for (var i = 0; i < 256; i++) {
                _Memory.memArray[i] = "00";
            }
        }
        static memoryLength() {
            return _Memory.memArray.length;
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map