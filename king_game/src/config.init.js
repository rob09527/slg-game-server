const configitemlist = require('./util/configitemlist');
const configrobtpvp = require('./util/configrobtpvp');


/**
 * 游戏配置初始化
 */
module.exports = async function () {
    global.gameconfig = require('../loadgameconf')(config.GAMECONFIG, config.CONFIG_REWRITE, config.GAME_ENV);
    Object.defineProperty(global, 'gameconfig', { writable: false });
    global.gameconfig.maplist = Object.keys(gameconfig.chapter);
    // 军团战 默认配置
    global.gameconfig.legionpvp.CONFIG = gameconfig.legionpvp.CONFIG || {
        MAX_AVA_TIMES: 3, // 单周匹配次数
        MATCH: '0 0 10 * * 1,3,5', // 匹配时间
        LOCK_TEAM: '0 30 19 * * 2,4,6', // 锁定整容时间
        START_FIGHT: '0 0 20 * * 2,4,6' // 战斗开始时间
    }
    // 限时玩法默认粮草初始CD
    global.gameconfig.chapter_new_event.LIANG_DEF_TIME = global.gameconfig.chapter_new_event.LIANG_DEF_TIME || 10 * 60 * 1000;

    global.gameconfig.others.NEW_ROLE_DAYS = global.gameconfig.others.NEW_ROLE_DAYS || 7; // 新手周 活动持续时间
    global.gameconfig.others.FIGHT_CHAPTER = global.gameconfig.others.FIGHT_CHAPTER || 10301; // 前2章，不进战斗服
    global.gameconfig.others.PVPKING.WZ_CONFIG = global.gameconfig.others.PVPKING.WZ_CONFIG || {
        SINGLE: 10, // 单服王者上线10
        MULTI: 30, // 



    }

    global.execrules = require('../loadgameconf')(config.EXECUTIONS, config.EXEC_REWRITE, config.GAME_ENV);
    Object.defineProperty(global, 'execrules', { writable: false });


    global.probs = require('../loadgameconf')(config.PROB, config.PROB_REWRITE, config.GAME_ENV);
    Object.defineProperty(global, 'probs', { writable: false });
    decorateConfiginit()
}


function decorateConfiginit() {
    decorateConfig()
}




async function decorateConfig() {

    // 定义一个辅助函数来处理类似的逻辑
    function processConfig(index) {
        for (let x in global.gameconfig.ftmphb[index]) {
            let item_list = [];
            let configdata = global.gameconfig.ftmphb[index][x];
            for (let count = 0; count < 10; count++) {
                if (configdata[`gsid${count}`] && configdata[`count${count}`]) {
                    item_list.push({
                        gsid: configdata[`gsid${count}`],
                        count: configdata[`count${count}`]
                    });
                }
            }
            global.gameconfig.ftmphb[index][x]['item'] = item_list;
        }
    }
    //超级招募配置处理
    function processConfig_cjzm() {
        for (let x = 0; x < Object.assign(global.gameconfig.cjzm).length; x++) {
            if (x == 0) {
                let config = global.gameconfig.cjzm[0]
                let xykc = {}
                config.forEach(e => {
                    xykc[e.LUCKY] = e
                    global.gameconfig.cjzm['maxluckycount'] = e.LUCKY
                })
                global.gameconfig.cjzm[0] = xykc
            }

            if (x == 1) {
                //做一些逻辑处理后续业务使用
                let tskc = {}
                global.gameconfig.cjzm[1].forEach(e => {
                    !tskc[e.pond] ? tskc[e.pond] = [e] : tskc[e.pond].push(e)
                })
                global.gameconfig.cjzm['tskc'] = tskc

            }
            if (x == 5) {
                let cqbs = {}
                let config = global.gameconfig.cjzm[5]
                config.forEach(e => {
                    cqbs[e.MULTIPLE] = {
                        MULTIPL: e.MULTIPLE,
                        items: [{ gsid: e.ID1, count: e.NUMBER1 }, { gsid: e.ID2, count: e.NUMBER2 }, { gsid: e.ID3, count: e.NUMBER3 }]
                    }
                })
                global.gameconfig.cjzm[5] = cqbs
            }
            if (x == 6) {
                let xhysx = {}
                let config = global.gameconfig.cjzm[6]
                config.forEach(e => {
                    xhysx[e.ID] = e
                })
                global.gameconfig.cjzm[6] = xhysx
            }
        }
        console.log()
    }
    //超级招募商业化
    function processConfig_cjzmsyh() {
        for (let x = 0; x < Object.assign(global.gameconfig.cjzmsyh).length; x++) {
            if (x <= 6) {
                configitemlist(global.gameconfig.cjzmsyh[x])
            }
            if (x == 2) {
                global.gameconfig.cjzmsyh[x].forEach(e => {
                    let freeitem = e.item.splice(0, 1)
                    e['freeitem'] = freeitem
                })
            }
        }
    }

    function processConfig_pvpmultiplayer() {
        for (let x = 0; x < Object.assign(global.gameconfig.pvpmultiplayer).length; x++) {
            if (x == 0) {
                let info = configrobtpvp(global.gameconfig.pvpmultiplayer[x])
                global.gameconfig.pvpmultiplayer.robot = info
            }
        }
    }


    function processConfig_itemdeal() {
        configitemlist(global.gameconfig.secretRealm[0], 1)
        configitemlist(global.gameconfig.secretRealm[1], 1)
        configitemlist(global.gameconfig.secretRealmGz[0], "mj0")
        configitemlist(global.gameconfig.secretRealmGz[1], "mj")
        configitemlist(global.gameconfig.secretRealmGz[2], "mj")
        configitemlist(global.gameconfig.secretRealmGz[3], 1)
        configitemlist(global.gameconfig.secretRealmGz[6], "mj")
        configitemlist(global.gameconfig.secretRealmWdjz[0])
        configitemlist(global.gameconfig.secretRealmTask[0])
        configitemlist(global.gameconfig.surrenderseat[0], 1)
        configitemlist(global.gameconfig.surrendersearch[1], 1)
        configitemlist(global.gameconfig.surrendersearch[3], 1)
        configitemlist(global.gameconfig.surrenderfight[3])
        configitemlist(global.gameconfig.kftt)
        configitemlist(global.gameconfig.ssdb[1])
        configitemlist(global.gameconfig.ssdb[3])
        configitemlist(global.gameconfig.ssdb[4])
        configitemlist(global.gameconfig.ssdb[5])
        configitemlist(global.gameconfig.ssdb[6])
        configitemlist(global.gameconfig.ssdb[7])
        console.log("===")
    }




    // general
    processConfig(0);
    processConfig(1);
    processConfig(3);
    processConfig_cjzm()
    processConfig_cjzmsyh()
    processConfig_pvpmultiplayer()
    processConfig_itemdeal()




}