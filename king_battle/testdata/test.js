
const dobattle = require('../dobattle');
const bConfig = require("../lib/battle_config")
// let data = require("./testdata.json")
let data = require("./testdata1.json")
bConfig.SetStartData(data)
const ret = dobattle(data.seed, data.player, data.enemy, 3600, data.seasonInfo, data.lcards, data.rcards, data.type)
// console.log(JSON.stringify(ret, null, 4))
console.log("round=", ret.round, " lhp=", ret.lhp, " rhp=", ret.rhp)
console.log("complete................")




