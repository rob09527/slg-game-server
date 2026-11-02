'use strict'

/**
 */
module.exports = function () {
    const FN = async function (...params) {
        let fn_name = this;
        let res;
        if (fn_name.startsWith('proxy_')) { // 执行 proxy 远程函数

            fn_name = fn_name.replace('proxy_', '');
            res = await require('./remote/' + fn_name)(...params);


        } else if (fn_name.startsWith('agent_')) { // 执行定时器实例远程函数
            fn_name = fn_name.replace('agent_', '');
            if(!global.gametimer) {
                throw 'agent closed';
            }
            res = await global.gametimer.remote[fn_name](...params);
        } else {
            const arr = Object.values(global.gameservs).map(gserv => gserv.remote[fn_name](...params).catch(e => null));
            res = await Promise.all(arr);
        }
        return res;
    };

    const remoteProxy = new Proxy({}, {
        get(target, p, receiver) {
            return FN.bind(p);
        }
    });

    return remoteProxy;
}
