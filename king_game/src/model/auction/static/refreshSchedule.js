'use strict';

/**
 *  刷新拍卖行定时器
 */
module.exports = exports = function () {
    global.remote.agent_retimer('auction'); // 执行定时器远程函数retimer(刷新定时器
};
