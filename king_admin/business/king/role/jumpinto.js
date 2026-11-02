const {ObjectID} = require("mongodb");
exports.name = '跳关';
exports.type = 'N';
exports.exec = async function (body, query, ctx) {

    let {rid, servid, type, value, legion, uid} = body;
    let r;
    const roleModel = await this.service.game.collection('roles');
    const obid = ObjectID(rid)
    if (type === "maxmapid") {
        const i = Object.keys(this.service.game.config.chapter).indexOf('' + value);
        if (i === -1) {
            throw '无效的关卡ID'
        }
        r = await roleModel.updateOne({_id: obid}, {$set: {_maxmapid: i}});
    } else if (type === "tower") {
        r = await roleModel.updateOne({_id: obid}, {$set: {tower: Number.parseInt(value)}});
    } else if (type.startsWith("occu")) {
        const towerModel = await this.service.game.collection('towers');
        let floor = parseInt(value)
        let [, sub] = type.split("_");
        sub = parseInt(sub);
        let record = [];
        for (let i = 1; i <= floor; i++) {
            record.push({time: Date.now(), floor: i})
        }
        let data = {
            occu: sub,
            type: 'occutower',
            rid,
            record: record,
            topfloor: floor,
            topfloortime: Date.now()
        }
        let select = {rid, coccu: sub, type: 'occutower'}
        r = await towerModel.findOneAndUpdate(select, {$set: data}, {upsert: true});
    } else if (type === "dg") {
        const dgch = await this.service.game.collection('c_dgchapters');
        r = await dgch.deleteMany({rid: rid});
        const dginfo = await this.service.game.collection('c_dginfos');
        r = await dginfo.deleteMany({rid: rid});
        const num = Number.parseInt(value) - 2;
        r = await roleModel.updateOne({_id: obid}, {$set: {'dgtop.chapter': num, 'dgtop.pass': num}});
    } else if (type === "rlevel") {
        value = Number.parseInt(value);
        let exp = this.service.game.config.roleexp.slice(0, value).reduce((sum, cur) => sum + cur, 0);
        r = await roleModel.updateOne({_id: obid}, {$set: {'hide.38001.count': exp}});
    } else if (type === "vlevel") {
        value = Number.parseInt(value);
        let vipExps = this.service.game.config.vip.EXP;
        r = await roleModel.updateOne({_id: obid}, {$set: {'hide.38003.count': vipExps[value]}});
    } else if (type === 'create') {
        r = await roleModel.updateOne({_id: obid}, {$set: {'create': new Date(isNaN(value) ? value: +value).getTime()}});
    } else if (type === "llevel") {
        if (!legion) throw "暂未加入军团";
        value = Number.parseInt(value);
        let _exp = this.service.game.config.legionlevel.slice(0, value).map(({EXP}) => EXP).reduce((sum, cur) => sum + cur, 0);
        const legionModel = await this.service.game.collection('legions');
        r = await legionModel.updateOne({_id: ObjectID(legion)}, {$set: {_exp}});
    } else if (type === "lscore") {
        if (!legion) throw "暂未加入军团";
        value = Number.parseInt(value);
        const legionModel = await this.service.game.collection('legions');
        r = await legionModel.updateOne({_id: ObjectID(legion)}, {$set: {score: value}});
    } else if(type === "yuanggu") {
        const yuanguModel = await this.service.game.collection('chapterbosses');
        r = await yuanguModel.updateOne({ rid ,type: 'yuangu' }, { $set: { subindex:  +value , pass: 0}})
    } else if(type === "manor") {
        const manorModel = await this.service.game.collection('newmanors');
        r = await manorModel.updateOne({ rid   }, { $set: { monsterlv:  +value }});
        if (+value > 1){
            await roleModel.updateOne({_id: obid}, {$set: {'others.97054.count': value - 1 }});
        }
    } else if (type === "secrettrial") {
        const levelid = +value || 0;
        const { CHAPTER: chapterObj } = this.service.game.config.secrettrial_chapter;
        let isExit = false;
        let $set = { passchapter: {} }
        for (let chapterid in chapterObj) {
            const { BOSS: bossList } = chapterObj[chapterid];

            let chapterInfo = { stars: [], boxs: [0, 0, 0] }
            for (let b = 0; b < bossList.length; b++) {
                let boss = bossList[b];
                if (!boss) continue;
                // 设置通关到此
                chapterInfo.stars[b] = { levelid: +boss.BOSSID, satisfy: [] }
                if (+boss.BOSSID == levelid) {
                    $set.chapterid = chapterid;
                    $set.levelid = levelid;
                    isExit = true; break;
                }
                // 设置满星通此关
                chapterInfo.stars[b].satisfy = boss.STARCONDID;
            }

            $set.passchapter[chapterid] = chapterInfo;
            if (isExit) break;
        }
        if (!isExit) {
            throw '无效的关卡ID'
        }

        const secretModel = await this.service.game.collection('secrettrials');
        //let dbInfo = await secretModel.findOne({ rid, type: 'shilian' }, {});
        r = await secretModel.updateOne({ rid }, { $set });
    }
    return r;
};

