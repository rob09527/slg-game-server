const {curl} = require('urllib');


module.exports = (err, message, path = undefined) => {

    if (global.config.CRASH_ROBOT) {
        curl(global.config.CRASH_ROBOT, {
            method: "POST",
            dataType: "json",
            contentType: 'json',
            data: {
                title: `SERVER[PROXY] ${path ? path : ''}  ${message || err.message}`,
                text: err.stack
            }
        }).catch(console.error);
    }
}
