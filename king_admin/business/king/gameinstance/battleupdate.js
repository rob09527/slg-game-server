exports.name = '战斗服升级部署';
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

    if (!global.config.game.battle) {
        return;
    }
    const { host, path } = global.config.game.battle;
    let hosts = await this.remote.proxy_fightinstances({});
    if (hosts.length == 0) {
        hosts.push(host);
    }
    const a = Date.now();
    for (const ip of hosts) {
        let shellScript = '';
        if (ip !== '127.0.0.1' && ip !== 'localhost') { // 本机实例直接执行
            shellScript = `ssh ${ip}`;
        }

        const getExec = (sh) => {
            if (shellScript) {
                return `${shellScript} '${sh}'`;
            }
            return sh;
        }
        await execAsync(getExec(`cd ${path} && git checkout . && git pull && pm2 reload all`), { cwd: path });

        await util.sleep(2000); // 间隔2秒重启下一台机子
    }
    const b = Date.now();
    console.log("update battle:", b - a);
    return 'OK';
}
