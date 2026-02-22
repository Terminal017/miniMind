// build-worker.js
const esbuild = require('esbuild')
const path = require('path')

// Model Worker 源文件
const entry_model = path.resolve(__dirname, 'src/workers/model-worker.ts')
// 输出到 public 目录
const outFile_model = path.resolve(__dirname, 'public/model-worker-bundle.js')

//Doc Worker 源文件
const entry_doc = path.resolve(__dirname, 'src/workers/doc-worker.ts')
const outFile_doc = path.resolve(__dirname, 'public/doc-worker-bundle.js')

esbuild
  .build({
    entryPoints: [entry_model],
    bundle: true, // 打包所有依赖
    outfile: outFile_model, // 输出文件
    format: 'esm', // 浏览器可用模块
    platform: 'browser', // 目标浏览器环境
    sourcemap: true,
  })
  .catch(() => process.exit(1))

esbuild
  .build({
    entryPoints: [entry_doc],
    bundle: true, // 打包所有依赖
    outfile: outFile_doc, // 输出文件
    format: 'esm', // 浏览器可用模块
    platform: 'browser', // 目标浏览器环境
    sourcemap: true,
  })
  .catch(() => process.exit(1))

console.log('Worker打包完毕')
