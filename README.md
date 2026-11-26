# 翔安滨海幼儿园 · 我的成长纪念册

原生 HTML / CSS / JavaScript + Vite MPA。没有 UI 框架、后端或数据库，三个页面直接独立访问。以 `提示词留档/` 中的 `首页.png`、`精彩活动.png`、`成长蜕变.png` 为布局参考，设计稿未用作网页背景。

## 运行

需要 Node.js 20.19+ 或 22.12+。

```sh
npm install
npm run dev
```

默认本地地址以 Vite 输出为准。`npm run check` 校验 JSON、日期、图片与页面引用；`npm test` 检查相片翻页、拖拽跟随、回弹、轻扫、大图同步、焦点恢复和导航交互；`npm run build` 生成 `dist/`；`npm run preview` 预览构建产物。`dist/` 可部署到支持静态文件的 Web 服务，三个 HTML 文件是三个真实页面。

## 页面

- `index.html`：海滨主题首页、幼儿园日常、活动和成长预览。
- `activities.html`：左右交错的彩色蜡笔时间河、照片堆叠、可选活动介绍。
- `growth.html`：宇宙星球成长时间轴、技能清单、变化记录和照片。

## 替换个人内容

统一编辑 `public/data/site.json`：`site` 为园名、导航和页脚，`home` 为首页，`activitiesPage` / `growthPage` 为页头，`activities` / `growth` 为时间轴记录，`ui` 为交互文案。

把照片放入 `public/images/`，再将 JSON 的 `src` 改为 `./images/文件名.jpg`。每张照片有 `src`、`alt`、`caption` 三个字段；一条记录可以有任意数量照片。支持单张照片，只有多张时才显示翻页按钮和圆点。`activities[].summary` 可以省略。

新增活动或成长阶段只需向数组添加对象；日期会自动排序，河流长度、相片交错位置和成长星球随条目数扩展。首页预览通过 `previewActivityIds` / `previewGrowthIds` 指定，ID 必须对应已有记录。跨多个年份时活动页自动显示年份筛选。

颜色可选 `coral`、`yellow`、`green`、`blue`、`purple`、`orange`；星球可选 `orange-planet`、`blue-planet`、`saturn`、`moon`、`earth`、`galaxy`。

## 组件与素材

Web Components 位于 `src/components/`：`site-header`、`site-footer`、`photo-stack`、`photo-lightbox`、`crayon-art`。使用 Light DOM，统一由样式表控制手绘外观。

照片支持点击大图、左右按钮、圆点、键盘方向键和手指跟随拖拽。拖拽时相邻照片同时移入，松手根据距离和速度翻页，短距离慢拖会回弹，首尾可循环；纵向手势保留页面滚动，拖动后会抑制误点击。相册和大图共用 `src/components/swipe-carousel.js` 中的手势逻辑；大图使用原生 `dialog`，支持 Esc 关闭、焦点恢复和背景滚动锁定。导航适配手机折叠菜单，动画尊重系统的减少动态效果设置。

`public/illustrations/stickers.png` 是独立透明蜡笔贴纸图集，以 CSS 定位各贴纸；纸纹、海浪、草坡和刷痕是独立 SVG。文字均为真实 HTML 文本。字体为本地 ZCOOL KuaiLe，许可证见 `public/fonts/OFL.txt`。素材说明及生成提示见 [素材说明](提示词留档/assets-notes.md)，贴纸风格参考图为 `提示词留档/素材.png`。

儿童照片和示例经历均为演示内容。上线前可自行替换为真实个人记录。

## 安装到手机主屏幕（PWA）

项目提供应用名称、启动页、`standalone` 独立窗口模式，以及 Android / iPhone 主屏幕图标。三页共用 `public/manifest.webmanifest`，安装后在应用内浏览首页、活动页和成长页。应用配置中的路径全部为相对路径，也可部署到域名下的子目录。

将 `dist/` 部署到支持 **HTTPS** 的静态托管服务后：

- **iPhone / iPad**：使用 Safari 打开网站，点击“分享”→“添加到主屏幕”→“添加”。如果显示“作为网页 App 打开”，保持开启。
- **Android**：使用 Chrome 打开网站，在菜单中选择“安装应用”或“添加到主屏幕”，按系统提示完成安装。

从桌面图标启动后，网站会以独立应用窗口打开。安装体验不依赖业务服务端或数据库；通过普通静态托管即可提供。照片与内容仍通过网络加载，本次按“安装并独立打开”的需求实现。

开发电脑上的 `localhost` / `127.0.0.1` 可用于检查安装配置。手机通过局域网 IP 访问的普通 HTTP 地址不满足完整 PWA 安装条件；请使用 HTTPS 地址验证手机安装。实际安装操作需要在手机上由用户完成。

应用名称、颜色、作用范围和启动地址可在 `public/manifest.webmanifest` 中修改。`public/icons/app-icon.svg` 是蜡笔阳光彩虹图标的可编辑源文件：奶油色底、颗粒笔触、五色彩虹与云朵，主体留在 maskable 图标的中央安全区域。同目录下的 192px、512px、maskable 512px PNG 和 `apple-touch-icon.png` 为安装图标，`public/illustrations/favicon.svg` 同步使用这一设计。修改图标时应同步导出相应尺寸。已安装的应用可能保留系统缓存的旧图标，部署新版后如未更新，可移除主屏幕入口再重新添加。

参考：[Chrome 安装要求](https://web.dev/articles/install-criteria)、[Apple 主屏幕应用配置](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)。
