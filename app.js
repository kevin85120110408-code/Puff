console.log('🔥🔥🔥 APP.JS LOADED - VERSION 3.1 🔥🔥🔥');

// Global state
let currentUser = null;
let isAdmin = false;
let typingTimeout = null;
let cachedUsername = null;
let isCurrentlyTyping = false;

// Auto cleanup settings
const MESSAGE_LIMIT = 500; // 消息数量达到这个值时触发清理
const CLEANUP_KEEP = 250; // 清理后保留最新的消息数量

// Mention autocomplete
let allUsers = [];
let mentionStartPos = -1;

// DOM Elements
const authPage = document.getElementById('authPage');
const forumPage = document.getElementById('forumPage');
const adminPage = document.getElementById('adminPage');

// Auth elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authTitle = document.getElementById('authTitle');
const authSubtitle = document.getElementById('authSubtitle');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const rememberMe = document.getElementById('rememberMe');
const registerUsername = document.getElementById('registerUsername');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');

// Navigation
const showRegisterLink = document.getElementById('showRegister');
const showLoginLink = document.getElementById('showLogin');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const adminPanelBtn = document.getElementById('adminPanelBtn');
const backToForumBtn = document.getElementById('backToForumBtn');

// Forum elements
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const onlineCount = document.getElementById('onlineCount');
const searchInput = document.getElementById('searchInput');

// Admin elements
const usersTable = document.getElementById('usersTable');
const searchUser = document.getElementById('searchUser');
const announcementText = document.getElementById('announcementText');
const postAnnouncementBtn = document.getElementById('postAnnouncementBtn');

// Helper Functions
function showPage(page) {
  document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
  page.classList.add('active');
}

function showError(message) {
  alert(message);
}

function showSuccess(message) {
  alert(message);
}

// Auth State Observer
let userStatusListener = null;

auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    const userRef = database.ref(`users/${user.uid}`);
    const snapshot = await userRef.once('value');
    const userData = snapshot.val();

    // Check if user is banned
    if (userData?.banned) {
      showError('Your account has been banned');
      await auth.signOut();
      return;
    }

    isAdmin = userData?.role === 'admin';

    if (isAdmin) {
      adminPanelBtn.style.display = 'block';
    }

    // Real-time listener for user status changes
    let isFirstLoad = true;
    userStatusListener = userRef.on('value', async (snapshot) => {
      // Skip the first load (initial data)
      if (isFirstLoad) {
        isFirstLoad = false;
        return;
      }

      const userData = snapshot.val();
      if (userData?.banned) {
        showError('Your account has been banned');
        // Remove listener before signing out
        if (userStatusListener) {
          userRef.off('value', userStatusListener);
          userStatusListener = null;
        }
        await auth.signOut();
      }
    });

    console.log('✅ User authenticated, setting up forum...');
    showPage(forumPage);
    loadMessages();
    updateOnlineStatus(true);

    console.log('🎬 Initializing components...');

    // Initialize typing indicator
    console.log('1️⃣ Initializing typing indicator...');
    initTypingIndicator();

    // Initialize mention autocomplete
    console.log('2️⃣ Initializing mention autocomplete...');
    initMentionAutocomplete();

    // Initialize online users list
    console.log('3️⃣ About to initialize online users list...');
    console.log('🔍 Checking if initOnlineUsersList function exists:', typeof initOnlineUsersList);
    setTimeout(() => {
      console.log('⏰ Timeout fired, calling initOnlineUsersList...');
      if (typeof initOnlineUsersList === 'function') {
        initOnlineUsersList();
      } else {
        console.error('❌ initOnlineUsersList is not a function!');
      }
    }, 1000); // Delay 1 second to ensure DOM is ready

    console.log('🏁 All initialization calls completed');
  } else {
    currentUser = null;
    isAdmin = false;
    cachedUsername = null; // Reset cached username

    // Clean up listener when user logs out
    if (userStatusListener && currentUser) {
      database.ref(`users/${currentUser.uid}`).off('value', userStatusListener);
      userStatusListener = null;
    }

    showPage(authPage);
    updateOnlineStatus(false);
  }
});

// Auth Functions with smooth transitions
showRegisterLink.addEventListener('click', (e) => {
  e.preventDefault();

  // Update title and subtitle
  authTitle.style.opacity = '0';
  authSubtitle.style.opacity = '0';

  setTimeout(() => {
    authTitle.textContent = 'Create Account';
    authSubtitle.textContent = 'Join our community';
    authTitle.style.opacity = '1';
    authSubtitle.style.opacity = '1';
  }, 200);

  // Slide out login form to the left
  loginForm.classList.add('slide-out-left');

  setTimeout(() => {
    loginForm.classList.add('hidden');
    loginForm.classList.remove('slide-out-left');

    // Slide in register form from the right
    registerForm.classList.remove('hidden');
    registerForm.classList.add('slide-in-right');

    setTimeout(() => {
      registerForm.classList.remove('slide-in-right');
    }, 400);
  }, 400);
});

showLoginLink.addEventListener('click', (e) => {
  e.preventDefault();

  // Update title and subtitle
  authTitle.style.opacity = '0';
  authSubtitle.style.opacity = '0';

  setTimeout(() => {
    authTitle.textContent = 'Community Forum';
    authSubtitle.textContent = 'Sign in to continue';
    authTitle.style.opacity = '1';
    authSubtitle.style.opacity = '1';
  }, 200);

  // Slide out register form to the right
  registerForm.classList.add('slide-out-right');

  setTimeout(() => {
    registerForm.classList.add('hidden');
    registerForm.classList.remove('slide-out-right');

    // Slide in login form from the left
    loginForm.classList.remove('hidden');
    loginForm.classList.add('slide-in-left');

    setTimeout(() => {
      loginForm.classList.remove('slide-in-left');
    }, 400);
  }, 400);
});

loginBtn.addEventListener('click', async () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  
  if (!email || !password) {
    showError('Please fill in all fields');
    return;
  }
  
  try {
    await auth.signInWithEmailAndPassword(email, password);
    
    if (rememberMe.checked) {
      await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    }
    
    showSuccess('Login successful!');
  } catch (error) {
    showError(error.message);
  }
});

registerBtn.addEventListener('click', async () => {
  const username = registerUsername.value.trim();
  const email = registerEmail.value.trim();
  const password = registerPassword.value;
  
  if (!username || !email || !password) {
    showError('Please fill in all fields');
    return;
  }
  
  if (password.length < 6) {
    showError('Password must be at least 6 characters');
    return;
  }
  
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;
    
    // Save user data
    await database.ref(`users/${user.uid}`).set({
      username: username,
      email: email,
      role: 'user',
      createdAt: Date.now(),
      banned: false,
      muted: false
    });
    
    showSuccess('Account created successfully!');
  } catch (error) {
    showError(error.message);
  }
});

logoutBtn.addEventListener('click', async () => {
  await auth.signOut();
});

// Online Status
function updateOnlineStatus(online) {
  if (!currentUser) return;
  
  const userStatusRef = database.ref(`status/${currentUser.uid}`);
  
  if (online) {
    userStatusRef.set({
      online: true,
      lastSeen: Date.now()
    });
    
    userStatusRef.onDisconnect().set({
      online: false,
      lastSeen: Date.now()
    });
    
    // Update online count
    database.ref('status').on('value', (snapshot) => {
      let count = 0;
      snapshot.forEach((child) => {
        if (child.val().online) count++;
      });
      onlineCount.textContent = `${count} online`;
    });
  } else {
    userStatusRef.set({
      online: false,
      lastSeen: Date.now()
    });
  }
}

// Messages
const userCache = new Map();
const loadedMessages = new Set();
let oldestMessageKey = null;
let isLoadingMore = false;
let hasMoreMessages = true;

async function getUserData(userId) {
  if (userCache.has(userId)) {
    return userCache.get(userId);
  }

  const userSnapshot = await database.ref(`users/${userId}`).once('value');
  const userData = userSnapshot.val();
  userCache.set(userId, userData);
  return userData;
}

function loadMessages() {
  const messagesRef = database.ref('messages').limitToLast(50);

  // Reset infinite scroll state
  hasMoreMessages = true;
  loadedMessages.clear();
  oldestMessageKey = null;

  // Clear loading text
  const loadingText = messagesContainer.querySelector('.loading-text');
  if (loadingText) {
    loadingText.remove();
  }

  // Set lastMessageTime to now to prevent treating existing messages as new
  lastMessageTime = Date.now();

  messagesRef.on('child_added', async (snapshot) => {
    const messageId = snapshot.key;

    if (loadedMessages.has(messageId)) {
      return;
    }

    loadedMessages.add(messageId);
    const msg = snapshot.val();
    const userData = await getUserData(msg.userId);

    // Track oldest message for infinite scroll
    if (!oldestMessageKey || messageId < oldestMessageKey) {
      oldestMessageKey = messageId;
    }

    // Only messages with timestamp > current time are considered new
    // This means only messages sent AFTER page load will have animation
    const isNewMessage = msg.timestamp > lastMessageTime;

    // Play notification sound for new messages
    if (isNewMessage && msg.userId !== currentUser.uid) {
      playNotificationSound();
    }

    const messageEl = document.createElement('div');
    messageEl.className = 'message';
    messageEl.dataset.messageId = messageId;

    // Only add animation class if it's truly a new message
    if (isNewMessage) {
      messageEl.classList.add('animate-new');
    }

    const isAdminMsg = userData?.role === 'admin';
    const authorClass = isAdminMsg ? 'message-author admin' : 'message-author';
    const isOwnMessage = msg.userId === currentUser.uid;
    const likes = msg.likes || {};
    const likeCount = Object.keys(likes).length;
    const hasLiked = likes[currentUser.uid];
    const isEdited = msg.edited ? '<span class="edited-badge">(edited)</span>' : '';

    // Reply/Quote section
    let replySection = '';
    if (msg.replyTo) {
      replySection = `
        <div class="message-reply">
          <span class="reply-icon">↩</span>
          <span class="reply-text">${escapeHtml(msg.replyTo.text || '')}</span>
          <span class="reply-author">- ${escapeHtml(msg.replyTo.author || '')}</span>
        </div>
      `;
    }

    const avatar = getAvatar(userData?.username || 'Unknown', userData, msg.userId);
    const userLevel = getUserLevel(userData?.messageCount || 0);

    messageEl.innerHTML = `
      <div class="message-container-flex">
        <div class="message-avatar-wrapper">
          <div class="message-avatar">${avatar}</div>
          <div class="user-online-dot" id="online-${msg.userId}" style="display: none;"></div>
        </div>
        <div class="message-content-wrapper">
          <div class="message-header">
            <span class="${authorClass}">${userData?.username || 'Unknown'}</span>
            <span class="user-level-badge level-${userLevel.level}">${userLevel.name}</span>
            <span class="message-time">${formatTime(msg.timestamp)} ${isEdited}</span>
          </div>
          ${replySection}
          <div class="message-text" data-message-id="${messageId}">${processMessageText(msg.text)}</div>
          <div class="message-actions">
            <button class="btn-action btn-like ${hasLiked ? 'liked' : ''}" onclick="toggleLike('${messageId}')">
              ❤️ <span class="like-count">${likeCount > 0 ? likeCount : ''}</span>
            </button>
            <button class="btn-action btn-reply" onclick="replyToMessage('${messageId}', '${escapeHtml(msg.text)}', '${escapeHtml(userData?.username || 'Unknown')}')">
              💬 Reply
            </button>
            ${isOwnMessage ? `
              <button class="btn-action btn-edit" onclick="editMessage('${messageId}', '${escapeHtml(msg.text)}')">
                ✏️ Edit
              </button>
              <button class="btn-action btn-delete" onclick="deleteMessage('${messageId}')">
                🗑️ Delete
              </button>
            ` : ''}
            ${isAdmin ? `
              <button class="btn-action btn-delete-admin" onclick="deleteMessage('${messageId}')">
                🗑️ Delete
              </button>
            ` : ''}
          </div>
          <div class="message-read-status" id="read-${messageId}"></div>
        </div>
      </div>
    `;

    // Check if user is near bottom before adding message
    const isNearBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 100;

    // Add message to DOM (before typing indicator if it exists)
    const typingIndicator = messagesContainer.querySelector('.typing-indicator-message');
    if (typingIndicator) {
      messagesContainer.insertBefore(messageEl, typingIndicator);
    } else {
      messagesContainer.appendChild(messageEl);
    }

    // Smooth scroll to bottom if user was already near bottom
    if (isNearBottom) {
      requestAnimationFrame(() => {
        messagesContainer.scrollTo({
          top: messagesContainer.scrollHeight,
          behavior: 'smooth'
        });
      });
    }

    // Listen for read status updates
    database.ref(`messages/${messageId}/readBy`).on('value', (readSnapshot) => {
      updateReadStatus(messageId, readSnapshot.val(), msg.userId);
    });

    // Listen for user online status
    database.ref(`status/${msg.userId}/online`).on('value', (statusSnapshot) => {
      const onlineDot = document.getElementById(`online-${msg.userId}`);
      if (onlineDot) {
        onlineDot.style.display = statusSnapshot.val() ? 'block' : 'none';
      }
    });

    // Mark message as read when it becomes visible
    observeMessageVisibility(messageEl, messageId, msg.userId);
  });

  messagesRef.on('child_removed', (snapshot) => {
    const messageId = snapshot.key;
    loadedMessages.delete(messageId);
    const messageEl = messagesContainer.querySelector(`[data-message-id="${messageId}"]`);
    if (messageEl) {
      messageEl.remove();
    }
  });

  messagesRef.on('child_changed', async (snapshot) => {
    const messageId = snapshot.key;
    const msg = snapshot.val();
    const userData = await getUserData(msg.userId);

    const messageEl = messagesContainer.querySelector(`[data-message-id="${messageId}"]`);
    if (messageEl) {
      const isAdminMsg = userData?.role === 'admin';
      const authorClass = isAdminMsg ? 'message-author admin' : 'message-author';
      const isOwnMessage = msg.userId === currentUser.uid;
      const likes = msg.likes || {};
      const likeCount = Object.keys(likes).length;
      const hasLiked = likes[currentUser.uid];
      const isEdited = msg.edited ? '<span class="edited-badge">(edited)</span>' : '';

      let replySection = '';
      if (msg.replyTo) {
        replySection = `
          <div class="message-reply">
            <span class="reply-icon">↩</span>
            <span class="reply-text">${escapeHtml(msg.replyTo.text || '')}</span>
            <span class="reply-author">- ${escapeHtml(msg.replyTo.author || '')}</span>
          </div>
        `;
      }

      const avatar = getAvatar(userData?.username || 'Unknown', userData, msg.userId);
      const userLevel = getUserLevel(userData?.messageCount || 0);

      messageEl.innerHTML = `
        <div class="message-container-flex">
          <div class="message-avatar">${avatar}</div>
          <div class="message-content-wrapper">
            <div class="message-header">
              <span class="${authorClass}">${userData?.username || 'Unknown'}</span>
              <span class="user-level-badge level-${userLevel.level}">${userLevel.name}</span>
              <span class="message-time">${formatTime(msg.timestamp)} ${isEdited}</span>
            </div>
            ${replySection}
            <div class="message-text" data-message-id="${messageId}">${processMessageText(msg.text)}</div>
            <div class="message-actions">
              <button class="btn-action btn-like ${hasLiked ? 'liked' : ''}" onclick="toggleLike('${messageId}')">
                ❤️ <span class="like-count">${likeCount > 0 ? likeCount : ''}</span>
              </button>
              <button class="btn-action btn-reply" onclick="replyToMessage('${messageId}', '${escapeHtml(msg.text)}', '${escapeHtml(userData?.username || 'Unknown')}')">
                💬 Reply
              </button>
              ${isOwnMessage ? `
                <button class="btn-action btn-edit" onclick="editMessage('${messageId}', '${escapeHtml(msg.text)}')">
                  ✏️ Edit
                </button>
                <button class="btn-action btn-delete" onclick="deleteMessage('${messageId}')">
                  🗑️ Delete
                </button>
              ` : ''}
              ${isAdmin ? `
                <button class="btn-action btn-delete-admin" onclick="deleteMessage('${messageId}')">
                  🗑️ Delete
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }
  });
}

sendMessageBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// Typing indicator - will be initialized after login
function initTypingIndicator() {
  console.log('🎯 Initializing typing indicator');

  const msgInput = document.getElementById('messageInput');
  if (!msgInput) {
    console.error('❌ Message input not found');
    return;
  }

  // Function to handle typing status
  const handleTyping = async () => {
    if (!currentUser) {
      console.log('❌ No current user for typing indicator');
      return;
    }

    // If input is empty, clear typing status
    if (!msgInput.value.trim()) {
      if (isCurrentlyTyping) {
        console.log('🧹 Input empty, clearing typing status');
        isCurrentlyTyping = false;
        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }
        try {
          await database.ref(`typing/${currentUser.uid}`).remove();
        } catch (error) {
          console.error('❌ Error removing typing status:', error);
        }
      }
      return;
    }

    // Get username from cache or database (only once)
    if (!cachedUsername) {
      try {
        const userSnapshot = await database.ref(`users/${currentUser.uid}`).once('value');
        const userData = userSnapshot.val();
        if (!userData) {
          console.log('❌ No user data found');
          return;
        }
        cachedUsername = userData.username || currentUser.email;
        console.log('✅ Cached username:', cachedUsername);
      } catch (error) {
        console.error('❌ Error getting user data:', error);
        return;
      }
    }

    // Only set typing status if not already typing
    if (!isCurrentlyTyping) {
      console.log('📝 Setting typing status for:', cachedUsername);
      isCurrentlyTyping = true;
      try {
        await database.ref(`typing/${currentUser.uid}`).set({
          username: cachedUsername,
          timestamp: Date.now()
        });
        console.log('✅ Typing status set successfully');
      } catch (error) {
        console.error('❌ Error setting typing status:', error);
      }
    }

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Remove typing status after 3 seconds of inactivity
    typingTimeout = setTimeout(async () => {
      console.log('⏰ Removing typing status');
      isCurrentlyTyping = false;
      try {
        await database.ref(`typing/${currentUser.uid}`).remove();
      } catch (error) {
        console.error('❌ Error removing typing status:', error);
      }
    }, 3000);
  };

  // Listen to multiple events for better responsiveness
  msgInput.addEventListener('input', handleTyping);
  msgInput.addEventListener('compositionstart', handleTyping); // 开始输入拼音
  msgInput.addEventListener('compositionupdate', handleTyping); // 输入拼音过程中
  msgInput.addEventListener('keydown', handleTyping); // 按键时立即响应

  console.log('✅ Typing indicator initialized');
}

async function sendMessage() {
  const text = messageInput.value.trim();

  if (!text) return;

  // Disable send button and show sending state
  sendMessageBtn.disabled = true;
  sendMessageBtn.style.opacity = '0.6';
  const originalText = sendMessageBtn.textContent;
  sendMessageBtn.textContent = 'Sending...';

  // Check if user is muted
  const userSnapshot = await database.ref(`users/${currentUser.uid}`).once('value');
  const userData = userSnapshot.val();

  if (userData.muted) {
    showError('You are muted and cannot send messages');
    // Re-enable button
    sendMessageBtn.disabled = false;
    sendMessageBtn.style.opacity = '1';
    sendMessageBtn.textContent = originalText;
    return;
  }

  try {
    // Extract mentions from message
    const mentions = messageInput.dataset.mentions ? JSON.parse(messageInput.dataset.mentions) : [];

    await database.ref('messages').push({
      userId: currentUser.uid,
      text: text,
      timestamp: Date.now(),
      mentions: mentions.length > 0 ? mentions : null
    });

    // Send notifications to mentioned users
    if (mentions.length > 0) {
      const senderName = cachedUsername || currentUser.email;
      mentions.forEach(async (mentionedUid) => {
        if (mentionedUid !== currentUser.uid) {
          await database.ref(`notifications/${mentionedUid}`).push({
            type: 'mention',
            from: currentUser.uid,
            fromName: senderName,
            message: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
            timestamp: Date.now(),
            read: false
          });
        }
      });
    }

    messageInput.value = '';
    messageInput.dataset.mentions = '[]';

    // Clear typing status immediately when message is sent
    isCurrentlyTyping = false;
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    await database.ref(`typing/${currentUser.uid}`).remove();

    // Check and cleanup old messages if needed
    checkAndCleanup();

    // Success animation
    sendMessageBtn.textContent = '✓ Sent';
    setTimeout(() => {
      sendMessageBtn.textContent = originalText;
      sendMessageBtn.disabled = false;
      sendMessageBtn.style.opacity = '1';
    }, 500);
  } catch (error) {
    showError('Failed to send message');
    // Re-enable button
    sendMessageBtn.disabled = false;
    sendMessageBtn.style.opacity = '1';
    sendMessageBtn.textContent = originalText;
  }
}

// Navigation
adminPanelBtn.addEventListener('click', () => {
  if (isAdmin) {
    showPage(adminPage);
    switchAdminTab('overview');
    loadAdminDashboard();
  }
});

backToForumBtn.addEventListener('click', () => {
  showPage(forumPage);
});

// Admin Tab Switching
function switchAdminTab(tabName) {
  // Update menu items
  document.querySelectorAll('.admin-menu-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tabName);
  });

  // Update tabs
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.classList.toggle('active', tab.id === `tab-${tabName}`);
  });

  // Load tab content
  switch(tabName) {
    case 'overview':
      loadAdminDashboard();
      break;
    case 'users':
      loadUsers();
      break;
    case 'messages':
      loadMessagesAdmin();
      break;
    case 'announcements':
      loadAnnouncementsManager();
      break;
    case 'logs':
      loadAdminLogs();
      break;
    case 'settings':
      // Settings are static
      break;
  }
}

// Add event listeners to menu items
document.querySelectorAll('.admin-menu-item').forEach(item => {
  item.addEventListener('click', () => {
    switchAdminTab(item.dataset.tab);
  });
});

// Load Admin Dashboard
async function loadAdminDashboard() {
  try {
    // Load statistics
    const usersSnapshot = await database.ref('users').once('value');
    const messagesSnapshot = await database.ref('messages').once('value');

    const users = usersSnapshot.val() || {};
    const messages = messagesSnapshot.val() || {};

    const totalUsers = Object.keys(users).length;
    const totalMessages = Object.keys(messages).length;

    // Count online users (active in last 5 minutes)
    const now = Date.now();
    const onlineUsers = Object.values(users).filter(user =>
      user.lastActive && (now - user.lastActive) < 5 * 60 * 1000
    ).length;

    // Count today's messages
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayMessages = Object.values(messages).filter(msg =>
      msg.timestamp >= todayStart
    ).length;

    // Update stats
    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalMessages').textContent = totalMessages;
    document.getElementById('onlineUsers').textContent = onlineUsers;
    document.getElementById('todayMessages').textContent = todayMessages;

    // Load recent activity
    loadRecentActivity();

  } catch (error) {
    console.error('Failed to load dashboard:', error);
  }
}

// Load Recent Activity
async function loadRecentActivity() {
  try {
    const logsSnapshot = await database.ref('adminLogs').limitToLast(5).once('value');
    const logs = [];

    logsSnapshot.forEach(snapshot => {
      logs.unshift({ id: snapshot.key, ...snapshot.val() });
    });

    const activityList = document.getElementById('recentActivity');

    if (logs.length === 0) {
      activityList.innerHTML = '<div class="loading-text">No recent activity</div>';
      return;
    }

    activityList.innerHTML = logs.map(log => {
      const icon = getActionIcon(log.action);
      const time = formatTime(log.timestamp);

      return `
        <div class="activity-item">
          <div class="activity-icon">${icon}</div>
          <div class="activity-content">
            <p class="activity-text">${log.action} - ${log.targetUser || 'N/A'}</p>
            <span class="activity-time">${time}</span>
          </div>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Failed to load activity:', error);
  }
}

function getActionIcon(action) {
  const icons = {
    'BAN': '🚫',
    'UNBAN': '✅',
    'MUTE': '🔇',
    'UNMUTE': '🔊',
    'DELETE': '🗑️',
    'PIN': '📌',
    'UNPIN': '📍'
  };
  return icons[action] || '📝';
}

// Load Messages Admin
async function loadMessagesAdmin() {
  try {
    const messagesSnapshot = await database.ref('messages').limitToLast(50).once('value');
    const messages = [];

    messagesSnapshot.forEach(snapshot => {
      messages.unshift({ id: snapshot.key, ...snapshot.val() });
    });

    const messagesList = document.getElementById('messagesAdminList');

    if (messages.length === 0) {
      messagesList.innerHTML = '<div class="loading-text">No messages found</div>';
      return;
    }

    // Load user data for all messages
    const userIds = [...new Set(messages.map(msg => msg.userId))];
    const userDataMap = {};

    for (const userId of userIds) {
      const userSnapshot = await database.ref(`users/${userId}`).once('value');
      userDataMap[userId] = userSnapshot.val();
    }

    messagesList.innerHTML = messages.map(msg => {
      const userData = userDataMap[msg.userId];
      const time = formatTime(msg.timestamp);

      return `
        <div class="activity-item">
          <div class="activity-content">
            <p class="activity-text"><strong>${userData?.username || 'Unknown'}</strong>: ${escapeHtml(msg.text)}</p>
            <span class="activity-time">${time}</span>
          </div>
          <button class="btn btn-danger btn-small" onclick="deleteMessageAdmin('${msg.id}')">Delete</button>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Failed to load messages:', error);
  }
}

// Delete message from admin panel
window.deleteMessageAdmin = async function(messageId) {
  if (!confirm('确定要删除这条消息吗？')) return;

  try {
    await database.ref(`messages/${messageId}`).remove();
    await logAdminAction('DELETE', messageId, { messageId });
    showSuccess('消息已删除');
    loadMessagesAdmin();
  } catch (error) {
    showError('删除消息失败');
  }
};

// Load Admin Logs
async function loadAdminLogs() {
  try {
    const logsSnapshot = await database.ref('adminLogs').limitToLast(100).once('value');
    const logs = [];

    logsSnapshot.forEach(snapshot => {
      logs.unshift({ id: snapshot.key, ...snapshot.val() });
    });

    const logsList = document.getElementById('logsList');

    if (logs.length === 0) {
      logsList.innerHTML = '<div class="loading-text">No logs found</div>';
      return;
    }

    logsList.innerHTML = logs.map(log => {
      const time = formatTime(log.timestamp);

      return `
        <div class="log-item">
          <div>
            <div class="log-action">${log.action}</div>
            <div class="log-details">By: ${log.adminUser} | Target: ${log.targetUser || 'N/A'}</div>
          </div>
          <div class="log-time">${time}</div>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Failed to load logs:', error);
  }
}

// Clear all messages
window.clearAllMessages = async function() {
  if (!confirm('⚠️ 确定要删除所有消息吗？此操作无法撤销！')) return;

  try {
    await database.ref('messages').remove();
    await logAdminAction('CLEAR_ALL', 'all_messages', { action: 'cleared all messages' });
    showSuccess('所有消息已清空');
    loadMessagesAdmin();
  } catch (error) {
    showError('清空消息失败');
  }
};

// Export logs
window.exportLogs = async function() {
  try {
    const logsSnapshot = await database.ref('adminLogs').once('value');
    const logs = [];

    logsSnapshot.forEach(snapshot => {
      logs.push({ id: snapshot.key, ...snapshot.val() });
    });

    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-logs-${Date.now()}.json`;
    link.click();

    showSuccess('日志导出成功');
  } catch (error) {
    showError('导出日志失败');
  }
};

// Reset database
window.resetDatabase = async function() {
  if (!confirm('⚠️⚠️⚠️ 危险！这将删除所有数据，包括用户、消息和公告。你确定吗？')) return;
  if (!confirm('这是最后的机会。在下一个提示中输入"是"以确认。')) return;

  const confirmation = prompt('输入"是"以确认重置数据库：');
  if (confirmation !== '是') {
    showError('重置已取消');
    return;
  }

  try {
    await database.ref('messages').remove();
    await database.ref('announcements').remove();
    await database.ref('adminLogs').remove();
    showSuccess('数据库重置完成');
    loadAdminDashboard();
  } catch (error) {
    showError('重置数据库失败');
  }
};

// Export all data
window.exportData = async function() {
  try {
    const snapshot = await database.ref().once('value');
    const data = snapshot.val();

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `forum-backup-${Date.now()}.json`;
    link.click();

    showSuccess('数据导出成功');
  } catch (error) {
    showError('导出数据失败');
  }
};

// Utility Functions
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Process message text with mentions
function processMessageText(text) {
  let processed = escapeHtml(text);
  // Replace @username with clickable mentions
  processed = processed.replace(/@([\w\u4e00-\u9fa5]+)/g, (match, username) => {
    return `<a href="@${username}" class="mention-link" onclick="event.preventDefault(); findUserByUsername('${username}')">${match}</a>`;
  });
  return processed;
}

// Find user by username (for mentions)
window.findUserByUsername = async function(username) {
  // Just a placeholder for mention clicks
  console.log('Mentioned user:', username);
};

// Admin Functions
async function loadUsers() {
  const usersSnapshot = await database.ref('users').once('value');
  usersTable.innerHTML = '';

  if (!usersSnapshot.exists()) {
    usersTable.innerHTML = '<div class="loading-text">No users found</div>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'table';
  table.innerHTML = `
    <thead>
      <tr>
        <th>用户名</th>
        <th>邮箱</th>
        <th>角色</th>
        <th>状态</th>
        <th>操作</th>
      </tr>
    </thead>
    <tbody id="usersTableBody"></tbody>
  `;

  usersTable.appendChild(table);
  const tbody = document.getElementById('usersTableBody');

  usersSnapshot.forEach((child) => {
    const user = child.val();
    const userId = child.key;

    if (userId === currentUser.uid) return; // Skip current admin

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.username}</td>
      <td>${user.email}</td>
      <td><span class="badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}">${user.role === 'admin' ? '管理员' : '用户'}</span></td>
      <td>
        ${user.banned ? '<span class="badge badge-danger">已封禁</span>' : ''}
        ${user.muted ? '<span class="badge badge-warning">已禁言</span>' : ''}
        ${!user.banned && !user.muted ? '<span class="badge badge-success">正常</span>' : ''}
      </td>
      <td>
        <button class="btn-small ${user.muted ? 'btn-success' : 'btn-warning'}" onclick="toggleMute('${userId}', ${!user.muted})">${user.muted ? '解除禁言' : '禁言'}</button>
        <button class="btn-small ${user.banned ? 'btn-success' : 'btn-danger'}" onclick="toggleBan('${userId}', ${!user.banned})">${user.banned ? '解封' : '封禁'}</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

window.toggleMute = async function(userId, mute) {
  try {
    await database.ref(`users/${userId}/muted`).set(mute);
    showSuccess(mute ? '用户已禁言' : '已解除禁言');
    loadUsers();
  } catch (error) {
    showError('更新用户状态失败');
  }
};

window.toggleBan = async function(userId, ban) {
  try {
    await database.ref(`users/${userId}/banned`).set(ban);
    showSuccess(ban ? '用户已封禁' : '已解除封禁');
    loadUsers();
  } catch (error) {
    console.error('Ban error:', error);
    showError('更新用户状态失败: ' + error.message);
  }
};

searchUser.addEventListener('input', async (e) => {
  const query = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('#usersTableBody tr');

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? '' : 'none';
  });
});

// Announcement posting is handled later in the code (line ~1927)
// This old handler has been removed to prevent duplicate posts

// Load announcements
let allAnnouncements = [];
let announcementsExpanded = false;

function loadAnnouncements() {
  const announcementsRef = database.ref('announcements');

  announcementsRef.on('value', (snapshot) => {
    const container = document.getElementById('announcementsList');
    const showMoreBtn = document.getElementById('showMoreAnnouncements');

    if (!container) return;

    container.innerHTML = '';
    allAnnouncements = [];

    if (!snapshot.exists()) {
      container.innerHTML = '<div class="announcement-card"><p class="announcement-text">No announcements yet.</p></div>';
      if (showMoreBtn) showMoreBtn.style.display = 'none';
      return;
    }

    snapshot.forEach((child) => {
      allAnnouncements.push({ id: child.key, ...child.val() });
    });

    // Sort by timestamp (newest first)
    allAnnouncements.sort((a, b) => b.timestamp - a.timestamp);

    // Show/hide "Show More" button
    if (showMoreBtn) {
      showMoreBtn.style.display = allAnnouncements.length > 3 ? 'block' : 'none';
    }

    renderAnnouncements();
  });
}

async function renderAnnouncements() {
  const container = document.getElementById('announcementsList');
  const toggleBtn = document.getElementById('toggleAnnouncementsBtn');

  if (!container) return;
  container.innerHTML = '';

  // Load user data for all announcements
  const userIds = [...new Set(allAnnouncements.map(ann => ann.author))];
  const userDataMap = {};

  for (const userId of userIds) {
    if (userId && !userDataMap[userId]) {
      const userSnapshot = await database.ref(`users/${userId}`).once('value');
      userDataMap[userId] = userSnapshot.val();
    }
  }

  allAnnouncements.forEach((ann, index) => {
    const card = document.createElement('div');
    card.className = 'announcement-card';

    // Collapse announcements after the 3rd one
    if (index >= 3 && !announcementsExpanded) {
      card.classList.add('collapsed');
    }

    const imageHtml = ann.imageUrl ?
      `<img src="${ann.imageUrl}" alt="Announcement" class="announcement-image-thumb">` : '';

    const isNew = (Date.now() - ann.timestamp) < 86400000; // 24 hours

    // Get user data
    const userData = userDataMap[ann.author];
    const avatar = userData ? getAvatar(userData.username, userData, ann.author) : '<div class="avatar" style="background: #999999">?</div>';
    const username = userData?.username || 'Unknown';
    const isAdmin = userData?.role === 'admin';
    const authorClass = isAdmin ? 'announcement-author-name admin' : 'announcement-author-name';

    card.innerHTML = `
      <div class="announcement-header">
        <div class="announcement-author-info">
          <div class="announcement-avatar">${avatar}</div>
          <div class="announcement-author-details">
            <span class="${authorClass}">${escapeHtml(username)}</span>
            <span class="announcement-date">${formatTime(ann.timestamp)}</span>
          </div>
        </div>
        <div class="announcement-meta">
          ${isNew ? '<span class="announcement-badge">New</span>' : ''}
        </div>
      </div>
      <p class="announcement-text">${escapeHtml(ann.text.substring(0, 150))}${ann.text.length > 150 ? '...' : ''}</p>
      ${imageHtml}
    `;

    // Click to view details
    card.addEventListener('click', () => {
      showAnnouncementDetail(ann, userData);
    });

    container.appendChild(card);
  });

  // Update button text
  if (toggleBtn) {
    toggleBtn.textContent = announcementsExpanded ? '📋 Show Less' : '📋 Show More';
  }
}

// Toggle announcements
const toggleAnnouncementsBtn = document.getElementById('toggleAnnouncementsBtn');
if (toggleAnnouncementsBtn) {
  toggleAnnouncementsBtn.addEventListener('click', () => {
    announcementsExpanded = !announcementsExpanded;
    renderAnnouncements();
  });
}

// Show announcement detail
function showAnnouncementDetail(announcement, userData) {
  const modal = document.getElementById('announcementDetailModal');
  const title = document.getElementById('announcementDetailTitle');
  const meta = document.getElementById('announcementDetailMeta');
  const image = document.getElementById('announcementDetailImage');
  const content = document.getElementById('announcementDetailContent');

  if (!modal) return;

  title.textContent = announcement.text.substring(0, 50) + (announcement.text.length > 50 ? '...' : '');

  const isNew = (Date.now() - announcement.timestamp) < 86400000;
  const avatar = userData ? getAvatar(userData.username, userData, announcement.author) : '<div class="avatar" style="background: #999999">?</div>';
  const username = userData?.username || 'Unknown';
  const isAdmin = userData?.role === 'admin';
  const authorClass = isAdmin ? 'announcement-author-name admin' : 'announcement-author-name';

  meta.innerHTML = `
    <div class="announcement-author-info">
      <div class="announcement-avatar">${avatar}</div>
      <div class="announcement-author-details">
        <span class="${authorClass}">${escapeHtml(username)}</span>
        <span class="announcement-date">${formatTime(announcement.timestamp)}</span>
      </div>
    </div>
    ${isNew ? '<span class="announcement-badge">New</span>' : ''}
  `;

  if (announcement.imageUrl) {
    image.innerHTML = `<img src="${announcement.imageUrl}" alt="Announcement">`;
  } else {
    image.innerHTML = '';
  }

  content.textContent = announcement.text;

  modal.classList.add('active');
}

// Close announcement detail modal
const closeAnnouncementDetailModal = document.getElementById('closeAnnouncementDetailModal');
if (closeAnnouncementDetailModal) {
  closeAnnouncementDetailModal.addEventListener('click', () => {
    document.getElementById('announcementDetailModal').classList.remove('active');
  });
}

// Close modal when clicking outside
const announcementDetailModal = document.getElementById('announcementDetailModal');
if (announcementDetailModal) {
  announcementDetailModal.addEventListener('click', (e) => {
    if (e.target === announcementDetailModal) {
      announcementDetailModal.classList.remove('active');
    }
  });
}

// Load announcements on auth state change
auth.onAuthStateChanged((user) => {
  if (user) {
    loadAnnouncements();
  }
});

// ============================================
// NEW FEATURES: Message Actions
// ============================================

let replyingTo = null;

// Toggle Like
window.toggleLike = async function(messageId) {
  try {
    const likeRef = database.ref(`messages/${messageId}/likes/${currentUser.uid}`);
    const snapshot = await likeRef.once('value');

    if (snapshot.exists()) {
      await likeRef.remove();
    } else {
      await likeRef.set(true);
    }
  } catch (error) {
    console.error('Like error:', error);
    showError('Failed to like message');
  }
};

// Delete Message
window.deleteMessage = async function(messageId) {
  if (!confirm('Are you sure you want to delete this message?')) {
    return;
  }

  try {
    await database.ref(`messages/${messageId}`).remove();
    showSuccess('Message deleted');
  } catch (error) {
    console.error('Delete error:', error);
    showError('Failed to delete message');
  }
};

// Edit Message
window.editMessage = function(messageId, currentText) {
  const messageTextEl = messagesContainer.querySelector(`[data-message-id="${messageId}"]`);
  if (!messageTextEl) return;

  const originalHtml = messageTextEl.innerHTML;

  messageTextEl.innerHTML = `
    <textarea class="edit-textarea" id="edit-${messageId}">${currentText}</textarea>
    <div class="edit-actions">
      <button class="btn-small btn-primary" onclick="saveEdit('${messageId}')">Save</button>
      <button class="btn-small btn-secondary" onclick="cancelEdit('${messageId}', \`${escapeHtml(originalHtml)}\`)">Cancel</button>
    </div>
  `;

  document.getElementById(`edit-${messageId}`).focus();
};

window.saveEdit = async function(messageId) {
  const textarea = document.getElementById(`edit-${messageId}`);
  const newText = textarea.value.trim();

  if (!newText) {
    showError('Message cannot be empty');
    return;
  }

  try {
    await database.ref(`messages/${messageId}`).update({
      text: newText,
      edited: true,
      editedAt: Date.now()
    });
    showSuccess('Message updated');
  } catch (error) {
    console.error('Edit error:', error);
    showError('Failed to edit message');
  }
};

window.cancelEdit = function(messageId, originalHtml) {
  const messageTextEl = messagesContainer.querySelector(`[data-message-id="${messageId}"]`);
  if (messageTextEl) {
    messageTextEl.innerHTML = originalHtml;
  }
};

// Reply to Message
window.replyToMessage = function(messageId, text, author) {
  replyingTo = {
    id: messageId,
    text: text,
    author: author
  };

  const replyIndicator = document.getElementById('reply-indicator') || createReplyIndicator();
  replyIndicator.style.display = 'flex';
  replyIndicator.querySelector('.reply-preview-text').textContent = `Replying to ${author}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`;

  messageInput.focus();
};

function createReplyIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'reply-indicator';
  indicator.className = 'reply-indicator';
  indicator.innerHTML = `
    <span class="reply-preview-text"></span>
    <button class="btn-cancel-reply" onclick="cancelReply()">✕</button>
  `;
  messageInput.parentElement.insertBefore(indicator, messageInput);
  return indicator;
}

window.cancelReply = function() {
  replyingTo = null;
  const indicator = document.getElementById('reply-indicator');
  if (indicator) {
    indicator.style.display = 'none';
  }
};

// Update sendMessage to include reply, rate limiting, and profanity filter
const originalSendMessage = sendMessage;
async function sendMessage() {
  const text = messageInput.value.trim();

  if (!text) return;

  // Clear typing indicator
  if (currentUser) {
    database.ref(`typing/${currentUser.uid}`).remove();
  }

  // Check rate limit
  if (!checkRateLimit()) {
    showError('You are sending messages too quickly. Please slow down.');
    return;
  }

  // Check profanity
  if (containsProfanity(text)) {
    showError('Your message contains inappropriate content');
    return;
  }

  // Check if user is muted
  const userSnapshot = await database.ref(`users/${currentUser.uid}`).once('value');
  const userData = userSnapshot.val();

  if (userData.muted) {
    showError('You are muted and cannot send messages');
    return;
  }

  try {
    // Filter profanity (just in case)
    const filteredText = filterProfanity(text);

    const messageData = {
      text: filteredText,
      userId: currentUser.uid,
      timestamp: Date.now()
    };

    if (replyingTo) {
      messageData.replyTo = {
        id: replyingTo.id,
        text: replyingTo.text,
        author: replyingTo.author
      };
    }

    await database.ref('messages').push(messageData);
    messageInput.value = '';

    // Update message count
    await updateMessageCount(currentUser.uid);

    if (replyingTo) {
      cancelReply();
    }
  } catch (error) {
    console.error('Send error:', error);
    showError('Failed to send message');
  }
}

// Search Messages
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const messages = messagesContainer.querySelectorAll('.message');

    messages.forEach(message => {
      const text = message.querySelector('.message-text').textContent.toLowerCase();
      const author = message.querySelector('.message-author').textContent.toLowerCase();

      if (text.includes(query) || author.includes(query) || query === '') {
        message.style.display = '';
      } else {
        message.style.display = 'none';
      }
    });
  });
}

// Emoji Picker
const emojiBtn = document.getElementById('emojiBtn');
const emojiPicker = document.getElementById('emojiPicker');
const emojiGrid = document.getElementById('emojiGrid');

const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
  '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
  '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
  '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨',
  '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
  '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
  '🤢', '🤮', '🤧', '🥵', '🥶', '😶‍🌫️', '😵', '🤯',
  '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁',
  '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧',
  '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣',
  '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠',
  '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹',
  '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹',
  '😻', '😼', '😽', '🙀', '😿', '😾', '❤️', '🧡',
  '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
  '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐',
  '🖖', '👋', '🤙', '💪', '🙏', '✍️', '💅', '🤳',
  '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉',
  '⭐', '🌟', '✨', '💫', '🔥', '💯', '✅', '❌'
];

emojis.forEach(emoji => {
  const emojiItem = document.createElement('div');
  emojiItem.className = 'emoji-item';
  emojiItem.textContent = emoji;
  emojiItem.onclick = () => {
    messageInput.value += emoji;
    messageInput.focus();
    emojiPicker.style.display = 'none';
  };
  emojiGrid.appendChild(emojiItem);
});

if (emojiBtn) {
  emojiBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
  });
}

// Close emoji picker when clicking outside
document.addEventListener('click', (e) => {
  if (emojiPicker && !emojiPicker.contains(e.target) && e.target !== emojiBtn) {
    emojiPicker.style.display = 'none';
  }
});

// Dark mode removed - using light theme only for better mobile experience

// ============================================
// USER AVATAR & LEVEL SYSTEM
// ============================================

// Generate avatar from username or custom data
function getAvatar(username, userData = null, userId = null) {
  const clickable = userId ? `onclick="showUserProfile('${userId}')" style="cursor: pointer;"` : '';

  // Check if user has custom avatar
  if (userData?.avatarUrl) {
    return `<div class="avatar" ${clickable}><img src="${userData.avatarUrl}" alt="${username}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"></div>`;
  }

  const initials = username.substring(0, 2).toUpperCase();

  // Check if user has custom color
  if (userData?.avatarColor) {
    return `<div class="avatar" style="background: ${userData.avatarColor}" ${clickable}>${initials}</div>`;
  }

  // Default color based on username
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
  ];
  const colorIndex = username.charCodeAt(0) % colors.length;
  const color = colors[colorIndex];

  return `<div class="avatar" style="background: ${color}" ${clickable}>${initials}</div>`;
}

// Get user level based on message count
function getUserLevel(messageCount) {
  if (messageCount >= 1000) return { level: 5, name: '🏆 Legend' };
  if (messageCount >= 500) return { level: 4, name: '💎 Expert' };
  if (messageCount >= 100) return { level: 3, name: '⭐ Regular' };
  if (messageCount >= 20) return { level: 2, name: '🌱 Active' };
  return { level: 1, name: '🐣 Newbie' };
}

// Update user message count
async function updateMessageCount(userId) {
  try {
    const userRef = database.ref(`users/${userId}`);
    const snapshot = await userRef.once('value');
    const userData = snapshot.val();
    const currentCount = userData?.messageCount || 0;
    await userRef.update({ messageCount: currentCount + 1 });
  } catch (error) {
    console.error('Failed to update message count:', error);
  }
}

// ============================================
// NOTIFICATION SOUND
// ============================================

let notificationEnabled = localStorage.getItem('notificationSound') !== 'false';
let lastMessageTime = 0;

function playNotificationSound() {
  if (!notificationEnabled) return;

  // Create a simple beep sound using Web Audio API
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 800;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

// Add notification toggle button
function createNotificationToggle() {
  const toggle = document.createElement('button');
  toggle.className = 'nav-btn';
  toggle.id = 'notificationToggle';
  toggle.textContent = notificationEnabled ? '🔔' : '🔕';
  toggle.title = 'Toggle notification sound';
  toggle.onclick = () => {
    notificationEnabled = !notificationEnabled;
    localStorage.setItem('notificationSound', notificationEnabled);
    toggle.textContent = notificationEnabled ? '🔔' : '🔕';
    if (notificationEnabled) {
      playNotificationSound();
      showSuccess('Notifications enabled');
    } else {
      showSuccess('Notifications disabled');
    }
  };

  const navActions = document.querySelector('.nav-actions');
  const avatarBtn = document.getElementById('avatarBtn');
  if (navActions && avatarBtn) {
    navActions.insertBefore(toggle, avatarBtn.nextSibling);
  }
}

// Call this when forum page loads
if (forumPage) {
  createNotificationToggle();
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Enter to send message
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    if (messageInput === document.activeElement) {
      e.preventDefault();
      sendMessage();
    }
  }

  // Escape to cancel reply or close emoji picker
  if (e.key === 'Escape') {
    if (replyingTo) {
      cancelReply();
    }
    if (emojiPicker && emojiPicker.style.display !== 'none') {
      emojiPicker.style.display = 'none';
    }
  }

  // Ctrl/Cmd + K to focus search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    if (searchInput) {
      searchInput.focus();
    }
  }

  // Ctrl/Cmd + / to focus message input
  if ((e.ctrlKey || e.metaKey) && e.key === '/') {
    e.preventDefault();
    if (messageInput) {
      messageInput.focus();
    }
  }
});

// ============================================
// INFINITE SCROLL - Load More Messages
// ============================================

async function loadMoreMessages() {
  if (isLoadingMore || !oldestMessageKey || !hasMoreMessages) return;

  isLoadingMore = true;
  const loadingIndicator = document.createElement('div');
  loadingIndicator.className = 'loading-more';
  loadingIndicator.textContent = 'Loading more messages...';
  messagesContainer.insertBefore(loadingIndicator, messagesContainer.firstChild);

  try {
    const snapshot = await database.ref('messages')
      .orderByKey()
      .endBefore(oldestMessageKey)
      .limitToLast(20)
      .once('value');

    const messages = [];
    snapshot.forEach(child => {
      messages.push({ key: child.key, val: child.val() });
    });

    if (messages.length > 0) {
      oldestMessageKey = messages[0].key;

      // Save scroll position
      const scrollHeightBefore = messagesContainer.scrollHeight;
      const scrollTopBefore = messagesContainer.scrollTop;

      for (const { key, val } of messages.reverse()) {
        if (!loadedMessages.has(key)) {
          loadedMessages.add(key);
          const userData = await getUserData(val.userId);
          const messageEl = createMessageElement(key, val, userData, false); // false = not a new message, no animation
          messagesContainer.insertBefore(messageEl, loadingIndicator.nextSibling);
        }
      }

      // Restore scroll position
      const scrollHeightAfter = messagesContainer.scrollHeight;
      messagesContainer.scrollTop = scrollTopBefore + (scrollHeightAfter - scrollHeightBefore);
    } else {
      // No more messages to load
      hasMoreMessages = false;

      // Show "no more messages" indicator
      const noMoreIndicator = document.createElement('div');
      noMoreIndicator.className = 'no-more-messages';
      noMoreIndicator.textContent = '📜 已经到顶了';
      noMoreIndicator.style.cssText = `
        text-align: center;
        padding: 12px;
        color: #999;
        font-size: 13px;
        opacity: 0.7;
      `;
      messagesContainer.insertBefore(noMoreIndicator, messagesContainer.firstChild);

      // Remove after 2 seconds
      setTimeout(() => {
        noMoreIndicator.remove();
      }, 2000);
    }
  } catch (error) {
    console.error('Failed to load more messages:', error);
  } finally {
    loadingIndicator.remove();
    isLoadingMore = false;
  }
}

// Scroll event listener for infinite scroll
if (messagesContainer) {
  let scrollTimeout;
  messagesContainer.addEventListener('scroll', () => {
    // Debounce scroll event to prevent excessive calls
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      // Only load more if scrolled near top and has more messages
      if (messagesContainer.scrollTop < 50 && !isLoadingMore && hasMoreMessages) {
        loadMoreMessages();
      }
    }, 200);
  }, { passive: true });
}

// Helper function to create message element
function createMessageElement(messageId, msg, userData, isNewMessage = false) {
  const messageEl = document.createElement('div');
  messageEl.className = 'message';
  messageEl.dataset.messageId = messageId;

  // Only add animation for truly new messages
  if (isNewMessage) {
    messageEl.classList.add('animate-new');
  }

  const isAdminMsg = userData?.role === 'admin';
  const authorClass = isAdminMsg ? 'message-author admin' : 'message-author';
  const isOwnMessage = msg.userId === currentUser?.uid;
  const likes = msg.likes || {};
  const likeCount = Object.keys(likes).length;
  const hasLiked = currentUser ? likes[currentUser.uid] : false;
  const isEdited = msg.edited ? '<span class="edited-badge">(edited)</span>' : '';

  let replySection = '';
  if (msg.replyTo) {
    replySection = `
      <div class="message-reply">
        <span class="reply-icon">↩</span>
        <span class="reply-text">${escapeHtml(msg.replyTo.text || '')}</span>
        <span class="reply-author">- ${escapeHtml(msg.replyTo.author || '')}</span>
      </div>
    `;
  }

  const avatar = getAvatar(userData?.username || 'Unknown', userData, msg.userId);
  const userLevel = getUserLevel(userData?.messageCount || 0);
  const isPinned = msg.pinned ? '<span class="pinned-badge">📌 Pinned</span>' : '';

  messageEl.innerHTML = `
    <div class="message-container-flex">
      <div class="message-avatar">${avatar}</div>
      <div class="message-content-wrapper">
        <div class="message-header">
          <span class="${authorClass}">${userData?.username || 'Unknown'}</span>
          <span class="user-level-badge level-${userLevel.level}">${userLevel.name}</span>
          ${isPinned}
          <span class="message-time">${formatTime(msg.timestamp)} ${isEdited}</span>
        </div>
        ${replySection}
        <div class="message-text" data-message-id="${messageId}">${processMessageText(msg.text)}</div>
        <div class="message-actions">
          <button class="btn-action btn-like ${hasLiked ? 'liked' : ''}" onclick="toggleLike('${messageId}')">
            ❤️ <span class="like-count">${likeCount > 0 ? likeCount : ''}</span>
          </button>
          <button class="btn-action btn-reply" onclick="replyToMessage('${messageId}', '${escapeHtml(msg.text)}', '${escapeHtml(userData?.username || 'Unknown')}')">
            💬 Reply
          </button>
          ${isOwnMessage ? `
            <button class="btn-action btn-edit" onclick="editMessage('${messageId}', '${escapeHtml(msg.text)}')">
              ✏️ Edit
            </button>
            <button class="btn-action btn-delete" onclick="deleteMessage('${messageId}')">
              🗑️ Delete
            </button>
          ` : ''}
          ${isAdmin ? `
            <button class="btn-action btn-pin" onclick="togglePin('${messageId}', ${!msg.pinned})">
              ${msg.pinned ? '📌 Unpin' : '📌 Pin'}
            </button>
            <button class="btn-action btn-delete-admin" onclick="deleteMessage('${messageId}')">
              🗑️ Delete
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  return messageEl;
}

// ============================================
// PIN MESSAGES (Admin Only)
// ============================================

window.togglePin = async function(messageId, pin) {
  if (!isAdmin) {
    showError('Only admins can pin messages');
    return;
  }

  try {
    await database.ref(`messages/${messageId}/pinned`).set(pin ? true : null);
    showSuccess(pin ? 'Message pinned' : 'Message unpinned');
  } catch (error) {
    console.error('Pin error:', error);
    showError('Failed to pin message');
  }
};

// ============================================
// WELCOME NEW USERS
// ============================================

// Monitor new user registrations
database.ref('users').on('child_added', async (snapshot) => {
  const userId = snapshot.key;
  const userData = snapshot.val();

  // Skip if this is not a new user (created more than 10 seconds ago)
  const now = Date.now();
  const userCreatedAt = userData.createdAt || 0;

  if (now - userCreatedAt < 10000 && userId !== currentUser?.uid) {
    // Show welcome notification
    showWelcomeNotification(userData.username);

    // Optionally send a welcome message (disabled by default)
    // await sendWelcomeMessage(userData.username);
  }
});

function showWelcomeNotification(username) {
  const notification = document.createElement('div');
  notification.className = 'welcome-notification';
  notification.innerHTML = `
    <span class="welcome-icon">👋</span>
    <span class="welcome-text">Welcome <strong>${escapeHtml(username)}</strong> to the community!</span>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 100);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

async function sendWelcomeMessage(username) {
  try {
    await database.ref('messages').push({
      text: `Welcome ${username} to the community! 🎉`,
      userId: 'system',
      timestamp: Date.now(),
      isSystem: true
    });
  } catch (error) {
    console.error('Failed to send welcome message:', error);
  }
}

// Update register function to set createdAt timestamp
const originalRegister = registerBtn.onclick;
registerBtn.onclick = async function() {
  const username = registerUsername.value.trim();
  const email = registerEmail.value.trim();
  const password = registerPassword.value.trim();

  if (!username || !email || !password) {
    showError('Please fill in all fields');
    return;
  }

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    await database.ref(`users/${userCredential.user.uid}`).set({
      username: username,
      email: email,
      role: 'user',
      createdAt: Date.now(),
      messageCount: 0
    });
    showSuccess('Registration successful!');
  } catch (error) {
    showError(error.message);
  }
};

// ============================================
// ANNOUNCEMENT MANAGEMENT (Admin)
// ============================================

const announcementTitle = document.getElementById('announcementTitle');
const announcementBadge = document.getElementById('announcementBadge');
const announcementsManager = document.getElementById('announcementsManager');
const announcementImage = document.getElementById('announcementImage');
const uploadAnnouncementImageBtn = document.getElementById('uploadAnnouncementImageBtn');
const announcementImagePreview = document.getElementById('announcementImagePreview');

let selectedAnnouncementImage = null;

// Upload announcement image
if (uploadAnnouncementImageBtn) {
  uploadAnnouncementImageBtn.addEventListener('click', () => {
    announcementImage.click();
  });
}

if (announcementImage) {
  announcementImage.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('Image size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      selectedAnnouncementImage = e.target.result;
      announcementImagePreview.innerHTML = `
        <div class="image-preview-container">
          <img src="${e.target.result}" alt="Preview">
          <button class="remove-image-btn" onclick="removeAnnouncementImage()">✕</button>
        </div>
      `;
    };
    reader.readAsDataURL(file);
  });
}

// Remove announcement image
window.removeAnnouncementImage = function() {
  selectedAnnouncementImage = null;
  announcementImagePreview.innerHTML = '';
  announcementImage.value = '';
};

// Post new announcement
postAnnouncementBtn.addEventListener('click', async () => {
  const title = announcementTitle?.value.trim() || 'Announcement';
  const text = announcementText.value.trim();
  const badge = announcementBadge?.value || 'Important';

  if (!text) {
    showError('Please enter announcement text');
    return;
  }

  postAnnouncementBtn.disabled = true;
  postAnnouncementBtn.textContent = 'Posting...';

  try {
    const announcementData = {
      title: title,
      text: text,
      badge: badge,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now(),
      author: currentUser.uid
    };

    // Add image if selected
    if (selectedAnnouncementImage) {
      announcementData.imageUrl = selectedAnnouncementImage;
    }

    await database.ref('announcements').push(announcementData);

    announcementText.value = '';
    if (announcementTitle) announcementTitle.value = '';
    removeAnnouncementImage();

    showSuccess('Announcement posted!');
  } catch (error) {
    showError('Failed to post announcement');
  } finally {
    postAnnouncementBtn.disabled = false;
    postAnnouncementBtn.textContent = '📢 Post Announcement';
  }
});

// Load announcements for management
async function loadAnnouncementsManager() {
  if (!announcementsManager) return;

  database.ref('announcements').on('value', async (snapshot) => {
    announcementsManager.innerHTML = '';

    if (!snapshot.exists()) {
      announcementsManager.innerHTML = '<div class="loading-text">No announcements yet</div>';
      return;
    }

    const announcements = [];
    snapshot.forEach((child) => {
      announcements.push({ id: child.key, ...child.val() });
    });

    // Load user data
    const userIds = [...new Set(announcements.map(ann => ann.author))];
    const userDataMap = {};

    for (const userId of userIds) {
      if (userId && !userDataMap[userId]) {
        const userSnapshot = await database.ref(`users/${userId}`).once('value');
        userDataMap[userId] = userSnapshot.val();
      }
    }

    announcements.forEach((announcement) => {
      const announcementId = announcement.id;
      const userData = userDataMap[announcement.author];
      const avatar = userData ? getAvatar(userData.username, userData, announcement.author) : '<div class="avatar" style="background: #999999">?</div>';
      const username = userData?.username || 'Unknown';
      const isAdmin = userData?.role === 'admin';
      const authorClass = isAdmin ? 'announcement-author-name admin' : 'announcement-author-name';

      const imageHtml = announcement.imageUrl ?
        `<img src="${announcement.imageUrl}" alt="Announcement" class="announcement-image-thumb">` : '';

      const item = document.createElement('div');
      item.className = 'announcement-item';
      item.innerHTML = `
        <div class="announcement-item-header">
          <div>
            <div class="announcement-author-info" style="margin-bottom: 8px;">
              <div class="announcement-avatar">${avatar}</div>
              <div class="announcement-author-details">
                <span class="${authorClass}">${escapeHtml(username)}</span>
                <span class="announcement-date">${formatTime(announcement.timestamp)}</span>
              </div>
            </div>
            <div class="announcement-item-title">${escapeHtml(announcement.title || 'Announcement')}</div>
            <span class="announcement-badge">${escapeHtml(announcement.badge || 'Important')}</span>
          </div>
          <div class="announcement-item-actions">
            <button class="btn-icon" onclick="editAnnouncement('${announcementId}', '${escapeHtml(announcement.title)}', '${escapeHtml(announcement.text)}', '${escapeHtml(announcement.badge)}')">✏️ Edit</button>
            <button class="btn-icon danger" onclick="deleteAnnouncement('${announcementId}')">🗑️ Delete</button>
          </div>
        </div>
        <p class="announcement-text">${escapeHtml(announcement.text)}</p>
        ${imageHtml}
      `;

      announcementsManager.appendChild(item);
    });
  });
}

window.editAnnouncement = function(id, title, text, badge) {
  if (announcementTitle) announcementTitle.value = title;
  announcementText.value = text;
  if (announcementBadge) announcementBadge.value = badge;

  // Change button to update mode
  postAnnouncementBtn.textContent = 'Update Announcement';
  postAnnouncementBtn.onclick = async () => {
    try {
      await database.ref(`announcements/${id}`).update({
        title: announcementTitle?.value.trim() || title,
        text: announcementText.value.trim(),
        badge: announcementBadge?.value || badge,
        edited: true,
        editedAt: Date.now()
      });

      announcementText.value = '';
      if (announcementTitle) announcementTitle.value = '';
      postAnnouncementBtn.textContent = 'Post Announcement';
      postAnnouncementBtn.onclick = null;
      showSuccess('Announcement updated!');
    } catch (error) {
      showError('Failed to update announcement');
    }
  };
};

window.deleteAnnouncement = async function(id) {
  if (!confirm('Delete this announcement?')) return;

  try {
    await database.ref(`announcements/${id}`).remove();
    showSuccess('Announcement deleted');
  } catch (error) {
    showError('Failed to delete announcement');
  }
};

// Load announcements manager when admin page is shown
if (isAdmin && announcementsManager) {
  loadAnnouncementsManager();
}

// ============================================
// STATISTICS DASHBOARD
// ============================================

async function loadStatistics() {
  try {
    // Total Users
    const usersSnapshot = await database.ref('users').once('value');
    const totalUsers = usersSnapshot.numChildren();
    document.getElementById('totalUsers').textContent = totalUsers;

    // Total Messages
    const messagesSnapshot = await database.ref('messages').once('value');
    const totalMessages = messagesSnapshot.numChildren();
    document.getElementById('totalMessages').textContent = totalMessages;

    // Online Users
    const onlineUsers = await database.ref('users').orderByChild('online').equalTo(true).once('value');
    document.getElementById('onlineUsers').textContent = onlineUsers.numChildren();

    // Today's Messages
    const todayStart = new Date().setHours(0, 0, 0, 0);
    let todayCount = 0;
    messagesSnapshot.forEach((child) => {
      const msg = child.val();
      if (msg.timestamp >= todayStart) {
        todayCount++;
      }
    });
    document.getElementById('todayMessages').textContent = todayCount;

    // Update stats every 30 seconds
    setTimeout(loadStatistics, 30000);
  } catch (error) {
    console.error('Failed to load statistics:', error);
  }
}

// Load stats when admin page is shown
auth.onAuthStateChanged((user) => {
  if (user && isAdmin) {
    loadStatistics();
  }
});

// ============================================
// PROFANITY FILTER
// ============================================

const profanityList = [
  'badword1', 'badword2', 'spam', 'scam',
  // Add more words as needed
];

function filterProfanity(text) {
  let filtered = text;
  profanityList.forEach(word => {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  });
  return filtered;
}

function containsProfanity(text) {
  return profanityList.some(word =>
    text.toLowerCase().includes(word.toLowerCase())
  );
}

// ============================================
// RATE LIMITING
// ============================================

const messageTimestamps = [];
const RATE_LIMIT_WINDOW = 10000; // 10 seconds
const MAX_MESSAGES = 5; // Max 5 messages per 10 seconds

function checkRateLimit() {
  const now = Date.now();

  // Remove old timestamps
  while (messageTimestamps.length > 0 && messageTimestamps[0] < now - RATE_LIMIT_WINDOW) {
    messageTimestamps.shift();
  }

  if (messageTimestamps.length >= MAX_MESSAGES) {
    return false; // Rate limit exceeded
  }

  messageTimestamps.push(now);
  return true;
}

// ============================================
// OPERATION LOGS (Admin)
// ============================================

async function logAdminAction(action, targetUserId, details) {
  if (!currentUser) return;

  try {
    await database.ref('adminLogs').push({
      action: action,
      adminId: currentUser.uid,
      targetUserId: targetUserId,
      details: details,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Failed to log action:', error);
  }
}

// Update ban/mute functions to log actions
const originalToggleBan = window.toggleBan;
window.toggleBan = async function(userId, ban) {
  await originalToggleBan(userId, ban);
  await logAdminAction(ban ? 'BAN' : 'UNBAN', userId, { banned: ban });
};

const originalToggleMute = window.toggleMute;
window.toggleMute = async function(userId, mute) {
  await originalToggleMute(userId, mute);
  await logAdminAction(mute ? 'MUTE' : 'UNMUTE', userId, { muted: mute });
};

// ============================================
// AVATAR UPLOAD & MANAGEMENT
// ============================================

const avatarModal = document.getElementById('avatarModal');
const avatarBtn = document.getElementById('avatarBtn');
const closeAvatarModal = document.getElementById('closeAvatarModal');
const avatarPreview = document.getElementById('avatarPreview');
const avatarFileInput = document.getElementById('avatarFileInput');
const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
const saveAvatarBtn = document.getElementById('saveAvatarBtn');
const colorPicker = document.getElementById('colorPicker');

let selectedAvatarData = null;
let selectedColor = null;

// Open avatar modal
if (avatarBtn) {
  avatarBtn.addEventListener('click', async () => {
    avatarModal.classList.add('active');
    await loadCurrentAvatar();
  });
}

// Close avatar modal
if (closeAvatarModal) {
  closeAvatarModal.addEventListener('click', () => {
    avatarModal.classList.remove('active');
  });
}

// Close modal when clicking outside
avatarModal?.addEventListener('click', (e) => {
  if (e.target === avatarModal) {
    avatarModal.classList.remove('active');
  }
});

// Load current avatar
async function loadCurrentAvatar() {
  if (!currentUser) return;

  try {
    const snapshot = await database.ref(`users/${currentUser.uid}`).once('value');
    const userData = snapshot.val();

    if (userData.avatarUrl) {
      // Custom uploaded image
      avatarPreview.innerHTML = `<img src="${userData.avatarUrl}" alt="Avatar">`;
      selectedAvatarData = { type: 'image', url: userData.avatarUrl };
    } else if (userData.avatarColor) {
      // Custom color
      const initials = userData.username.substring(0, 2).toUpperCase();
      avatarPreview.innerHTML = initials;
      avatarPreview.style.background = userData.avatarColor;
      selectedColor = userData.avatarColor;

      // Highlight selected color
      document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.color === userData.avatarColor);
      });
    } else {
      // Default avatar
      const initials = userData.username.substring(0, 2).toUpperCase();
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
        '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
      ];
      const colorIndex = userData.username.charCodeAt(0) % colors.length;
      const color = colors[colorIndex];

      avatarPreview.innerHTML = initials;
      avatarPreview.style.background = color;
    }
  } catch (error) {
    console.error('Failed to load avatar:', error);
  }
}

// Upload avatar button
if (uploadAvatarBtn) {
  uploadAvatarBtn.addEventListener('click', () => {
    avatarFileInput.click();
  });
}

// Handle file selection
if (avatarFileInput) {
  avatarFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showError('Image size must be less than 2MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.innerHTML = `<img src="${e.target.result}" alt="Avatar">`;
      avatarPreview.style.background = 'transparent';
      selectedAvatarData = { type: 'file', file: file, preview: e.target.result };
      selectedColor = null;

      // Deselect all colors
      document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.remove('selected');
      });
    };
    reader.readAsDataURL(file);
  });
}

// Color picker
if (colorPicker) {
  colorPicker.addEventListener('click', async (e) => {
    if (e.target.classList.contains('color-option')) {
      const color = e.target.dataset.color;
      selectedColor = color;

      // Update preview
      const snapshot = await database.ref(`users/${currentUser.uid}`).once('value');
      const userData = snapshot.val();
      const initials = userData.username.substring(0, 2).toUpperCase();

      avatarPreview.innerHTML = initials;
      avatarPreview.style.background = color;
      selectedAvatarData = { type: 'color', color: color };

      // Highlight selected color
      document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.toggle('selected', opt.dataset.color === color);
      });
    }
  });
}

// Save avatar
if (saveAvatarBtn) {
  saveAvatarBtn.addEventListener('click', async () => {
    console.log('Save avatar clicked', selectedAvatarData);

    if (!selectedAvatarData) {
      showError('Please select an avatar');
      return;
    }

    saveAvatarBtn.disabled = true;
    saveAvatarBtn.textContent = 'Saving...';

    try {
      console.log('Starting save process...');
      if (selectedAvatarData.type === 'file') {
        // Save image as base64 to database (simpler than Firebase Storage)
        console.log('Saving image as base64');
        await database.ref(`users/${currentUser.uid}`).update({
          avatarUrl: selectedAvatarData.preview,
          avatarColor: null
        });
        console.log('Image saved successfully');
        showSuccess('Avatar updated successfully!');
      } else if (selectedAvatarData.type === 'color') {
        // Save color to database
        console.log('Saving color:', selectedAvatarData.color);
        await database.ref(`users/${currentUser.uid}`).update({
          avatarColor: selectedAvatarData.color,
          avatarUrl: null
        });
        console.log('Color saved successfully');
        showSuccess('Avatar color updated!');
      }

      avatarModal.classList.remove('active');

      // Update all existing avatars in real-time
      updateAllAvatarsInDOM();

    } catch (error) {
      console.error('Failed to save avatar:', error);
      showError('Failed to save avatar: ' + error.message);
    } finally {
      saveAvatarBtn.disabled = false;
      saveAvatarBtn.textContent = 'Save Avatar';
    }
  });
}

// Update all avatars in DOM without reloading
async function updateAllAvatarsInDOM() {
  if (!currentUser) return;

  try {
    // Get updated user data
    const snapshot = await database.ref(`users/${currentUser.uid}`).once('value');
    const userData = snapshot.val();

    // Update cache
    userCache.set(currentUser.uid, userData);

    // Generate new avatar HTML
    const newAvatarHTML = getAvatar(userData.username, userData);

    // Find all messages from current user and update their avatars
    const messages = messagesContainer.querySelectorAll('.message');
    let updatedCount = 0;

    messages.forEach((messageEl) => {
      // Check if this message belongs to current user by checking the avatar container
      const messageContentWrapper = messageEl.querySelector('.message-content-wrapper');
      if (messageContentWrapper) {
        const authorElement = messageContentWrapper.querySelector('.message-author');
        if (authorElement && authorElement.textContent === userData.username) {
          // This is current user's message, update avatar
          const avatarEl = messageEl.querySelector('.message-avatar');
          if (avatarEl) {
            avatarEl.innerHTML = newAvatarHTML;
            updatedCount++;
          }
        }
      }
    });

    console.log(`Updated ${updatedCount} avatars in real-time`);
    showSuccess('Avatar updated! All your messages now show the new avatar.');
  } catch (error) {
    console.error('Failed to update avatars:', error);
  }
}

// ============================================
// TYPING INDICATOR
// ============================================

const typingIndicator = document.getElementById('typingIndicator');
const typingText = typingIndicator?.querySelector('.typing-text');
let typingUsers = new Map();

// Listen for typing status
database.ref('typing').on('value', (snapshot) => {
  console.log('🔔 Typing status update received');

  if (!currentUser) {
    console.log('❌ No current user, skipping typing indicator');
    return;
  }

  typingUsers.clear();

  snapshot.forEach((child) => {
    const userId = child.key;
    const data = child.val();

    console.log('👤 Typing user:', userId, data);

    // Don't show current user's typing status
    if (userId !== currentUser.uid) {
      // Only show if typed within last 3 seconds
      if (Date.now() - data.timestamp < 3000) {
        typingUsers.set(userId, data.username);
        console.log('✅ Added to typing users:', data.username);
      } else {
        console.log('⏰ Typing status expired for:', data.username);
      }
    } else {
      console.log('🚫 Skipping current user');
    }
  });

  console.log('📊 Total typing users:', typingUsers.size);
  updateTypingIndicator();
});

function updateTypingIndicator() {
  let existingIndicator = messagesContainer.querySelector('.typing-indicator-message');

  if (typingUsers.size === 0) {
    console.log('👻 No typing users, hiding indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }
    return;
  }

  console.log('✅ Showing typing indicator in messages');
  const usernames = Array.from(typingUsers.values());

  let typingText;
  if (usernames.length === 1) {
    typingText = `${usernames[0]} is typing...`;
  } else if (usernames.length === 2) {
    typingText = `${usernames[0]} and ${usernames[1]} are typing...`;
  } else {
    typingText = `${usernames[0]} and ${usernames.length - 1} others are typing...`;
  }

  // Update existing indicator or create new one
  if (existingIndicator) {
    // Just update the text, don't recreate the whole element
    const textSpan = existingIndicator.querySelector('.typing-text');
    if (textSpan && textSpan.textContent !== typingText) {
      textSpan.textContent = typingText;
    }
  } else {
    // Create typing indicator as a message-like element
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator-message';
    typingDiv.style.cssText = `
      padding: 10px 15px;
      margin: 5px 0;
      background: rgba(100, 100, 100, 0.1);
      border-radius: 8px;
      font-style: italic;
      color: #888;
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    typingDiv.innerHTML = `
      <div class="typing-dots" style="display: flex; gap: 4px;">
        <span style="width: 6px; height: 6px; background: #888; border-radius: 50%; animation: typing-bounce 1.4s infinite ease-in-out both; animation-delay: 0s;"></span>
        <span style="width: 6px; height: 6px; background: #888; border-radius: 50%; animation: typing-bounce 1.4s infinite ease-in-out both; animation-delay: 0.2s;"></span>
        <span style="width: 6px; height: 6px; background: #888; border-radius: 50%; animation: typing-bounce 1.4s infinite ease-in-out both; animation-delay: 0.4s;"></span>
      </div>
      <span class="typing-text">${typingText}</span>
    `;

    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  console.log('💬 Typing text:', typingText);
}

// Clean up typing status on logout
logoutBtn.addEventListener('click', async () => {
  if (currentUser) {
    await database.ref(`typing/${currentUser.uid}`).remove();
  }
});

// ============================================
// AUTO MESSAGE CLEANUP
// ============================================

async function autoCleanupMessages() {
  try {
    const messagesSnapshot = await database.ref('messages').once('value');
    const totalMessages = messagesSnapshot.numChildren();

    // 如果消息数量超过限制，执行清理
    if (totalMessages >= MESSAGE_LIMIT) {
      console.log(`🧹 Auto cleanup: ${totalMessages} messages found, cleaning up...`);

      const messages = [];
      messagesSnapshot.forEach(child => {
        messages.push({
          key: child.key,
          timestamp: child.val().timestamp || 0,
          pinned: child.val().pinned || false
        });
      });

      // 过滤掉置顶消息，不删除置顶的消息
      const unpinnedMessages = messages.filter(msg => !msg.pinned);

      // 按时间戳排序（最旧的在前）
      unpinnedMessages.sort((a, b) => a.timestamp - b.timestamp);

      // 计算要删除的消息数量
      const deleteCount = totalMessages - CLEANUP_KEEP;

      if (deleteCount > 0 && unpinnedMessages.length > 0) {
        const messagesToDelete = unpinnedMessages.slice(0, Math.min(deleteCount, unpinnedMessages.length));

        // 批量删除旧消息
        const updates = {};
        messagesToDelete.forEach(msg => {
          updates[`messages/${msg.key}`] = null;
        });

        await database.ref().update(updates);

        console.log(`✅ Cleaned up ${messagesToDelete.length} old messages, kept ${CLEANUP_KEEP} recent messages`);
      }
    }
  } catch (error) {
    console.error('❌ Auto cleanup error:', error);
  }
}

// 每次发送消息后检查是否需要清理
async function checkAndCleanup() {
  // 使用随机延迟，避免多个用户同时触发清理
  const delay = Math.random() * 3000; // 0-3秒随机延迟
  setTimeout(async () => {
    await autoCleanupMessages();
  }, delay);
}

// ============================================
// READ STATUS
// ============================================

// Intersection Observer for marking messages as read
const messageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const messageId = entry.target.dataset.messageId;
      const authorId = entry.target.dataset.authorId;

      // Don't mark own messages as read
      if (authorId !== currentUser?.uid && currentUser) {
        markMessageAsRead(messageId);
      }
    }
  });
}, {
  threshold: 0.5 // Message must be 50% visible
});

function observeMessageVisibility(messageEl, messageId, authorId) {
  messageEl.dataset.authorId = authorId;
  messageObserver.observe(messageEl);
}

async function markMessageAsRead(messageId) {
  if (!currentUser) return;

  try {
    await database.ref(`messages/${messageId}/readBy/${currentUser.uid}`).set({
      username: cachedUsername || currentUser.email,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
}

async function updateReadStatus(messageId, readByData, authorId) {
  const statusEl = document.getElementById(`read-${messageId}`);
  if (!statusEl) return;

  // Don't show read status for own messages to others
  if (authorId === currentUser?.uid) {
    // Show who read my message
    if (readByData) {
      const readers = Object.values(readByData);
      const readerCount = readers.length;

      if (readerCount > 0) {
        const readerNames = readers.slice(0, 3).map(r => r.username).join(', ');
        const moreText = readerCount > 3 ? ` and ${readerCount - 3} more` : '';
        statusEl.innerHTML = `<span class="read-indicator">👁️ Read by ${readerNames}${moreText}</span>`;
      } else {
        statusEl.innerHTML = '';
      }
    } else {
      statusEl.innerHTML = '';
    }
  } else {
    // Don't show read status for others' messages
    statusEl.innerHTML = '';
  }
}

// ============================================
// MENTION AUTOCOMPLETE
// ============================================

// Load all users for mention autocomplete
async function loadUsersForMention() {
  try {
    const usersSnapshot = await database.ref('users').once('value');
    allUsers = [];

    usersSnapshot.forEach(child => {
      const userData = child.val();
      if (userData.username) {
        allUsers.push({
          uid: child.key,
          username: userData.username
        });
      }
    });
  } catch (error) {
    console.error('Error loading users for mention:', error);
  }
}

// Initialize mention autocomplete
function initMentionAutocomplete() {
  const messageInput = document.getElementById('messageInput');
  const autocompleteDiv = document.createElement('div');
  autocompleteDiv.id = 'mentionAutocomplete';
  autocompleteDiv.className = 'mention-autocomplete';
  autocompleteDiv.style.display = 'none';
  messageInput.parentElement.appendChild(autocompleteDiv);

  // Load users
  loadUsersForMention();

  messageInput.addEventListener('input', (e) => {
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;

    // Find @ symbol before cursor
    let atPos = -1;
    for (let i = cursorPos - 1; i >= 0; i--) {
      if (text[i] === '@') {
        atPos = i;
        break;
      }
      if (text[i] === ' ' || text[i] === '\n') {
        break;
      }
    }

    if (atPos !== -1) {
      mentionStartPos = atPos;
      const query = text.substring(atPos + 1, cursorPos).toLowerCase();

      // Filter users
      const matches = allUsers.filter(user =>
        user.username.toLowerCase().startsWith(query)
      ).slice(0, 5);

      if (matches.length > 0 && query.length > 0) {
        showMentionAutocomplete(matches, messageInput);
      } else {
        hideMentionAutocomplete();
      }
    } else {
      hideMentionAutocomplete();
    }
  });

  messageInput.addEventListener('keydown', (e) => {
    const autocomplete = document.getElementById('mentionAutocomplete');
    if (autocomplete.style.display === 'none') return;

    const items = autocomplete.querySelectorAll('.mention-item');
    let selectedIndex = -1;

    items.forEach((item, index) => {
      if (item.classList.contains('selected')) {
        selectedIndex = index;
      }
    });

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % items.length;
      updateMentionSelection(items, selectedIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1;
      updateMentionSelection(items, selectedIndex);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      items[selectedIndex].click();
    } else if (e.key === 'Escape') {
      hideMentionAutocomplete();
    }
  });
}

function showMentionAutocomplete(users, inputEl) {
  const autocomplete = document.getElementById('mentionAutocomplete');
  autocomplete.innerHTML = '';
  autocomplete.style.display = 'block';

  users.forEach((user, index) => {
    const item = document.createElement('div');
    item.className = 'mention-item' + (index === 0 ? ' selected' : '');
    item.textContent = '@' + user.username;
    item.onclick = () => selectMention(user.username, user.uid);
    autocomplete.appendChild(item);
  });

  // Position autocomplete above the input
  autocomplete.style.position = 'absolute';
  autocomplete.style.bottom = '100%';
  autocomplete.style.left = '0';
  autocomplete.style.right = '0';
  autocomplete.style.marginBottom = '8px';
}

function hideMentionAutocomplete() {
  const autocomplete = document.getElementById('mentionAutocomplete');
  if (autocomplete) {
    autocomplete.style.display = 'none';
  }
  mentionStartPos = -1;
}

function updateMentionSelection(items, selectedIndex) {
  items.forEach((item, index) => {
    if (index === selectedIndex) {
      item.classList.add('selected');
    } else {
      item.classList.remove('selected');
    }
  });
}

function selectMention(username, uid) {
  const messageInput = document.getElementById('messageInput');
  const text = messageInput.value;
  const cursorPos = messageInput.selectionStart;

  // Replace from @ to cursor with @username
  const before = text.substring(0, mentionStartPos);
  const after = text.substring(cursorPos);
  const mention = `@${username} `;

  messageInput.value = before + mention + after;
  messageInput.selectionStart = messageInput.selectionEnd = before.length + mention.length;

  // Store mention for notification
  if (!messageInput.dataset.mentions) {
    messageInput.dataset.mentions = JSON.stringify([]);
  }
  const mentions = JSON.parse(messageInput.dataset.mentions);
  if (!mentions.includes(uid)) {
    mentions.push(uid);
    messageInput.dataset.mentions = JSON.stringify(mentions);
  }

  hideMentionAutocomplete();
  messageInput.focus();
}

// ============================================
// ONLINE USERS LIST
// ============================================

// Initialize online users display
function initOnlineUsersList() {
  console.log('🎯 Initializing online users list...');
  console.log('🔍 Database object:', database);
  const container = document.getElementById('onlineUsersList');
  console.log('📦 Container found:', container);

  if (!container) {
    console.error('❌ Container #onlineUsersList not found in DOM!');
    return;
  }

  if (!database) {
    console.error('❌ Firebase database not initialized!');
    return;
  }

  // Listen for status changes
  console.log('👂 Setting up status listener...');
  database.ref('status').on('value', async (snapshot) => {
    console.log('🔄 Status update received, snapshot:', snapshot.val());
    await updateOnlineUsersList(snapshot);
  }, (error) => {
    console.error('❌ Error listening to status:', error);
  });

  console.log('✅ Online users list listener set up successfully');
}

async function updateOnlineUsersList(statusSnapshot) {
  const onlineUsersContainer = document.getElementById('onlineUsersList');
  console.log('📋 Updating online users list, container:', onlineUsersContainer);

  if (!onlineUsersContainer) {
    console.error('❌ Online users container not found!');
    return;
  }

  const onlineUsers = [];

  // Get all online users
  statusSnapshot.forEach(child => {
    const status = child.val();
    if (status && status.online) {
      onlineUsers.push({
        uid: child.key,
        lastSeen: status.lastSeen
      });
    }
  });

  console.log('👥 Found online users:', onlineUsers.length);

  // Get user data for online users
  const userDataPromises = onlineUsers.map(async (user) => {
    const userSnapshot = await database.ref(`users/${user.uid}`).once('value');
    return {
      uid: user.uid,
      ...userSnapshot.val()
    };
  });

  const usersData = await Promise.all(userDataPromises);
  console.log('📊 User data loaded:', usersData);

  // Update display
  if (usersData.length === 0) {
    onlineUsersContainer.innerHTML = '<div class="no-online-users">No users online</div>';
    console.log('⚠️ No users online');
    return;
  }

  // Sort by username
  usersData.sort((a, b) => (a.username || '').localeCompare(b.username || ''));

  // Create formatted user list with colors
  const formattedUsers = usersData.map(user => {
    const isAdmin = user.role === 'admin';
    const username = user.username || 'Unknown';
    return `<span class="online-user-item ${isAdmin ? 'admin' : ''}">${username}</span>`;
  }).join(', ');

  onlineUsersContainer.innerHTML = `
    <div class="online-users-header">
      <strong>Online:</strong> ${formattedUsers}
    </div>
  `;

  console.log('✅ Online users list updated');
}
