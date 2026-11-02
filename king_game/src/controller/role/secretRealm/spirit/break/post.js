// 'use strict';

// //精灵突破
// module.exports = async (ctx) => {
//     const secretRealmRole = ctx.secretRealmRole
//     const { id } = ctx.request.body;
//     if (!secretRealmRole.spirit[id]) {
//         throw new Error('Unable to obtain information about the sprite');
//     }
//     let spirit = secretRealmRole.spirit[id]
//     let spiritconfig = global.gameconfig.secretRealmjl[1].find(e => e.QUALITY == spirit.quality && id == e.ID)
//     if (!spiritconfig) {
//         throw new Error('Unable to obtain configuration file spiritconfig');
//     }
//     let limitlevel = global.gameconfig.secretRealmjl[0].find(e => e.QUALITY == spirit.quality).LIMIT

//     if (secretRealmRole.spiritLevel < limitlevel) {
//         throw new Error(`Level does not meet the conditions${limitlevel}`);
//     }


//     let items = spiritconfig.item
//     ctx.role.castItemsNoSave(items);
//     await ctx.role.save()

//     //秘境属性添加
//     let insert = {}
//     insert[`spirit.${id}`] = {
//         quality: spiritconfig.TGQUALITY,
//     }

//     let attribute = secretRealmRole.attribute
//     attribute[spiritconfig.MJATT] = (attribute[spiritconfig.MJATT] || 0) + spiritconfig.M_A_COUNT_0
//     insert['attribute'] = attribute

//     let spiritpj = global.gameconfig.secretRealmjl[0].find(e => e.QUALITY == spiritconfig.TGQUALITY)
//     if (spiritpj.LIMIT > secretRealmRole.spiritLimitLevel) {
//         insert['spiritLimitLevel'] = spiritpj.LIMIT
//     }


//     let gatherAttribute = secretRealmRole.gatherAttribute
//     gatherAttribute['wood'] = (gatherAttribute['wood'] || 0) + spiritconfig.SPEED1
//     gatherAttribute['ore'] = (gatherAttribute['ore'] || 0) + spiritconfig.SPEED2
//     insert['gatherAttribute'] = gatherAttribute
//     await global.dao.secretRealmRole.updateOne({ rid: ctx.role.rid }, { $set: insert });

//     //游戏属性添加
//     let secretRealm = ctx.role.secretRealm
//     let spiritbreak = secretRealm.spiritbreak
//     let roleinsert = {}
//     spiritbreak[spiritconfig.ATT] = (spiritbreak[spiritconfig.ATT] || 0) + spiritconfig.A_COUNT_0
//     roleinsert['secretRealm.spiritbreak'] = spiritbreak
//     await ctx.role.updateOne({ $set: roleinsert });

//     ctx.body = "success"
// };
