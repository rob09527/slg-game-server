
'use strict'
const assert = require('assert');
const cardsConfig = global.gameconfig.cards;
const cardsInfoConfig = global.gameconfig.cardinfo;
// 添加到卡牌组里
module.exports = exports = async function ({ cardid = 0, type = 'maze' }) {
    let cardList = [...this.cardbag];
    let cardInfo = cardsConfig.find(card => card.CARDID == cardid);

    if (cardid) {
        if (type == 'maze') {
            // 判断卡牌类别
            if (cardInfo && cardInfo.ISREPEAT == 0) {
                // 判断是否存在该类型,不存在该类型则直接添加
                let existType = 0;
                for (let c of cardList) {
                    let cinfo = cardsInfoConfig[c.id];
                    if (cinfo.TYPE == cardInfo.TYPE) {
                        existType = 1;
                        break;
                    }
                }
                if (existType > 0) {
                    // 高品质覆盖低品质
                    for (let card of cardList) {
                        let info = cardsInfoConfig[card.id];
                        if (info.TYPE == cardInfo.TYPE) {
                            card.id = cardInfo.CARDID;
                        }
                    }
                } else {
                    // 直接添加,判断是否是特殊类别,特殊类别是指 1381这张卡。该卡牌在一场战斗只能使用一次。
                    let addcardInfo = cardsInfoConfig[cardInfo.CARDID];
                    let dtype = addcardInfo.DTYPE[0];
                    if (dtype && dtype.TYPE == 3) {
                        cardList.push({ id: cardInfo.CARDID, param: [1], setparam: 1 });
                    } else {
                        cardList.push({ id: cardInfo.CARDID });
                    }
                }

            } else if (cardInfo && cardInfo.ISREPEAT > 0) {
                // 添加到背包里
                let obj = {};
                obj.id = cardInfo.CARDID;
                let info = cardsInfoConfig[cardInfo.CARDID];
                obj.id = cardInfo.CARDID;
                obj.param = [];
                if (info.DTYPE.length > 0) {
                    let cardtypes = info.DTYPE;
                    for (let i = 0; i < cardtypes.length; i++) {
                        let typeInfo = cardtypes[i];
                        // 判断对应的类别事件
                        switch (typeInfo.TYPE) {
                            case 1:
                                // 1记录获取该卡片的胜场数,默认0
                                obj.param.push(0);
                                break;
                            case 2:
                                // 记录紫色及其以上品质的卡片数量（包含自身的这张卡）
                                //遍历这卡组
                                let count = 0;
                                for (let card of cardList) {
                                    let icard = cardsInfoConfig[card.id];
                                    if (icard.LEVEL >= typeInfo.PARAM[0]) {
                                        count++;
                                    }
                                }
                                // 自身品质达到要求继续加
                                if (info.LEVEL >= typeInfo.PARAM[0]) {
                                    obj.param.push(count++)
                                } else {
                                    obj.param.push(count)
                                }
                                break;
                        }

                    }
                }
                cardList.push(obj);
            }
        }
    }


    return cardList;
}