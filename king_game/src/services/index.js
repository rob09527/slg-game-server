'use strict'

// const fs = require("fs");
//
// const files = fs.readdirSync(__dirname);
// const services = {};
// for (const f of files) {
//     if (f === 'index.js' || !f.endsWith('.js')) {
//         continue;
//     }
//     const service = require('./' + f);
//     const name = f.replace('.service.js', ''); //
//     // 首字母大写
//     const Name = name.replace(/\b(\w)(\w*)/g, function($0, $1, $2) {
//         return $1.toUpperCase() + $2.toLowerCase();
//     });
//     services[Name+"Service"] = service;
// }

module.exports = { // 硬写，这样ide 可以正常代码提示
    RankService: require('./rank.service'),
    FriendService: require('./friend.service')(),
    WangpvpService: require('./wangpvp.service')(),
    RemindService: require('./remind.service')()
};
