'use strict';


module.exports = exports = {
    save: function () {
        ACTIVITY[this.type.toLowerCase()] = this;
        global.config.ZHD[this.type.toUpperCase()] = [this.start, this.etime];
    },

};
