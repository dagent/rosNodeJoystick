/* ROS publishing -- Node.js call to a publisher which can stream from
 * stdin.
 *
 * Author: David A. Gent
 * v1.0 complete 8 August 2012
 */


var logging = require('./loggerNode.js'),
    Logger_Diag = logging.Logger_Diag;
var spawn = require('child_process').spawn;
var procPath = './ros/turtle_stdin.py';
var driveTurtle;

// Some code here modified (heavily) from
// https://github.com/Marak/say.js/blob/master/lib/say.js

function spawnChild (path, args) { 
    function myLog (where, text) {
        Logger_Diag(1,"Spawned child " + path + 
            " says: " + text + " on " + where );
    }
    var childD = spawn(path, args);
    childD.addListener('exit', function (code, signal) {
        if(code == null || signal != null) {
            myLog("Exit status", 'couldnt talk, had an error ' +
                '[code: '+ code + '] ' + '[signal: ' + signal + ']');
        }
    })
    if (childD.pid){
        Logger_Diag(1,"Launched " + path + " with PID " + childD.pid );
    }
    childD.stdin.setEncoding('ascii');
    childD.stderr.setEncoding('ascii');
    childD.stdout.on('data', function(data){
        myLog('stdout', data);
    })
    childD.stderr.on('data', function(data){
        myLog('stderr', data);
    })
    return childD;
}

exports.start = function () {
    driveTurtle = spawnChild(procPath, "");
}

exports.handleJoystick = function(arrayXY){
    if ( driveTurtle.stdin.writable ) {
        // expecting arrayXY [x,y]
        try{
            driveTurtle.stdin.write(arrayXY[0] + " " + arrayXY[1] + "\n");
        }
        catch(err){
            Logger_Diag(3,'handleJoystick: driveTurtle array write error');
        }
    } else {
        Logger_Diag(3,'handleJoystick: driveTurtle not writable');
    }
}

exports.handleReset = function (strWhat){
    spawnChild("./ros/turtle_reset");
}



