
'use strict'

const { Schema } = require('mongoose');

module.exports = exports = {
    rid: { type: String, require: true, index: 1 },
    // 记录上阵过的武将,hp和mp {"guid":{hp:10000,mp:100}}
    gcache: { type: Schema.Types.Mixed, default: {} },
    // 选择的模板记录[101,102,203]
    nodetemplates: { type: Schema.Types.Mixed, default: [101] },
    // 下次重置时间
    nextreftime: { type: Number },
    // 特殊的bug,使用七星灯后有加成
    specialbuf: { "hp": 0, "atk": 0, "def": 0, "mdef": 0 },
    // 创建时间
    create: { type: Number, default: Date.now },
}
