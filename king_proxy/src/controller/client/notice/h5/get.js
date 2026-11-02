'use strict'


const proxy  = require('../../../../../preview').proxy;

// 公告页面
module.exports = exports = async function (ctx, next) {
    const {id = '', bundle } = ctx.request.query || {};
    let notice;
    if(id.startsWith('agreement')) { // 协议查询
        notice = await ctx.dao.notice.findOne({title: id, bundle: {$in: [bundle]} }, {content: 1});
        if (!notice) {
            notice = await ctx.dao.notice.findOne({title: id, bundle: {$in: ['ALL']} }, {content: 1});
        }
    } else {
        notice = await ctx.dao.notice.findOne({_id: id}, {content: 1});

    }
    if (!notice) {
        try { // 尝试打开 审核服的公告
            const res = await proxy(ctx.request.originalUrl, ctx.method, ctx.ip);
            return ctx.body = res.res.data;
        }catch (e) {
            return ctx.body = "No Notice";
        }
    }
    ctx.body = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>-</title>
    <meta name="viewport"
          content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=0,viewport-fit=cover">
    <style>
        * {
            margin: 0px;
            box-sizing: border-box;
            color: #603615;
        }
        html, body {
            height: 100%;
            max-width: 1200px;
            margin: 0 auto;
            overflow: auto;
            background-color: #f2e1d0;
        }
        body {
            margin: 8px 6px;
        }
        @media screen and (min-width: 500px) {
           * {
                font-size: 20px;
            }
            font[size="1"] {
                font-size: 16px;
            }
            font[size="2"] {
                font-size: 18px;
            }
            font[size="3"] {
                font-size: 20px;
            }
            font[size="4"] {
                font-size: 22px;
            }
            font[size="5"] {
                font-size: 24px;
            }
            font[size="6"] {
                font-size: 26px;
            }
            font[size="7"] {
                font-size: 30px;
            }
        }
        *::-webkit-scrollbar {
            display: none
        }
        @media screen and (min-width: 300px) and (max-width: 500px) {
            * {
                font-size: 18px;
            }
            font[size="1"] {
                font-size: 14px;
            }
            font[size="2"] {
                font-size: 16px;
            }
            font[size="3"] {
                font-size: 18px;
            }
            font[size="4"] {
                font-size: 20px;
            }
            font[size="5"] {
                font-size: 22px;
            }
            font[size="6"] {
                font-size: 24px;
            }
            font[size="7"] {
                font-size: 28px;
            }
        }
        @media screen and (max-width: 300px) {
            * {
                font-size: 12px;
            }
            font[size="1"] {
                font-size: 8px;
            }
            font[size="2"] {
                font-size: 10px;
            }
            font[size="3"] {
                font-size: 12px;
            }
            font[size="4"] {
                font-size: 14px;
            }
            font[size="5"] {
                font-size: 16px;
            }
            font[size="6"] {
                font-size: 22px;
            }
            font[size="7"] {
                font-size: 26px;
            }
        }
    </style>
</head>
<body>
    ${notice.content}
</body> 
</html>
`;
}
