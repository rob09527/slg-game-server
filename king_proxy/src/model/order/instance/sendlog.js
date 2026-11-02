/**
 * 发送消息到kafka
 */
'use strict';

const assert = require('assert');

const qs = require('querystring');

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

module.exports = function () {
  if (this.platform !== 'ios') return;
  if (this.channel !== 'papajs') return;
  if (!this.deviceInfo) return;
  let {
    ip,
    ua,
  } = this.deviceInfo;
  pass_msg('/hio/payment/junshi/ios/toutiao', ip, qs.escape(ua), this.toJSON()).catch(console.error);
}