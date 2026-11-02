'use strict'

//问鼎九州被攻击者收集
module.exports = exports = {
    servid: { type: String, require: 1 },
    rno: { type: Object, require: 1 },
    rid: { type: Object, require: 1 },
    update: { type: Number, default: Date.now },
    create: { type: Number, default: Date.now },
}