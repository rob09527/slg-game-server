'use strict';

// 北伐匈奴个人总伤害记录
module.exports = exports = {
    rid: { // rid
        type: String,
        require: true,
        index: 1
    },
    groupid: {type: Number, index: 1},           // 服务器分组id
    state: {type: Boolean}, 			// 奖励是否已经分发,true 已经发放
    killrewards: Array,				// 击杀奖励
    totaldamge: {type: Number, index: -1, default: 0}, // 总输出伤害
};
