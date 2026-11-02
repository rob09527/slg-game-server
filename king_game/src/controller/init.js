const fs = require('fs');
const path = require('path');
const CONTROLLER = {};

function createController(dir, el, contr) {
    const fl = path.resolve(dir, el);
    if (fs.statSync(fl).isDirectory()) {
        contr[el] = {};
        findController(fl,  contr[el] )
        return;
    }

    if (el === 'use.js') {
        contr.use = require(fl);
    } else if (el === 'post.js') {
        contr.post = require(fl);
    }
}

function findController(dir, contr) {
    for (const el of fs.readdirSync(dir)) {
        createController(dir, el, contr)
    }

}

/**
 * 递归执行控制器函数
 * @param ctx
 * @param controllers
 * @param i {number}
 * @return {Promise<void>}
 */
async function execController(ctx, controllers, i = 0) {
    if (!controllers[i]) {
        return;
    }
    await controllers[i](ctx, async () => {
        await execController(ctx, controllers, i + 1);
    });
}

module.exports = function () {
    const _p_ = path.resolve(__dirname, './');
    let controllers = fs.readdirSync(_p_);
    for (const cl of controllers) {
        const dir = path.resolve(_p_, cl);
        if (cl !== 'use.js' && !fs.statSync(dir).isDirectory()) {
            continue;
        }
        createController(_p_, cl, CONTROLLER);
    }

    /*
    * 返回一个控制器执行函数
    * */
    return async function (ctx) {
        const api = ctx.path;

        const controllers = [];
        // 记录当前递归的 控制器
        let currentController = CONTROLLER;

        currentController.use && controllers.push(currentController.use);
        const apis = api.split('/');
        const params = {};
        for (const routPath of apis) {
            if(!routPath) { // 跟路径
                continue;
            }
            if (currentController[routPath]){
                currentController = currentController[routPath];
            } else {
                const paramKey = Object.keys(currentController).find((k) => k.startsWith('#'));
                if (!paramKey) {
                    currentController = null;
                    break;
                }
                params[paramKey.replace('#', '')] = routPath;
                currentController = currentController[paramKey];
            }
            currentController.use && controllers.push(currentController.use);
        }
        ctx.params = params;
        currentController && currentController.post && controllers.push(currentController.post);
        return execController(ctx, controllers);
    }
}
