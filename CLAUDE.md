# CLAUDE.md - 项目上下文

## 项目：ReportCardAI.com (Kriterix 引擎)

### 核心身份
*   **名称**：ReportCardAI.com
*   **引擎**：Kriterix 引擎
*   **使命**：通过高质量、符合框架的成绩单评语为教师节省时间。

### 技术栈
*   **框架**：Next.js 14 (App Router)
*   **样式**：Tailwind CSS v4, Shadcn/UI
*   **AI**：Google Gemini (通过 Vercel AI SDK)
*   **语言**：TypeScript

### 关键目录
*   `src/app`：Next.js App Router 页面和 API 路由。
*   `src/components`：React 组件 (UI, 主页, 布局)。
*   `src/lib`：工具函数。
*   `src/styles`：全局样式 (CSS 变量, Tailwind 配置)。

### 常用命令
*   `npm run dev`：启动开发服务器。
*   `npm run build`：构建生产版本。
*   `npm run lint`：运行代码检查。

### 开发指南
*   **设计**：使用 "Kriterix" 品牌色（蓝色系）。保持整洁、现代的 SaaS 美学。
*   **代码风格**：函数式 React 组件，Hooks，严格的 TypeScript。
*   **AI 逻辑**：
    *   始终尊重“框架”（IB, SPED, ESL）。
    *   IB：注入学习者档案（Learner Profile）属性。
    *   SPED：仅使用基于资产（Asset-Based）的语言。
*   **安全**：对公共 API 进行速率限制（目前开发阶段可能暂时禁用）。不要在日志中存储个人身份信息 (PII)。
