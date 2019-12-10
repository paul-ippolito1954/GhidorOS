///<reference path="../globals.ts" />
///<reference path="deviceDriver.ts" />
///<reference path="console.ts" />

module TSOS {
    export class DeviceDriverFileSystem extends DeviceDriver{
        
        public track: number;
        public sector: number;
        public block: number;
        public blockSize: number;

        constructor(){
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
        public krnFileSysDriverEntry(){

            //Inititalization for kernel mode keyboard device driver
            this.status = "loaded";

            if(sessionStorage){
                var tsb: string;

                var lineValue = [];

                // set bits for available and pointer
                for (var i = 0; i < 4; i++){
                    lineValue.push["00"];
                }

                // create tsb for every track sector block and store in sessionstorage
                // with lineValue
                for(var i = 0; i < this.track; i++){
                    for(var j = 0; j < this.sector; j++){
                        for(var k = 0; k < this.block; k++){
                            tsb = i.toString() + j.toString() + k.toString();
                            sessionStorage.setItem(tsb, JSON.stringify(lineValue));
                        }
                    }
                }
            }
            else
              console.log("Your Browser does not support session storage");

        }
    }
}