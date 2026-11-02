/**
 * 查找角色武将
 * guids: 指定查找武将的guid列表,可无,若指定则返回指定武将的信息
 */
'use strict';

const { SlowBuffer } = require("buffer");

module.exports = exports = async function (guids) {
    // 加载阵法
    this._zhenfa = await this.db.models.zhenfa.getZfAll(this._id);
    // 武将属性皇宫加成
    let kingdom = await this.db.models.c_kingdom.findOne({standings: this.i()});
    if (kingdom) this.kingdomStandingIndex = kingdom.standings.indexOf(this.i());

    if (!this.manorbuildingBuf) {
        const building = await this.db.models.newmanor.findOne({rid: this._id});
        if (building) {
            this.manorbuildingBuf = await building.buildingBuf();
        }
    }
    // 加载zbdepot,直接算出所有珍宝+珍宝库属性
    const zbdepot = await this.db.models
        .zbdepot.getOne({rid: this._id});
    if (zbdepot) {
        const {
            zblist,
        } = await zbdepot.getZhenbaoAll({
            role: this,
        })
        const zb_all_attr = zbdepot.attr();
        // 珍宝属性加成
        for (let zhenbao of zblist) {
            const {
                attr: zb_attr,
            } = zhenbao.info();
            for (const [key, val] of Object.entries(zb_attr)) {
                zb_all_attr[key] = zb_all_attr[key] || 0;
                zb_all_attr[key] += val;
            }
        }
        zbdepot._attr = zb_all_attr;
    }

    this._general_official = {};
    if (this.general_official && this.general_official.official) {
        const official = this.general_official.official;
        // 把武将官职，转换成 以武将为 key, pos为官职的对象，避免重复循环
        Object.keys(official).forEach(pos => {
            if (official[pos] && (official[pos] + "").length == 24) {
                this._general_official[official[pos]] = pos;
            }
        });
    }
    this._general_retinue = {};
    if (this.general_official && this.general_official.retinue) {
        const retinue = this.general_official.retinue;
        // 把武将随从，转换成 以武将为 key, pos为随从位的对象，避免重复循环
        Object.keys(retinue).forEach(pos => {
            if ((retinue[pos]+"").length == 24 ) {
                this._general_retinue[retinue[pos]] = pos;
            }
        });
    }

    const opt = {
        rid: this._id.toString(),
    };

    const isFindArray = (!guids) || Array.isArray(guids);
    if (guids) {
        opt._id = isFindArray ? {$in: guids} : guids;
    }
    const generalList = await this.db.models.general.find(opt).hint({rid:1});
    const generalMap = {};
    let soulGeneralHost = []; // 灵魂宿主 guid
    generalList.forEach(g => {
        if (g.inherit && g.inherit.guid) {
            soulGeneralHost.push(g.inherit.guid);
        }
        let guid = g._id.toString();
        g.destiny = false;
        if(this.destiny && Array.isArray(this.destiny.general)){
            let pos = this.destiny.general.findIndex(des=>{
                return des && des.guid == guid;
            })
            g.destiny = pos > -1;
        }
        generalMap[guid] = g;
    }); // 将武将转换为 map类型

    // 找出没有在列表中的 灵魂宿主(方便 灵魂武将能顺利得到宿主的属性
    soulGeneralHost = soulGeneralHost.filter(guid => !generalMap[guid]);
    const soulMap = {};
    if (soulGeneralHost.length > 0) {
        const soulGeneralList = await this.db.models.general.find({_id: {$in: soulGeneralHost}});
        soulGeneralList.forEach(g => soulMap[g._id.toString()] = g);
    }
    // 所有穿戴觉醒宝物的武将
    const awakeTreasureGenerals = [...Object.values(generalMap), ...Object.values(soulMap)].filter(g => g.treasure && g.treasure.length === 24);
    if (awakeTreasureGenerals.length){
        const treasureList = await this.db.models.awake_treasure.find({_id: {$in: awakeTreasureGenerals.map(g => g.treasure)}});
        const treasureMap = {};
        treasureList.forEach(t => treasureMap[t._id] = t);
        for (const g of awakeTreasureGenerals) {
            let awake_treasure = treasureMap[g.treasure];
            if (!awake_treasure) continue;
            g._awaketreasure = await awake_treasure.base();
        }
    }
    // 穿戴兵书的所有武将
    const bookGenerals = [...Object.values(generalMap), ...Object.values(soulMap)].filter(g => g.book && g.book.length );

    if (bookGenerals.length){
        const allBooks = [];
        const bookMap = {};
        bookGenerals.forEach(g => {allBooks.push(...g.book)});
        const books = await this.db.models.book.find({_id: {$in:  allBooks}});
        books.forEach(b => bookMap[b._id] = b);

        for (const g of bookGenerals) {
            g._book_ = []; // 后台属性计算用的兵书属性
            for (let i = 0; i <  g.book.length ; i++) {
                const bid =  g.book[i];
                g._book_[i] = bookMap[bid] &&  await bookMap[bid].base();
            }
        }
    }
    // 装备魂石的所有武将
    const stoneGenerals = [...Object.values(generalMap), ...Object.values(soulMap)].filter(g => g.stone && g.stone.length);
    if (stoneGenerals) {
        let allStones = [];
        let stoneMap = {};
        stoneGenerals.forEach(g => {
            allStones.push(...g.stone);
        })
        let stones = await this.db.models.soulstone.find({_id: {$in: allStones}});
        stones.forEach(stone => stoneMap[stone._id.toString()] = stone);
        for (let g of stoneGenerals) {
            g._stone_ = [];
            for (let i = 0; i < g.stone.length ; i++) {
                let stoneid = g.stone[i];
                if (!stoneid) continue;
                g._stone_[i] = stoneMap[stoneid] && stoneMap[stoneid].base();
            }
        }
    }
    // 装备印记的所有武将
    const signetGenerals = [...Object.values(generalMap), ...Object.values(soulMap)].filter(g => g.signet && g.signet.length);
    if (signetGenerals) {
        let allSignets = [];
        let signetMap = {};
        signetGenerals.forEach(g => {
        allSignets.push(...g.signet);
        })
        let signets = await this.db.models.signet.find({_id: {$in: allSignets}});
        signets.forEach(signet => signetMap[signet._id.toString()] = signet);
        for (let g of signetGenerals) {
            g._signet_ = [];
            for (let i = 0; i < g.signet.length ; i++) {
                let signetid = g.signet[i];
                if (!signetid) continue;
                g._signet_[i] = signetMap[signetid] && signetMap[signetid].base();
            }
        }
    }
    // 装备灵宠的所有武将
    const petGenerals = [...Object.values(generalMap), ...Object.values(soulMap)].filter(g => g.pet.guid);
    if(petGenerals) {
        let allPets = [];
        petGenerals.forEach(g => {
            allPets.push(g.pet.guid);
        })
        let petsMap = {};
        let pets = await this.db.models.pet.find({_id: {$in: allPets}});
        pets.forEach(pet => petsMap[pet._id.toString()] = pet);
        for (let g of petGenerals) {
            g._pet_ = petsMap[g.pet.guid] && petsMap[g.pet.guid].base();
        }
    }
    // 新坐骑
    const {SET_ON} = global.gameconfig.horsesetting;
    const horseGenerals = [...Object.values(generalMap), ...Object.values(soulMap)].filter(g => {
        let ret = false;
        for(let i = 0; i < SET_ON; ++i ){ 
            if(g.horse.guids[i]) {
                ret = true;
                break;
            }
        };
        return ret;
    });
    if(horseGenerals) {
        let allhorse = [];
        horseGenerals.forEach(g => {
            for(let i = 0; i < SET_ON; ++i ){ 
                if(g.horse.guids[i]) {
                    allhorse.push(g.horse.guids[i]);
                }
            };
        })
        let horseMap = {};
        let horses = await this.db.models.horse.find({_id: {$in: allhorse}});
        horses.forEach(horse => horseMap[horse._id.toString()] = horse);
        for (let g of horseGenerals) {
            g._horse_ = [];
            for(let i = 0; i < SET_ON; ++i ){
                let guid = g.horse.guids[i]
                if(guid) {
                    let base = horseMap[guid].base();
                    if(base.owner){
                        g._horse_[i] = base;
                    }else{
                        // 数据修复
                        g.horse.guids[i] = '';
                        g._horse_[i] = null;
                    }
                }
                else {
                    g._horse_[i] = null;
                }
            };
        }
    }

    const officialGuids = Object.keys(this._general_official);
    let officialGenerals = null;
    if (officialGuids.length > 0) {
        officialGenerals = await this.db.models.general.find({_id: {$in: officialGuids}}).sort({level: 1}).limit(officialGuids.length);
        const _GENERAL_OFFICIAL_BUFF = {};
        // 官职全对BUFF计算
        for (const og of officialGenerals) { // 官职武将buf
            const ogid = og._id.toString();
            const pos = this._general_official[ogid];
            const offConfig = gameconfig.generalofficial.OFFICIAL[pos]; // 当前官职配置

            if (offConfig.BUFF) {
                this._GENERAL_OFFICIAL_BUFF = null; // 避免出现重复buff计算，在这之前的不允许又官职武将BUF
                og._role = this;
                const genInfo = og.base(); // 得到官职武将的属性,
                generalMap[ogid] && (generalMap[ogid]._globalbuf = {}); // 全体buf详情要返回客户端
                for (const P in offConfig.BUFF) {
                    const p = P.toLowerCase();
                    _GENERAL_OFFICIAL_BUFF[p] = _GENERAL_OFFICIAL_BUFF[p] || 0;
                    const bufNumber = Math.floor(genInfo.property[p] * offConfig.BUFF[P] / 1000);
                    generalMap[ogid] && (generalMap[ogid]._globalbuf[p] = bufNumber);
                    _GENERAL_OFFICIAL_BUFF[p] += bufNumber;
                }
            }
        }
        // 计算过后再赋值
        this._GENERAL_OFFICIAL_BUFF = _GENERAL_OFFICIAL_BUFF;
    }
    if (officialGuids.length === Object.keys(gameconfig.generalofficial.OFFICIAL).length) { // 角色官职任命10个了才会出现继承效果
        // 得到最低等级官职
        this._MIN_OFFICIAL_GENERAL = officialGenerals[0];
    }

    generalList.forEach(general => {
        general._role = this;
        general._zbdepot_ = zbdepot;
        if (general.inherit && general.inherit.guid) { // 有灵魂宿体
            general._bind = generalMap[general.inherit.guid] || soulMap[general.inherit.guid];
        }
    });
    if (!isFindArray) { // 如果只查一个就返回这个
        return generalMap[guids];
    }
    return generalMap;
};
