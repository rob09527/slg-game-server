/**
 * 角色道具/武将增加
 * @param {number | string | Array<Record<gsid: string, count: number>>} items 道具GSID或道具列表
 * @param {string | Record<main: string, sec: string>} reason 增加原因
 * 
 * 本方法可以这么用
 * addItemsNoSave({gsid: 10010, count: 10})
 * addItemsNoSave({GSID: 10010, COUNT: 10})
 * addItemsNoSave({gsid: 10010, COUNT: 10})
 * addItemsNoSave({GSID: 10010, count: 10})
 * addItemsNoSave({gsid: 10010})
 * addItemsNoSave(10010)
 * addItemsNoSave([10010, {gsid: 10010, COUNT: 10}])
 * addItemsNoSave([ {gsid: 18001, COUNT: 1 , inherit: ['level','soul'], expire: '7D'}]) // 灵魂武将 限时武将领取
 */

'use strict'

const assert = require('assert');

const _type = require('./../common/type');
const _item_convert = require('./../common/items_convert');
const addPrisoner = require('../../prisoner/instance/addPrisoner');
const frameConfig = global.gameconfig.frame;
const titleConfig = global.gameconfig.title;
module.exports = exports = function (items, reason) {
    items = _item_convert(items);
    for (let { gsid, count, inherit, expire, formark } of items) { // @author 增加参数，inherit(灵魂武将) ,expire(限时武将
        let type = _type(gsid);
        // 过滤无效类别gsid
        if (!type) continue;

        if (type === 'general') {
            if (formark) continue;
            this.newg = this.newg || [];
            assert(this.gnum + this.newg.length < this.bagspace, 'nmore bag');
            for (let i = 0; i < count; i++) {
                this.newg.push(this.db.models.general.newGeneralNoSave(this.i(), gsid, expire, inherit));
            }
        } else if (type === 'tianlao') {
            this.newg = this.newg || [];
            let list = []
            for (let i = 0; i < count; i++) {
                let tianlaogsid = gsid - 100000
                list.push({ rid: this._id, servid: this.servid, gsid: tianlaogsid })
            }
            addPrisoner(list);
            continue
        } else if (type === 'pet') {
            if (formark) continue;
            this.newpet = this.newpet || [];
            assert(this.petnum + this.newpet.length < this.petspace, 'nmore pet');
            for (let i = 0; i < count; i++) {
                this.newpet.push(this.db.models.pet.newPetNoSave(this.i(), gsid, expire));
            }
        } else if (type === 'horse') {
            if (formark) continue;
            this.newhorse = this.newhorse || [];
            assert(this.horsenum + this.newhorse.length < this.horsespace, 'nmore horse');
            for (let i = 0; i < count; i++) {
                this.newhorse.push(this.db.models.horse.newHorseNoSave(this.i(), gsid, expire));
            }
        } else if (type === '_frames') {
            // 头像框
            if (frameConfig[gsid]) {
                this[type] = this[type] || {};
                let time = frameConfig[gsid].TIMELIMIT || 1;
                if (time == -1) {
                    this[type][gsid] = -1;
                } else {
                    this[type][gsid] = Date.now() + 3600 * 24 * 1000 * time;
                }
                this.markModified(type);
            }
        } else if (type == '_titles') {
            // 称号
            if (titleConfig[gsid]) {
                this[type] = this[type] || {};
                let time = titleConfig[gsid].TIMELIMIT || 1;
                if (time == -1) {
                    this[type][gsid] = -1;
                } else {
                    this[type][gsid] = Date.now() + 3600 * 24 * 1000 * time;
                }
                this.markModified(type);
            }
        } else if (type === 'book') {
            if (formark) continue;
            this.newbook = this.newbook || [];
            for (let i = 0; i < count; i++) {
                this.newbook.push(this.db.models.book.genNewBook(this.i(), gsid));
            }
        } else if (type === 'soulstone') {
            if (formark) continue;
            this.newsoulstone = this.newsoulstone || [];
            for (let i = 0; i < count; i++) {
                this.newsoulstone.push(this.db.models.soulstone.genNewStone(this.i(), gsid));
            }
        } else if (type === 'signet') {
            if (formark) continue;
            this.newsignet = this.newsignet || [];
            for (let i = 0; i < count; i++) {
                this.newsignet.push(this.db.models.signet.genNewSignet(this.i(), gsid, reason.sec));
            }
        } else {
            // let item = this[type][gsid];
            // if (item) {
            //     item.count += count;
            //     this.markModified(type + '.' + gsid + '.count');
            // } else {
            //     this[type][gsid] = {count: count};
            //     this.markModified(type + '.' + gsid);
            // }
            assert(count >= 0, "illegal count");
            this._change_items_ = this._change_items_ || {};
            this._change_items_[gsid] = this._change_items_[gsid] || 0;
            this._change_items_[gsid] += count;
        }
    }
    this.item_tmp = this.item_tmp || [];
    this.item_tmp.append(items.map(item => {
        let {
            GSID,
            gsid,
            COUNT,
            count,
            ...rest
        } = item;
        let _gsid = GSID || gsid;
        let _count = COUNT || count;
        let item_tmp = {
            GSID: _gsid,
            COUNT: _count,
            reason,
            ...rest
        };
        return item_tmp;
    }));
}
