///<reference path="../globals.ts" />
/* ------------
     Pcb.ts
     Requires global.ts.
     Process control block for creating new processes
     ------------ */
var TSOS;
(function (TSOS) {
    class ProcessControlBlock {
        constructor(PID, base, state, PC, IR, turnaround, waittime, Acc, Xreg, Yreg, Zflag) {
            this.PID = PID;
            this.base = base;
            this.state = state;
            this.PC = PC;
            this.IR = IR;
            this.turnaround = turnaround;
            this.waittime = waittime;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
        }
        init() {
            console.log("In init");
            this.PID = "-";
            this.base = 0;
            this.state = "-";
            this.PC = 0;
            this.IR = "-";
            this.turnaround = 0;
            this.waittime = 0;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
        }
    }
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map