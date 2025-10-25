# 📦 存储优化指南 - 免费额度使用

**目标**: 在 Firebase 免费额度内运行，避免产生费用

---

## 📊 Firebase 免费额度

### Realtime Database
- **存储空间**: 1 GB
- **下载流量**: 10 GB/月
- **同时连接**: 100 个

### Storage（如果使用）
- **存储空间**: 5 GB
- **下载流量**: 1 GB/天
- **上传流量**: 无限制

---

## ✅ 已实施的优化措施

### 1. 文件大小限制

| 类型 | 之前 | 现在 | 节省 |
|------|------|------|------|
| 单个文件 | 10 MB | **5 MB** | 50% ⬇️ |
| 总上传 | 25 MB | **10 MB** | 60% ⬇️ |
| 头像 | 5 MB | **2 MB** | 60% ⬇️ |

**效果**: 
- 每条消息最多占用 10MB（而不是 25MB）
- 每个头像最多占用 2MB（而不是 5MB）

---

### 2. 每日上传限制

**限制**: 每个用户每天最多上传 **10 个文件**

**计算**:
- 100 个活跃用户 × 10 文件/天 × 5MB = **5 GB/天**
- 实际使用会更少（不是每个用户都会上传满）

**重置**: 每天 00:00 UTC 自动重置

---

### 3. 文件类型限制

**允许的类型**:
- ✅ 图片: JPEG, PNG, GIF, WebP
- ✅ 文档: PDF, TXT
- ❌ 压缩包: ZIP（已禁用，安全风险）
- ❌ 视频: MP4, AVI（太大）
- ❌ 音频: MP3, WAV（太大）

---

### 4. 文件验证

**魔数检查**: 验证文件真实类型，防止伪装

**示例**:
```
用户上传 virus.exe 改名为 image.jpg
❌ 系统检测到不是真实图片，拒绝上传
```

---

## 📈 使用量估算

### 场景 1: 小型论坛（50 用户）

**假设**:
- 每天 10 个用户上传文件
- 平均每人上传 2 个文件
- 平均文件大小 1 MB

**每日使用**:
- 10 用户 × 2 文件 × 1 MB = **20 MB/天**
- 每月: 20 MB × 30 = **600 MB/月**

**结论**: ✅ 远低于 1 GB 免费额度

---

### 场景 2: 中型论坛（200 用户）

**假设**:
- 每天 30 个用户上传文件
- 平均每人上传 3 个文件
- 平均文件大小 2 MB

**每日使用**:
- 30 用户 × 3 文件 × 2 MB = **180 MB/天**
- 每月: 180 MB × 30 = **5.4 GB/月**

**结论**: ⚠️ 超出免费额度，需要进一步优化

---

### 场景 3: 大型论坛（500+ 用户）

**建议**: 
- 🔴 **不适合免费额度**
- 考虑升级到付费计划
- 或者禁用文件上传功能

---

## 🛡️ 防止滥用

### 已实施的保护措施

1. **每日限制**: 10 文件/用户/天
2. **文件大小**: 单个文件 < 5MB
3. **速率限制**: 
   - 消息: 10 条/分钟
   - 私信: 20 条/分钟
4. **管理员监控**: 可以查看上传统计

---

## 📊 监控使用量

### 在 Firebase Console 中查看

1. **打开 Firebase Console**
   - https://console.firebase.google.com/

2. **查看 Realtime Database 使用量**
   - Realtime Database → 使用情况
   - 查看存储空间和流量

3. **设置预算提醒**
   - 项目设置 → 使用情况和结算
   - 设置预算提醒（例如：达到 80% 时提醒）

---

## 🚨 如果接近限额怎么办？

### 短期措施（立即）

1. **降低文件大小限制**
   ```javascript
   const MAX_FILE_SIZE = 2 * 1024 * 1024;  // 降低到 2MB
   const MAX_AVATAR_SIZE = 1 * 1024 * 1024;  // 降低到 1MB
   ```

2. **减少每日上传限制**
   ```javascript
   const MAX_DAILY_UPLOADS = 5;  // 降低到 5 个/天
   ```

3. **禁用文件上传**
   - 隐藏上传按钮
   - 只允许文本消息

---

### 中期措施（1-2周）

1. **清理旧文件**
   - 删除 30 天以上的文件
   - 删除已删除消息的附件

2. **压缩图片**
   - 在上传前自动压缩图片
   - 使用 Canvas API 调整大小

3. **限制特定用户**
   - 新用户: 5 文件/天
   - 老用户: 10 文件/天
   - VIP 用户: 20 文件/天

---

### 长期措施（1个月+）

1. **升级到付费计划**
   - Blaze 计划（按使用量付费）
   - 预估成本: $5-25/月

2. **使用第三方存储**
   - Cloudinary（免费 25GB）
   - ImgBB（免费图片托管）
   - GitHub（免费 Git LFS）

3. **优化数据结构**
   - 不存储 Base64，使用外部链接
   - 只存储缩略图，原图存储在其他地方

---

## 🔧 代码优化建议

### 1. 图片压缩（推荐）

```javascript
async function compressImage(file, maxWidth = 1920, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        }, 'image/jpeg', quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
```

---

### 2. 自动清理旧文件

```javascript
// 每周运行一次
async function cleanupOldFiles() {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  const messagesRef = database.ref('messages');
  const snapshot = await messagesRef
    .orderByChild('timestamp')
    .endAt(thirtyDaysAgo)
    .once('value');
  
  const updates = {};
  snapshot.forEach((child) => {
    const message = child.val();
    if (message.files) {
      // 删除文件数据，保留消息文本
      updates[`${child.key}/files`] = null;
    }
  });
  
  await messagesRef.update(updates);
  console.log(`Cleaned up ${Object.keys(updates).length} old files`);
}
```

---

## 📋 检查清单

### 每日检查
- [ ] 查看 Firebase 使用量仪表板
- [ ] 检查是否有异常上传活动

### 每周检查
- [ ] 审查上传统计
- [ ] 检查存储空间使用情况
- [ ] 清理测试数据

### 每月检查
- [ ] 评估是否需要升级计划
- [ ] 优化存储策略
- [ ] 更新文件大小限制

---

## 💰 成本估算（如果升级）

### Blaze 计划（按使用量付费）

**Realtime Database**:
- 存储: $5/GB/月
- 下载: $1/GB

**示例成本**:
- 2 GB 存储 = $10/月
- 20 GB 下载 = $20/月
- **总计**: ~$30/月

**建议**: 
- 如果用户 < 100，坚持免费计划
- 如果用户 100-500，考虑升级
- 如果用户 > 500，必须升级

---

## ✅ 总结

### 当前配置（免费额度）

| 限制 | 值 | 原因 |
|------|-----|------|
| 单个文件 | 5 MB | 平衡质量和空间 |
| 每日上传 | 10 文件/用户 | 防止滥用 |
| 头像大小 | 2 MB | 足够高质量 |
| 允许类型 | 图片+PDF+TXT | 安全考虑 |

### 适用场景
- ✅ 小型论坛（< 100 用户）
- ✅ 中等活跃度
- ✅ 主要是文本交流
- ⚠️ 偶尔上传图片

### 不适用场景
- ❌ 大型论坛（> 500 用户）
- ❌ 高频上传
- ❌ 视频/音频分享
- ❌ 文件存储服务

---

**最后更新**: 2025-10-25  
**版本**: 1.0  
**状态**: 已优化，适合免费额度

