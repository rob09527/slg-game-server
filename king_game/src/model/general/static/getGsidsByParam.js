/**
 * 返回指定条件的武将所有的gsid
 */

 'use strict'

 module.exports = function(param={}) {
     let gsidlist = [];
     for (let gsid in global.gameconfig.general) {
        let info = global.gameconfig.general[gsid];
        let push = false;
        for(let key of Object.keys(param)){
            if(info[key] && info[key] == param[key]) push = true;
            else push = false;
        }
        if(!!push) gsidlist.push(+gsid);
     }
     return gsidlist;
 }