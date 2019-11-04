///<reference path="../globals.ts" />
var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        //read value from memory
        readValue(address) {
            //console.log(address);
            var base = _currPcb.base;
            //console.log("base in mem access: " + base);
            //create memory address from base of process
            var memAddress = Number(base + address);
            //console.log("current pcb and address: " + _currPcb.PID + " : " + memAddress);
            //check to see if memory address created is within the process bounds in memory
            if (memAddress <= (base + _limit)) {
                //return value at address in memory
                return _Memory.memArray[memAddress];
            }
            else {
                //console.log("Memory address out of bounds.");
                var killInfo = [_currPcb.PID, "current"];
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(MEMORY_ACCESS_IRQ, killInfo));
            }
        }
        //write value to memory
        writeValue(address, value) {
            var base = _currPcb.base;
            //create memory address from base of process
            var memAddress = base + address;
            //check to see if memory address created is within the process bounds in memory
            if (memAddress <= (base + _limit)) {
                //set value at memory location
                _Memory.memArray[memAddress] = value.toString(16);
            }
            else {
                //console.log("Memory address out of bounds.");
                var killInfo = [_currPcb.PID, "current"];
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(MEMORY_ACCESS_IRQ, killInfo));
            }
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map