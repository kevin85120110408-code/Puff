# 版本更新指南 📝

## 问题说明
当你在 Vercel 部署新代码后,用户可能看不到最新版本,因为:
1. **Service Worker 缓存** - PWA 会缓存文件
2. **Vercel CDN 缓存** - 边缘节点缓存
3. **浏览器缓存** - 本地缓存

## 解决方案
每次部署新版本时,按以下步骤操作:

### 步骤 1: 更新版本号
在以下 3 个位置更新版本号(例如从 v4.1 改为 v4.2):

#### 1. `sw.js` (第 2 行)
```javascript
const CACHE_VERSION = 'v4.2';  // 👈 更新这里
```

#### 2. `index.html` (第 16 行)
```html
<meta name="app-version" content="4.2">  <!-- 👈 更新这里 -->
```

#### 3. `index.html` (第 27 行)
```html
<link rel="stylesheet" href="style.css?v=4.2">  <!-- 👈 更新这里 -->
```

#### 4. `index.html` (第 96 行)
```html
<h2 class="nav-brand">Forum <span style="font-size: 10px; opacity: 0.5; margin-left: 8px;">v4.2</span></h2>  <!-- 👈 更新这里 -->
```

#### 5. `index.html` (第 646 行)
```html
<script src="app.js?v=4.2"></script>  <!-- 👈 更新这里 -->
```

### 步骤 2: 提交并部署到 Vercel
```bash
git add .
git commit -m "Update to v4.2"
git push
```

### 步骤 3: 用户端更新
用户访问网站时会看到提示:
- "New version available! Reload to update?"
- 点击确认后会自动更新到最新版本

## 技术说明

### Service Worker 策略
现在使用 **Network First** 策略:
- ✅ 优先从网络获取最新内容
- ✅ 网络失败时才使用缓存(离线支持)
- ✅ 自动清理旧版本缓存

### Vercel 缓存配置
`vercel.json` 配置了:
- HTML/CSS/JS: `max-age=0, must-revalidate` (总是检查更新)
- 图片: `max-age=31536000, immutable` (长期缓存)

## 快速更新脚本
你可以创建一个脚本来自动更新版本号:

```bash
# update-version.sh
#!/bin/bash
NEW_VERSION=$1

if [ -z "$NEW_VERSION" ]; then
  echo "Usage: ./update-version.sh v4.2"
  exit 1
fi

# 更新 sw.js
sed -i "s/const CACHE_VERSION = 'v[0-9.]*'/const CACHE_VERSION = '$NEW_VERSION'/g" sw.js

# 更新 index.html
sed -i "s/content=\"[0-9.]*\"/content=\"${NEW_VERSION#v}\"/g" index.html
sed -i "s/\?v=[0-9.]*/?v=${NEW_VERSION#v}/g" index.html
sed -i "s/>v[0-9.]*</>$NEW_VERSION</g" index.html

echo "✅ Version updated to $NEW_VERSION"
```

使用方法:
```bash
chmod +x update-version.sh
./update-version.sh v4.2
```

## 验证更新
1. 打开浏览器开发者工具 (F12)
2. 进入 Application > Service Workers
3. 检查是否显示新版本
4. 查看 Console 日志确认版本号

## 强制清除缓存(紧急情况)
如果用户仍然看到旧版本:
1. 按 `Ctrl + Shift + R` (Windows) 或 `Cmd + Shift + R` (Mac) 硬刷新
2. 或者: F12 > Application > Clear storage > Clear site data

