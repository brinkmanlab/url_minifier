const path = require("path");
module.exports = {
    target: "webworker",
    mode: "production",
    resolve: {
        alias: {
            'dns': '@i2labs/dns'
        }
    },
    entry: "./index.js",
    output: {
        libraryTarget: "",
        globalObject: "this",
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
    }
}
