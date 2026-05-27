# 音乐博主工作台 · MVP

面向小红书音乐博主的创作者工具网页版（Mobile-First）。

## 技术栈

- **Next.js 16** (App Router)
- **Tailwind CSS 4**
- **Framer Motion**
- **Canvas API**（导出高清封面，兼容 Tailwind v4 配色）

## 本地运行

```bash
cd my_app
npm install
npm run dev
```

浏览器打开 [http://localhost:3456](http://localhost:3456)。

## 功能说明

| 区域 | 功能 |
|------|------|
| 视觉预览 | 发光卡片、旋转黑胶、CSS 声波动画 |
| 播放控制 | 播放/暂停控制唱片旋转与声波 |
| 导出封面 | Canvas 绘制 680×920 PNG（避免 oklch 解析错误） |
| 内容生成 | Mock AI 生成小红书标题与文案 |
| 一键复制 | 单条或全文复制到剪贴板 |

## AI 服务配置

1. 复制 `.env.example` 为 `.env.local`
2. 填入 API Key（变量名见 `.env.example`）
3. 重启 `npm run dev`（修改环境变量后必须重启）

API Key 仅保存在服务端，不会暴露给浏览器。

默认展示：落日飞车《My Jinji》。点击「AI 触发生成」将实时生成标题与文案。
