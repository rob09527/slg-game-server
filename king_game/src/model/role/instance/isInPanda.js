
'use strict'

const moment = require("moment");

/* 是否在天数内*/
module.exports = exports = function (key) {
	let now = Date.now();
    let config = global.gameconfig.panda[key.toUpperCase()];
    if (!config) { return [false, 0] }
    for (let i = 0; i < config.length; i++) {
        let obj = config[i];
        let start = 0
        if ( obj.mode == 0 ) {    
            start = moment(this.create).startOf('days').valueOf();
        }
        else {
            start = moment(this._gameserv.start).startOf('days').valueOf();
        }
        let etime1 = start + (parseInt(obj.start)-1) * 24 * 3600 * 1000;
        let etime2 = start + (parseInt(obj.etime)-1) * 24 * 3600 * 1000;
        if (now < etime2 && now > etime1) {
            return [true, i, obj.id, etime1, etime2, obj.arg];
        }
    }
    return [false, 0];
}
