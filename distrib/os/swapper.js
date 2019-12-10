///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    class Swapper {
        //take in pid and base of the process being swapped into disk as arguments
        swapProcesses(pid, base) {
            var limit = 256;
            //get filename based on pid
            var filename = "process:" + _currPcb.PID;
            //gets program and clears lines along the way
            var diskProgram = _krnFileSystem.getProcessFromDisk(filename);
            //clear the filename line
            var tsb = _krnFileSystem.getTsb(filename);
            var block = JSON.parse(sessionStorage.getItem(tsb));
            block = _krnFileSystem.clearLine(tsb);
            sessionStorage.setItem(tsb, JSON.stringify(block));
            //grab process from memory
            var len = _ReadyQueue.getSize();
            var memProgram = [];
            //initialize section of main mem to "00" while looping
            for (var i = 0; i < limit; i++) {
                memProgram[i] = _Memory.memArray[i + base];
                _Memory.memArray[i + base] = "00";
            }
            //and trim the ending zeroes off
            memProgram = this.trimZeroes(memProgram);
            diskProgram = this.trimZeroes(diskProgram);
            //set disk program to main memory
            for (var j = 0; j < diskProgram.length; j++) {
                _Memory.memArray[j + base] = diskProgram[j];
            }
            //write memprogram to disk
            _krnFileSystem.loadProcessToDisk(pid, memProgram);
        }
        swapIn() {
            var limit = 256;
            //get filename based on pid
            var filename = "process:" + _currPcb.PID;
            //gets program and clears lines along the way
            var diskProgram = _krnFileSystem.getProcessFromDisk(filename);
            diskProgram = this.trimZeroes(diskProgram);
            //clear the filename line
            var tsb = _krnFileSystem.getTsb(filename);
            var block = JSON.parse(sessionStorage.getItem(tsb));
            block = _krnFileSystem.clearLine(tsb);
            sessionStorage.setItem(tsb, JSON.stringify(block));
            var newBase = _MemoryManager.loadMem(diskProgram);
            return newBase;
        }
        trimZeroes(program) {
            var opcode = program.pop();
            //while the program has 00 on the end keep trimming them off
            while (opcode == "00") {
                opcode = program.pop();
            }
            //put the last opcode on that isn't a 00
            program.push(opcode);
            return program;
        }
    }
    TSOS.Swapper = Swapper;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=swapper.js.map