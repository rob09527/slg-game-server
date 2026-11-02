
'use strict'
const assert = require('assert');
const random = require('../../../util/random');
let mazeCardLevelConfig = global.gameconfig.mazecardlevel;
let cardsConfig = global.gameconfig.cards;

// 生成指定张数随机卡片
// [1011,1012,1013]
module.exports = exports = async function ({ cardsNum = 1, type = 'maze', eventnum }) {
    let cardList = [...this.cardbag];
    cardsConfig = [...cardsConfig];
    mazeCardLevelConfig = [...mazeCardLevelConfig];
    // 判断使用场合
    let list = [];
    let levellist;
    let levelInfo;
    if (type == 'maze') {
        // 根据当前事件类型选出卡片
        levellist = mazeCardLevelConfig.filter(mazecard => mazecard.TYPE == eventnum);
        if (levellist.length > 0) {
            while (list.length < cardsNum) {
                // 根据权重随机出能获得的品质卡片
                let rate = levellist.deepMap('W');
                levelInfo = levellist[random.inweight(rate)];
                // 根据品质找出所有符合品质的cards
                if (levelInfo) {
                    let cards = cardsConfig.filter(cards => cards.LEVEL == levelInfo.LEVEL);
                    let rate = cards.deepMap('W');
                    let info = cards[random.inweight(rate)];
                    assert(info, 'invalid config');
                    // 判断自身是否有这个节点
                    let card = cardList.filter(card => card.id == info.CARDID);
                    // 判断抽出的卡牌是否有相同的,去重
                    if (list.includes(info.CARDID)) continue;
                    if (card.length == 0) {
                        list.push(info.CARDID);
                    } else if (card.length > 0) {
                        // 如果自身存在,判断是否到了能获得的上限
                        if (card.length < info.LIMIT) {
                            list.push(info.CARDID);
                        }
                    }
                }
            }
        }
    }
    return list;
}