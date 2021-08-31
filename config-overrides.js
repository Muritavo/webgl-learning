module.exports = function (webpackconfig) {
    webpackconfig.module.rules[1].oneOf.unshift({
        loader: require.resolve("raw-loader"),
        test: /.(vert|frag)$/
    })
    return webpackconfig;
}