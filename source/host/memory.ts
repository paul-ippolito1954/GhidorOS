///<reference path="../globals.ts" />

/* ------------
     memory.ts
     Requires global.ts.
     ------------ */

     module TSOS {

        export class Memory {

            // I will make this less disgusting another time
            // for now it works.

            public memArray = [["00","00","00","00","00","00","00","00", //section0 of memory
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00"],
                    ["00","00","00","00","00","00","00","00",  // section1 of memory
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00"],
                    ["00","00","00","00","00","00","00","00", // section2 of memory
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00",
                    "00","00","00","00","00","00","00","00"]
        ];
                        
            public memArrayPosition = 0;

            public section0Free = true;
            public section1Free = true;
            public section2Free = true;
    
    
            constructor(
    
    
                ) {
    
            }
    
            public init(): void {
    
            }
    
        }
    }