# 🧹 自动清理在线状态 - 设置说明

## ✨ 新功能

现在系统会**自动清理**已删除用户的在线状态！

当你在 Firebase Authentication 后台删除用户后，网站会自动检测并清理他们的在线状态数据。

---

## 🔧 设置步骤

### 1️⃣ 更新 Firebase 安全规则

**重要！** 必须先更新 Firebase 安全规则，否则自动清理功能无法工作。

#### 步骤：

1. 打开 [Firebase Console](https://console.firebase.google.com/)
2. 选择你的项目
3. 点击左侧菜单的 **Realtime Database**
4. 点击顶部的 **规则** 标签
5. 将以下规则**完整复制**并粘贴到规则编辑器中：

```json
{
  "rules": {
    ".read": false,
    ".write": false,

    "users": {
      ".read": true,
      ".indexOn": ["username", "email"],
      "$uid": {
        ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin')",
        "emailVerified": {
          ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin'"
        },
        "role": {
          ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin'"
        },
        "banned": {
          ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin'"
        },
        "muted": {
          ".write": "root.child('users').child(auth.uid).child('role').val() === 'admin'"
        },
        "conversations": {
          ".read": "auth != null && auth.uid === $uid",
          "$chatId": {
            ".write": "auth != null && ($chatId.beginsWith(auth.uid + '_') || $chatId.endsWith('_' + auth.uid))"
          }
        }
      }
    },

    "messages": {
      ".read": "auth != null",
      ".indexOn": ["timestamp", "pinned", "userId"],
      "$messageId": {
        ".write": "auth != null && (!data.exists() || data.child('userId').val() === auth.uid || root.child('users').child(auth.uid).child('role').val() === 'admin')",
        ".validate": "newData.hasChildren(['userId', 'text', 'timestamp'])"
      }
    },

    "announcements": {
      ".read": "auth != null",
      ".indexOn": ["timestamp"],
      "$announcementId": {
        ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'",
        ".validate": "newData.hasChildren(['title', 'content', 'timestamp', 'authorId'])"
      }
    },

    "privateMessages": {
      "$chatId": {
        ".read": "auth != null && ($chatId.beginsWith(auth.uid + '_') || $chatId.endsWith('_' + auth.uid))",
        ".write": "auth != null && ($chatId.beginsWith(auth.uid + '_') || $chatId.endsWith('_' + auth.uid))",
        "$messageId": {
          ".validate": "newData.hasChildren(['from', 'to', 'text', 'timestamp']) && (newData.child('from').val() == auth.uid || newData.child('to').val() == auth.uid)"
        }
      }
    },

    "notifications": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null"
      }
    },

    "reactions": {
      ".read": "auth != null",
      "$messageId": {
        ".write": "auth != null"
      }
    },

    "bookmarks": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    },

    "following": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $uid"
      }
    },

    "followers": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },

    "status": {
      ".read": "auth != null",
      "$uid": {
        ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin')"
      }
    },

    "userStatus": {
      ".read": "auth != null",
      "$uid": {
        ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin')"
      }
    },

    "reports": {
      ".read": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'",
      ".write": "auth != null"
    },

    "adminLogs": {
      ".read": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'",
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
    },

    "appVersion": {
      ".read": "auth != null",
      ".write": "auth != null && root.child('users').child(auth.uid).child('role').val() === 'admin'"
    },

    "typing": {
      ".read": "auth != null",
      "$uid": {
        ".write": "auth != null && (auth.uid === $uid || root.child('users').child(auth.uid).child('role').val() === 'admin')"
      }
    },

    "checkIns": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```

6. 点击 **发布** 按钮

---

### 2️⃣ 刷新网站

按 **Ctrl+F5** 强制刷新网站

---

## 🎯 工作原理

### 自动清理
- ✅ 当在线用户列表更新时，系统会自动检查每个在线用户是否还存在
- ✅ 如果发现用户已被删除（在 Firebase Authentication 中），会自动删除其在线状态
- ✅ 只有管理员账号会执行自动清理（避免多个用户同时清理）
- ✅ 清理过程在后台静默进行，不会打扰用户

### 手动清理（可选）
如果你想立即清理所有已删除用户的状态：

1. 进入 **Admin Panel**
2. 点击 **⚙️ 系统设置**
3. 在"数据维护"部分，点击 **🧹 清理在线状态**
4. 确认清理

---

## 📊 清理的数据

系统会清理以下数据：
- ✅ `status/{uid}` - 在线状态
- ✅ `typing/{uid}` - 打字状态

---

## 🔍 查看清理日志

打开浏览器控制台（F12），你会看到类似的日志：

```
🧹 Found deleted user in online status: abc123xyz
🧹 Auto-cleaning 1 deleted user(s) from online status...
✅ Removed status for deleted user: abc123xyz
```

---

## ⚠️ 注意事项

1. **必须先更新 Firebase 规则**，否则会出现权限错误
2. 自动清理只在**管理员登录**时执行
3. 清理是**实时的** - 删除用户后，下次在线列表更新时就会自动清理

---

## ✅ 测试

### 测试步骤：

1. 在 Firebase Authentication 中删除一个测试用户
2. 刷新网站（Ctrl+F5）
3. 以管理员身份登录
4. 查看在线列表 - 已删除的用户应该会自动消失
5. 打开控制台（F12）查看清理日志

---

## 🎉 完成！

现在你的网站会自动保持在线列表的准确性，不再显示已删除的用户！

