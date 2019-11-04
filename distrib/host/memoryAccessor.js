///<reference path="../globals.ts" />
/* ------------
     MemoryAccessor.ts
     Requires global.ts.
     ------------ */
var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        static readMemory(position) {
            return _Memory.memArray[_CPU.program.segment][position];
        }
        static writeMemory(position, val) {
            val = (+val).toString(16).toUpperCase();
            if (val.length == 1)
                _Memory.memArray[_CPU.program.segment][position] = "0" + val;
            else
                _Memory.memArray[_CPU.program.segment][position] = val;
            //console.log("Update mem: " + _Memory.memArray.toString());
            TSOS.Control.clearTable();
            TSOS.Control.loadTable();
        }
        static clearMem() {
            for (var j = 0; j < 3; j++) {
                for (var i = 0; i < 256; i++) {
                    _Memory.memArray[j][i] = "00";
                }
            }
        }
        static memoryLength() {
            return _Memory.memArray[0].length;
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map