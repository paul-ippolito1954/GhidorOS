///<reference path="../globals.ts" />

/* ------------
     cpuScheduler.ts
     Requires global.ts.
     Process control block for creating new processes
     ------------ */

     module TSOS {

        export class Scheduler {
    
            public quantum: number = 6;
            public readyLength: number;
            public procIndex: number = 0;
    
    
            public init(): void {
    
            }
    
    
            public getNewProc(): void{
    
                _currPcb = _ReadyQueue.dequeue();
                _currPcb.state = "Running";
    
            }
    
            public setCPU(): void{
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
            public schedule(): void{
    
                if (_ReadyQueue.getSize() > 0){
                    
                    if (_schedule == "rr"){
                        this.roundRobin();
                    }
                    else if (_schedule == "fcfs"){
                        this.fcfs();
                    }
                    else{
                        this.priority();
                    }
                }
            }

            /**
             * Executes using Round Robin
             */
            public roundRobin(): void{

                 //if cpu cycles = quantum.. switch the process
                 if (_ReadyQueue.getSize() > 0){
                    if (cpuCycles >= this.quantum){
                        console.log("New process");
                        _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, _currPcb));
                        
                    }else{
                        console.log("same process");
                    }
    
                }
            }

            /**
             * Does FCFS scheduling
             */
            public fcfs(): void{

            // since round robin degrades to fcfs anyway, set the quantum high
            // I SERIOUSLY doubt there's a process that takes 1000000 cycles....
            this.quantum = 1000000;

            if (_ReadyQueue.getSize() > 0){
                if (cpuCycles >= this.quantum){
                    console.log("New process");
                    _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, _currPcb));
                }else{
                    console.log("same process");
                }
            }

            }

            /**
             * Executes using non-preemptive priority scheduling
             */
            public priority(): void{

                // why not? the switch is based on the priority
                this.quantum = 1000000;

                if(_ReadyQueue.getSize() > 0){

                    if(cpuCycles >= this.quantum){
                        console.log("New Process");
                        _KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, _currPcb));
                    }
                    else{
                        console.log("Same process");
                    }
                }

            }

            /**
             * sort the ready queue by priority, wasn't running properly
             * before
             */
            public sortReadyQueue(): void{

              var len = _ReadyQueue.getSize();
              var tempList = [];

              // add elements of ready queue to tempList
              for (var i = 0; i < len; i++){
                  tempList[i] = _ReadyQueue.dequeue();
               }

               // sort templist by priority using sort function
               tempList.sort((a,b)=>a.priority-b.priority);

               // add the elements of tempList back into readyqueue
               for (var l = 0; l < len; l++){
                  _ReadyQueue.enqueue(tempList[l]);
                }
            }  
    
            public updateWaitAndTurnaround(): void{
    
                var readyLength = _ReadyQueue.getSize();
    
                for (var i = 0; i < readyLength; i++){
    
                    var proc = _ReadyQueue.q[i];
                    console.log("wait and turnaround pid: " + proc.PID);
    
                    proc.turnaround += 1;
                    proc.waittime +=1;
                }
            }
    
    
    
    
    
        }
    }