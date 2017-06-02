module.exports = function() {
    return [...arguments][1].onProxyReq;
};