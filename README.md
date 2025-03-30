
# 智能聊天应用 (Next.js)

[![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-06B6D4.svg)](https://tailwindcss.com/)

基于 Next.js 的全栈聊天应用，支持用户认证、文件上传和实时对话。

## ✨ 核心功能

- **用户系统**：登录/注册/密码重置
- **聊天管理**：创建/删除/重命名对话
- **文件处理**：上传 PDF/图片并解析
- **数据库**：PostgreSQL + Drizzle ORM
- **实时通信**：WebSocket 支持（可选）

## 🛠 技术栈

- **前端**：Next.js 14 (App Router), Tailwind CSS
- **后端**：Next.js API Routes
- **数据库**：PostgreSQL + Drizzle ORM
- **认证**：JWT + Cookie
- **工具链**：TypeScript, ESLint, Prettier

## 🚀 快速开始

### 环境要求

- Node.js v18+
- PostgreSQL 或 Docker（本地开发）
- Git

### 安装步骤

1. 克隆仓库：
   ```bash
   git clone https://github.com/你的用户名/chat-app.git
   cd chat-app
## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
