# GitHub 仓库授权与部署方案

此文档适用于 GitHub 账号 `BSY26`，建议仓库名 `blue-tide-music-player`。

## 1. 新建仓库

1. 登录 https://github.com/new ，确认所有者为 `BSY26`。
2. Repository name 填写 `blue-tide-music-player`。
3. 选择 **Public**，以便所有人查看和复用源码。
4. 如果使用本压缩包上传全部文件，可以不勾选额外的 Initialize README、License 或 .gitignore（包内已有）。
5. 点击 **Create repository**。

**注意：** 当前 ChatGPT GitHub 插件不提供“创建仓库”或“修改 Pages 设置”的写入动作，这两步需由你在 GitHub 页面完成。

## 2. 授权 ChatGPT 访问仓库

1. 在 ChatGPT 的 **Settings → Plugins** 找到 GitHub，并打开连接或仓库访问管理入口（界面名称可能不同）。
2. 在跳转的 GitHub 页面，核对 App 名称和申请的权限，选择个人账号 **BSY26**。
3. 推荐选择 **Only select repositories**，只勾选 `blue-tide-music-player`。
4. 为提交代码，插件需要该仓库的 **Contents: Read and write**（如安装页面可显示）。只有只读权限时无法写入。
5. 授权/安装后返回 ChatGPT，让助手再次检查 `BSY26` 下仓库是否可见，以及该仓库的 `push` 权限。
6. 也可以到 GitHub **Settings → Applications → Installed GitHub Apps** 找到已安装的 App 并点 **Configure** 调整可访问仓库。

**不要**把 GitHub 密码、私人访问令牌（PAT）或验证码粘贴到聊天中。连接操作只应通过 GitHub 的官方授权页面完成。

## 3A. 手动上传源码（无需插件写权限）

1. 先解压 `blue-tide-music-player.zip`。
2. 在仓库主页点击 **Add file → Upload files**。
3. 上传解压后**目录内部**的文件（不是 ZIP 本身），保持 `examples/example.lrc` 子目录结构。
4. 在 Commit changes 中提交，信息建议 `Initial release: Blue Tide music player`。

## 3B. 用 ChatGPT GitHub 插件提交

安装并授予仓库访问权限之后，让助手确认目标仓库 `BSY26/blue-tide-music-player` 存在，并从已审查的本地源码包上传 HTML、CSS、JS、README 等文件。

发布前最好再次检查：
- 无 `.env`、API 密钥、密码、令牌；
- 无商业 MP3/FLAC、受保护的歌词、专辑封面；
- README 中的功能与实际实现一致；
- `index.html` 位于根目录。

## 4. GitHub Pages 部署

进入仓库 **Settings → Pages**：

- Build and deployment → Source：`Deploy from a branch`
- Branch：`main`
- Folder：`/(root)`
- 点击 **Save**

发布完成后，通常打开：

`https://bsy26.github.io/blue-tide-music-player/`

注意：这是按用户名与建议仓库名**推算的目标地址，不表示已经上线**。以 GitHub Pages 后台的 Visit site 链接为准。

## 5. 自检

- 页面能在桌面和手机浏览器打开；
- 导入 MP3 后可播放、暂停、快进、切歌；
- 导入同名 `.lrc` 后随时间滚动，点击歌词可跳转；
- 切换 GB18030 / GBK 可以解决常见的歌词编码问题；
- 导入 FLAC 时，如浏览器无法解码，会给出提示而不是无提示失败；
- 网络面板不应发现上传本地歌曲内容的请求。

更多资料：
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/apps/using-github-apps/reviewing-and-modifying-installed-github-apps
