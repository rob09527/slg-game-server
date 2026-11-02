'use strict';
/*
* boss 表，玩法 远古战场 以及 类似玩法都可以用这个表
* */
module.exports = exports = {
    type: {type: String, require: true}, // 例如： yuangu = 远古战场,
    rid: {type: String, index: 1, require: true},
    subindex: {type: Number, default: 0}, // 关卡 id,
    maxsubindex: {type: Number, default: 0}, // 历史最高关卡
    last: {type: Number}, // 最近突破记录时间
    etime: {type: Number, default: 0},  // 结束时间
    pass: {type: Number, default: 0},   // 通关标记
    update: {type: Number},
    lastdamge: {type: Number, default: 0},
    totaldamge: {type: Number, default: 0},
    create: {type: Number, default: Date.now},
};
