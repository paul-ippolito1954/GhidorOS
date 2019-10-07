///<reference path="../globals.ts" />
///<reference path="../../source/os/canvastext.ts" />

/* ------------
     Control.ts

     Requires globals.ts.

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {

    export class Control {

        public static tbl  = document.createElement('table');

        public static hostInit(): void {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = <HTMLCanvasElement>document.getElementById('display');

            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");

            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            CanvasTextFunctions.enable(_DrawingContext);   // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("taHostLog")).value="";

            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            (<HTMLInputElement> document.getElementById("btnStartOS")).focus();

            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }

        public static hostLog(msg: string, source: string = "?"): void {
            // Note the OS CLOCK.
            var clock: number = _OSclock;

            // Note the REAL clock in milliseconds since January 1, 1970.
            var now: number = new Date().getTime();

            // Build the log string.
            var str: string = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now  + " })"  + "\n";

            // Update the log console.
            var taLog = <HTMLInputElement> document.getElementById("taHostLog");
            taLog.value = str + taLog.value;

            // TODO in the future: Optionally update a log database or some streaming service.
        }


        //
        // Host Events
        //
        public static hostBtnStartOS_click(btn): void {
            // Disable the (passed-in) start button...
            btn.disabled = true;

            // .. enable the Halt and Reset buttons ...
            (<HTMLButtonElement>document.getElementById("btnHaltOS")).disabled = false;
            (<HTMLButtonElement>document.getElementById("btnReset")).disabled = false;

            // .. set focus on the OS console display ...
            document.getElementById("display").focus();

            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new Cpu();  // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init();       //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.

            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new Kernel();
            _Kernel.krnBootstrap();  // _GLaDOS.afterStartup() will get called in there, if configured.

           
            this.loadTable();
            
            
        }

        public static hostBtnHaltOS_click(btn): void {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }

        public static hostBtnReset_click(btn): void {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload(true);
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }

         //method to clear the memory table
         public static clearTable():void {
            var tableDiv = document.getElementById("divMemory");
            //loop down to delete every row
            for(var i = this.tbl.rows.length - 1; i >= 0; i--)
                this.tbl.deleteRow(i);
            //make the table disappear
            tableDiv.removeChild(this.tbl);
        }

        //method to update the memory table
        public static loadTable():void {
            //find table div and set id
            var tableDiv = document.getElementById("divMemory");
            this.tbl.setAttribute("id", "tableMemory");
            //set equal to number that memory column header should be equal to
            var memNum = 0;

            //loop through 32 times to create 32 rows
            for(var i = 0; i < 32; i++){
                var tr = this.tbl.insertRow();
                //create 9 columns in those rows
                for(var j = 0; j < 9; j++){
                    var td = tr.insertCell();
                    //if first in column
                    if(j == 0) {
                        var hexNum = memNum.toString(16).toUpperCase();
                        //if single digit, add 0x00 in front
                        if(hexNum.length == 1)
                            td.appendChild(document.createTextNode("0x00" + hexNum));
                        //if two digits, add 0x0 in front
                        else if(hexNum.length == 2)
                            td.appendChild(document.createTextNode("0x0" + hexNum));
                        //if three digits, add 0x in front
                        else
                            td.appendChild(document.createTextNode("0x" + hexNum));
                    }
                    //if not first in column
                    else {
                        //add memory value to cell
                        td.appendChild(document.createTextNode(_Memory.memArray[_Memory.memArrayPosition]));

                        //if not at the end of the row, increment row count
                        _Memory.memArrayPosition++;
                    }
                }
                //increment column header by 8
                memNum += 8;
            }
            //add to page
            tableDiv.appendChild(this.tbl);
            //set height and overflow of memory table
            document.getElementById("tableMemory").style.height = '100px';
            document.getElementById("tableMemory").style.overflow = 'auto';
            //reset counters to 0
            _Memory.memArrayPosition = 0;
        }

        public static updatePCB(pid: string, status: string, pc: string, acc: string, ir: string, xreg: string, yreg: string, zflag: string): void {
            document.getElementById("pcbPID").innerHTML = pid;
            document.getElementById("pcbStatus").innerHTML = status;
            document.getElementById("pcbPC").innerHTML = pc;
            document.getElementById("pcbAcc").innerHTML = acc;
            document.getElementById("pcbIR").innerHTML = ir;
            document.getElementById("pcbXreg").innerHTML = xreg;
            document.getElementById("pcbYreg").innerHTML = yreg;
            document.getElementById("pcbZflag").innerHTML = zflag;
        }

        public static updateCPU(PC: string, Acc: string, IR: string, Xreg: string, Yreg: string, Zflag: string): void {
            document.getElementById("PC").innerHTML = PC;
            document.getElementById("Acc").innerHTML = Acc;
            document.getElementById("IR").innerHTML = IR;
            document.getElementById("Xreg").innerHTML = Xreg;
            document.getElementById("Yreg").innerHTML = Yreg;
            document.getElementById("Zflag").innerHTML = Zflag;
        }

    }
}  