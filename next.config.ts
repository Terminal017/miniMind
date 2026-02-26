import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,

  turbopack: {
    resolveAlias: {
      sharp: './empty-module.js', //打包时忽略sharp模块和onnxruntime-node模块（node相关模块）
      'onnxruntime-node': './empty-module.js',
    },
  },

  webpack: (config, { dev }) => {
    if (!dev) {
      // 禁用压缩，防止破坏模型加载的二进制逻辑
      config.optimization.minimize = false
      // 保持类名和函数名，这对某些依赖反射的模型框架很重要
      config.optimization.minimizer = []
    }
    return config
  },
}

export default nextConfig
