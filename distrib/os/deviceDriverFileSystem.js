///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
///<reference path="console.ts" />
var TSOS;
(function (TSOS) {
    class DeviceDriverFileSystem extends TSOS.DeviceDriver {
        constructor() {
            super();
            this.driverEntry = this.krnFileSysDriverEntry;
            this.track = 4;
            this.sector = 8;
            this.block = 8;
            this.blockSize = 60;
        }
        /**
         * initializes sessionstorage if the browser user is on supports the HTML5 storage
         */
        krnFileSysDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
            if (sessionStorage) {
                var tsb;
                var lineValue = [];
                //set single bits for available bit and pointer
                for (var i = 0; i < 4; i++) {
                    lineValue.push("0");
                }
                //set base line values to 00
                for (var i = 0; i < this.blockSize; i++) {
                    lineValue.push("00");
                }
                //create tsb for each track sector block and store in session storage with linevalue
                sessionStorage.clear();
                for (var i = 0; i < this.track; i++) {
                    for (var j = 0; j < this.sector; j++) {
                        for (var k = 0; k < this.block; k++) {
                            tsb = i.toString() + j.toString() + k.toString();
                            sessionStorage.setItem(tsb, JSON.stringify(lineValue));
                        }
                    }
                }
            }
            else {
                console.log("Sorry your browser does not support Session Storage.");
            }
        }
    }
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverFileSystem.js.map