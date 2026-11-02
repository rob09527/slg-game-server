'use strict'
const {ObjectId} = require("mongodb");

module.exports = exports = async (ctx, next) =>{
    ctx.team.challenge = true;
    await ctx.team.save();

    try {
        let { pos } = ctx.request.body;
        let battleArr = [];
        let saveRole = {};
        let saveArr = [];
    
        let arr = ctx.team.fellows.map(value=> value.rid);
        const roles = {};
        roles[ctx.role.i()] = ctx.role;
        let maps = Object.values(ctx.config.TEAMID[pos].MAPS);
        let battle, player, fireids = [];
        for (let i = 0; i < maps.length;) {
            if (arr.length == 0) break;
            let rid = arr[0];
            const role = roles[rid] ? roles[rid] : await ctx.dao.role.findOne({_id:ObjectId(rid)});
            if (!role) {
                arr.splice(0,1);
                player = null;
                continue;
            }
            roles[rid] = role;
            if (!player) {
                player = await role.getBattleSet('qxzldef');
            }
            let rhp;
            if (battle) {
                if (battle.result.ret == 'win') {
                    for (const pos in battle.result.lhp) {
                        if (battle.result.lhp[pos] == 0) {
                            delete player.team[pos];
                            continue;
                        }
                        player.team[pos].nowhp = battle.result.lhp[pos];
                    }
                }
                else {
                    rhp = battle.result.rhp;
                }
            }
            battle = new ctx.dao.c_battle({
                rid,
                type: ctx.config.TEAMTYPE,
                player,
            })
            
            await battle.createEnemy(maps[i],rhp);
            battle.player.roleInfo = {rid, rname:role.name, level:role.level, frameid:role.frameid, headid:role.headid};
            battle.enemy.headid = ctx.config.TEAMID[pos].HEADICON[maps[i]];
            await battle.save();
            await battle.cal();
            battleArr.push({base:JSON.parse(JSON.stringify(battle.base())), result:battle.result});
            let video = battle.getVideoObject();
            video.left.info = role.videoAvatarInfo();
            // video.right.info = { index: ctx.bossConfig.bossidx };
            video = new ctx.dao.video({
                type: 'qxzl',
                rid: role.i(),
                video: JSON.stringify(video),
                version: battle.result.version,
            })
            saveArr.push(video.save());
            fireids.push({bid:battle._id.toString(), vid:video._id.toString()});
            battleArr[battleArr.length - 1].base.vid = video._id.toString();
            if (battle.result.ret == 'win') {
                i++;
                continue;
            }
            arr.splice(0,1);
            player = null;
        }
        ctx.body = {win:arr.length > 0, reward:[], battleArr};
    
        let record = new ctx.dao.c_qxzlrecord({ids:fireids, player:[], win:ctx.body.win, name:ctx.config.REWARDNAME[pos]});
    
        for (let {rid} of ctx.team.fellows) {
            const role = roles[rid] || await ctx.dao.role.findOne({_id:ObjectId(rid)});
            if (!role) {continue;}
            roles[rid] = role;
            let qxzlrecord = role.qxzlrecord[ctx.type] || [];
            qxzlrecord.unshift(record._id.toString());
            qxzlrecord.length > 50 && qxzlrecord.splice(50);
            role.qxzlrecord[ctx.type] = qxzlrecord;
            role.markModified('qxzlrecord');
            saveRole[rid] = true;
        }
        record.player = Object.values(roles).map(role=>{
            let obj = {};
            obj.level = role.level;
            obj.rname = role.name;
            obj.headid = role.headid;
            obj.rid = role.i();
            obj.frameid = role.frameid;
            obj.help = ctx.team.fellows.find(value=>value.rid == obj.rid).help;
            if (obj.rid == ctx.role.i()) {
                ctx.body.help = obj.help;
            }
            return obj;
        });
        record.markModified('player');
        saveArr.push(record.save());
    
        if (arr.length) {
            let up = ctx.config.UP[ctx.team.fellows.length] + 1;
            let reward = [];
            ctx.config.REWARD[pos].forEach(({GSID, COUNT, RATE, UP})=>{
                if (RATE == 100 || Math.random() * 100 <= RATE) {
                    reward.push({GSID, COUNT:UP?Math.floor(COUNT * up):COUNT});
                }
            });
            let helpreward = ctx.type == 2 ? (ctx.config.HELP[pos] || []).map(({GSID,COUNT})=>{
                return {GSID,COUNT};
            }) : [];
            for (let info of ctx.team.fellows) {
                let {rid, help} = info;
                let rew = [];
                if (ctx.type == 2) {
                    let qxzl = await ctx.dao.c_qxzl.findOne({rid, type:2});
                    if (!qxzl) continue;
                    if (help && qxzl.help > 0) {
                        qxzl.help--;
                        saveArr.push(qxzl.save())
                        rew = helpreward;
                    }
                    else if (!help && qxzl.val > 0) {
                        qxzl.val--;
                        saveArr.push(qxzl.save())
                        rew = reward;
                        if (qxzl.val <= 0) {
                            info.help = true;
                            ctx.team.markModified('fellows');
                        }
                    }
                }
                else {
                    const role = roles[rid];
                    if (role && role.getProp(ctx.config.TICKET) >= ctx.config.COUNT) {
                        rew = reward;
                        role.castItemsNoSave({GSID:ctx.config.TICKET, COUNT:ctx.config.COUNT});
                        saveRole[rid] = true;
                    }
                }
                if (rid == ctx.rid) {
                    ctx.body.reward = rew;
                    const role = roles[rid];
                    if (role && rew.length) {
                        role.addItemsNoSave(rew);
                        saveRole[rid] = true;
                    }
                    continue;
                }
                if (rew.length) {
                    let re = new ctx.dao.c_qxzlreward({rid, reward:rew, player:record.player, record_id:record._id.toString(),name:ctx.config.REWARDNAME[pos]});
                    saveArr.push(re.save());
                }
            }
        }
        for (let rid in saveRole) {
            let role = roles[rid];
            if (!role) {continue;}
            saveArr.push(role.save());
        }
        saveArr.length && await Promise.all(saveArr);
    } catch (error) {
    }
        
    ctx.team.challengerid = 0;
    await ctx.team.save();
}