'use strict'

/**
 *
 * 武将战斗力排名表
 */
module.exports = exports = {
    guid: {type: String, require: true},
    power: {type: Number, index: -1},
    gsid: Number,
    level: Number,
    skin: {type:Number}, // 武将当前使用的皮肤
    gname: {type: String, require: true, index: 1},
    role: Object // {rid, rname,level,vip, iconid, sex, servid}
}
