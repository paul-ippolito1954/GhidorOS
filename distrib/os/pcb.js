///<reference path="../globals.ts" />
/* ------------
     ProcessControlBlock.ts
     Requires global.ts.
     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.
     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    class ProcessControlBlock {
        constructor(processId, status = "Ready", PC = 0, Acc = "0", IR = "0", Xreg = "0", Yreg = "0", Zflag = "0", waitTime = 0, turnAround = 0) {
            this.processId = processId;
            this.status = status;
            this.PC = PC;
            this.Acc = Acc;
            this.IR = IR;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.waitTime = waitTime;
            this.turnAround = turnAround;
        }
        init() {
            this.status = "Ready";
            this.PC = 0;
            this.Acc = "0";
            this.IR = "0";
            this.Xreg = "0";
            this.Yreg = "0";
            this.Zflag = "0";
            this.waitTime = 0;
            this.turnAround = 0;
            TSOS.Control.updatePCB(this.processId, this.status, String(this.PC), this.Acc, this.IR, this.Xreg, this.Yreg, this.Zflag);
        }
    }
    TSOS.ProcessControlBlock = ProcessControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=pcb.js.map