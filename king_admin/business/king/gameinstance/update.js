exports.name = '服务器升级部署';
exports.type = 'N';

const exec = require('child_process').exec;


/**
 *
 * @param commend {string}
 * @param options {any}
 * @return {Promise<unknown>}
 */
const execAsync = (commend, options = {}) => new Promise((resolve, reject) => {
    console.log(`EXEC(${options.cwd}) : `, commend);
    options.uid = process.getuid();
    let res = `EXEC:  ${commend} \n`;
    exec(commend, options, function (err, stdout, stderr) {
        if (err) {
            return reject(err);
        }
        res += stderr;
        res += stdout;
        console.error('exec -stderr', stderr);
        resolve(res);
    })
});

exports.exec = async function (body, query, ctx) {
    // const {_page_, _sort_} = body;
    if (body.test) {
        return 'OK';
    }

    const res = await this.remote.proxy_gameinstances({});
    const { games, agent } = res;
    const tmp = {}; // 按服务器地址分组
    games.push(agent);
    for (const game of games) {
        tmp[game.ip] = tmp[game.ip] || [];
        tmp[game.ip].push(game);
    }
    console.log('process', process.getuid());
    const a = Date.now();
    const servpath = global.config.servpath;
    for (const ip of Object.keys(tmp)) { // 遍历让每一台机子都执行
        let shellScript = '';
        if (ip !== '127.0.0.1') { // 本机实例直接执行
            shellScript = `ssh ${ip}`;
        }

        const getExec = (sh) => {
            if (shellScript) {
                return `${shellScript} '${sh}'`;
            }
            return sh;
        }
        let res = '';
        for (const k in servpath) {

            const r = await execAsync(getExec(`cd ${servpath[k]} && git checkout .`), { cwd: servpath[k] });
            console.log('res', r); // 这个日志不输出

            res += await execAsync(getExec(`cd ${servpath[k]} && git pull && git branch -v | grep "*"`), { cwd: servpath[k] });
            res += '\n';
            console.log('res', res);
        }
        if (ip !== '127.0.0.1') { // 非本机实例直接执行reload
            res += await execAsync(getExec(`pm2 reload all`), { cwd: servpath.game });
        }

        // util.sendByRobot(ctx.adminName + ' 升级服务器:' + ip, res).then(res => {
        //     console.log('robot', res);
        // }).catch(console.error);
        await util.sleep(2000); // 间隔2秒重启下一台机子
    }
    const b = Date.now();
    console.log("update game:", b - a);
    return 'OK';
}
