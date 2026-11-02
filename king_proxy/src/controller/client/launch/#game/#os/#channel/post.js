
'use strict'

const {
  curl,
} = require('urllib');

const pass_msg = function(path, ip, ua, body) {
  let opt = {
    method: 'POST',
    dataType: 'json',
    contentType: 'json',
    data: body,
    headers: {
      'x-real-ip': ip,
      'x-real-ua': ua,
    }
  }
  let url = 'http://localhost:10144'+path;
  return curl(url, opt);
}

module.exports = exports = async function (ctx, next) {
  let path = ctx.path.replace('/client/launch', '/hio/applaunch');
  pass_msg(path, ctx.ip, ctx.headers['user-agent'], ctx.request.body).catch(console.error);
  ctx.body = {};
}