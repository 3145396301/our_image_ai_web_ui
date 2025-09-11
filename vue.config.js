const {defineConfig} = require('@vue/cli-service')
module.exports = defineConfig({
    transpileDependencies: true,
    lintOnSave: false,
    devServer: {
        https: true,
        host: '0.0.0.0',
        proxy: {
            '/user': {
                target: 'http://127.0.0.1:8083',
                changeOrigin: true
            },
            '/userGenerateImage': {
                target: 'http://127.0.0.1:8083',
                changeOrigin: true
            },
            '/shareImage': {
                target: 'http://127.0.0.1:8083',
                changeOrigin: true
            },
            '/activity': {
                target: 'http://127.0.0.1:8083',
                changeOrigin: true
            }
        }
    }

})
