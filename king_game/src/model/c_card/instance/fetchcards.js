
'use strict'
const assert = require('assert');
const cardsInfoConfig = global.gameconfig.cardinfo;

// 取出能提交到云函数的卡
module.exports = exports = async function ({ gateid, type = 'maze' }) {
    let cardList = [...this.cardbag];
    let list = [];
    for (let card of cardList) {
        let needPush = true;
        let info = cardsInfoConfig[card.id];
        if (info.CTYPE.length > 0) {
            let types = info.CTYPE;
            for (let i = 0; i < types[i].length; i++) {
                let typeInfo = types[i];
                switch (typeInfo.TYPE) {
                    case 1:
                        if (typeInfo.PARAM[0] != gateid) needPush = false;
                        break;
                }
            }
        }
        if (needPush) list.push(card);
    }
    return list;
}