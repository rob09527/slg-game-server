exports.name = '活动转表或导入';
exports.type = 'N';

const moment = require('moment');
const child_process = require('child_process');
const fs = require("fs");
const format = 'YYYY-MM-DD HH:mm:ss';

exports.exec = async function (body, query, ctx) {
    const DOC_PATH = global.config.docspath
    const SCRIPT_PATH = DOC_PATH + "/trans/27活动配置"; // 转表脚本路径
    const OUT_PATH = DOC_PATH + "/output/output_gm"; // 转表脚本路径

    let lan = "";

    const run = () => new Promise((resolve, reject) => {
        if (global._last_tran_ && Date.now() - global._last_tran_ < 60000) { // 60S 之内不允许重复转表
            return resolve(1);
        }
        global._last_tran_ = Date.now();
        child_process.exec("git checkout . && git pull && git branch -v | grep '\\*'", {
            cwd: DOC_PATH,
            encoding: 'utf-8'
        }, (err, data) => {
            if (err) {
                console.log('拉取文档失败', err);
                return reject(err);
            }
            const r = data.split('* master');
            const gitLog = r[1];

            const do_script = 'trans_zhd_gm_script.js'; // 0 表示转灵活活动的配置
            const child = child_process.fork(`${SCRIPT_PATH}${do_script}`, [lan || 'zh_cn'], {
                cwd: SCRIPT_PATH,
                encoding: 'utf-8',
                silent: true
            });
            let err_data = "";

            child.stderr.on('data', function (data) {
                err_data += data;
                console.error('转表异常 :' + data);
            });
            child.on('close', (code) => {

                if (code != 0) {
                    let err = err_data.split('Error:')[1];
                    err = err.split('\n')[0];
                    return reject(err);
                }
                resolve(gitLog)
            });
        })
    });

    const getConfig = () => {
        let lanpath = lan ? `/${lan}` : '';
        const dpath = `${OUT_PATH}${lanpath}/`;
        const configs = fs.readdirSync(dpath);
        console.log('configs', configs);

        const set_config = { gameconfig: {}, activity: [] };
        for (const cnf of configs) {
            if (cnf == '.DS_Store') {
                continue;
            }
            const str = fs.readFileSync(dpath + cnf, { encoding: 'utf8' });
            console.log(str)
            const obj = JSON.parse(str);
            if (cnf === 'backend_zhd.json') { // 后台类活动配置
                set_config.activity = Object.values(obj);
            } else {
                const name = cnf.replace('.json', '');
                set_config.gameconfig[name] = obj;
            }
        }
        return set_config;
    };

    const saveConfig = async () => {
        const set_config = getConfig();

        const actModel = await this.service.game.collection('activities');
        for (const act of set_config.activity) {
            act.type = act.type.toUpperCase();
            await actModel.findOneAndUpdate({
                type: act.type,
            }, {
                $set: act
            }, {
                upsert: true // 无则添加
            });
        }
        const cfgModel = await this.service.game.collection('gameconfigs');
        await cfgModel.findOneAndUpdate({}, {
            $set: {
                config: set_config.gameconfig
            }
        }, {
            upsert: true
        })
    }


    // await run();


    if (query.out) { // out 为转出配置 不更新测试服本身的配置
        const cfg = getConfig();
        const outCfg = {
            activities: cfg.activity,
            gameconfig: {
                config: cfg.gameconfig
            }
        }
        ctx.set('Content-Disposition', `attachment;filename=${encodeURIComponent('act_' + new Date().format() + '.json')}`);
        ctx.set('content-type', `text/text;charset=utf-8`);
        return ctx.body = JSON.stringify(outCfg);
    }

    await saveConfig();
    await this.remote.refreshActivity({}); // 刷新game活动配置
    await this.remote.refreshGameConfig({}); // 重载gameconfig配置

    await this.remote.agent_refreshActivity({}); // 刷新agent活动配置
    await this.remote.agent_refreshGameConfig({}); // 重载agent的gameconfig配置
    await this.remote.agent_retimer('zhdendclean');
    await this.remote.agent_retimer('zhdmail');
    return 'OK';
}
