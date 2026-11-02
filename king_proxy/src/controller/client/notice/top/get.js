'use strict'


const proxy = require('../../../../../preview').proxy;

// 公告页面,查询指定类型的最新一条公告
module.exports = exports = async function (ctx, next) {
    const {type = '', servid, bundle} = ctx.request.query || {};
    let notice;
    const match = {status: 2, type: type, bundle:  bundle };
    if (servid) {
        match.servid = +servid;
    }
    notice = await ctx.dao.notice.find(match, {content: 1}).sort({_id: -1}).limit(1);
    if (!notice.length) {
        match.bundle = 'ALL';
        notice = await ctx.dao.notice.find(match, {content: 1}).sort({_id: -1}).limit(1);
    }
    if (!notice.length) {
        return ctx.body = "No Notice";
    }
    notice = notice[0];
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
