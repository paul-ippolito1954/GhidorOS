///<reference path="../globals.ts" />
/* ------------
     cpuScheduler.ts
     Requires global.ts.
     Process control block for creating new processes
     ------------ */
var TSOS;
(function (TSOS) {
    class Scheduler {
        constructor() {
            this.quantum = 6;
            this.procIndex = 0;
        }
        init() {
        }
        getNewProc() {
            _currPcb = _ReadyQueue.dequeue();
            _currPcb.state = "Running";
        }
        setCPU() {
            _CPU.PC = _currPcb.PC;
            _CPU.Acc = _currPcb.Acc;
            _CPU.IR = _currPcb.IR;
            _CPU.Xreg = _currPcb.Xreg;
            _CPU.Yreg = _currPcb.Yreg;
            _CPU.Zflag = _currPcb.Zflag;
        }
        /**
         * checks what current scheduler
         * is and executes program accordingly
         */
        schedule() {
            if (_ReadyQueue.getSize() > 0) {
                if (_schedule == "rr") {
                    this.roundRobin();
                }
                else if (_schedule == "fcfs") {
                    this.fcfs();
                }
                else {
                    this.priority();
                }
            }
        }
        /**
         * Executes using Round Robin
         */
        roundRobin() {
            //if cpu cycles = quantum.. switch the process
            if (_ReadyQueue.getSize() > 0) {
                if (cpuCycles >= this.quantum) {
                    console.log("New process");
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, _currPcb));
                }
                else {
                    console.log("same process");
                }
            }
        }
        /**
         * Does FCFS scheduling
         */
        fcfs() {
            // since round robin degrades to fcfs anyway, set the quantum high
            // I SERIOUSLY doubt there's a process that takes 1000000 cycles....
            this.quantum = 1000000;
            if (_ReadyQueue.getSize() > 0) {
                if (cpuCycles >= this.quantum) {
                    console.log("New process");
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, _currPcb));
                }
                else {
                    console.log("same process");
                }
            }
        }
        /**
         * Executes using non-preemptive priority scheduling
         */
        priority() {
            // why not? the switch is based on the priority
            this.quantum = 1000000;
            if (_ReadyQueue.getSize() > 0) {
                if (cpuCycles >= this.quantum) {
                    console.log("New Process");
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, _currPcb));
                }
                else {
                    console.log("Same process");
                }
            }
        }
        updateWaitAndTurnaround() {
            var readyLength = _ReadyQueue.getSize();
            for (var i = 0; i < readyLength; i++) {
                var proc = _ReadyQueue.q[i];
                console.log("wait and turnaround pid: " + proc.PID);
                proc.turnaround += 1;
                proc.waittime += 1;
            }
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map