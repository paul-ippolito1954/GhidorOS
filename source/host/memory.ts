///<reference path="../globals.ts" />

/* ------------
     memory.ts
     Requires global.ts.
     ------------ */

     module TSOS{

        export class Memory {

            public memArray: string[];

            public init(){

                // create the actual array and values
                this.memArray = new Array<string>();

                // size is 768, as it is our maximum

                for(var i = 0; i < 768; i++){

                    // load it with initial 00 values
                    this.memArray[i] = "00";
                }

            }
        }

     }