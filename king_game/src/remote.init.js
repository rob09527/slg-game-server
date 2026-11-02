'use strict'

const { AssertionError } = require("assert");
/**
 */
module.exports = function () {
    const FN = function (...params) {
        const fnname = this;
        if (process.env.IS_TIMER && fnname.startsWith('agent_')) {
            // 如果自身就是 agent 项目，访问自身的远程函数，则不需要走 proxy
            return require(process.cwd() + '/src/remote/' + fnname.replace('agent_', ''))(...params);
        }
        return new Promise(((resolve, reject) => {
            let repeatTimes = 0;


            const execFn = () => {
                if (!global.PROXY_SERVER) {
                    repeatTimes++;
                    if (repeatTimes > 6) { // 增加重试机制，减少重启 proxy的情况，导致跨实例通信业务异常
                        return reject(new Error('PLEASE CHECK PROXY ONLINE')); // 需要链接proxy
                    }
                    return setTimeout(execFn, 10000);
                }

                const msgid = Math.random() + fnname;

                global.PROXY_SERVER.emit('EXEC', {
                    fn_name: fnname, // 函数名
                    params: params
                }, msgid);

                global.PROXY_SERVER.on(msgid, (data) => {
                    global.PROXY_SERVER && global.PROXY_SERVER.removeListener(msgid);
                    if (data.error) {
                        if (data.error.length > 50) { // 预期之外的异常, (代码异常报错一般error描述相对偏多，也可以通过 包含 'Require stack' 来判断，不过比对效率相对低
                            return reject(new Error(data.error));
                        } else {
                            return reject(new AssertionError({ message: data.error })); // 预期内异常(该异常不会触发 错误通知
                        }
                    }
                    return resolve(data.result);
                })
            }
            execFn();
        }))
    };
    const remoteProxy = new Proxy({}, {
        get(target, p, receiver) {
            return FN.bind(p);
        }
    });

    return remoteProxy;
}
