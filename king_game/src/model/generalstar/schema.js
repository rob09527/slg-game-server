/**
 * 武将升星
 */
 'use strict'

 module.exports = exports = {
     rid: {type: String, unique: true, require: true},
     // 武将配置id
     gname: {type: String},
     // 创建时间
     create: {type: Number, default: Date.now},
 
     // 到期时间
     expire: {type: Number},
     /**
      * 购买礼包的次数,结构如下,顺序与配置一致
      * buylimit: [
      * 	0,
      * 	null,
      * 	...
      * ]
      */
     buylimit: [Number],
 }