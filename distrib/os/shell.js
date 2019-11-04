///<reference path="../globals.ts" />
///<reference path="../utils.ts" />
///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    class Shell {
        constructor() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
            this.status = "Running";
            // for some odd reason, will skip 1 and go to 2 if loaded twice
            // initalizing to -1 and increasing pids first remedies this
            this.pids = -1;
        }
        init() {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            //whereami
            sc = new TSOS.ShellCommand(this.shellWhereami, "whereami", " - Displays current location");
            this.commandList[this.commandList.length] = sc;
            //date
            sc = new TSOS.ShellCommand(this.shellDate, "date", " - Displays current date and time");
            this.commandList[this.commandList.length] = sc;
            //combust
            sc = new TSOS.ShellCommand(this.shellCombust, "combust", " - Combustible Lemons");
            this.commandList[this.commandList.length] = sc;
            //BSOD
            sc = new TSOS.ShellCommand(this.shellBSOD, "bsod", " - does bluescreen of death error");
            this.commandList[this.commandList.length] = sc;
            //load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", " - Loads and validates user input");
            this.commandList[this.commandList.length] = sc;
            // status
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "<string> - Set status message.");
            this.commandList[this.commandList.length] = sc;
            //run
            sc = new TSOS.ShellCommand(this.shellRun, "run", "<pid> - runs program with process id <pid>");
            this.commandList[this.commandList.length] = sc;
            //clearmem
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", "clears memory if nothing is running");
            this.commandList[this.commandList.length] = sc;
            //runall
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "runs all processes loaded");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            sc = new TSOS.ShellCommand(this.shellPs, "ps", "displays all IDs and states of all processes");
            this.commandList[this.commandList.length] = sc;
            // kill <id> - kills the specified process id.
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "<pid> - kills specified process with speciifed pid");
            this.commandList[this.commandList.length] = sc;
            // killall - becasue killing one wasn't enough
            sc = new TSOS.ShellCommand(this.shellKillAll, "killall", "kills all processes");
            this.commandList[this.commandList.length] = sc;
            //quantum - set new Round Robin Quantum
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "<int> - sets Round Robin Quantum to new int");
            this.commandList[this.commandList.length] = sc;
            //
            // Display the initial prompt.
            this.putPrompt();
        }
        putPrompt() {
            _StdOut.putText(this.promptStr);
        }
        handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.  TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }
        // Note: args is an option parameter, ergo the ? which allows TypeScript to understand that.
        execute(fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }
        parseInput(buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }
        //
        // Shell Command Functions.  Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }
        shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }
        shellApology() {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        }
        shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }
        shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }
        shellShutdown(args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }
        shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }
        shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shutdown shuts down the operating systems.");
                        break;
                    case "whereami":
                        _StdOut.putText("whereami displays your current location");
                        break;
                    case "combust":
                        _StdOut.putText("Engages combustible lemons. I wouldn't if I were you...");
                        break;
                    case "date":
                        _StdOut.putText("Date displays the current date and time.");
                        break;
                    case "bsod":
                        _StdOut.putText("Forces bluescreen trap error.");
                        break;
                    case "load":
                        _StdOut.putText("Loads and validates hex input from User Program Input, loads valid hex as program to memory");
                        break;
                    case "status":
                        _StdOut.putText("Status <string> sets the status message on the task bar.");
                        break;
                    case "cls":
                        _StdOut.putText("Clears the screen and resets cursor position");
                        break;
                    case "run":
                        _StdOut.putText("runs/executes program with the entered pid");
                        break;
                    case "clearmem":
                        _StdOut.putText("Clears memory if no processes running");
                        break;
                    case "runall":
                        _StdOut.putText("Will run all programs in resident queue");
                        break;
                    case "ps":
                        _StdOut.putText("Displays all process IDs and states of the processes");
                        break;
                    case "kill":
                        _StdOut.putText("Will kill speciifed process with speciifed pid");
                        break;
                    case "killall":
                        _StdOut.putText("Will kill ALL processes. Releases King Ghidorah");
                        break;
                    case "quantum":
                        _StdOut.putText("Sets Round Robin processing quantum to your integer");
                        break;
                    // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }
        shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }
        shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }
        shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }
        shellWhereami() {
            _StdOut.putText("You're in a room, staring blankly at a screen.");
        }
        shellDate() {
            _StdOut.putText("The current date and time are: Today and right now");
        }
        shellCombust() {
            _StdOut.putText("Engaging combustible lemons!");
            _StdOut.advanceLine();
            _StdOut.putText("Shutting down...Critical error...");
            _Kernel.krnShutdown();
        }
        shellBSOD() {
            _Kernel.krnTrapError("Error caused by YOU");
        }
        /**
         * Reads in the code from the UserProgramInput
         * validates if hex. If valid hex, allocate to a free memory partition
         * and update memory to reflect that. If not valid hex or memory is full,
         * inform the user of either respectively.
         */
        shellLoad() {
            //store the user input in a variable
            var programInput = document.getElementById("taProgramInput").value;
            //console.log(programInput);
            //set valid to true
            var valid = true;
            //regex pattern
            var hex = new RegExp('([a-fA-F0-9][a-fA-F0-9]([ ]*))+');
            //if no input is in the text area
            if (programInput == "") {
                //tell the user and set valid to false.
                _StdOut.putText("No user program entered.");
                valid = false;
                //if something besides valid hex is found
            }
            else if (programInput.search(hex) == -1) {
                _StdOut.putText("User code is invalid.");
                valid = false;
            }
            else if (valid == true) {
                //put user program in array and check size
                _userProgram = programInput.split(" ");
                if (_userProgram.length > 255) {
                    _StdOut.putText("Program too large for available memory space.");
                }
                else {
                    //load into memory
                    var base = _MemoryManager.loadMem(_userProgram);
                    console.log("Base on load: " + base);
                    if (base == -1) {
                        _StdOut.putText("No space in memory left.");
                    }
                    else {
                        _StdOut.putText("Program loaded into memory with Process ID " + _Pid);
                        //call kernel to create a new process
                        _Kernel.createProcess(base);
                    }
                }
            }
        }
        /**
         * Changes the status message in taskBar to whatever the user
         * inputs. so status cake is a thing. It also clears the inital
         * status message from startup.
         * @param args
         */
        shellStatus(args) {
            // check arguments
            if (args.length > 0) {
                //clear the hardcoated status
                _Status = "";
                //for each item in args
                for (let item of args) {
                    //add it to the status
                    _Status += item + " ";
                }
            }
            else {
                _StdOut.putText("Usage: status <string>  Please supply a string.");
            }
        }
        /**
         * This will run the process with the asociated pid if it exists
         * will accept run 0, check if 0 is a valid pid, and run if it is
         * @param args
         */
        shellRun(args) {
            // set pid to first argument
            var pid = args[0];
            var valid = false;
            // length of resident queue
            var resLen = _ResidentQueue.getSize();
            // loop through to see if valid PIDs
            for (var i = 0; i < resLen; i++) {
                var temp = _ResidentQueue.q[i].PID;
                if (temp == pid.toString()) {
                    valid = true;
                    break;
                }
            }
            if (valid) {
                _Kernel.executeProcess(pid);
            }
            else {
                _StdOut.putText("Not a valid Pid");
            }
        }
        /**
         * ClearMem will only work if CPU is not running ANY programs.
         * So, we check if CPU isExecuting. If it is not, go ahead
         * and clear the memory. If it IS, NO! THAT'S BAD! BAD USER!
         */
        shellClearMem() {
            if (_CPU.isExecuting == false) {
                _Kernel.clearMemory();
                _StdOut.putText("Memory successfully cleared");
            }
            else {
                _StdOut.putText("Cannot clear memory while program is running.");
            }
        }
        /**
         * This will run ALL loaded programs.
         * Even if one program is already being executed,
         * this will make the others run as well. This will
         * only work if there's actually something in the resident
         * queue to actualy run, however.
         */
        shellRunAll() {
            if (_ResidentQueue.getSize() == 0) {
                _StdOut.putText("No processes to run");
            }
            else {
                _Kernel.executeAll();
            }
        }
        /**
         * Displays information for all processes and their current states
         */
        shellPs() {
            var resLen = _ResidentQueue.getSize();
            console.log("Len res: " + resLen);
            var readyLen = _ReadyQueue.getSize();
            console.log("Len ready: " + readyLen);
            for (var j = 0; j < readyLen; j++) {
                console.log(_ReadyQueue.q[j]);
            }
            if (_currPcb.PID != "-") {
                _StdOut.putText(_currPcb.PID + ": " + _currPcb.state);
                _StdOut.advanceLine();
            }
            if ((resLen == 0) && (readyLen == 0)) {
                _StdOut.putText("No current processes loaded.");
            }
            else if ((resLen > 0) && (readyLen == 0)) {
                console.log("res > 0, ready = 0");
                for (var i = 0; i < resLen; i++) {
                    var pcb = _ResidentQueue.q[i];
                    _StdOut.putText(pcb.PID + ": " + pcb.state);
                    _StdOut.advanceLine();
                }
            }
            else if ((resLen == 0) && (readyLen > 0)) {
                console.log("res = 0, ready > 0");
                for (var i = 0; i < readyLen; i++) {
                    var pcb = _ReadyQueue.q[i];
                    _StdOut.putText(pcb.PID + ": " + pcb.state);
                    _StdOut.advanceLine();
                }
            }
            else {
                for (var i = 0; i < readyLen; i++) {
                    console.log("res > 0, ready > 0");
                    var pcb = _ReadyQueue.q[i];
                    _StdOut.putText(pcb.PID + ": " + pcb.state);
                    _StdOut.advanceLine();
                }
                for (var i = 0; i < resLen; i++) {
                    var pcb = _ResidentQueue.q[i];
                    _StdOut.putText(pcb.PID + ": " + pcb.state);
                    _StdOut.advanceLine();
                }
            }
        }
        /**
         * kills specified process with pid
         * @param args
         */
        shellKill(args) {
            var pid = args[0];
            var location;
            var found = false;
            if (_currPcb.PID == pid) {
                found = true;
                location = "current";
            }
            for (var i = 0; i < _ResidentQueue.getSize(); i++) {
                var temp = _ResidentQueue.q[i];
                if (pid == temp.PID) {
                    found = true;
                    location = "resident";
                }
            }
            for (var i = 0; i < _ReadyQueue.getSize(); i++) {
                var temp = _ReadyQueue.q[i];
                if (pid == temp.PID) {
                    found = true;
                    location = "ready";
                }
            }
            if (found) {
                var killInfo = [];
                killInfo[0] = pid;
                killInfo[1] = location;
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(KILL_PROC_IRQ, killInfo));
                _StdOut.putText("Killing the process");
            }
            else {
                _StdOut.putText("No process with that PID.");
            }
        }
        shellKillAll() {
            _StdOut.putText("CHITTY CHITTY BANG");
            _StdOut.advanceLine();
            _StdOut.putText("MURDER EVERYTHING");
        }
        /**
         * Sets roundrobin quantum to user's desired int
         * as long as it is greater than 0
         * @param args
         */
        shellQuantum(args) {
            var quantNum = args[0];
            if (quantNum > 0) {
                _Scheduler.quantum = quantNum;
                _StdOut.putText("Setting quantum to " + quantNum);
            }
            else {
                _StdOut.putText("Quantum must be greater than 0.");
            }
        }
    }
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=shell.js.map