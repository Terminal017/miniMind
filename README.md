### 项目概述

基于 Next.js + TypeScript + shadcn/ui + transform.js 实现的浏览器内嵌模型项目

### 运行说明

1. 运行环境

- Node.js >= 18.18.0
- npm >= 9
- pnpm >= 8

2. 设备要求

- 浏览器需要支持 Web GPU，内存推荐 16GB 及以上
- 推荐使用 Chrome 浏览器进行测试

3. 安装依赖

```
npm install
pnpm install
```

4. 运行测试

```
npm run dev
pnpm dev
```

5. 构建项目

```
npm run build
npm run start
#或
pnpm build
pnpm start
```

### 其他相关说明

1. 为考虑中国大陆的下载，模型现在托管在 Cloudflare R2 上，部署域名与本地测试(`http://localhost:3000`)能够正常下载。

2. 模型下载存储在 Cache Storage 中，文档存储在 Indexed DB 中，如不再访问项目网站，推荐先去设置中清理相关数据或手动清理。
