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
            //if resident queue has items in it
            /*if (_ResidentQueue.getSize() > 0){
                //take the first item off the resident queue and make it the current pcb
                _currPcb = _ResidentQueue.dequeue();
                _currPcb.state = "Running";
            //otherwise
            }else{
                //the the first item off the ready queue and make it pcb
                _currPcb = _ReadyQueue.dequeue();
                _currPcb.state = "Running";
            }*/
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
        schedule() {
            //if cpu cycles = quantum.. switch the process
            if (_ReadyQueue.getSize() > 0) {
                if (cpuCycles >= this.quantum) {
                    console.log("New process");
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, _currPcb));
                    //switch the process
                    /*_currPcb.state = "Ready";
                    TSOS.Control.updatePCBTable(_currPcb.PID,
                                                _currPcb.state,
                                                _currPcb.PC,
                                                _currPcb.IR,
                                                _currPcb.Acc.toString(16).toUpperCase(),
                                                _currPcb.Xreg.toString(16).toUpperCase(),
                                                _currPcb.Yreg.toString(16).toUpperCase(),
                                                _currPcb.Zflag.toString(16).toUpperCase());
                    _ReadyQueue.enqueue(_currPcb);
                    cpuCycles = 0;
                    this.getNewProc();
                    this.setCPU();*/
                }
                else {
                    console.log("same process");
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