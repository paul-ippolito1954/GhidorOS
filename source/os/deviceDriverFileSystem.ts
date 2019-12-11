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

        public krnFileSysDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?

            if (sessionStorage){
                var tsb: string;

                var lineValue = [];

                //set single bits for available bit and pointer
                for (var i = 0; i < 4; i++){
                    lineValue.push("0")
                }

                //set base line values to 00
                for (var i = 0; i < this.blockSize; i++){
                    lineValue.push("00");
                }

                //create tsb for each track sector block and store in session storage with linevalue
                sessionStorage.clear();
                for (var i = 0; i < this.track; i++){
                    for (var j = 0; j < this.sector; j++){
                        for (var k = 0; k < this.block; k++){
                            tsb = i.toString() + j.toString() + k.toString();
                            sessionStorage.setItem(tsb, JSON.stringify(lineValue));
                        }
                    }
                }
            }else{

                console.log("Sorry your browser does not support Session Storage.");
            }

        }


        /**
         * Create new file and store it
         * @param filename 
         */
        public createFile(filename): string{

            var hexName = this.convertToAscii(filename);

            //check for existing filename
            if (this.fileNameExists(hexName)){
                return "File name already exists.";
            }else{
                //loop through disk to find first available block after MBR
                for (var i = 0; i < this.track; i++){
                    for (var j = 0; j < this.sector; j++){
                        for (var k = 0; k < this.block; k++){
                            var tsb = i.toString() + j.toString() + k.toString();
                            if (tsb == "100"){
                                return "Disk space is full."
                            }
                            var currBlock = JSON.parse(sessionStorage.getItem(tsb));

                            if (tsb !== "000"){

                                //check if available bit is 0 (not in use)
                                if (currBlock[0] == "0"){
                                    //we can use this block!

                                    //set available bit to 1
                                    currBlock[0] = "1";

                                    //setpointer
                                    var pointerTsb = this.getPointer();
                                    if (pointerTsb == null){
                                        return "No space to store content of file.";
                                    }
                                    for (var a = 1; a < 4; a++){
                                        currBlock[a] = pointerTsb[a-1];
                                    }

                                    //set pointer tsb available bit to 1
                                    var pointer = JSON.parse(sessionStorage.getItem(pointerTsb));
                                    pointer[0] = "1";
                                    sessionStorage.setItem(pointerTsb, JSON.stringify(pointer));

                                    //set filename starting at index 4
                                    for (var b = 0; b < hexName.length; b++){
                                        currBlock[b+4] = hexName[b];
                                    }
                                    sessionStorage.setItem(tsb, JSON.stringify(currBlock));
                                    console.log("Set file name: " + hexName);
                                    console.log("Original name: " + filename);
                                    if (filename[0] == "."){
                                        return ("Successfully created hidden file: " + filename);
                                    }else{
                                        return ("Successfully created file: " + filename);
                                    }

                                }
                            }
                        }
                    }
                }
            }
        }

        /**
         * Writes data to a file if it exists
         * and data is given
         * @param filename 
         * @param str 
         */
        public writeFile(filename, str){

            var hexName = this.convertToAscii(filename);

            //check if filename exists
            if (this.fileNameExists(hexName)){

                //get tsb from the given filename
                var currTsb = this.getTsb(filename);

                //get current block from that tsb
                var currBlock = JSON.parse(sessionStorage.getItem(currTsb));

                //find pointerlocation of that tsb
                var pointerTsb = currBlock[1] + currBlock[2] + currBlock[3];

                //clear current data at the pointer
                var pointer = JSON.parse(sessionStorage.getItem(pointerTsb));
                pointer = this.clearData(pointerTsb);

                //convert the given string to a hexstring
                var hexStr = this.convertToAscii(str);

                if (str.length > 60){

                    //continue this loop until string is no longer 60 characters
                    while (str.length > 60){

                        //separate the string into the first 60 bits and the rest
                        var firstPart = str.substring(0, 60);
                        firstPart = this.convertToAscii(firstPart);
                        var str = str.substring(61);

                        //get a new pointer file to assign to the current pointer file for rest of string
                        var newPointerTsb = this.getPointer();
                        if (newPointerTsb == null){
                            return "Out of space on disk to continue writing file.";
                        }
                        var newPointer = JSON.parse(sessionStorage.getItem(newPointerTsb));
                        //change available bit of new pointer to 1
                        newPointer[0] = "1";
                        sessionStorage.setItem(newPointerTsb, JSON.stringify(newPointer));

                        //update original pointer bits with new pointer tsb
                        for (var i = 1; i < 4; i++){
                            pointer[i] = newPointerTsb[i-1];
                        }

                        //update pointer file with firstpart
                        for (var j = 0; j < firstPart.length; j++){
                            pointer[j+4] = firstPart[j];
                        }

                        //write the first 60 characters to the pointer file in sessionstorage
                        sessionStorage.setItem(pointerTsb, JSON.stringify(pointer));

                        pointer = newPointer;
                        pointerTsb = newPointerTsb;

                        if (str.length < 60){
                            str = this.convertToAscii(str);
                            for (var k = 0; k < str.length; k++){
                                pointer[k+4] = str[k];
                            }
                            sessionStorage.setItem(pointerTsb, JSON.stringify(pointer));
                        }

                    }
                }else{
                    //set the hex value of the string in the pointer block
                    for (var a = 0; a < hexStr.length; a++){
                        pointer[a+4] = hexStr[a];
                    }
                    sessionStorage.setItem(pointerTsb, JSON.stringify(pointer));
                    console.log(hexStr + " - original: " + str + " - wrote to " + pointerTsb);
                }

                return ("Successfull wrote to file: " + filename);

            }else{
                return ("Filename does not exist");
            }

        }

        /**
         * Clear the data on a line
         * @param tsb 
         */
        public clearData(tsb){

            var lineValue = [];

            //set base line values to 00
            for (var i = 0; i < this.blockSize; i++){
                lineValue.push("00");
            }

            var currBlock = JSON.parse(sessionStorage.getItem(tsb));

            for (var i = 0; i < lineValue.length; i++){
                currBlock[i+4] = lineValue[i];
            }
            return currBlock;
        }

        //clear everything on line including pointer val and available bit
        public clearLine(tsb){

            var lineValue = [];

            //reset pointer and available bits
            for (var i = 0; i < 4; i++){
                lineValue.push("0");
            }

            //reset data section
            for (var j = 0; j < this.blockSize; j++){
                lineValue.push("00");
            }

            var currBlock = JSON.parse(sessionStorage.getItem(tsb));

            //write cleared line to current block
            for (var k = 0; k < lineValue.length; k++){
                currBlock[k] = lineValue[k];
            }
            return currBlock;
        }



        /**
         * Retrieves the TSB of a given filename
         * @param filename 
         */
        public getTsb(filename): string{

            var hexName = this.convertToAscii(filename);

            for (var i = 0; i < this.track; i++){
                for (var j = 0; j < this.sector; j++){
                    for (var k = 0; k < this.block; k++){

                        //boolean var for filename exists set tot true
                        var filenameExists = true;

                        //set tsb var
                        var tsb = i.toString() + j.toString() + k.toString();

                        //get the filename in disk
                        var dirFileName = JSON.parse(sessionStorage.getItem(tsb));

                        //loop through filename and dirfilename and check for matches in each letter
                        for (var a = 0; a < hexName.length; a++){
                            //console.log(dirFileName[a + 4] == filename[a]);
                            //if any are different, set filename exists to false
                            if (dirFileName[a + 4] != hexName[a]){
                                filenameExists = false;
                            }

                        }
                        //if filenameexists is true after looping through filename
                        //check next character of dirfilename in case name is longer than filename
                        if (filenameExists){
                            //if its not zero then filenames are different
                            //so set filenameexists to false
                            if (dirFileName[hexName.length + 4] != "00"){
                                filenameExists = false;
                            }
                        }

                        //stop the loop if filenameexists is true
                        if (filenameExists){
                            return tsb;
                        }
                    }
                }
            }
        }

        /**
         * read data from a file
         * @param filename 
         */
        public readFile(filename){

            var hexName = this.convertToAscii(filename)
            var hexArr = []
            var str = "";

            //check if filename exists
            if (this.fileNameExists(hexName)){
                //get the tsb of the file and data at that block
                var tsb = this.getTsb(filename);
                var currBlock = JSON.parse(sessionStorage.getItem(tsb));
                //find the pointer of the filename block
                var pointerTsb = currBlock[1] + currBlock[2] + currBlock[3];
                var pointer = JSON.parse(sessionStorage.getItem(pointerTsb));
                //get the pointer's pointer
                var newPointerTsb = pointer[1] + pointer[2] + pointer[3];


                if (newPointerTsb == "000"){
                    //grab the data from the pointer and convert hexstring to regular string
                    for (var i = 4; i < pointer.length; i++){
                        if (pointer[i] != "00"){
                            hexArr[i-4] = pointer[i];
                        }
                    }
                    str = this.convertToString(hexArr);
                    return str;
                }else{
                    while (newPointerTsb != "000"){

                        //check what pointer bits are
                        newPointerTsb = pointer[1] + pointer[2] + pointer[3];

                        //add pointer data to hexstr
                        for (var j = 4; j < pointer.length; j++){
                            if (pointer[j] != "00"){
                                hexArr.push(pointer[j]);
                            }
                        }

                        //go to new pointer
                        var newPointer = JSON.parse(sessionStorage.getItem(newPointerTsb));

                        //set to current pointer
                        pointer = newPointer;
                        pointerTsb = newPointerTsb;
                    }

                    str = this.convertToString(hexArr);
                    return str;
                }

            }
            else{
                return "File name does not exist.";
            }

        }

        /**
         * Delete file if it exists
         * @param filename 
         */
        public deleteFile(filename){

            var hexName = this.convertToAscii(filename);
            var currBlock;
            var pointer;
            var pointerTsb;

            if (this.fileNameExists(hexName)){

                //get current block and pointer tsb of that block
                var tsb = this.getTsb(filename);
                currBlock = JSON.parse(sessionStorage.getItem(tsb));
                pointerTsb = currBlock[1] + currBlock[2] + currBlock[3];


                //while there are still pointer files left
                while(pointerTsb != "000"){

                    pointerTsb = currBlock[1] + currBlock[2] + currBlock[3];

                    //clear the currentLine and write to session storage
                    currBlock = this.clearLine(tsb);
                    sessionStorage.setItem(tsb, JSON.stringify(currBlock));

                    //get pointer from pointer tsb
                    pointer = JSON.parse(sessionStorage.getItem(pointerTsb));

                    currBlock = pointer;
                    tsb = pointerTsb;

                }

                return ("Successfully deleted file: " + filename);

            }
            else{
                return "File name does not exist.";
            }

        }

        //format first four bits of each block
        public formatQuick(){

        }

        //format entirety of each block
        public formatFull(){

        }

        //check if filename exists
        public fileNameExists(filename){
            //loop through disk and look for matching filename
            for (var i = 0; i < this.track; i++){
                for (var j = 0; j < this.sector; j++){
                    for (var k = 0; k < this.block; k++){

                        //boolean var for filename exists set tot true
                        var filenameExists = true;

                        //set tsb var
                        var tsb = i.toString() + j.toString() + k.toString();

                        //get the filename in disk
                        var dirFileName = JSON.parse(sessionStorage.getItem(tsb));

                        //loop through filename and dirfilename and check for matches in each letter
                        for (var a = 0; a < filename.length; a++){
                            //console.log(dirFileName[a + 4] == filename[a]);
                            //if any are different, set filename exists to false
                            if (dirFileName[a + 4] != filename[a]){
                                filenameExists = false;
                            }

                        }
                        //if filenameexists is true after looping through filename
                        //check next character of dirfilename in case name is longer than filename
                        if (filenameExists){
                            //if its not zero then filenames are different
                            //so set filenameexists to false
                            if (dirFileName[filename.length + 4] != "00"){
                                filenameExists = false;
                            }
                        }
                        //stop the loop if filenameexists is true
                        if (filenameExists){
                            return filenameExists;
                        }
                    }
                }
            }
            //return filenameexists after looping through all
            return filenameExists;

        }

        //convert string to ascii to hex
        public convertToAscii(data){

            //create an empty array for the new hex values for each letter
            var hexArr = [];

            //loop through string and convert each letter to ascii hex
            //and push to array
            for (var i = 0; i < data.length; i++){
                hexArr[hexArr.length] = data.charCodeAt(i).toString(16);
            }

            return hexArr;
        }

        //convert hex to ascii to string
        public convertToString(hexArr){

            //create empy string and variable for char
            var char;
            var str = "";

            //loop through hex array and convert each character to a letter and add to string
            for (var i = 0; i < hexArr.length; i++){
                char = String.fromCharCode(parseInt(hexArr[i], 16));
                str += char;
            }

            return str;

        }

        //find an available pointer
        public getPointer(){

            //start pointer section on the second track
            for (var i = 1; i < this.track; i++){
                for (var j = 0; j < this.sector; j++){
                    for (var k = 0; k < this.block; k++){

                        var tsb = i.toString() + j.toString() + k.toString();

                        var block = JSON.parse(sessionStorage.getItem(tsb));

                        //if block is available return the tsb
                        if (block[0] == "0"){
                            return tsb;
                        }

                    }
                }
            }
            //if none are available, return null
            return null;
        }

        /**
         * Lists files based on type
         * list is public if user did not use ls -l
         * no hidden files will show.
         * all files will show if they use ls -l
         * @param listType 
         */
        public listFiles(listType: string){

            var track = "0";
            var filenames = [];

            // loop through first dir (0) and skip MBR
            for (var i = 0; i < this.sector; i++){
                for (var j = 1; j < this.block; j++){
                    var tsb = track + i.toString() + j.toString();
                    var currBlock = JSON.parse(sessionStorage.getItem(tsb));

                    if (currBlock[0] == "1"){

                        var hexName = [];
                        var index = 4;
                        var filename = "";

                        while (currBlock[index] != "00"){
                            hexName[index - 4] = currBlock[index];
                            index++;
                        }

                        filename = this.convertToString(hexName);
                        if (listType == "all"){
                            // add all filenames if ls -l was chosen at shell
                            filenames[filenames.length] = filename;
                        }else if (listType == "public"){
                            if (filename[0] != "."){
                                // if list type is public, only add it if the first character is not a .
                                filenames[filenames.length] = filename;
                            }

                        }

                    }
                }
            }
            return filenames;
            
        }

        //load a process to the disk
        public loadProcessToDisk(pid, userProg){

            var foundLoc = false;

            //loop through first sector
            for (var j = 0; j < this.sector; j++){
                for (var k = 1; k < this.block; k++){
                    var tsb = "0" + j.toString() + k.toString();
                    //get the current block on each loop
                    var currBlock = JSON.parse(sessionStorage.getItem(tsb));

                    //if the available bit is zero we can use it
                    if (currBlock[0] == "0"){
                        //set found loc to true because we found a loc
                        foundLoc = true;

                        //change available bit to 1
                        currBlock[0] = "1";

                        //write process and pid as file name and set to block
                        var filename = ("process:" + pid);
                        var hexName = this.convertToAscii(filename);
                        for (var a = 0; a < hexName.length; a++){
                            currBlock[a+4] = hexName[a];
                        }

                        //find available pointertsb
                        var pointerTsb = this.getPointer();
                        if (pointerTsb == null){
                            return "No space on disk to store process.";
                        }
                        //get the pointer block
                        var pointer = JSON.parse(sessionStorage.getItem(pointerTsb));

                        //set available bit of pointer to 1
                        pointer[0] = "1";
                        sessionStorage.setItem(pointerTsb, JSON.stringify(pointer));

                        //update pointer bits on filename block
                        for (var b = 1; b < 4; b++){
                            currBlock[b] = pointerTsb[b-1];
                        }
                        //update currblock in session storage
                        sessionStorage.setItem(tsb, JSON.stringify(currBlock));

                        //write process to pointer file
                        this.writeProcessToDisk(pointerTsb, userProg);
                        return "SUCCESS";

                    }
                }
            }

            if (foundLoc == false){
                return "Disk is full. Program could not be loaded."
            }

        }

        /**
         * Retrieves process stored on the disk
         * @param filename 
         */
        public getProcessFromDisk(filename){

            var hexName = this.convertToAscii(filename)
            var program = [];

            //check if filename exists
            if (this.fileNameExists(hexName)){
                //get the tsb of the file and data at that block
                var tsb = this.getTsb(filename);
                var currBlock = JSON.parse(sessionStorage.getItem(tsb));

                //find the pointer of the filename block
                var pointerTsb = currBlock[1] + currBlock[2] + currBlock[3];
                var pointer = JSON.parse(sessionStorage.getItem(pointerTsb));

                //get the pointer's pointer
                var newPointerTsb = pointer[1] + pointer[2] + pointer[3];


                if (newPointerTsb == "000"){
                    //grab the data from the pointer and convert hexstring to regular string
                    for (var i = 4; i < pointer.length; i++){
                        program[i-4] = pointer[i];
                    }

                    //clear pointer block
                    pointer = this.clearLine(pointerTsb);
                    sessionStorage.setItem(pointerTsb, JSON.stringify(pointer));
                    return program;
                }
                else{
                    while (newPointerTsb != "000"){

                        //check what pointer bits are
                        newPointerTsb = pointer[1] + pointer[2] + pointer[3];

                        //add pointer data to program
                        for (var j = 4; j < pointer.length; j++){
                            program.push(pointer[j]);
                        }

                        //go to new pointer
                        var newPointer = JSON.parse(sessionStorage.getItem(newPointerTsb));

                        //clear the pointer line
                        pointer = this.clearLine(pointerTsb);
                        sessionStorage.setItem(pointerTsb, JSON.stringify(pointer));

                        //set to current pointer
                        pointer = newPointer;
                        pointerTsb = newPointerTsb;

                    }

                    sessionStorage.setItem(pointerTsb, JSON.stringify(pointer));
                    return program;
                }

            }else{
                return "File name does not exist.";
            }
        }

        //write a process to the disk
        public writeProcessToDisk(tsb, proc){

            //pointer block from the process filename
            var currBlock = JSON.parse(sessionStorage.getItem(tsb));

            //if process length is greater than 60
            if (proc.length > 60){
                var length = proc.length;
                var offset = 0;

                //do loop until the length > 60
                while (length > 60){
                    var firstPart = [];

                    //set first part to the first 60 bits and decrease length as counter
                    for (var i = 0; i < 60; i++){
                        if (length > 0){
                            firstPart[i] = proc[i + offset];
                            length--;
                        }
                    }

                    //get a new pointer file to assign to the current pointer file for rest of string
                    var pointerTsb = this.getPointer();
                    if (pointerTsb == null){
                        return "No space on disk to write rest of process";
                    }
                    //console.log("IN WRITE PROCESS TO DISK pointer tsb of next block to write to" + pointerTsb);

                    var pointer = JSON.parse(sessionStorage.getItem(pointerTsb));
                    //change available bit of new pointer to 1
                    pointer[0] = "1";
                    sessionStorage.setItem(pointerTsb, JSON.stringify(pointer));

                    //update original pointer bits with new pointer tsb
                    for (var i = 1; i < 4; i++){
                        currBlock[i] = pointerTsb[i-1];
                    }

                    //update pointer file with firstpart
                    for (var j = 0; j < firstPart.length; j++){
                        currBlock[j+4] = firstPart[j];
                    }

                    //write the first 60 characters to the pointer file in sessionstorage
                    sessionStorage.setItem(tsb, JSON.stringify(currBlock));

                    tsb = pointerTsb;
                    currBlock = pointer;

                    //increase offset
                    offset+=60;

                    //if rest of process is less than 60, deal with it now
                    if (length < 60){
                        for (var k = 0; k < this.blockSize; k++){
                            if (proc[k + offset] == undefined){
                                currBlock[k+4] = "00";
                            }else{
                                currBlock[k+4] = proc[k + offset];
                            }
                        }
                        sessionStorage.setItem(tsb, JSON.stringify(currBlock));
                    }
                }

            }else{
                //write each part of the process to a bit in the cirrent block
                for (var a = 0; a < proc.length; a++){
                    currBlock[a+4] = proc[a];
                }

                sessionStorage.setItem(tsb, JSON.stringify(currBlock));
            }
        }
    }
}
