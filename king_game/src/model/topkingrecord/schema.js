
/*
    参加巅峰赛的记录
*/

'use strict'

const { Schema } = require('mongoose');

module.exports = exports = {

    // 记录,海选赛记录、小组赛、冠军赛
    /** record
     * key 组别
     *  value 数组值
        // 挑战记录
        // result 为挑战结果,uid为挑战方
     * { "0":[ [{'uid':xxx,'servid':1001,lmark:1,'tuid':'xxx',
                'tservid':'1001',tmark:2,vedioid:'xxxx',result:'win'}]],[[{}],[{}]].....}
     *   ...
     * ]
     */
    record: { type: Schema.Types.Mixed, default: {} },
    /**
     * standing 挑战赛制站位
     * 
     * key 是组别
     * value 二维数组 王者挑战的赛制站位; 0 1 2 3 是组员的唯一数字编号
     * {"0":[['0_1','2_3','4_5'],['1_2','3_4'],['2_3'],[2]]}
     */
    standing: { type: Schema.Types.Mixed, default: {} },
    // 修改时间
    update: { type: Number, default: Date.now },
    // 创建时间
    create: { type: Number, default: Date.now },
    // 冠军赛分区记录
    areamark: { type: String, index: 1 },
    // 已完成的轮数,默认0轮没有完成。
    round: { type: Number, default: 0, index: 1 },
    // 赛制 sea 海选  group 小组赛 king 冠军赛
    format: { type: String },
    // 赛制是否结束。(有该字段则表示结束)
    finish: { type: Number }

}