'use strict';

/*
* 天机试炼通关表
* */
module.exports = exports = {
    rid: { type: String, require: true, index: true },
    type: { type: String, require: true, default: 'shilian' }, // 保留字段
    chapterid: { type: Number, default: 0 }, // 当前章节id
    levelid: { type: Number, default: 0 }, // 当前章节的关卡id
    passchapter: { type: Object, default: {} },
    /*
       "1": {// 章节id
            "stars":[{levelid:0,satisfy:[0,0,0]},..],// 章节所有关卡星级数; satisfy: 已满足条件的配置表内的id
            "boxs":[0,0,...]// 章节的星级奖励情况
        },...
     */
    update: { type: Number, default: Date.now },
    create: { type: Number, default: Date.now },
};