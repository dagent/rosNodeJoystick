/* meter object
*/

var meters = {

    meters : [
        {
            "name": "left",
            port: 7331,
        },
        {
            "name": "right",
            port: 7332,
        },
    ],

    port2name : function(port) {
        for (index in meters) {
            if (meters[index].port === port) {
                return meters[index].name;
            }
        }
        return undefined ;
    },

    name2port : function(name) {
        for (index in meters) {
            if (meters[index].name === name) {
                return meters[index].port;
            }
        }
        return undefined ;
    },

    setPort : function(name, port) {
        for (index in meters) {
            if (meters[index].name === name) {
                meters[index].port = port;
                return true;
            }
        }

        meters.push({
                "name": name,
                "port": port,
            });
        return true;

    },

    meterObj : function(name) {
        for (index in meters) {
            if (meters[index].name === name) {
                return meters[index];
            }
        }
        return undefined;
    }
};

exports.meters = meters;

