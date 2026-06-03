# 用户操作手册

> 这份文档列出**只能由你（用户）亲自做**的事情。代码部分都已完成，剩下的是账号注册、网页点点、和决策性的内容编辑。

---

## ⚠️ 立即要做（安全相关）

### 1. 准备 GitHub Token
1. https://github.com/settings/tokens → **Generate new token (classic)** → 只勾 `public_repo` → 90 days
2. 复制 token，编辑 `E:\project\GoogleAdv\.env` 的 `GITHUB_TOKEN=` 那行填入
3. 确保本机 `.env`、`GitHubToken.txt` 等含 token 的文件**不要**入 git（已在 `.gitignore`）

---

## 阶段 1：MVP 验证期（接下来一两周）

### 2. 在 GitHub 创建一个空仓库
1. https://github.com/new
2. 仓库名：**GoogleAdv**（或你喜欢的名字，但 `SITE_URL` 要相应调整）
3. **不要** Initialize with README（本地已经有内容）
4. 创建后复制 SSH/HTTPS clone URL

### 3. 推送本地代码
在 `E:\project\GoogleAdv` 打开 bash/PowerShell：
```bash
git remote add origin https://github.com/你的用户名/GoogleAdv.git
git branch -M main
git push -u origin main
```

### 4. 启用 GitHub Pages
- 仓库 → **Settings** → 左侧 **Pages**
- **Source**: 选 **GitHub Actions**
- 不需要额外配置，第一次 push 后 `.github/workflows/deploy.yml` 会自动跑

### 5. 配置 SITE_URL 变量（可选但推荐）
- 仓库 → **Settings** → **Secrets and variables** → **Actions** → **Variables** 标签 → **New repository variable**
- Name: `SITE_URL`
- Value: `https://你的用户名.github.io/GoogleAdv`（注意末尾不要斜杠）

### 6. 触发首次部署
- 仓库 → **Actions** → 左侧 **Deploy** workflow → **Run workflow** → main
- 等 2-3 分钟 → 完成后访问 `https://你的用户名.github.io/GoogleAdv`

### 7. 检查 MVP 站
- 首页 9 个分类入口可点
- 分类页能进
- 详情页（如 `/repo/openai/whisper`）有中文简介 + 适用场景
- 没中文解读的仓库（enrich 没跑到的）会显示英文 description，没问题

---

## 阶段 2：正式期（约 W4，2-3 周后）

### 8. 买顶级域名
- **Cloudflare Registrar**（最便宜）：https://dash.cloudflare.com/?to=/:account/registrar
- 选 `.com` 约 $9.15/年
- 或 Namecheap 等其他

### 9. 域名指向 GitHub Pages
- Cloudflare DNS 添加 4 条 A 记录指向：
  - 185.199.108.153
  - 185.199.109.153
  - 185.199.110.153
  - 185.199.111.153
- 顶级域名留空 `@`，子域名（如 `www`）也加一条 CNAME 指向 `你的用户名.github.io`

### 10. 在仓库根目录加 CNAME 文件
```bash
mkdir -p public
echo "yourdomain.com" > public/CNAME
git add public/CNAME
git commit -m "feat: bind custom domain"
git push
```

### 11. GitHub 仓库配置
- Settings → Pages → **Custom domain** 填 `yourdomain.com`
- 等几分钟 DNS 生效 → 勾选 **Enforce HTTPS**
- 把 Actions Variables 里的 `SITE_URL` 改成 `https://yourdomain.com` 并重跑 Deploy

### 12. 提交到 Google Search Console
- https://search.google.com/search-console
- 添加你的新域名（用 **Domain** 属性，需要做 DNS 验证 TXT 记录）
- 提交 sitemap：`https://yourdomain.com/sitemap-index.xml`
- **从此正式 SEO 计时**

---

## 阶段 3：AdSense 审核（W9，约 2 个月后）

### 13. 内容补充与人工抽检
- 抽查 30 个热门仓库的中文 digest 质量，明显错的手动改 `data/digests/<owner>__<name>.json`
- 把 `src/pages/contact.md` 里的 `your-email@example.com` 改成你的真实邮箱
- 把 `src/pages/contact.md` 里的源码仓库 URL 改成你实际的

### 14. 提交 AdSense 审核
- https://www.google.com/adsense/start/
- 用 Google 账号登录
- 网站 URL 填 `https://yourdomain.com`
- 国家选你的实际收款国 ⚠️ **注册后不能改**
- AdSense 会给一段 `<script>` 代码，把它填到 `src/layouts/Base.astro` 的注释处（已留好位置）：
  ```html
  <!-- 找到这行注释 -->
  <!-- AdSense 脚本占位：审核通过后取消注释并填 client id
  <script async src="...?client=ca-pub-XXX" ...></script>
  -->
  ```
  去掉注释 + 把 `ca-pub-XXX` 换成你实际的 client id → push → 等审核

### 15. 审核通过后启用真实广告
- 在 AdSense 后台创建广告单元，拿到 slot id
- 修改 `src/components/AdSlot.astro` 替换占位 div 为真实 `<ins class="adsbygoogle" ...>` 代码

---

## 日常维护

### 16. 每周/手动更新数据
```bash
cd E:\project\GoogleAdv
npm run update         # fetch + classify + enrich
git add data/
git commit -m "chore(data): weekly update"
git push               # 触发 Deploy workflow 自动构建
```

### 17. 监控 LLM 反代是否在跑
enrich 依赖 `.env` 中配置的 `ANTHROPIC_BASE_URL`，跑 `npm run update` 前确认它已启动且可达。

### 18. 想增删分类
编辑 `scripts/lib/categories.ts` 的 `CATEGORIES` 和 `RULES` → 重跑 `npm run classify`。

### 19. 调 prompt
编辑 `scripts/lib/prompts.ts`。改了之后老 digest 不会自动重生成（因为 hash 没变）；要强制重做就删 `data/digests/*.json` 再 `npm run enrich`。

---

## 我（Claude）做了什么

✅ 完成的任务：
- T1 项目脚手架（Astro + Tailwind + TS + Vitest）
- T2 GitHub 抓取客户端 + 测试
- T3 9 个分类规则 + 测试
- T4 LLM 客户端（Anthropic 反代 + 模型 alias 映射）
- T5 fetch.ts 跑通（500 个仓库实抓）
- T6 classify.ts 跑通（分类分布：LLM 118 / Agent 108 / RAG 85 / 其他 92 / ...）
- T7 enrich.ts + 缓存测试 + 实际跑全量
- T8 数据加载/SEO/format 工具
- T9 Base 布局 + 5 个组件
- T10/11/12 首页 + 分类页 + 详情页
- T13 静态页（about/privacy/terms/contact）+ RSS
- T14 GitHub Actions deploy.yml

❌ 需要你做（按上面 1-19 步）：
- 撤销并重发 GitHub token
- 创建 GitHub 仓库、push、启用 Pages
- 域名（W4 时）
- AdSense 申请（W9 时）

## 已知限制 / 后续可优化

- LLM 解读没有人工二审，少数可能不准（详情页加了 AI 生成声明）
- 22% 仓库归入"其他"分类，可优化规则提高命中率
- Star 趋势图是单时间点条形图，要真历史曲线得加 GitHub stars history API（未做）
- 没站内搜索（500 条不算多，可后续加 Fuse.js 客户端搜索）
- 没多语言（首期仅中文）
