import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    resolveAlias: {
      sharp: './empty-module.js', //打包时忽略sharp模块和onnxruntime-node模块（node相关模块）
      'onnxruntime-node': './empty-module.js',
    },
  },
}

export default nextConfig
