# Liquid Glass Web

[English](README.md) · [在线演示](https://oopsg1thub.github.io/liquid-glass-web/) · [案例](#案例) · [安装](#为-codex-安装)

一个面向 Codex、符合 [Agent Skills 规范](https://agentskills.io/specification)
的 Liquid Glass 网页实现技能。目录结构遵循
[OpenAI Skills 指南](https://developers.openai.com/plugins/build/skills)，但按设计
保持为独立 skill。它把一套锁定的 CSS 材质、一个 SVG/JavaScript 运行时片段、
实施指南和四个自包含案例封装在一起。

这套材质包含半透明着色、背景磨砂、镜面边缘光、跟随光标的高光，以及仅在
Chromium 启用的位移折射。Safari、Firefox、系统无障碍偏好、强制色彩和打印
都有明确降级，不会得到残缺的近似效果。

> 预览版本：`v0.1.0`。这是独立 skill，不是 Codex Plugin，也不是 npm 包。
> 中英文文档保持同一结构；如技术表述出现差异，以英文 README 为准。

## 效果预览

[打开 GitHub Pages 在线演示](https://oopsg1thub.github.io/liquid-glass-web/)。
首页只实时渲染一个 glass hero，再链接到四个完整案例，避免用多组预览耗尽页面
合成预算。

![Liquid Glass Web 效果预览](docs/preview.png)

## 包含内容

```text
skills/liquid-glass-web/
├── SKILL.md
├── agents/openai.yaml
├── assets/
│   ├── glass.css
│   └── refraction-snippet.html
└── references/
    ├── components.md
    ├── example-quick-start.html
    ├── example-components.html
    ├── example-music-player.html
    └── example-resume.html
```

技能目录完全自包含，可以直接从 GitHub 子路径安装。仓库根目录的脚本、测试和
`package.json` 仅用于校验与发布；`package.json` 已标记为 `private: true`。

## 为 Codex 安装

让 Codex 安装锁定版本：

```text
Use $skill-installer to install https://github.com/oopsg1thub/liquid-glass-web/tree/v0.1.0/skills/liquid-glass-web
```

若希望跟随 `main`，把 `v0.1.0` 换成 `main`。如果技能没有立即出现在列表中，
重启 Codex。安装后可显式调用：

```text
Use $liquid-glass-web to apply the canonical Liquid Glass material to this web interface.
```

需要严格复现时，建议显式调用。技能描述也支持 Codex 在 liquid glass、
glassmorphism、磨砂面板及相关调试请求中自动选择它。

## 手动安装

```sh
git clone --depth 1 --branch v0.1.0 https://github.com/oopsg1thub/liquid-glass-web.git
mkdir -p ~/.codex/skills
cp -R liquid-glass-web/skills/liquid-glass-web ~/.codex/skills/liquid-glass-web
```

若本机有 Codex 校验器，可验证安装结构：

```sh
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py ~/.codex/skills/liquid-glass-web
```

本仓库不会主动覆盖或替换已有本机技能；如果目标目录已经存在，请先检查再复制。

## 快速使用

制作自包含 HTML 页面时：

1. 把 [`glass.css`](skills/liquid-glass-web/assets/glass.css) 完整复制到一个
   `<style>` 元素中。
2. 只在少量浮动界面上添加 `.lg`；材质厚度类按需选择。
3. 把
   [`refraction-snippet.html`](skills/liquid-glass-web/assets/refraction-snippet.html)
   完整复制到 `<body>` 末尾附近。
4. 页面专属 CSS 放在 canonical 样式之后；业务脚本放在 canonical snippet 之后，
   最后再关闭 `</body>`。

```html
<article class="lg lg--thick lg-materialize">
  <h1>One clear surface</h1>
  <p>Controls inside glass use unblurred chips.</p>
  <button class="lg-chip lg-cta" type="button">Continue</button>
</article>
```

最小完整参考是
[`example-quick-start.html`](skills/liquid-glass-web/references/example-quick-start.html)。
不要凭记忆重写材质声明：两项 canonical 资产均已锁定。

| Canonical 资产 | SHA-256 |
|---|---|
| `glass.css` | `98e07bd1b012bb0b020e50fb423c0e2d65190a9b6263f8e851ccbfafd0a7bdb4` |
| `refraction-snippet.html` | `7c33def72b231ecb1d009fdf4ef937fa7d637abf0a6e72dcf284260ee46c0351` |

## 公开类名

以下类名是 `v0.1.0` 的稳定公开接口。

| 类名 | 用途 |
|---|---|
| `.lg` | 基础 pane 与三层材质结构 |
| `.lg--thick` | 大卡片和 dialog；更重的磨砂与阴影 |
| `.lg--thin` | 导航、dock 和小型浮动控件 |
| `.lg-materialize` | 调校后的入场；用 `--enter-delay` 错峰 |
| `.lg-chip` | glass 内部使用的不模糊 chip / button |
| `.lg-cta` | 强调色 `.lg-chip` 变体 |
| `.lg-backdrop` | 可选的 glass 后方动画色场 |

不要 glass 套 glass。`.lg` 内部控件应使用 `.lg-chip`，而不是另一个 `.lg`。
每个视图最多五个 glass pane。`.lg` 单独使用就是受支持的中等厚度表面；
`.lg--thick` 和 `.lg--thin` 是可选的层级修饰类。

## 设计 token

请在 canonical 样式之后覆盖 token，不要改材质层规则。注明主题的默认值会随明暗
主题变化。

| Token | 默认值 / 作用 |
|---|---|
| `--lg-blur` | `16px`；thick 为 `24px`，thin 为 `12px` |
| `--lg-sat`, `--lg-bright` | `1.8`, `1.08`；补偿模糊后的色彩 |
| `--lg-radius` | `26px`；pill 使用 `999px` |
| `--bg`, `--ink`, `--ink-dim`, `--hairline` | 页面、主文字、次文字和分隔线 |
| `--lg-tint`, `--lg-tint-a` | 主题着色通道与 alpha |
| `--lg-border`, `--lg-spec` | 外边线与镜面边缘颜色 |
| `--lg-shadow`, `--lg-shadow-sm` | 大表面与浮动 chrome 的层次 |
| `--sheen-a`, `--spot-max` | 对角 sheen 与光标 spotlight 强度 |
| `--chip-bg`, `--chip-border` | 不模糊控件的处理 |
| `--accent`, `--accent-ink` | CTA、焦点和状态颜色 |
| `--solid` | 无障碍 / 打印所用的近乎不透明表面 |
| `--hue-a` … `--hue-d` | 可选背景色 |
| `--blob-opacity` | 可选背景强度 |
| `--enter-delay` | 每个 pane 的 materialize 延迟，默认 `0s` |

`--mx`、`--my` 和 `--spot-a` 是 spotlight 的运行时状态，不是设计输入。
SVG 位移尺度 `38 / 45 / 52` 是锁定的材质参数。

## 案例

每个案例都是可离线直接打开的单文件 HTML，逐字内嵌 canonical 样式和 snippet，
并遵守最多五个 pane 的限制。

| 案例 | 展示内容 | 在线打开 |
|---|---|---|
| [Quick Start](skills/liquid-glass-web/references/example-quick-start.html) | 最小 nav、hero、主题和降级 | [打开](https://oopsg1thub.github.io/liquid-glass-web/examples/example-quick-start.html) |
| [Component Gallery](skills/liquid-glass-web/references/example-components.html) | nav、card、chip、独立 CTA、dialog | [打开](https://oopsg1thub.github.io/liquid-glass-web/examples/example-components.html) |
| [Music Player](skills/liquid-glass-web/references/example-music-player.html) | 语义化 transport/progress 与独立业务脚本 | [打开](https://oopsg1thub.github.io/liquid-glass-web/examples/example-music-player.html) |
| [Résumé / Portfolio](skills/liquid-glass-web/references/example-resume.html) | 响应式五 pane 布局与打印 | [打开](https://oopsg1thub.github.io/liquid-glass-web/examples/example-resume.html) |

编辑 `templates/examples/` 中的文件后运行 `npm run build`。技能目录下生成的案例
会被追踪，使安装后的 skill 保持自包含；`.site-dist/` 中的 GitHub Pages 产物是
临时文件，不纳入 Git。

## 浏览器支持与降级阶梯

核验日期：2026-07-31。支持状态会变化。

| 能力 | Chromium | Safari / WebKit | Firefox |
|---|---|---|---|
| 磨砂（`backdrop-filter`） | 支持 | 通过前缀与标准声明支持 | 支持 |
| `backdrop-filter` 中的 SVG 折射 | 增强路径 | 磨砂 fallback | 磨砂 fallback |
| `corner-shape: squircle` | Chrome/Edge 139+ | 未启用 | 未启用 |
| `prefers-reduced-transparency` | 有限 / 实验性 | 有限 / 实验性 | 有限 / 实验性 |

运行时阶梯是：**折射 → 磨砂 → 实色填充**。降低透明度、提高对比度、强制色彩
和打印所需的实色降级已经写入 canonical CSS。

Safari 继续走磨砂路径，因为在核验日期，
[WebKit bug 245510](https://bugs.webkit.org/show_bug.cgi?id=245510) 仍为开放状态，
[WebKit PR #68614](https://github.com/WebKit/WebKit/pull/68614) 仍未合并。
不能只依赖 `@supports`：WebKit 可能能解析 `backdrop-filter: url(...)`，却不能
真正渲染。canonical snippet 因此使用保守的 Chromium 运行时检查。Firefox 同样
暂不把 SVG URL filter 应用于 backdrop filter，因此保留相同的磨砂 baseline。

## 无障碍与性能规则

- glass 用于浮动导航/控制层、小型卡片、dialog 和聚焦组件；不要用于长文、密集
  表格或所有 section。
- 一个视图最多五个 `.lg` pane；每一个都会增加 backdrop 合成工作。
- iOS 持续悬浮 chrome 使用 `position: sticky`，不要使用 fixed glass。
- 只有符号的按钮必须有可访问名称，并保留 canonical `:focus-visible` 轮廓。
- 在最繁忙背景上测试明暗主题文本；使用 `--ink` 或 `--ink-dim`，不要用低透明灰。
- reduced motion 下停止位移，但保留短暂颜色反馈。
- 200% 缩放与 320 CSS 像素视口下，控件和内容必须重排，不能裁切或横向滚动。
- 打印时应变为不透明白色表面，没有动画、模糊或装饰 blob。

CI 会拒绝重复 ID、案例远程依赖、超过五个 pane、axe serious/critical 问题、
控制台错误、错误的引擎 gate、主题切换失效、生成案例漂移，以及入场动画后丢失
frost。

## 常见故障

### 入场后磨砂消失

检查 pane 和祖先是否遗留 `filter`、`transform`、`opacity < 1` 或
`will-change`。这些属性可能创建新的 backdrop root。保留 canonical
`lg-materialize` 动画及其 `backwards` fill mode。

### Chromium 圆角出现月牙缝

`corner-shape` 不继承，必须像 `glass.css` 一样同时应用在 `.lg`、
`.lg::before` 和 `.lg::after`。内圆角保持
`calc(var(--lg-radius) - 1px)` 的同心关系。

### Safari 没有磨砂

同时保留 `-webkit-backdrop-filter` 与 `backdrop-filter`。通用 Safari filter
值列表不要使用 CSS 变量；canonical 样式有意在这里写死字面量。

### Glass 发白或浑浊

先在 pane 后方加入有意义的色彩或图像。在背景没有可折射内容之前，不要靠提高
blur 或 tint 补偿。

### 滚动变慢

减少 pane 数量，用 sticky chrome 替换 fixed glass，移除无用合成提示，并检查
祖先 filter/transform。

## 开发与验证

需要 Node.js 20+；本机 Codex 校验还需要 Python 3。

```sh
npm ci
npx playwright install chromium firefox webkit
npm run build
npm run check
npm test
python3 ~/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/liquid-glass-web
```

CI 还运行 Agent Skills reference validator。Playwright 覆盖 Chromium、Firefox、
WebKit；axe 检查 serious 和 critical 无障碍问题。只有完整校验通过后，GitHub
Pages 才会从临时产物部署。

人工发布验收覆盖当前 Chrome 与 Safari 的明暗主题、键盘、200% 缩放、系统无障碍
偏好、打印和滚动表现。`v0.1.0` 暂缓真实 Firefox 应用验收；Playwright Firefox
仍是发布前必过项，这项限制会明确写入 Release。

## 贡献

提交 PR 前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。修改 canonical 资产必须是
明确的兼容性决策，同时更新哈希、重新生成案例并提供浏览器证据。大多数视觉调整
应该只覆盖设计 token 或页面专属 CSS。

文档的理想测试很简单：一个不了解仓库背景的读者，应该能独立说明如何安装、哪些
内容可以定制、Safari 为什么不同，以及如何排查 frost 丢失。

## 许可与声明

使用 [MIT License](LICENSE) 发布。

这是独立、非官方实现，与 Apple Inc. 没有关联，也未获得其认可或赞助。
“Liquid Glass”、iOS、macOS 及相关产品名仅作描述使用。本项目不包含 Apple 的
代码、美术或专有资产。
