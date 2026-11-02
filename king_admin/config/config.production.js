/**
 *
 * @param app {App}
 * @return
 */
module.exports = app => {

    const config = {};
    config.SSL_PATH = {
        KEY: 'YOUR_SSL_KEY_PATH',
        CRT: 'YOUR_SSL_CRT_PATH'
    }

    return config;
}
