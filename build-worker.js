// build-worker.js
const esbuild = require('esbuild')
const path = require('path')

// Worker 源文件
const entry = path.resolve(__dirname, 'src/workers/doc-worker.ts')

// 输出到 public 目录
const outFile = path.resolve(__dirname, 'public/doc-worker-bundle.js')

esbuild
  .build({
    entryPoints: [entry],
    bundle: true, // 打包所有依赖
    outfile: outFile, // 输出文件
    format: 'esm', // 浏览器可用模块
    platform: 'browser', // 目标浏览器环境
    sourcemap: true,
  })
  .catch(() => process.exit(1))

console.log('Worker打包完毕')
