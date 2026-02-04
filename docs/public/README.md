# Public Assets

这个目录用于存放静态资源文件，这些文件会被复制到最终构建输出的根目录。

## 必需的文件

请将以下 logo 图片放入此目录：

- **AgentFlow-01.png** - 浅色模式下使用的 logo
- **AgentFlow-02.png** - 深色模式下使用的 logo

这些图片被以下配置文件引用：

- `docs/.vuepress/config.ts` - favicon 和页面图标
- `docs/.vuepress/plume.config.ts` - 主题 logo 和头像

## 图片要求

- 格式：PNG（推荐使用透明背景）
- 尺寸：建议 200x200 像素或以上
- 文件名：必须完全匹配 `AgentFlow-01.png` 和 `AgentFlow-02.png`

## 部署说明

放入图片后，执行以下步骤：

```bash
# 清理缓存并重新构建
npm run docs:build

# 提交并推送到 GitHub
git add docs/public/
git commit -m "Add logo images"
git push
```

构建完成后，GitHub Actions 会自动部署到 GitHub Pages。
