
'use strict'
const cardsInfoConfig = global.gameconfig.cardinfo;
// 给卡牌记录参数
module.exports = exports = async function ({ type = 'maze' }) {
    let cardList = [...this.cardbag];
    if (type == 'maze') {
        for (let card of cardList) {
            let info = cardsInfoConfig[card.id];
            if (info && info.DTYPE.length > 0) {
                let types = info.DTYPE;
                for (let i = 0; i < types.length; i++) {
                    let typeInfo = types[i];
                    // 判断对应的类别事件
                    switch (typeInfo.TYPE) {
                        case 1:
                            // 记录获取该卡片的胜场数,默认0
                            let num = card.param[0] || 0;
                            card.param[0] = ++num;
                            //遍历这卡组
                            break;
                        case 2:
                            // 记录获取该卡片的卡牌品质数
                            let count = 0;
                            for (let mycard of cardList) {
                                let icard = cardsInfoConfig[mycard.id];
                                if (icard.LEVEL >= typeInfo.PARAM[0]) {
                                    count++;
                                }
                            }
                            card.param = [count];
                            break;
                        case 3:
                            // 记录使用次数
                            card.param = [1];
                            break;
                    }
                }
            }
        }
    }
    return cardList;
}