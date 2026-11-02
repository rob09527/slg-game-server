/**
 * 计算灵魂绑定的属性
 * @type {exports}
 */
module.exports = exports = function () {
    if(this._bind_data_){ // 避免重复计算灵魂属性
        return this._bind_data_;
    }
    const data = {};
    const guid = this._id.toString();
    let INHERIT = this.inherit;
    // 判断武将职业
    let { OCCU ,OCCU2=0 } = global.gameconfig.general[this.gsid];

    if(this._role && this._role._general_retinue && this._role._general_retinue[guid]){ // 随从
        const pos = this._role._general_retinue[guid];
        const oConfig = gameconfig.generalofficial;
        INHERIT = {
            prop: oConfig.RETINUE[pos].INHERIT
        };
        this._bind = this._role._MIN_OFFICIAL_GENERAL;
    }

    // 计算职业套装的数量
    let sets = {};
    for (let equip of this.equip) {
		let conf_equip = global.gameconfig.occuequip[equip];
		if (!conf_equip) continue;
		if (conf_equip.SETID) {
			sets[conf_equip.SETID] = sets[conf_equip.SETID] || 0;
			sets[conf_equip.SETID]++;
		}
	}
    //  occuequipset 职业套装
    // 需要同一个职业的武将穿着同一个套装才能激活技能
    this.occusuitskill = [];// 赋空
	for (let sid in sets) {
		const conf_equipset = global.gameconfig.occuequipset[sid];
		if (!conf_equipset) continue;
		let num = sets[sid];
        if (num < 2) continue;
        // 双职业武将任意一个职业都可以激活
        if (OCCU != conf_equipset.OCCU && (!OCCU2 || OCCU2 != conf_equipset.OCCU)) continue;
        if (num <= 3) {
			// 一个技能
			this.occusuitskill.append(conf_equipset.SKILL[0]);
		} else if (num > 3) {
			// 二个技能
			this.occusuitskill.append(conf_equipset.SKILL[0],conf_equipset.SKILL[1]);
        }
    }

    data.level = this.level;
    data.class = this.class;
    data.star = this.star;
    // data.exclusive = this.exclusive; // 屏蔽老坐骑
    data.exclusive = {level: 0, property: [], skill: []}; // 屏蔽老坐骑
    data.exclusive_equip = this.exclusive_equip;
    data.equip = this.equip;
    data.treasure = this.treasure;

    // 觉醒宝物
    data._awaketreasure = this._awaketreasure;
    data.soul = this.soul;
    data.gsid = this.gsid;
    data.occusuitskill = this.occusuitskill;
    data.skin = this.skin; // 武将正在穿的皮肤

    data._horse_ = this._horse_; // 新坐骑
    data._pet_ = this._pet_; // 灵宠
    data._book_ = this._book_; // 兵书
    data._stone_ = this._stone_; // 魂石
    data._zbdepot_ = this._zbdepot_; // 珍宝库,珍宝
    data._signet_ = this._signet_; // 印记

    //印记套装属性
    if(this._signet_){
        let key = '';
        let ying = 0;
        let yang = 0;
        for (let i = 0; i < this._signet_.length; i++) {
            const s = this._signet_[i];
            if(!s)continue;
            if(s.appraise && s.appraise.type == 1) ying ++;
            if(s.appraise && s.appraise.type == 2) yang ++;
        };
        key = yang + "-" + ying;
        let signet_suit = global.gameconfig.signet_suit[key];
        if(signet_suit){
            data.signet_suit = {key,attrs:signet_suit.ATTRS};
        }
    };
   
    if (INHERIT && INHERIT.prop && INHERIT.prop.length && this._bind) {
        for (let k of INHERIT.prop) {
            if(k === 'level'){
                data[k] = Math.max(this[k], this._bind[k]);
                data.class = Math.max(this.class, this._bind.class);
            } else if (k === 'star'){ // 星级 继承
                if ( this.star !==  this._bind.star){ // 星级继承'
                    let gsid = this.gsid;
                    let add = this.star < this._bind.star ? 1 : -1;
                    while ( global.gameconfig.general[gsid].STAR !== this._bind.star){
                        if(!global.gameconfig.general[gsid + add]) break;
                        gsid+= add;
                    }
                    data.gsid = gsid;
                } else {
                    data.gsid = this.gsid;
                }
            } else if (k === 'treasure') {
                data.treasure = this._bind.treasure;
                data._awaketreasure = this._bind._awaketreasure;
            }else {
                data[k] = this._bind[k];
            }
        }
    }
    this._bind_data_ = data;
    return data;
};
