///<reference path="../globals.ts" />
///<reference path="queue.ts" />
/* ------------
     Kernel.ts
     Requires globals.ts
              queue.ts
     Routines for the Operating System, NOT the host.
     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
var TSOS;
(function (TSOS) {
    class Kernel {
        //
        // OS Startup and Shutdown Routines
        //
        krnBootstrap() {
            TSOS.Control.hostLog("bootstrap", "host"); // Use hostLog because we ALWAYS want this, even if _Trace is off.
            // Initialize our global queues.
            _KernelInterruptQueue = new TSOS.Queue(); // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array(); // Buffers... for the kernel.
            _KernelInputQueue = new TSOS.Queue(); // Where device input lands before being processed out somewhere.
            // Initialize the console.
            _Console = new TSOS.Console(); // The command line interface / console I/O device.
            _Console.init();
            // Initialize standard input and output to the _Console.
            _StdIn = _Console;
            _StdOut = _Console;
            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new TSOS.DeviceDriverKeyboard(); // Construct it.
            _krnKeyboardDriver.driverEntry(); // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);
            //
            // ... more?
            //
            //memory manager
            _MemoryManager = new TSOS.MemoryManager();
            _CPU = new TSOS.Cpu();
            _CPU.init();
            _Memory = new TSOS.Memory();
            _Memory.init();
            _MemoryAccessor = new TSOS.MemoryAccessor();
            _Scheduler = new TSOS.Scheduler();
            //pcb setting in bootstrap
            _currPcb = new TSOS.ProcessControlBlock("-", 0, "-", 0, "-", 0, 0, 0, "-", 0, 0, 0, 0);
            _ResidentQueue = new TSOS.Queue();
            _ReadyQueue = new TSOS.Queue();
            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();
            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new TSOS.Shell();
            _OsShell.init();
            // Finally, initiate student testing protocol.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }
        krnShutdown() {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  If there are some, alert and stop. Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        }
        krnOnCPUClockPulse() {
            //console.log("current pcb id in krnclockpulse: " + _currPcb.PID);
            /* This gets called from the host hardware simulation every time there is a hardware clock pulse.
               This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
               This, on the other hand, is the clock pulse from the hardware / VM / host that tells the kernel
               that it has to look for interrupts and process them if it finds any.                           */
            // Check for an interrupt, are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            }
            else if (_CPU.isExecuting) { // If there are no interrupts then run one CPU cycle if there is anything being processed. {
                //console.log("In kernel in cycle curr pcb pid: " + _currPcb.PID)
                _CPU.cycle();
                if (runall == true) {
                    _Scheduler.schedule();
                    _Scheduler.updateWaitAndTurnaround();
                }
            }
            else { // If there are no interrupts and there is nothing being executed then just be idle. {
                this.krnTrace("Idle");
            }
            TSOS.Control.createMemoryTable();
        }
        //
        // Interrupt Handling
        //
        krnEnableInterrupts() {
            // Keyboard
            TSOS.Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }
        krnDisableInterrupts() {
            // Keyboard
            TSOS.Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }
        krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  See pages 8 and 560.
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on. Page 766.
            this.krnTrace("Handling IRQ~" + irq);
            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR(); // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params); // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case OPCODE_ERROR_IRQ:
                    _StdOut.putText(params);
                    this.exitProcess(_currPcb.PID);
                    break;
                case OUTPUT_IRQ:
                    _StdOut.putText(params);
                    break;
                case COMPLETE_PROC_IRQ:
                    this.exitProcess(params);
                    break;
                case CONTEXT_SWITCH_IRQ:
                    this.contextSwitch();
                    break;
                case KILL_PROC_IRQ:
                    this.killProcess(params[0], params[1]);
                    break;
                case MEMORY_ACCESS_IRQ:
                    _StdOut.putText("Memory access request out of bounds.");
                    this.killProcess(params[0], params[1]);
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }
        krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
        }
        //
        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile
        //create a new process
        createProcess(base, priority) {
            if (base == -1) {
                //create a new process control block based on base of program in disk
                var newProcess = new TSOS.ProcessControlBlock(_Pid.toString(), base, "Resident", 0, "-", 0, 0, priority, "Disk", 0, 0, 0, 0);
            }
            else {
                //create a new process control block based on base of program in memory
                var newProcess = new TSOS.ProcessControlBlock(_Pid.toString(), base, "Resident", 0, "-", 0, 0, priority, "Memory", 0, 0, 0, 0);
            }
            //update pid
            _Pid++;
            //add new process to resident queue
            _ResidentQueue.enqueue(newProcess);
            //print to test
            for (var i = 0; i < _ResidentQueue.getSize(); i++) {
                console.log(_ResidentQueue.q[i]);
            }
        }
        //execute a specified process
        executeProcess(pid) {
            //find the correct process in the resident queue based on pid
            var resLen = _ResidentQueue.getSize();
            for (var i = 0; i < resLen; i++) {
                //set it to a global pcb variable
                _currPcb = _ResidentQueue.dequeue();
                //console.log("regular execution pcb pid: " + _currPcb.PID);
                if (_currPcb.PID == pid.toString()) {
                    //console.log("currpcb pid in id statement: " + _currPcb.PID)
                    //change the state and set executing to true; break out of loop
                    _currPcb.state = "Running";
                    _CPU.isExecuting = true;
                    break;
                }
                else {
                    _ResidentQueue.enqueue(_currPcb);
                }
            }
            for (var i = 0; i < _ResidentQueue.getSize(); i++) {
                console.log(_ResidentQueue.q[i]);
            }
            //console.log("Current pcb pid at end of execute process: " + _currPcb.PID);
        }
        //execute all processes
        executeAll() {
            var resLength = _ResidentQueue.getSize();
            //move everthing from the resident queue to the ready queue
            for (var i = 0; i < resLength; i++) {
                var temp = _ResidentQueue.dequeue();
                _ReadyQueue.enqueue(temp);
            }
            //set runall to true
            runall = true;
            //take the first pcb off the ready queue and set it to _currPcb
            _currPcb = _ReadyQueue.dequeue();
            //console.log("IN kernel - curr PCB:" + _currPcb.PID);
            _currPcb.state = "Running";
            _CPU.isExecuting = true;
        }
        //exit a process
        exitProcess(pid) {
            console.log("Process exited: " + pid);
            _StdOut.advanceLine();
            _StdOut.putText("Process: " + pid);
            _StdOut.advanceLine();
            _StdOut.putText("Turnaround Time: " + _currPcb.turnaround);
            _StdOut.advanceLine();
            _StdOut.putText("Wait Time: " + _currPcb.waittime);
            //advance line and put prompt
            _StdOut.advanceLine();
            _OsShell.putPrompt();
            //set state to terminated and executing to false
            _currPcb.state = "Terminated";
            //reset clock cycles
            cpuCycles = 0;
            //reset main mem using base
            var base = _currPcb.base;
            //console.log("In exit: " + _currPcb.base);
            for (var j = base; j < base + 255; j++) {
                _Memory.mainMem[j] = "00";
            }
            if (_ReadyQueue.isEmpty()) {
                _CPU.isExecuting = false;
                _CPU.PC = 0;
                _CPU.IR = "-";
                _CPU.Acc = 0;
                _CPU.Xreg = 0;
                _CPU.Yreg = 0;
                _CPU.Zflag = 0;
                _currPcb.init();
            }
            else {
                //console.log("switching curr pcb in exit process");
                _currPcb = _ReadyQueue.dequeue();
                //console.log("ReadyQueue size: " + _ReadyQueue.getSize());
                if (_currPcb.base == -1) {
                    var newBase = _Swapper.swapIn();
                    _currPcb.base = newBase;
                    _currPcb.location = "Memory";
                }
                _CPU.PC = _currPcb.PC;
                _CPU.IR = _currPcb.IR;
                _CPU.Acc = _currPcb.Acc;
                _CPU.Xreg = _currPcb.Xreg;
                _CPU.Yreg = _currPcb.Yreg;
                _CPU.Zflag = _currPcb.Zflag;
            }
            TSOS.Control.updateCPUTable(_CPU.PC, _CPU.IR, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);
            for (var i = 0; i < _ReadyQueue.getSize(); i++) {
                console.log(_ReadyQueue.q[i]);
            }
        }
        killProcess(pid, loc) {
            var temp;
            if (loc == "current") {
                _StdOut.advanceLine();
                _StdOut.putText("PID: " + _currPcb.PID);
                _StdOut.advanceLine();
                _StdOut.putText("Turnaround Time: " + _currPcb.turnaround);
                _StdOut.advanceLine();
                _StdOut.putText("Wait Time: " + _currPcb.waittime);
                //advance line and put prompt
                _StdOut.advanceLine();
                _OsShell.putPrompt();
                _currPcb.state = "Terminated";
                //reset cpu cycles
                cpuCycles = 0;
                //reset main mem using base
                var base = _currPcb.base;
                for (var j = base; j < base + 255; j++) {
                    _Memory.memArray[j] = "00";
                }
                TSOS.Control.updatePCBTable(_currPcb.PID, _currPcb.state, _currPcb.PC, _currPcb.IR, _currPcb.Acc.toString(16).toUpperCase(), _currPcb.Xreg.toString(16).toUpperCase(), _currPcb.Yreg.toString(16).toUpperCase(), _currPcb.Zflag.toString(16).toUpperCase(), _currPcb.base);
                if (_ReadyQueue.getSize() > 0) {
                    _currPcb = _ReadyQueue.dequeue();
                    _CPU.PC = _currPcb.PC;
                    _CPU.IR = _currPcb.IR;
                    _CPU.Acc = _currPcb.Acc;
                    _CPU.Xreg = _currPcb.Xreg;
                    _CPU.Yreg = _currPcb.Yreg;
                    _CPU.Zflag = _currPcb.Zflag;
                }
                else {
                    _CPU.isExecuting = false;
                    _currPcb.init();
                    _CPU.init();
                    _CPU.PC = 0;
                    _CPU.IR = "-";
                    _CPU.Acc = 0;
                    _CPU.Xreg = 0;
                    _CPU.Yreg = 0;
                    _CPU.Zflag = 0;
                }
                TSOS.Control.updateCPUTable(_CPU.PC, _CPU.IR, _CPU.Acc, _CPU.Xreg, _CPU.Yreg, _CPU.Zflag);
            }
            else if (loc == "resident") {
                for (var i = 0; i < _ResidentQueue.getSize(); i++) {
                    temp = _ResidentQueue.dequeue();
                    if (pid == temp.PID) {
                        break;
                    }
                    else {
                        _ResidentQueue.enqueue(temp);
                    }
                }
                temp.state = "Terminated";
                TSOS.Control.updatePCBTable(temp.PID, temp.state, temp.PC, temp.IR, temp.Acc.toString(16).toUpperCase(), temp.Xreg.toString(16).toUpperCase(), temp.Yreg.toString(16).toUpperCase(), temp.Zflag.toString(16).toUpperCase(), temp.base);
                _StdOut.advanceLine();
                _StdOut.putText("PID: " + temp.PID);
                _StdOut.advanceLine();
                _StdOut.putText("Turnaround Time: " + temp.turnaround);
                _StdOut.advanceLine();
                _StdOut.putText("Wait Time: " + temp.waittime);
                //advance line and put prompt
                _StdOut.advanceLine();
                _OsShell.putPrompt();
                //reset main mem using base
                base = temp.base;
                for (var j = base; j < base + 255; j++) {
                    _Memory.memArray[j] = "00";
                }
            }
            else if (loc == "ready") {
                for (var i = 0; i < _ReadyQueue.getSize(); i++) {
                    temp = _ReadyQueue.dequeue();
                    if (pid == temp.PID) {
                        break;
                    }
                    else {
                        _ReadyQueue.enqueue(temp);
                    }
                }
                temp.state = "Terminated";
                TSOS.Control.updatePCBTable(temp.PID, temp.state, temp.PC, temp.IR, temp.Acc.toString(16).toUpperCase(), temp.Xreg.toString(16).toUpperCase(), temp.Yreg.toString(16).toUpperCase(), temp.Zflag.toString(16).toUpperCase(), temp.base);
                _StdOut.advanceLine();
                _StdOut.putText("PID: " + temp.PID);
                _StdOut.advanceLine();
                _StdOut.putText("Turnaround Time: " + temp.turnaround);
                _StdOut.advanceLine();
                _StdOut.putText("Wait Time: " + temp.waittime);
                //advance line and put prompt
                _StdOut.advanceLine();
                _OsShell.putPrompt();
                //reset main mem using base
                base = temp.base;
                for (var j = base; j < base + 255; j++) {
                    _Memory.memArray[j] = "00";
                }
            }
        }
        clearMemory() {
            for (var i = 0; i < 768; i++) {
                _Memory.memArray[i] = "00";
            }
            var resLen = _ResidentQueue.getSize();
            var readyLen = _ReadyQueue.getSize();
            for (var i = 0; i < resLen; i++) {
                _ResidentQueue.dequeue();
            }
            for (var j = 0; j < readyLen; j++) {
                _ReadyQueue.dequeue();
            }
        }
        contextSwitch() {
            console.log("in context switch");
            _currPcb.state = "Ready";
            TSOS.Control.updatePCBTable(_currPcb.PID, _currPcb.state, _currPcb.PC, _currPcb.IR, _currPcb.Acc.toString(16).toUpperCase(), _currPcb.Xreg.toString(16).toUpperCase(), _currPcb.Yreg.toString(16).toUpperCase(), _currPcb.Zflag.toString(16).toUpperCase(), _currPcb.base);
            _ReadyQueue.enqueue(_currPcb);
            cpuCycles = 0;
            _Scheduler.getNewProc();
            console.log("current pcb after getting new proc: " + _currPcb.PID);
            _Scheduler.setCPU();
        }
        //
        // OS Utility Routines
        //
        krnTrace(msg) {
            // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
            if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        TSOS.Control.hostLog(msg, "OS");
                    }
                }
                else {
                    TSOS.Control.hostLog(msg, "OS");
                }
            }
        }
        krnTrapError(msg) {
            //clear the screen, reset the position, and print text at top
            _Console.clearScreen();
            _Console.resetXY();
            TSOS.Control.hostLog("OS ERROR - TRAP: " + msg);
            // TODO: Display error on console, perhaps in some sort of colored screen. (Maybe blue?)
            _DrawingContext.fillStyle = 'blue';
            _DrawingContext.fillRect(0, 0, _Canvas.width, _Canvas.height);
            _StdOut.putText("OS ERROR - TRAP: " + msg);
            this.krnShutdown();
        }
    }
    TSOS.Kernel = Kernel;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=kernel.js.map