const _ = require('lodash');
const getRandomArraySamples = require("../../../../../../util/getRandomArraySamples");
const expireUserinfo = require('../../../../../../util/expireUserinfo');
const checkPrisoner = require('../../../../../../model/prisoner/instance/checkPrisoner');

/**
 * 获取随机战俘列表 
 * @param {Object} ctx 上下文对象 
 * @param {Function} next 下一个中间件函数 
 */
module.exports = exports = async function (ctx, next) {
    try {
        const servid = ctx.role.servid;
        const currentTime = Date.now();

        // 查找所有已开始的游戏服务器 
        const servers = await global.dao.gameserver.find({
            start: { $lte: currentTime }
        });

        // 判断当前用户服务器是否已过期（超过30天）
        const isServerExpired = servers.some(e => {
            return e.servid === servid && (currentTime - e.start > 60000 * 60 * 24 * 30);
        });

        // 生成服务器列表 
        let serverlist = [];
        if (isServerExpired) {
            serverlist = servers.filter(e => currentTime - e.start > 60000 * 60 * 24 * 30)
                .map(e => e.servid);
        } else {
            serverlist = [servid];
        }

        // 获取随机样本 
        const randomSamples = getRandomArraySamples(serverlist, 10, 5);
        let clients = [];

        // 遍历随机样本并查询战俘数据 
        for (const servids of randomSamples) {
            console.log('Processing servids:', servids);
            const searchResult = await global.dao.prisoner.aggregate([
                {
                    $match: {
                        servid: { $in: servids }, // 确保(servid)是一个数组 
                        state: 0,
                        type: 1,
                        rid: { $ne: ctx.role._id.toString() }
                    }
                },
                {
                    $group: {
                        _id: "$rid",
                        doc: { $first: "$$ROOT" }
                    }
                },
                {
                    $replaceRoot: {
                        newRoot: "$doc"
                    }
                },
                {
                    $match: {
                        rid: { $exists: true }
                    }
                },
                {
                    $project: {
                        rid: 1
                    }
                },
                {
                    $sample: { size: 6 }
                }
            ]);
            // 获取战俘详细信息 
            const prisoners = await Promise.all(
                searchResult.map(async doc => {
                    const role = await global.dao.role.findOne({ _id: doc.rid });
                    let name = role.name
                    let power = role._power
                    const prisonerDoc = await global.dao.prisoner.find({ rid: doc.rid });
                    let prisonerDocNew = []
                    prisonerDoc.map(e => {
                        let doc_ = e._doc
                        let config = global.gameconfig.surrender.deepQueryOne('GSID', e.gsid);
                        doc_.cost = config.CAST
                        doc_.kill = config.KILL
                        doc_.rating = config.RATING
                        doc_.name = name
                        doc_.power = power
                        doc.seat = role.seat
                        if (checkPrisoner(doc_)) {
                            prisonerDocNew.push(doc_)
                        }
                    })
                    if (prisonerDocNew.length != 0) {
                        // let result = prisonerItem(prisonerDoc)
                        // prisonerDocNew.config = result
                        return prisonerDocNew;
                    } else {
                        return null
                    }

                })
            );

            clients.push(...prisoners.filter(Boolean));
            // 如果已经获取到足够数量的战俘，提前终止循环 
            if (clients.length >= 6) {
                break;
            }
        }
        const lastinfo = clients.slice(0, 6)
        if (lastinfo.length == 0) {
            ctx.body = lastinfo;
            console.warn('天牢没有数据找出来')
            return
        }
        const key = `${ctx.role._id.toString()}-prisoner`
        var cacheInfo = await expireUserinfo(key, true)
        if (cacheInfo.count > 0) {
            cacheInfo.count -= 1

        } else {
            let config = global.gameconfig.surrendersearch[1][cacheInfo.index]
            if (!config) {
                throw ('count no enought')
            }
            ctx.role.castItemsNoSave(config.item);
            await ctx.role.save();
            cacheInfo.index += 1
        }
        await expireUserinfo(key, false, cacheInfo)

        // 返回结果 
        ctx.body = lastinfo;

    } catch (error) {
        console.error('Error in getPrisoners:', error);
        ctx.body = [];
    }
};