///<reference path="../globals.ts" />
/* ------------
     memory.ts
     Requires global.ts.
     ------------ */
var TSOS;
(function (TSOS) {
    class Memory {
        constructor() {
            this.memArray = ["0", "0", "0", "0", "0", "0", "0", "0",
                "0", "0", "0", "0", "0", "0", "0", "0",
                "0", "0", "0", "0", "0", "0", "0", "0",
                "0", "0", "0", "0", "0", "0", "0", "0"];
            this.memArrayCount = 0;
        }
        init() {
            this.printTable();
        }
        //prints the memory table
        printTable() {
            var tableDiv = document.getElementById("divMemory");
            var tbl = document.createElement('table');
            for (var i = 0; i < 4; i++) {
                var tr = tbl.insertRow();
                for (var j = 0; j < 8; j++) {
                    if (i == 4 && j == 8) {
                        break;
                    }
                    else {
                        var td = tr.insertCell();
                        td.appendChild(document.createTextNode(this.memArray[this.memArrayCount]));
                        this.memArrayCount++;
                    }
                }
            }
            tableDiv.appendChild(tbl);
        }
    }
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memory.js.map