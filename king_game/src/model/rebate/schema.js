
'use strict'
// const { Schema } = require('mongoose');
// 充值返利
module.exports = exports = {
    uid: { type: String, require: true },
    // 返利累计
    price: { type: Number, default: 0 },
    // vip 经验
    exp: { type: Number , default: 0 },
    // 返利不计累充
    specialzk: { type: Number , default: 0 }, //周卡,
    specialgz: { type: Number , default: 0 }, //普通月卡
    specialzz: { type: Number , default: 0 }, //超级月卡
    specialbw: { type: Number , default: 0 }, //霸王特权30
    specialqz: { type: Number , default: 0 }, //爱民特权68
    specialfd: { type: Number , default: 0 }, //封地特权98
    specialcz: { type: Number , default: 0 }, //成长基金1阶
    specialcz1: { type: Number , default: 0 }, //成长基金2阶
    specialcz2: { type: Number , default: 0 }, //成长基金3阶
    specialtower: { type: Number , default: 0 }, //试炼基金1阶
    specialtower1: { type: Number , default: 0 }, //试炼基金2阶
    specialtower2: { type: Number , default: 0 }, //试炼基金3阶

    reward: {type: Object, default: {} }, // 领取数据
}