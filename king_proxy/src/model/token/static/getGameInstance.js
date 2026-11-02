'use strict';

const assert = require('assert');
/**
 * 获取一个游戏实例
 * @return {{ host: string, port: number,token: string }}
 */
module.exports = exports = function (servid = 0) {
    // 先简单意思一下，分配一个在线人数最少的游戏实例
    // PS: 后续需修改逻辑为按一定配置方案，优先半活跃的游戏实例，这样可以保证最少在线人数的实例随着用户下线，可能出现在线人数清零情况，以便做闲置实例自动回收
    let instances = Object.values(global.gameservs);
    // if (servid) {
    //     const SPEC_NODE = [ // 特殊指定配置
    //         {port: 8401, servid: [9101]}, // h5开发用
    //         {port: 8403, servid: 9018}, // 春节元宵分支测试节点
    //         {port: 8404, servid: 9017}, // dianjinshou 13号分支
    //     ]
    //     const splist = SPEC_NODE.filter(({servid: srv}) => {
    //         srv = Array.isArray(srv)? srv: [srv];
    //         return srv.includes(servid)
    //     })
    //     if (splist.length > 0) {    // 有指定的时候
    //         instances = instances.filter(({port}) => splist[0].port === port);
    //     }else{
    //         const exclude_ports = SPEC_NODE.map(({port}) => port);
    //         instances = instances.filter(({port}) => !exclude_ports.includes(port));
    //     }
    // } 
    const sorts = instances.sort((serv1, serv2) => serv1.online_count - serv2.online_count);
    assert(sorts, 'empty gameserv'); // 游戏实例空了
    const servs = [sorts[0]];
    for (let i = 1; i < sorts.length; ++i) {
        let serv = sorts[i]
        if(!serv || serv.online_count > servs[0].online_count) break;
        servs.push(serv)
    }
    let i = Math.round(Math.random() * (servs.length - 1));
    let serv = servs[i]
    return {
        host: serv.host,
        port: serv.port,
        is_ssl: serv.is_ssl
    }
}
