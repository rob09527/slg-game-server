// 辅助生成本地开发 d.ts文件的项目，方便开发代码提示
const fs = require('fs');
const path = require('path');

module.exports = (app) => {
    // 构造 d.ts 方便开发
    let dbList = ``;
    for (const key in global.dao) {
        dbList += `
            ${key}: Collection,`
    }
    let gameconfigStr = ``;
    for (const key in global.gameconfig) {
        let item = global.gameconfig[key];
        let type = typeof item;
        if (type === 'function'){
            continue;
        }
        let isArray ;
        if (type === 'object') {
            isArray = Array.isArray(item);
            if (isArray){
                item = item[0];
            }
            let interface = 'any'
            if (Array.isArray(item)){
                interface = `any[]`
            }else if (item){
                let itemStr = ``;
                for (const k in item) {
                    const o = item[k];
                    let t = typeof o;
                    if (t === 'function'){
                        continue;
                    }
                    if (Array.isArray(o)){
                        t = `[${typeof o[0]}]`
                    }

                    itemStr += `
                            '${k}': ${t},
                    `
                }
                interface = `{
                    ${itemStr}
                }`
            }
            type = interface;
        }
        gameconfigStr += `
            ${key}: ${type},`
    }
   ;

    const a =
        `
import {Collection} from './Collection';

declare module NodeJS {
    interface Global {
        dao: {
            ${dbList}
        },
        gameconfig: {
            ${gameconfigStr}
        },
        services: {
        }
    }
}

            `;
    fs.writeFileSync(path.join(__dirname, 'global.d.ts'), a);
}
