///<reference path="../globals.ts" />
/* ------------
     Console.ts

     Requires globals.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    class Console {
        constructor(currentFont = _DefaultFontFamily, currentFontSize = _DefaultFontSize, currentXPosition = 0, currentYPosition = _DefaultFontSize, buffer = "", arrowValue = -1, tabs = 0, storeInput = [], storeCmd = []) {
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
            this.arrowValue = arrowValue;
            this.tabs = tabs;
            this.storeInput = storeInput;
            this.storeCmd = storeCmd;
        }
        init() {
            this.clearScreen();
            this.resetXY();
        }
        clearScreen() {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }
        clearLine() {
            _DrawingContext.clearRect(0, this.currentYPosition - (_DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize)), _Canvas.width, _Canvas.height);
            this.currentXPosition = 0;
        }
        resetXY() {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }
        handleInput() {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { //     Enter key
                    // check for arrow nav
                    if (this.arrowValue > -1) {
                        this.buffer += this.storeInput[this.arrowValue];
                        this.arrowValue = -1;
                    }
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);
                    // add to storeInput for arrow navigation
                    this.storeInput.unshift(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                }
                else if (chr == String.fromCharCode(8)) { //backspace
                    this.backspace();
                }
                else if (chr == String.fromCharCode(9)) { //tab
                    this.complete(this.buffer);
                    this.tabs++;
                }
                else if (chr == String.fromCharCode(38)) {
                    //if there are input values left in array, allow to keep going
                    if (this.arrowValue < this.storeInput.length - 1) {
                        //increase position in array, clear the line, and print out the input value
                        this.arrowValue++;
                        this.clearLine();
                        _StdOut.putText(_OsShell.promptStr);
                        _StdOut.putText(this.storeInput[this.arrowValue]);
                    }
                }
                else if (chr === String.fromCharCode(40)) { //down arrow
                    //don't allow to navigate past 0
                    if (this.arrowValue > 0) {
                        //decrease position in array, clear the line, and print out the input value
                        this.arrowValue--;
                        this.clearLine();
                        _StdOut.putText(_OsShell.promptStr);
                        _StdOut.putText(this.storeInput[this.arrowValue]);
                    }
                    //handle unshifted special characters
                }
                else if (chr === String.fromCharCode(187)) {
                    _StdOut.putText("=");
                }
                else if (chr === String.fromCharCode(188)) {
                    _StdOut.putText(",");
                }
                else if (chr === String.fromCharCode(189)) {
                    _StdOut.putText("-");
                }
                else if (chr === String.fromCharCode(190)) {
                    _StdOut.putText(".");
                }
                else if (chr === String.fromCharCode(191)) {
                    _StdOut.putText("/");
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Write a case for Ctrl-C.
            }
        }
        putText(text) {
            // My first inclination here was to write two functions: putChar() and putString().
            // Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
            // between the two.  So rather than be like PHP and write two (or more) functions that
            // do the same thing, thereby encouraging confusion and decreasing readability, I
            // decided to write one function and use the term "text" to connote string or char.
            //
            // UPDATE: Even though we are now working in TypeScript, char and string remain undistinguished.
            //         Consider fixing that.
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
        }
        advanceLine() {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            // Varaibale to find line height
            var lineHeight = _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            // move canvas down by height of line
            this.currentYPosition += lineHeight;
            // if the text will go past the canvas
            if (this.currentYPosition >= _Canvas.height) {
                //copy the currently displayed text 
                var getDisplayedText = _DrawingContext.getImageData(0, 0, _Canvas.width, _Canvas.height);
                this.clearScreen();
                //move the y position up one so the text fits, excluding top line
                this.currentYPosition -= lineHeight;
                //redraw the canvas with the displayed text
                _DrawingContext.putImageData(getDisplayedText, 0, -lineHeight);
            }
        }
        backspace() {
            this.buffer = this.buffer.substring(0, this.buffer.length - 1);
            this.clearLine();
            _StdOut.putText(_OsShell.promptStr + this.buffer);
            this.arrowValue = -1;
        }
        complete(input) {
            //loop through all commands
            for (var i = 0; i < _OsShell.commandList.length; i++) {
                //compare input to commandlist
                if (_OsShell.commandList[i].command.includes(input)) {
                    //if input matches, push to array
                    this.storeCmd.push(_OsShell.commandList[i].command);
                }
            }
            //clear line and print text
            this.clearLine();
            _StdOut.putText(_OsShell.promptStr + this.storeCmd[this.tabs]);
            //add it to buffer
            this.buffer = this.storeCmd[this.tabs];
            //loop back if reached end
            if (this.tabs >= this.storeCmd.length) {
                this.tabs = 0;
            }
        }
    }
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=console.js.map