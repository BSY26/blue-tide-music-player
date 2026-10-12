# 蓝潮 · Blue Tide Music Player 🌊

> 一个轻量、无需后端的网页本地音乐播放器。支持选择 MP3 / FLAC 文件，读取 `.lrc` 滚动歌词；适合部署到 GitHub Pages。

**项目状态：** 依据 2026 年 8 月的功能需求重新实现的**重建开源版**，并非对原聊天中完整源码的恢复。

## 功能

- 📁 一次选择、拖拽导入多个 `.mp3` / `.flac` 本地音频
- ▶️ 播放 / 暂停、上一首 / 下一首、进度跳转和音量调节
- 🔀 随机播放、单曲循环、列表循环
- 🎼 自动匹配同名 `.lrc` 歌词，随播放进度滚动高亮；点击歌词跳转
- 🈶 支持 UTF-8、GB18030 / GBK 手动歌词解码切换，方便修复常见乱码
- 📱 响应式布局、基础键盘快捷键、无需账号和后端
- 🔐 文件仅由当前浏览器本地读取；不会上传至服务器

## 立即运行

直接打开 `index.html` 即可试用。如果浏览器限制 `file://` 页面资源，可在项目根目录启动一个本地静态服务器：

```bash
python3 -m http.server 8000
```

然后打开 <http://localhost:8000/>。

无需 npm、构建工具、数据库或 API 密钥。

## 使用步骤

1. 点击“选择本地文件”，导入 MP3 / FLAC 音乐（可多选或拖拽）。
2. 同时导入对应 `.lrc` 文件，文件名须与音频相同（忽略扩展名及大小写）。如 `海边.mp3` 对应 `海边.lrc`。
3. 如果出现乱码，在右侧将“歌词编码”从 UTF-8 切换到 GB18030 / GBK。
4. 点击歌词中的一行，可跳转到对应播放时间。

LRC 格式示例：

```text
[00:10.00]第一句歌词
[00:14.50]第二句歌词
```

## 部署到 GitHub Pages

推荐仓库名称：`blue-tide-music-player`（可自行更改）。

1. 在 GitHub 账号 **BSY26** 下新建 Public 仓库，默认分支为 `main`。
2. 将本仓库所有文件上传至仓库根目录，确保 `index.html` 位于根目录。
3. 打开仓库的 **Settings → Pages → Build and deployment**。
4. **Source** 选择 `Deploy from a branch`；**Branch** 选择 `main`，目录选择 `/(root)`；点击 **Save**。
5. Pages 成功发布后，网站地址通常为 `https://bsy26.github.io/blue-tide-music-player/`，具体以 GitHub 页面显示的地址为准。

详见 [DEPLOY.md](DEPLOY.md)。

## 项目结构

```text
blue-tide-music-player/
├── index.html             # 网页入口和 UI 结构
├── styles.css             # 响应式界面样式
├── app.js                 # 播放列表、音频事件、LRC 解析
├── favicon.svg            # 图标
├── examples/example.lrc   # 原创示例歌词，无商业音频
├── README.md              # 项目介绍与快速入门
├── DEPLOY.md              # GitHub 仓库与 Pages 部署指南
├── PRIVACY.md             # 本地隐私说明
├── LICENSE                # MIT 开源许可证
├── .gitignore             # 忽略本地音频和临时文件
└── .nojekyll              # Pages 跳过 Jekyll 处理
```

## 已知限制

- **FLAC 能否播放取决于浏览器对 FLAC 编码和容器的支持。** 本项目不包含服务端转码，也不将 FLAC 转成 MP3。
- 歌词目前按文件名匹配，支持 LRC 时间标签、同一行多个标签、`[offset:]`；不支持增强型逐字卡拉 OK 歌词。
- 文件及播放列表保留在当前页面内存中，刷新后需重新导入；不会自动读取电脑上的音乐文件。
- 对于混合、错误编码的 LRC，手动切换编码不一定能够完全修复。
- GitHub Pages 承载播放器网页，**不提供商业歌曲的授权或在线曲库**。

## 版权与隐私

本项目**不包含任何商业歌曲音频、专辑封面或受版权保护的歌词**。请只使用你有权播放或使用的音频与歌词，并遵守当地法律和平台规则。关于本地读取行为参见 [PRIVACY.md](PRIVACY.md)。

## 开源许可证

代码采用 [MIT License](LICENSE)。如你决定采用其他许可证，请在首次正式发布前修改。

维护者：[@BSY26](https://github.com/BSY26)
