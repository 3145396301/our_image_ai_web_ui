const { defineConfig } = require('@vue/cli-service')
const fs = require('fs')
const path = require('path')

// 证书路径（建议使用绝对路径）
const resolveCert = (file) => path.resolve(__dirname, 'certs', file)

module.exports = defineConfig({
    transpileDependencies: true,
    lintOnSave: false,
    devServer: {
        https: {
            key: fs.readFileSync(resolveCert('privkey1.pem')),
            cert: fs.readFileSync(resolveCert('fullchain1.pem')),
            // 如果有 CA 证书（自签名时需要）
            // ca: fs.readFileSync(resolveCert('ca.pem')),
        },
        host: '192.168.5.2',
        proxy: {
            '/user': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                pathRewrite: { '^/user': '' }
            },
            '/userGenerateImage': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                pathRewrite: { '^/userGenerateImage': '' }
            },
            '/shareImage': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                pathRewrite: { '^/shareImage': '' }
            },
            '/activity': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                pathRewrite: { '^/activity': '' }
            }
        },
        allowedHosts: 'all',
        hot: true,
        client: {
            logging: 'verbose',
        }
    }
})