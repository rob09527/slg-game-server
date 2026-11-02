
'use strict'

const util = require('util');

const debug = require('debug')('kaihei:launcher:' + require('./debug_extend')(__filename));

module.exports = exports = function(err) {
  // don't do anything if there is no error.
  // this allows you to pass `this.onerror`
  // to node-style callbacks.
  if (null == err) return;

  if (!(err instanceof Error)) err = new Error(util.format('non-error thrown: %j', err));

  let headerSent = false;
  if (this.headerSent || !this.writable) {
    headerSent = err.headerSent = true;
  }

  // delegate
  this.app.emit('error', err, this);

  // nothing we can do here other
  // than delegate to the app-level
  // handler and log.
  if (headerSent) return;

  const { res } = this;

  // first unset all headers
  /* istanbul ignore else */
  if (typeof res.getHeaderNames === 'function') {
    res.getHeaderNames().forEach(name => res.removeHeader(name));
  } else {
    res._headers = {}; // Node < 7.7
  }

  // then set those specified
  this.set(err.headers);

  // force text/plain
  this.type = 'text';

  // ENOENT support
  if ('ENOENT' == err.code) err.status = 404;

  // respond
  if (this.nowarp) {
    res.setHeader('content-type', 'text/plain');
    this.body = err.message;
  }else{
    this.body = {error: err.message};
    this.body = JSON.stringify(this.body);
  }
  // cipher
  if (!this.dev && this.whisper_encrypt) this.body = this.whisper_encrypt(this.body);

  this.res.end(this.body);
}
  