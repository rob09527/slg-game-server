exports.name = 'H5商品导入';
exports.type = 'N';

const fs = require("fs");
const assert = require('assert');

const getConfig = (lan) => {
    const DOC_PATH = global.config.docspath
    const OUT_PATH = DOC_PATH + "/output/output_gm"; // 脚本路径

    let lanpath = lan ? `/${lan}` : '';
    const dpath = `${OUT_PATH}${lanpath}/`;
    const configs = fs.readdirSync(dpath);

    let set_config = null;
    for (const cnf of configs) {
        const str = fs.readFileSync(dpath + cnf, {encoding: 'utf8'});
        const obj = JSON.parse(str);
        if (cnf === 'commodity.json') {
            set_config = Object.values(obj);
            break;
        }
    }
    return set_config;
};

exports.exec = async function (body, query, ctx) {
    const config = getConfig();
    console.log(config)
    assert(config, "no file");

    const commodities = await this.service.game.collection('commodities');
    // 先删除
    await commodities.remove({});
    // 再创建
    for (const cfg of config) {
        await commodities.insertOne({id:cfg.id, pid:cfg.pid, price:+cfg.price, name:cfg.name});
    }
    return 'ok';
};

