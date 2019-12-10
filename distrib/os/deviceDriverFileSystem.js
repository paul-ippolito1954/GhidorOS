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
            //Inititalization for kernel mode keyboard device driver
            this.status = "loaded";
            if (sessionStorage) {
                var tsb;
                var lineValue = [];
                // set bits for available and pointer
                for (var i = 0; i < 4; i++) {
                    lineValue.push["00"];
                }
                // create tsb for every track sector block and store in sessionstorage
                // with lineValue
                for (var i = 0; i < this.track; i++) {
                    for (var j = 0; j < this.sector; j++) {
                        for (var k = 0; k < this.block; k++) {
                            tsb = i.toString() + j.toString() + k.toString();
                            sessionStorage.setItem(tsb, JSON.stringify(lineValue));
                        }
                    }
                }
            }
            else
                console.log("Your Browser does not support session storage");
        }
        createFile(fileName) {
            var hexName = this.convertToAscii(fileName);
            return;
        }
        /**
         * converts given string to Ascii
         * @param data
         */
        convertToAscii(data) {
            // create an empty array for the new hex values for each letter
            var hexArr = [];
            // loop through string and convert each letter to ascii hex
            // and push to array
            for (var i = 0; i < data.length; i++) {
                hexArr[hexArr.length] = data.charCodeAt(i).toString(16);
            }
            return hexArr;
        }
        /**
         * converts hex to ascii to string
         * @param hexArr
         */
        convertToString(hexArr) {
            // create empty string and variable for char
            var char;
            var str = "";
            // loop through hex array and convert each character to a letter and add to string
            for (var i = 0; i < hexArr.length; i++) {
                char = String.fromCharCode(parseInt(hexArr[i], 16));
                str += char;
            }
            return str;
        }
    }
    TSOS.DeviceDriverFileSystem = DeviceDriverFileSystem;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=deviceDriverFileSystem.js.map