'use strict';

// 北伐匈奴阵容(锁定
module.exports = exports = {

    rid: {
        type: String,
        require: 1,
        index: 1,
    },
	type: Number, // 1,2,3 分别表示3路阵容
    bset: {
    	type: Object, // {team: {}, mythic: 101}
    },
    vit: {	// 体力
        type: Number,
        default: 5,
    },
    lastVitTime: { // 上次体力结算时间
        type: Number,
    },
    // 创建时间
    create: {type: Number, default: Date.now},
    // 阵容过期时间, 用于做懒删除逻辑
    expireAt: {type: Number},
};
