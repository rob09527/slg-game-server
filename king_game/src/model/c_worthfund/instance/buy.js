"use strict"

const moment = require("moment");

/**
 * 购买基金
 * @param {object} role 角色信息
 * @param {number} price 价格
 */
module.exports = async function (role, price) {

    let out = [];
    const { 
        GETDAY, // 基金总可领取天数
        FUND, MTITLE: title, MCONTENT: content 
    } = global.gameconfig.worthfund;
    const config = FUND.find(({ PRICE }) => PRICE == price);
    let now = Date.now();
    if(this.day == GETDAY) {
        this.fend = 1;
        this.day = 1;
    }
    else {
        this.day = this.day === 0 ? 1 : this.day;
    }
    // 设置此档的购买信息
    this.fund[price] = this.fund[price] || { price, num: 0 };
    this.fund[price].buytime = now;
    this.fund[price].end = moment(now).startOf("day").valueOf() + (GETDAY - this.day + 1) * 24 * 3600 * 1000;
    this.fund[price].num += 1;
    this.markModified(`fund.${price}`);

    // 第一次购买或买过并且失效了
    if (now > this.fend) {
        this.fend = this.fund[price].end;
        this.fstart = now;
        this.tnext = this.fund[price].end;
    }
    // 发放购买奖励
    out.push(...config.SPRICE);
    const item = config.ITEMS[this.cycle()];
    // 如果购买过其他档次的基金并且在有效期内，则立马通过邮件发放与这档基金领取天数相同的奖励
    // 一天一封邮件
    for (let i = 0; i < this.day; i++) {
        global.dao.mail.create({
            rid: role.i(), type: 2,
            title, content,
            reward: item[i].REWARD,
        }).catch(console.log);
    }
    out = out.arrange();
    await this.save();
    return out;
}