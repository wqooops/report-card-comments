# ReportCardAI.com - Kriterix 引擎

这是 **ReportCardAI.com** 的代码库，由 **Kriterix 引擎** 驱动。

## 项目概述

ReportCardAI.com 是一个 SaaS 平台，旨在帮助教师在几秒钟内生成高质量、符合教学框架的成绩单评语。

### 核心功能

*   **Kriterix 引擎**：我们专为教育框架微调的专有 AI 逻辑。
*   **框架支持**：
    *   **IB (MYP/DP)**：注入学习者档案（Learner Profile）属性。
    *   **SPED / IEP**：强制使用基于资产（Asset-Based）的积极语言。
    *   **ESL / ELL**：专注于语言习得阶段。
    *   **通用 / 共同核心标准**：专业且富有建设性的评语。
*   **免费生成器**：主页上的公开工具，用于快速试用。

## 技术栈

*   **前端**：Next.js 14 (App Router), Tailwind CSS v4, Shadcn/UI.
*   **后端**：Next.js API Routes.
*   **AI**：Google Gemini API (通过 Vercel AI SDK).
*   **数据库**：(计划中) PostgreSQL / Supabase.

## 快速开始

1.  **安装依赖**：
    ```bash
    npm install
    ```

2.  **设置环境变量**：
    创建一个 `.env.local` 文件并添加您的 Google Gemini API 密钥：
    ```env
    GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
    ```

3.  **运行开发服务器**：
    ```bash
    npm run dev
    ```

4.  **构建生产版本**：
    ```bash
    npm run build
    ```

## API 文档

### `POST /api/generate-comment`

生成成绩单评语。

**请求体 (Request Body):**

```json
{
  "studentName": "Alex",
  "framework": "IB (MYP/DP)",
  "strength": "Critical thinking in history",
  "weakness": "Time management",
  "tone": "Professional"
}
```

**速率限制：**
(目前已禁用) 公共 API 限制为每个 IP 地址每小时 10 次请求。
