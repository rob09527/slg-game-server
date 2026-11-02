'use strict'

/**
 */
module.exports = function () {
    const FN = async function (...params) {
        console.log('EXEC REMOTE', this, params);
        const res = await util.http.post(`${global.config.proxy}/sys/gm/remote`, {
            fn_name: this,
            params
        }, {});
        console.log('EXEC REMOTE RES', this, res);
        if (res.error) {
            throw res.error;
        }
        return res.result;
    };
    const remoteProxy = new Proxy({}, {
        get(target, p, receiver) {
            return FN.bind(p);
        }
    });

    return remoteProxy;
}
