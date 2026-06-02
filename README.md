# GoogleAdv — AI 开源仓库中文榜单站

> 一个静态站点：从 GitHub 抓取 Top 500 AI 开源项目 → 调 LLM 生成中文解读（一句话简介、适用场景、上手难度、同类替代）→ Astro 构建静态页 → 部署 GitHub Pages。

📚 完整设计与计划：
- 设计：[docs/superpowers/specs/2026-06-03-ai-repo-ranking-site-design.md](docs/superpowers/specs/2026-06-03-ai-repo-ranking-site-design.md)
- 实施计划：[docs/superpowers/plans/2026-06-03-ai-repo-ranking-site.md](docs/superpowers/plans/2026-06-03-ai-repo-ranking-site.md)
- **用户操作手册（必读）**：[docs/USER_HANDBOOK.md](docs/USER_HANDBOOK.md)

---

## 一、本地命令速查

```bash
# 开发预览（不依赖 LLM）
npm run dev          # http://localhost:4321

# 全量构建（需先有 data/repos.json）
npm run build
npm run preview      # 预览 dist/

# 测试
npm test

# 数据流（按顺序）
npm run fetch        # GitHub → data/repos.raw.json
npm run classify     # → data/repos.json + 分类
npm run enrich       # 增量调 LLM → data/digests/*.json
npm run update       # 一键三连
```

## 二、数据更新策略

数据**完全本地跑**，不在 GitHub Actions 跑。流程：

```
本地: npm run update  ⇒  git add data/  ⇒  git commit  ⇒  git push
              ↓
GitHub Actions: deploy.yml 自动跑 npm run build → 推到 gh-pages
```

理由：
- 不需要把 LLM 反代 token 放到 GitHub Secrets
- 完全控制 LLM 调用时机和费用
- 调试更方便（出错直接本地看）

代价：要更新数据必须手动跑 `npm run update`，没有 cron 自动化（如有需要再加）。

## 三、关键架构决策

| 决策 | 原因 |
|---|---|
| `data/` 入 git | LLM 解读是"已支付成本的输出"，必须持久化；rank_delta 计算需要历史数据 |
| LLM 解读用 sha256 缓存 | README 没变就不重复调 LLM，每周增量成本约 $0.01 |
| 分类用规则不用 LLM | 500 仓库 topics + 关键词命中率 80%+，省 API |
| AdSlot 组件只占位不加载脚本 | AdSense 审核通过前不能放真实广告代码 |
| 黑名单过滤 `awesome-*` / `*-list` | GitHub Search 噪音 |
| 自动按 5 topic 拉取并 dedup | GitHub Search 的 OR 表达式不靠谱 |

## 四、文件结构

```
GoogleAdv/
├── scripts/
│   ├── fetch.ts        # GitHub Search API → repos.raw.json
│   ├── classify.ts     # 分类 + rank_delta → repos.json
│   ├── enrich.ts       # 增量调 LLM → digests/*.json
│   └── lib/{github,llm,prompts,categories,hash}.ts
├── data/               # 入 git
│   ├── repos.json
│   ├── repos.raw.json
│   └── digests/*.json
├── src/
│   ├── layouts/Base.astro
│   ├── components/{RepoCard,AdSlot,StarChart,Breadcrumb,CategoryNav}.astro
│   ├── pages/
│   │   ├── index.astro                    # /
│   │   ├── category/[slug].astro          # /category/llm 等 9 个
│   │   ├── repo/[owner]/[name].astro      # /repo/openai/whisper 等 ~500 个
│   │   ├── {about,privacy,terms,contact}.md
│   │   └── rss.xml.ts
│   └── utils/{data,seo,format}.ts
├── tests/              # vitest
└── .github/workflows/deploy.yml
```

## 五、环境变量（`.env`，不入 git）

```
GITHUB_TOKEN=ghp_...                              # public_repo 权限
ANTHROPIC_BASE_URL=***REDACTED-LLM-URL***          # 本地 LLM 反代
ANTHROPIC_AUTH_TOKEN=dummy                         # 反代不校验
ANTHROPIC_MODEL=claude-opus-4-7[1m]               # 经 alias 映射到 ***REDACTED-MODEL***
SITE_URL=https://你的用户名.github.io/GoogleAdv    # GitHub Pages 完整 URL
LLM_CALL_BUDGET=600                                # 单次 enrich 最多调用次数
```

模型 alias 映射定义在 `scripts/lib/llm.ts` 的 `MODEL_ALIASES`。
