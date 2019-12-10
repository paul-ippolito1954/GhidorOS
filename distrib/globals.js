/* ------------
   Globals.ts
   Global CONSTANTS and _Variables.
   (Global over both the OS and Hardware Simulation / Host.)
   This code references page numbers in the text book:
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */
//
// Global CONSTANTS (TypeScript 1.5 introduced const. Very cool.)
//
const APP_NAME = "GhidorOS"; // 'cause Bob and I were at a loss for a better name.
const APP_VERSION = "0.1954"; // What did you expect?
const CPU_CLOCK_INTERVAL = 100; // This is in ms (milliseconds) so 1000 = 1 second.
const TIMER_IRQ = 0; // Pages 23 (timer), 9 (interrupts), and 561 (interrupt priority).
// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
const KEYBOARD_IRQ = 1;
const OPCODE_ERROR_IRQ = 2;
const OUTPUT_IRQ = 3;
const COMPLETE_PROC_IRQ = 4;
const CONTEXT_SWITCH_IRQ = 5;
const KILL_PROC_IRQ = 6;
const MEMORY_ACCESS_IRQ = 7;
//
// Global Variables
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
//var _CPU: TSOS.Cpu;  // Utilize TypeScript's type annotation system to ensure that _CPU is an instance of the Cpu class.
var _OSclock = 0; // Page 23.
var _Mode = 0; // (currently unused)  0 = Kernel Mode, 1 = User Mode.  See page 21.
//user program memory
var _userProgram = null;
var _Pid = 0;
var _Canvas; // Initialized in Control.hostInit().
var _DrawingContext; // = _Canvas.getContext("2d");  // Assigned here for type safety, but re-initialized in Control.hostInit() for OCD and logic.
var _DefaultFontFamily = "sans"; // Ignored, I think. The was just a place-holder in 2008, but the HTML canvas may have use for it.
var _DefaultFontSize = 13;
var _FontHeightMargin = 4; // Additional space added to font size when advancing a line.
var _Status = "Bidibidi means hello";
var _Trace = true; // Default the OS trace to be on.
// The OS Kernel and its queues.
var _Kernel;
var _KernelInterruptQueue; // Initializing this to null (which I would normally do) would then require us to specify the 'any' type, as below.
var _KernelInputQueue = null; // Is this better? I don't like uninitialized variables. But I also don't like using the type specifier 'any'
var _KernelBuffers = null; // when clearly 'any' is not what we want. There is likely a better way, but what is it?
// Standard input and output
var _StdIn; // Same "to null or not to null" issue as above.
var _StdOut;
// UI
var _Console;
var _OsShell;
var _Control;
var _Scheduler;
// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;
// Global Device Driver Objects - page 12
var _krnKeyboardDriver; //  = null;
var _krnFileSystem;
var _hardwareClockID = null;
// For testing (and enrichment)...
var Glados = null; // This is the function Glados() in glados.js on Labouseur.com.
var _GLaDOS = null; // If the above is linked in, this is the instantiated instance of Glados.
//	Hardware	(host)
var _CPU;
var _Memory;
var _MemoryAccessor;
//	Software	(OS)
var _MemoryManager = null;
var _Pcb;
var _ResidentQueue;
var _ReadyQueue;
var cpuCycles = 0;
//limit reg;
var _limit = 255;
//current process
var _currPcb;
var _Interrupt;
var _Swapper;
//run all
var runall = false;
var killall = false;
// initialize schedule to Round Robin
var _schedule = "rr";
var onDocumentLoad = function () {
    TSOS.Control.hostInit();
};
//# sourceMappingURL=globals.js.map