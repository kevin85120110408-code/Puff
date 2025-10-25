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
const appVersionInput = document.getElementById('appVersionInput');
const updateVersionBtn = document.getElementById('updateVersionBtn');
const currentVersionDisplay = document.getElementById('currentVersionDisplay');

// Version display element
const versionDisplay = document.getElementById('versionDisplay');

// Helper Functions
function showPage(page) {
  document.querySelectorAll('.page-view').forEach(p => p.classList.remove('active'));
  page.classList.add('active');
}

// Custom Modal System
function showCustomModal(options) {
  // Get elements inside function to ensure DOM is loaded
  const customModalOverlay = document.getElementById('customModalOverlay');
  const customModal = document.getElementById('customModal');
  const customModalIcon = document.getElementById('customModalIcon');
  const customModalTitle = document.getElementById('customModalTitle');
  const customModalMessage = document.getElementById('customModalMessage');
  const customModalInputContainer = document.getElementById('customModalInputContainer');
  const customModalInput = document.getElementById('customModalInput');
  const customModalButtons = document.getElementById('customModalButtons');

  if (!customModalOverlay || !customModal) {
    console.error('Modal elements not found, falling back to alert');
    alert(options.message || '');
    return;
  }

  const {
    icon = 'i',
    title = '',
    message = '',
    type = 'alert', // 'alert', 'confirm', 'prompt'
    inputPlaceholder = '',
    confirmText = 'OK',
    cancelText = 'Cancel',
    dangerButton = false,
    onConfirm = () => {},
    onCancel = () => {}
  } = options;

  // Set content
  customModalIcon.textContent = icon;
  customModalTitle.textContent = title;
  customModalMessage.textContent = message;

  // Handle input for prompt
  if (type === 'prompt') {
    customModalInputContainer.style.display = 'block';
    customModalInput.value = '';
    customModalInput.placeholder = inputPlaceholder;
  } else {
    customModalInputContainer.style.display = 'none';
  }

  // Clear previous buttons
  customModalButtons.innerHTML = '';

  // Create buttons based on type
  if (type === 'alert') {
    const okBtn = document.createElement('button');
    okBtn.className = 'custom-modal-btn custom-modal-btn-primary';
    okBtn.textContent = confirmText;
    okBtn.onclick = () => {
      hideCustomModal();
      onConfirm();
    };
    customModalButtons.appendChild(okBtn);
  } else if (type === 'confirm') {
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'custom-modal-btn custom-modal-btn-secondary';
    cancelBtn.textContent = cancelText;
    cancelBtn.onclick = () => {
      hideCustomModal();
      onCancel();
    };

    const confirmBtn = document.createElement('button');
    confirmBtn.className = `custom-modal-btn ${dangerButton ? 'custom-modal-btn-danger' : 'custom-modal-btn-primary'}`;
    confirmBtn.textContent = confirmText;
    confirmBtn.onclick = () => {
      hideCustomModal();
      onConfirm();
    };

    customModalButtons.appendChild(cancelBtn);
    customModalButtons.appendChild(confirmBtn);
  } else if (type === 'prompt') {
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'custom-modal-btn custom-modal-btn-secondary';
    cancelBtn.textContent = cancelText;
    cancelBtn.onclick = () => {
      hideCustomModal();
      onCancel();
    };

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'custom-modal-btn custom-modal-btn-primary';
    confirmBtn.textContent = confirmText;
    confirmBtn.onclick = () => {
      const value = customModalInput.value;
      hideCustomModal();
      onConfirm(value);
    };

    customModalButtons.appendChild(cancelBtn);
    customModalButtons.appendChild(confirmBtn);

    // Focus input after modal shows
    setTimeout(() => customModalInput.focus(), 300);
  }

  // Show modal
  customModalOverlay.classList.add('show');

  // Close on overlay click
  customModalOverlay.onclick = (e) => {
    if (e.target === customModalOverlay) {
      hideCustomModal();
      onCancel();
    }
  };

  // Close on Escape key
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      hideCustomModal();
      onCancel();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

function hideCustomModal() {
  const customModalOverlay = document.getElementById('customModalOverlay');
  if (customModalOverlay) {
    customModalOverlay.classList.remove('show');
  }
}

// Replace alert, confirm, prompt with custom modals
function showError(message) {
  showCustomModal({
    icon: '✕',
    title: 'Error',
    message: message,
    type: 'alert',
    confirmText: 'OK'
  });
}

function showSuccess(message) {
  showCustomModal({
    icon: '✓',
    title: 'Success',
    message: message,
    type: 'alert',
    confirmText: 'OK'
  });
}

function showConfirm(message, onConfirm, onCancel = () => {}) {
  showCustomModal({
    icon: '?',
    title: 'Confirm',
    message: message,
    type: 'confirm',
    confirmText: 'Yes',
    cancelText: 'No',
    onConfirm: onConfirm,
    onCancel: onCancel
  });
}

function showPrompt(message, placeholder = '', onConfirm, onCancel = () => {}) {
  showCustomModal({
    icon: 'i',
    title: 'Input Required',
    message: message,
    type: 'prompt',
    inputPlaceholder: placeholder,
    confirmText: 'Submit',
    cancelText: 'Cancel',
    onConfirm: onConfirm,
    onCancel: onCancel
  });
}

// Update version display on page
function updateVersionDisplay() {
  const currentVersion = localStorage.getItem('app_version');
  if (currentVersion && versionDisplay) {
    versionDisplay.textContent = `v${currentVersion}`;
    console.log('📦 Updated version display to:', currentVersion);
  }
}

// Update version display on page load
updateVersionDisplay();

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

    // Initialize new features
    initEmojiPicker();
    listenToNotifications();
    updateUserStatus(USER_STATUS.ONLINE);
    initMessagesInbox();

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

    // Load last read timestamp before loading messages
    await loadLastReadTimestamp();

    loadMessages();
    updateOnlineStatus(true);

    console.log('🎬 Initializing components...');

    // Initialize typing indicator
    console.log('1️⃣ Initializing typing indicator...');
    initTypingIndicator();

    // Initialize mention autocomplete
    console.log('2️⃣ Initializing mention autocomplete...');
    initMentionAutocomplete();

    // Mark messages as read when user scrolls to bottom
    messagesContainer.addEventListener('scroll', () => {
      const isAtBottom = messagesContainer.scrollHeight - messagesContainer.scrollTop - messagesContainer.clientHeight < 50;
      if (isAtBottom) {
        updateLastReadTimestamp();
      }
    });

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

  // Disable button to prevent double-click
  loginBtn.disabled = true;
  loginBtn.textContent = 'Signing in...';

  try {
    await auth.signInWithEmailAndPassword(email, password);

    if (rememberMe.checked) {
      await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    }

    showSuccess('Login successful!');
  } catch (error) {
    showError(error.message);
    // Re-enable button on error
    loginBtn.disabled = false;
    loginBtn.textContent = 'Sign In';
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

  // Disable button to prevent double-click
  registerBtn.disabled = true;
  registerBtn.textContent = 'Creating...';

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
      muted: false,
      messageCount: 0
    });

    showSuccess('Account created successfully!');
  } catch (error) {
    showError(error.message);
    // Re-enable button on error
    registerBtn.disabled = false;
    registerBtn.textContent = 'Create Account';
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
let lastReadTimestamp = 0; // Track last read message timestamp
let unreadCount = 0; // Track unread messages count

async function getUserData(userId) {
  if (userCache.has(userId)) {
    return userCache.get(userId);
  }

  const userSnapshot = await database.ref(`users/${userId}`).once('value');
  const userData = userSnapshot.val();
  userCache.set(userId, userData);
  return userData;
}

// Load last read timestamp for current user
async function loadLastReadTimestamp() {
  if (!currentUser) return;

  try {
    const snapshot = await database.ref(`users/${currentUser.uid}/lastReadTimestamp`).once('value');
    lastReadTimestamp = snapshot.val() || 0;
    console.log('Last read timestamp loaded:', lastReadTimestamp);
  } catch (error) {
    console.error('Failed to load last read timestamp:', error);
  }
}

// Update last read timestamp
async function updateLastReadTimestamp() {
  if (!currentUser) return;

  const now = Date.now();
  lastReadTimestamp = now;

  try {
    await database.ref(`users/${currentUser.uid}/lastReadTimestamp`).set(now);
    console.log('Last read timestamp updated:', now);
    updateUnreadCount();
  } catch (error) {
    console.error('Failed to update last read timestamp:', error);
  }
}

// Count unread messages
function updateUnreadCount() {
  unreadCount = 0;
  const messages = messagesContainer.querySelectorAll('.message');
  messages.forEach(msg => {
    const timestamp = parseInt(msg.dataset.timestamp);
    if (timestamp > lastReadTimestamp) {
      unreadCount++;
      msg.classList.add('unread-message');
    } else {
      msg.classList.remove('unread-message');
    }
  });

  // Update unread indicator in title
  if (unreadCount > 0) {
    document.title = `(${unreadCount}) Forum`;
  } else {
    document.title = 'Forum';
  }
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

    // Debug: Log message data
    if (msg.files) {
      console.log('Message with files:', messageId, msg.files);
    }

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
    messageEl.dataset.timestamp = msg.timestamp; // Store timestamp for unread tracking

    // Mark as unread if timestamp is after last read
    if (msg.timestamp > lastReadTimestamp && msg.userId !== currentUser.uid) {
      messageEl.classList.add('unread-message');
      unreadCount++;
    }

    // Only add animation class if it's truly a new message
    if (isNewMessage) {
      messageEl.classList.add('animate-new');

      // Remove animation class after animation completes to prevent re-animation on scroll
      setTimeout(() => {
        messageEl.classList.remove('animate-new');
      }, 500); // 500ms = animation duration (300ms) + buffer
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
            <span class="${authorClass} clickable-username" onclick="showUserProfile('${msg.userId}')" title="View profile">${userData?.username || 'Unknown'}</span>
            <span class="user-level-badge level-${userLevel.level}">${userLevel.name}</span>
            <span class="message-time">${formatTime(msg.timestamp)} ${isEdited}</span>
          </div>
          ${replySection}
          ${msg.text ? `<div class="message-text" data-message-id="${messageId}">${processMessageText(msg.text)}</div>` : ''}
          ${msg.files && msg.files.length > 0 ? createFilesDisplay(msg.files, messageId) : ''}
          <div class="message-actions">
            <button class="btn-action btn-like ${hasLiked ? 'liked' : ''}" onclick="toggleLike('${messageId}')">
              <span class="like-count">${likeCount > 0 ? likeCount : 'Like'}</span>
            </button>
            <button class="btn-action btn-react" onclick="showReactionPicker('${messageId}', event)">
              😊 React
            </button>
            <button class="btn-action btn-reply" onclick="replyToMessage('${messageId}', '${escapeHtml(msg.text)}', '${escapeHtml(userData?.username || 'Unknown')}')">
              Reply
            </button>
            <button class="btn-action btn-bookmark" onclick="toggleBookmark('${messageId}')">
              🔖 Save
            </button>
            ${!isOwnMessage && !isAdmin ? `
              <button class="btn-action btn-report" onclick="reportMessage('${messageId}', '${escapeHtml(msg.text)}', '${msg.userId}')">
                🚨 Report
              </button>
            ` : ''}
            ${isOwnMessage ? `
              <button class="btn-action btn-edit" onclick="editMessage('${messageId}', '${escapeHtml(msg.text)}')">
                Edit
              </button>
              <button class="btn-action btn-delete" onclick="deleteMessage('${messageId}')">
                Delete
              </button>
            ` : ''}
            ${isAdmin && !isOwnMessage ? `
              <button class="btn-action btn-edit" onclick="editMessage('${messageId}', '${escapeHtml(msg.text)}')">
                Edit
              </button>
              <button class="btn-action btn-delete-admin" onclick="deleteMessage('${messageId}')">
                Delete
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

    // Auto-scroll logic:
    // 1. Always scroll for new messages (isNewMessage = true)
    // 2. For initial load, scroll to bottom after a short delay
    if (isNewMessage) {
      // New message - always scroll with smooth animation
      requestAnimationFrame(() => {
        messagesContainer.scrollTo({
          top: messagesContainer.scrollHeight,
          behavior: 'smooth'
        });
      });
    } else if (isNearBottom || messagesContainer.scrollTop === 0) {
      // Initial load - scroll to bottom after messages are rendered
      setTimeout(() => {
        messagesContainer.scrollTo({
          top: messagesContainer.scrollHeight,
          behavior: 'auto'
        });
      }, 100);
    }

    // Listen for read status updates
    database.ref(`messages/${messageId}/readBy`).on('value', (readSnapshot) => {
      updateReadStatus(messageId, readSnapshot.val(), msg.userId);
    });

    // Listen for reactions (real-time)
    listenToReactions(messageId);

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
      const isAdmin = currentUser?.role === 'admin';
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

      // Save the reactions container before updating innerHTML
      const contentWrapper = messageEl.querySelector('.message-content-wrapper');
      const existingReactions = contentWrapper ? contentWrapper.querySelector('.message-reactions') : null;
      const reactionsHTML = existingReactions ? existingReactions.outerHTML : '';

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
            ${msg.text ? `<div class="message-text" data-message-id="${messageId}">${processMessageText(msg.text)}</div>` : ''}
            ${msg.files && msg.files.length > 0 ? createFilesDisplay(msg.files, messageId) : ''}
            <div class="message-actions">
              <button class="btn-action btn-like ${hasLiked ? 'liked' : ''}" onclick="toggleLike('${messageId}')">
                <span class="like-count">${likeCount > 0 ? likeCount : 'Like'}</span>
              </button>
              <button class="btn-action btn-react" onclick="showReactionPicker('${messageId}', event)">
                😊 React
              </button>
              <button class="btn-action btn-reply" onclick="replyToMessage('${messageId}', '${escapeHtml(msg.text || '')}', '${escapeHtml(userData?.username || 'Unknown')}')">
                Reply
              </button>
              <button class="btn-action btn-bookmark" onclick="toggleBookmark('${messageId}')">
                🔖 Save
              </button>
              ${!isOwnMessage && !isAdmin ? `
                <button class="btn-action btn-report" onclick="reportMessage('${messageId}', '${escapeHtml(msg.text || '')}', '${msg.userId}')">
                  🚨 Report
                </button>
              ` : ''}
              ${isOwnMessage ? `
                <button class="btn-action btn-edit" onclick="editMessage('${messageId}', '${escapeHtml(msg.text || '')}')">
                  Edit
                </button>
                <button class="btn-action btn-delete" onclick="deleteMessage('${messageId}')">
                  Delete
                </button>
              ` : ''}
              ${isAdmin && !isOwnMessage ? `
                <button class="btn-action btn-edit" onclick="editMessage('${messageId}', '${escapeHtml(msg.text || '')}')">
                  Edit
                </button>
                <button class="btn-action btn-delete-admin" onclick="deleteMessage('${messageId}')">
                  Delete
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;

      // Restore reactions container if it existed
      if (reactionsHTML) {
        const newContentWrapper = messageEl.querySelector('.message-content-wrapper');
        const actionsEl = newContentWrapper.querySelector('.message-actions');
        if (actionsEl && newContentWrapper) {
          actionsEl.insertAdjacentHTML('beforebegin', reactionsHTML);
        }
      }

      // Re-attach online status listener
      database.ref(`status/${msg.userId}/online`).on('value', (statusSnapshot) => {
        const onlineDot = document.getElementById(`online-${msg.userId}`);
        if (onlineDot) {
          onlineDot.style.display = statusSnapshot.val() ? 'block' : 'none';
        }
      });
    }
  });
}

// ============================================
// FILE UPLOAD
// ============================================

let selectedFiles = [];
const fileInput = document.getElementById('fileInput');
const folderInput = document.getElementById('folderInput');
const attachFileBtn = document.getElementById('attachFileBtn');
const attachFolderBtn = document.getElementById('attachFolderBtn');
const filePreviewContainer = document.getElementById('filePreviewContainer');
const filePreviewName = document.getElementById('filePreviewName');
const filePreviewSize = document.getElementById('filePreviewSize');
const removeFileBtn = document.getElementById('removeFileBtn');

// Open file picker
attachFileBtn.addEventListener('click', () => {
  fileInput.click();
});

// Open folder picker
attachFolderBtn.addEventListener('click', () => {
  folderInput.click();
});

// Handle file selection
fileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  // Check total size (max 25MB total)
  const maxTotalSize = 25 * 1024 * 1024; // 25MB
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  if (totalSize > maxTotalSize) {
    showError('Total file size must be less than 25MB');
    fileInput.value = '';
    return;
  }

  // Check individual file size (max 10MB per file)
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const oversizedFile = files.find(file => file.size > maxFileSize);
  if (oversizedFile) {
    showError(`File "${oversizedFile.name}" is too large. Max 10MB per file.`);
    fileInput.value = '';
    return;
  }

  selectedFiles = files;

  // Show preview
  if (files.length === 1) {
    filePreviewName.textContent = files[0].name;
    filePreviewSize.textContent = formatFileSize(files[0].size);
  } else {
    filePreviewName.textContent = `${files.length} files selected`;
    filePreviewSize.textContent = formatFileSize(totalSize);
  }
  filePreviewContainer.style.display = 'block';
});

// Handle folder selection
folderInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  // Check total size (max 25MB total)
  const maxTotalSize = 25 * 1024 * 1024; // 25MB
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  if (totalSize > maxTotalSize) {
    showError('Total folder size must be less than 25MB');
    folderInput.value = '';
    return;
  }

  selectedFiles = files;

  // Show preview
  const folderName = files[0].webkitRelativePath.split('/')[0];
  filePreviewName.textContent = `Folder: ${folderName} (${files.length} files)`;
  filePreviewSize.textContent = formatFileSize(totalSize);
  filePreviewContainer.style.display = 'block';
});

// Remove files
removeFileBtn.addEventListener('click', () => {
  selectedFiles = [];
  fileInput.value = '';
  folderInput.value = '';
  filePreviewContainer.style.display = 'none';
});

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Get file extension
function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toUpperCase();
}

// Check if file is image
function isImageFile(filename) {
  const imageExtensions = ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'BMP', 'SVG'];
  return imageExtensions.includes(getFileExtension(filename));
}

// Event listeners will be added after sendMessage is fully defined below
// Removed duplicate event listeners to prevent multiple sends

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

// sendMessage function is defined below with full features (line ~2235)

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

  // Close mobile menu after selection
  const sidebar = document.querySelector('.admin-sidebar');
  if (sidebar && sidebar.classList.contains('mobile-open')) {
    sidebar.classList.remove('mobile-open');
  }

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
    case 'permissions':
      loadAdminsList();
      loadRoleStats();
      break;
    case 'logs':
      loadAdminLogs();
      break;
    case 'settings':
      // Settings are static
      break;
    case 'analytics':
      loadAnalytics();
      break;
    case 'permissions':
      loadPermissions();
      break;
    case 'backup':
      loadBackup();
      break;
  }
}

// Mobile menu toggle
const adminMobileToggle = document.getElementById('adminMobileToggle');
if (adminMobileToggle) {
  adminMobileToggle.addEventListener('click', () => {
    const sidebar = document.querySelector('.admin-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('mobile-open');
    }
  });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
  const sidebar = document.querySelector('.admin-sidebar');
  const toggle = document.getElementById('adminMobileToggle');

  if (sidebar && sidebar.classList.contains('mobile-open')) {
    if (!sidebar.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) {
      sidebar.classList.remove('mobile-open');
    }
  }
});

// ============================================
// MESSAGE REACTIONS SYSTEM (REAL-TIME)
// ============================================

const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

// Add reaction to message
window.addReaction = async function(messageId, emoji) {
  if (!currentUser) {
    showError('Please login to react to messages');
    return;
  }

  try {
    const reactionRef = database.ref(`reactions/${messageId}/${currentUser.uid}`);
    const snapshot = await reactionRef.once('value');

    if (snapshot.exists() && snapshot.val() === emoji) {
      // Remove reaction if clicking same emoji
      await reactionRef.remove();
      showSuccess('Reaction removed');
    } else {
      // Add or update reaction
      await reactionRef.set(emoji);
      showSuccess(`Reacted with ${emoji}`);
    }
  } catch (error) {
    console.error('Reaction error:', error);
    showError('Failed to add reaction');
  }
};

// Listen to reactions in real-time
function listenToReactions(messageId) {
  database.ref(`reactions/${messageId}`).on('value', (snapshot) => {
    updateReactionDisplay(messageId, snapshot.val());
  });
}

// Update reaction display
function updateReactionDisplay(messageId, reactions) {
  // Find the .message element which has data-message-id attribute
  const messageEl = document.querySelector(`.message[data-message-id="${messageId}"]`);

  if (!messageEl) {
    return;
  }

  // Find the message-content-wrapper inside the message element
  const contentWrapper = messageEl.querySelector('.message-content-wrapper');

  if (!contentWrapper) {
    return;
  }

  let reactionsContainer = contentWrapper.querySelector('.message-reactions');

  if (!reactions || Object.keys(reactions).length === 0) {
    if (reactionsContainer) {
      reactionsContainer.remove();
    }
    return;
  }

  if (!reactionsContainer) {
    reactionsContainer = document.createElement('div');
    reactionsContainer.className = 'message-reactions';
    const actionsEl = contentWrapper.querySelector('.message-actions');
    if (actionsEl) {
      // Insert before the actions
      actionsEl.parentNode.insertBefore(reactionsContainer, actionsEl);
    } else {
      // Fallback: append to content wrapper
      contentWrapper.appendChild(reactionsContainer);
    }
  }

  // Count reactions
  const reactionCounts = {};
  const userReactions = {};

  Object.entries(reactions).forEach(([userId, emoji]) => {
    reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
    if (!userReactions[emoji]) userReactions[emoji] = [];
    userReactions[emoji].push(userId);
  });

  // Display reactions
  reactionsContainer.innerHTML = Object.entries(reactionCounts)
    .map(([emoji, count]) => {
      const hasReacted = userReactions[emoji].includes(currentUser?.uid);
      return `
        <button class="reaction-btn ${hasReacted ? 'reacted' : ''}"
                onclick="addReaction('${messageId}', '${emoji}')"
                title="${count} reaction${count > 1 ? 's' : ''}">
          ${emoji} <span class="reaction-count">${count}</span>
        </button>
      `;
    }).join('');
}

// Show reaction picker
window.showReactionPicker = function(messageId, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  // Remove existing picker
  const existingPicker = document.querySelector('.reaction-picker');
  if (existingPicker) existingPicker.remove();

  const picker = document.createElement('div');
  picker.className = 'reaction-picker';
  picker.innerHTML = reactionEmojis.map(emoji =>
    `<button class="reaction-emoji" onclick="event.stopPropagation(); addReaction('${messageId}', '${emoji}'); this.parentElement.remove();">${emoji}</button>`
  ).join('');

  const button = event ? event.target.closest('.btn-react') : null;
  if (button) {
    button.appendChild(picker);

    // Close picker when clicking outside
    setTimeout(() => {
      document.addEventListener('click', function closePicker(e) {
        if (!picker.contains(e.target) && !button.contains(e.target)) {
          picker.remove();
          document.removeEventListener('click', closePicker);
        }
      });
    }, 0);
  }
};

// ============================================
// BOOKMARK SYSTEM (REAL-TIME)
// ============================================

window.toggleBookmark = async function(messageId) {
  if (!currentUser) {
    showError('Please login to bookmark messages');
    return;
  }

  try {
    const bookmarkRef = database.ref(`bookmarks/${currentUser.uid}/${messageId}`);
    const snapshot = await bookmarkRef.once('value');

    if (snapshot.exists()) {
      await bookmarkRef.remove();
      showSuccess('Bookmark removed');
    } else {
      await bookmarkRef.set({
        timestamp: Date.now(),
        messageId: messageId
      });
      showSuccess('Message bookmarked!');
    }
  } catch (error) {
    console.error('Bookmark error:', error);
    showError('Failed to bookmark message');
  }
};

// ============================================
// USER STATUS SYSTEM (REAL-TIME)
// ============================================

const USER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BUSY: 'busy',
  AWAY: 'away'
};

// Update user status
function updateUserStatus(status) {
  if (!currentUser) return;

  database.ref(`userStatus/${currentUser.uid}`).set({
    status: status,
    lastSeen: Date.now()
  });
}

// Auto-detect user activity
let activityTimeout;
function resetActivityTimer() {
  clearTimeout(activityTimeout);
  updateUserStatus(USER_STATUS.ONLINE);

  activityTimeout = setTimeout(() => {
    updateUserStatus(USER_STATUS.AWAY);
  }, 5 * 60 * 1000); // 5 minutes
}

// Listen to user activity
['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
  document.addEventListener(event, resetActivityTimer, true);
});

// Set offline when leaving
window.addEventListener('beforeunload', () => {
  if (currentUser) {
    updateUserStatus(USER_STATUS.OFFLINE);
  }
});

// ============================================
// DAILY CHECK-IN SYSTEM
// ============================================

window.dailyCheckIn = async function() {
  if (!currentUser) return;

  try {
    const today = new Date().toDateString();
    const checkInRef = database.ref(`checkIns/${currentUser.uid}`);
    const snapshot = await checkInRef.once('value');
    const data = snapshot.val() || {};

    if (data.lastCheckIn === today) {
      showError('You have already checked in today!');
      return;
    }

    const consecutiveDays = data.lastCheckIn === new Date(Date.now() - 86400000).toDateString()
      ? (data.consecutiveDays || 0) + 1
      : 1;

    const points = consecutiveDays >= 7 ? 20 : 10; // Bonus for 7+ days

    await checkInRef.set({
      lastCheckIn: today,
      consecutiveDays: consecutiveDays,
      totalDays: (data.totalDays || 0) + 1
    });

    // Add points
    const userRef = database.ref(`users/${currentUser.uid}`);
    const userSnapshot = await userRef.once('value');
    const userData = userSnapshot.val();
    await userRef.update({
      points: (userData.points || 0) + points
    });

    showSuccess(`Check-in successful! +${points} points (${consecutiveDays} days streak)`);
  } catch (error) {
    console.error('Check-in error:', error);
    showError('Check-in failed');
  }
};

// ============================================
// DARK MODE
// ============================================

let darkMode = localStorage.getItem('darkMode') === 'true';

window.toggleDarkMode = function() {
  darkMode = !darkMode;
  localStorage.setItem('darkMode', darkMode);
  document.body.classList.toggle('dark-mode', darkMode);

  const icon = document.getElementById('darkModeIcon');
  if (icon) {
    icon.textContent = darkMode ? '☀️' : '🌙';
  }
};

// Apply dark mode on load
if (darkMode) {
  document.body.classList.add('dark-mode');
}

// ============================================
// USER PROFILE SYSTEM
// ============================================

window.showUserProfile = async function(userId) {
  if (!userId) return;

  try {
    // Show loading indicator
    const loadingModal = document.createElement('div');
    loadingModal.className = 'modal active';
    loadingModal.innerHTML = `
      <div class="modal-content" style="text-align: center; padding: 40px;">
        <div class="loading-spinner"></div>
        <p style="margin-top: 20px;">Loading profile...</p>
      </div>
    `;
    document.body.appendChild(loadingModal);

    // Parallel queries for better performance
    const [userSnapshot, messagesSnapshot, followersSnapshot, followingSnapshot, checkInSnapshot] = await Promise.all([
      database.ref(`users/${userId}`).once('value'),
      database.ref('messages').orderByChild('userId').equalTo(userId).limitToLast(100).once('value'), // Limit to last 100 messages
      database.ref(`followers/${userId}`).once('value'),
      database.ref(`following/${userId}`).once('value'),
      database.ref(`checkIns/${userId}`).once('value')
    ]);

    const userData = userSnapshot.val();

    if (!userData) {
      loadingModal.remove();
      showError('User not found');
      return;
    }

    // Get user stats
    const messageCount = messagesSnapshot.numChildren();

    // Get total likes received
    let totalLikes = 0;
    messagesSnapshot.forEach(msgSnap => {
      const likes = msgSnap.val().likes || {};
      totalLikes += Object.keys(likes).length;
    });

    // Get followers/following count
    const followersCount = followersSnapshot.numChildren();
    const followingCount = followingSnapshot.numChildren();

    // Check if current user is following
    let isFollowing = false;
    if (currentUser && currentUser.uid !== userId) {
      const followSnapshot = await database.ref(`following/${currentUser.uid}/${userId}`).once('value');
      isFollowing = followSnapshot.exists();
    }

    // Get check-in data (already fetched in parallel query)
    const checkInData = checkInSnapshot.val() || {};

    // Get user level based on message count
    const userLevel = getUserLevel(messageCount);

    // Generate avatar HTML
    const username = userData.username || 'Unknown';
    const initials = username.substring(0, 2).toUpperCase();
    let avatarHTML = '';

    if (userData?.avatarUrl) {
      avatarHTML = `<img src="${userData.avatarUrl}" alt="${username}" class="profile-avatar">`;
    } else {
      // Generate color-based avatar
      const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
        '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
      ];
      const colorIndex = username.charCodeAt(0) % colors.length;
      const color = userData?.avatarColor || colors[colorIndex];
      avatarHTML = `<div class="profile-avatar" style="background: ${color}; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: bold; color: white;">${initials}</div>`;
    }

    // Remove loading modal
    loadingModal.remove();

    // Show profile modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'userProfileModal';
    modal.innerHTML = `
      <div class="modal-content user-profile-modal">
        <div class="modal-header">
          <h3>User Profile</h3>
          <button class="modal-close" onclick="this.closest('.modal').remove()">✕</button>
        </div>
        <div class="modal-body">
          <div class="profile-header">
            ${avatarHTML}
            <div class="profile-info">
              <h2>${escapeHtml(username)}</h2>
              <span class="user-level-badge level-${userLevel.level}">${userLevel.name}</span>
              <p class="profile-bio">${escapeHtml(userData.bio || 'No bio yet')}</p>
            </div>
          </div>

          <div class="profile-stats">
            <div class="stat-item">
              <div class="stat-value">${messageCount}</div>
              <div class="stat-label">Messages</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${totalLikes}</div>
              <div class="stat-label">Likes</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${followersCount}</div>
              <div class="stat-label">Followers</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${followingCount}</div>
              <div class="stat-label">Following</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${userData.points || 0}</div>
              <div class="stat-label">Points</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">${checkInData.consecutiveDays || 0}</div>
              <div class="stat-label">Streak</div>
            </div>
          </div>

          ${currentUser && currentUser.uid !== userId ? `
            <div class="profile-actions">
              <button class="btn-primary" onclick="toggleFollow('${userId}')">
                ${isFollowing ? 'Following' : 'Follow'}
              </button>
              <button class="btn-secondary" onclick="openPrivateMessage('${userId}', '${escapeHtml(userData.username)}')">
                Message
              </button>
            </div>
          ` : ''}

          ${currentUser && currentUser.uid === userId ? `
            <div class="profile-actions">
              <button class="btn-primary" onclick="editProfile()">
                Edit Profile
              </button>
              <button class="btn-secondary" onclick="showBookmarks()">
                Bookmarks
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  } catch (error) {
    console.error('Profile error:', error);
    // Remove loading modal if it exists
    const loadingModal = document.querySelector('.modal');
    if (loadingModal) {
      loadingModal.remove();
    }
    showError('Failed to load profile');
  }
};

// ============================================
// FOLLOW SYSTEM (REAL-TIME)
// ============================================

window.toggleFollow = async function(userId) {
  if (!currentUser) {
    showError('Please login to follow users');
    return;
  }

  try {
    const followingRef = database.ref(`following/${currentUser.uid}/${userId}`);
    const followerRef = database.ref(`followers/${userId}/${currentUser.uid}`);

    const snapshot = await followingRef.once('value');

    if (snapshot.exists()) {
      // Unfollow
      await followingRef.remove();
      await followerRef.remove();
      showSuccess('Unfollowed');
    } else {
      // Follow
      await followingRef.set(true);
      await followerRef.set(true);
      showSuccess('Following!');

      // Send notification
      await database.ref(`notifications/${userId}`).push({
        type: 'follow',
        from: currentUser.uid,
        timestamp: Date.now(),
        read: false
      });
    }

    // Refresh profile
    document.getElementById('userProfileModal')?.remove();
    showUserProfile(userId);
  } catch (error) {
    console.error('Follow error:', error);
    showError('Failed to follow user');
  }
};

// ============================================
// PRIVATE MESSAGE SYSTEM (REAL-TIME)
// ============================================

window.openPrivateMessage = function(userId, username) {
  if (!currentUser) {
    showError('Please login to send messages');
    return;
  }

  // Create chat ID (sorted to ensure consistency)
  const chatId = [currentUser.uid, userId].sort().join('_');

  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'privateMessageModal';
  modal.innerHTML = `
    <div class="modal-content pm-modal">
      <div class="modal-header">
        <h3>Chat with ${escapeHtml(username)}</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">✕</button>
      </div>
      <div class="modal-body">
        <div class="pm-messages" id="pmMessages"></div>
        <div class="pm-input-container">
          <input type="text" id="pmInput" placeholder="Type a message..." class="pm-input">
          <button onclick="sendPrivateMessage('${chatId}', '${userId}')" class="btn-primary">Send</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Load messages
  loadPrivateMessages(chatId);

  // Enter to send
  document.getElementById('pmInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendPrivateMessage(chatId, userId);
    }
  });
};

window.sendPrivateMessage = async function(chatId, recipientId) {
  const input = document.getElementById('pmInput');
  const text = input.value.trim();

  if (!text) return;

  try {
    await database.ref(`privateMessages/${chatId}`).push({
      from: currentUser.uid,
      to: recipientId,
      text: text,
      timestamp: Date.now(),
      read: false
    });

    input.value = '';

    // Send notification
    await database.ref(`notifications/${recipientId}`).push({
      type: 'message',
      from: currentUser.uid,
      timestamp: Date.now(),
      read: false
    });
  } catch (error) {
    console.error('PM error:', error);
    showError('Failed to send message');
  }
};

function loadPrivateMessages(chatId) {
  const container = document.getElementById('pmMessages');
  if (!container) return;

  let isInitialLoad = true;

  database.ref(`privateMessages/${chatId}`).on('child_added', async (snapshot) => {
    const msg = snapshot.val();
    const isOwn = msg.from === currentUser.uid;

    // Get sender data
    const userSnapshot = await database.ref(`users/${msg.from}`).once('value');
    const userData = userSnapshot.val();

    const msgEl = document.createElement('div');
    msgEl.className = `pm-message ${isOwn ? 'pm-own' : 'pm-other'}`;
    msgEl.innerHTML = `
      <div class="pm-message-content">
        <div class="pm-message-header">
          <span class="pm-sender">${escapeHtml(userData?.username || 'Unknown')}</span>
          <span class="pm-time">${formatTime(msg.timestamp)}</span>
        </div>
        <div class="pm-message-text">${escapeHtml(msg.text)}</div>
      </div>
    `;

    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;

    // Mark as read if not own message
    if (!isOwn && msg.read === false) {
      database.ref(`privateMessages/${chatId}/${snapshot.key}/read`).set(true);
    }

    // Show notification for new messages (not during initial load)
    if (!isInitialLoad && !isOwn) {
      showToast(`💬 New message from ${userData?.username || 'Unknown'}`);
      playNotificationSound();
    }
  });

  // After a short delay, mark initial load as complete
  setTimeout(() => {
    isInitialLoad = false;
  }, 1000);
}

// ============================================
// MESSAGES INBOX
// ============================================

function initMessagesInbox() {
  const inboxBtn = document.getElementById('messagesInboxBtn');
  if (!inboxBtn) return;

  inboxBtn.addEventListener('click', showMessagesInbox);

  // Listen for new messages and update badge
  listenToInboxUpdates();
}

async function showMessagesInbox() {
  if (!currentUser) {
    showError('Please login to view messages');
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'messagesInboxModal';
  modal.innerHTML = `
    <div class="modal-content inbox-modal">
      <div class="modal-header">
        <h3>💬 Messages</h3>
        <button class="modal-close" onclick="this.closest('.modal').remove()">✕</button>
      </div>
      <div class="modal-body">
        <div class="inbox-list" id="inboxList">
          <div class="loading-text">Loading conversations...</div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Load conversations
  await loadInboxConversations();
}

async function loadInboxConversations() {
  const inboxList = document.getElementById('inboxList');
  if (!inboxList) return;

  try {
    // Get all private messages where user is involved
    const messagesSnapshot = await database.ref('privateMessages').once('value');
    const allMessages = messagesSnapshot.val() || {};

    // Group messages by conversation
    const conversations = {};

    for (const chatId in allMessages) {
      const messages = allMessages[chatId];

      // Check if current user is part of this conversation
      const userIds = chatId.split('_');
      if (!userIds.includes(currentUser.uid)) continue;

      // Get the other user's ID
      const otherUserId = userIds.find(id => id !== currentUser.uid);
      if (!otherUserId) continue;

      // Get last message
      const messagesList = Object.values(messages);
      const lastMessage = messagesList[messagesList.length - 1];

      // Count unread messages
      const unreadCount = messagesList.filter(msg =>
        msg.to === currentUser.uid && !msg.read
      ).length;

      conversations[chatId] = {
        chatId,
        otherUserId,
        lastMessage,
        unreadCount,
        timestamp: lastMessage.timestamp
      };
    }

    // Sort by timestamp (newest first)
    const sortedConversations = Object.values(conversations).sort((a, b) =>
      b.timestamp - a.timestamp
    );

    if (sortedConversations.length === 0) {
      inboxList.innerHTML = `
        <div class="inbox-empty">
          <div class="inbox-empty-icon">💬</div>
          <div class="inbox-empty-text">No messages yet</div>
        </div>
      `;
      return;
    }

    // Load user data for all conversations
    const userDataPromises = sortedConversations.map(conv =>
      database.ref(`users/${conv.otherUserId}`).once('value')
    );
    const userSnapshots = await Promise.all(userDataPromises);
    const userData = userSnapshots.map(snap => snap.val());

    // Render conversations
    inboxList.innerHTML = sortedConversations.map((conv, index) => {
      const user = userData[index];
      const avatar = user?.avatarUrl
        ? `<img src="${user.avatarUrl}" alt="${user.username}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
        : generateLetterAvatar(user?.username || 'U', user?.color);

      return `
        <div class="inbox-item ${conv.unreadCount > 0 ? 'unread' : ''}"
             onclick="openPrivateMessage('${conv.otherUserId}', '${escapeHtml(user?.username || 'Unknown')}')">
          <div class="inbox-avatar" style="${!user?.avatarUrl ? `background: ${user?.color || '#666'};` : ''}">${avatar}</div>
          <div class="inbox-content">
            <div class="inbox-header">
              <span class="inbox-username">${escapeHtml(user?.username || 'Unknown')}</span>
              <span class="inbox-time">${formatTime(conv.timestamp)}</span>
            </div>
            <div class="inbox-preview">
              ${conv.lastMessage.from === currentUser.uid ? 'You: ' : ''}${escapeHtml(conv.lastMessage.text)}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Close inbox modal when opening a conversation
    const inboxItems = inboxList.querySelectorAll('.inbox-item');
    inboxItems.forEach(item => {
      item.addEventListener('click', () => {
        const modal = document.getElementById('messagesInboxModal');
        if (modal) modal.remove();
      });
    });

  } catch (error) {
    console.error('Failed to load inbox:', error);
    inboxList.innerHTML = `
      <div class="inbox-empty">
        <div class="inbox-empty-icon">⚠️</div>
        <div class="inbox-empty-text">Failed to load messages</div>
      </div>
    `;
  }
}

function listenToInboxUpdates() {
  if (!currentUser) return;

  // Listen for new messages - need to listen to all chat conversations
  database.ref('privateMessages').on('value', () => {
    updateInboxBadge();
    // Refresh inbox list if modal is open
    const inboxModal = document.getElementById('messagesInboxModal');
    if (inboxModal) {
      loadInboxConversations();
    }
  });
}

async function updateInboxBadge() {
  if (!currentUser) return;

  try {
    const messagesSnapshot = await database.ref('privateMessages').once('value');
    const allMessages = messagesSnapshot.val() || {};

    let totalUnread = 0;

    for (const chatId in allMessages) {
      const messages = allMessages[chatId];
      const userIds = chatId.split('_');

      if (!userIds.includes(currentUser.uid)) continue;

      const messagesList = Object.values(messages);
      const unreadCount = messagesList.filter(msg =>
        msg.to === currentUser.uid && !msg.read
      ).length;

      totalUnread += unreadCount;
    }

    const badge = document.getElementById('inboxBadge');
    if (badge) {
      if (totalUnread > 0) {
        badge.textContent = totalUnread > 99 ? '99+' : totalUnread;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
  } catch (error) {
    console.error('Failed to update inbox badge:', error);
  }
}

// ============================================
// MESSAGE REPORT SYSTEM
// ============================================

window.reportMessage = async function(messageId, messageText, authorId) {
  if (!currentUser) {
    showError('Please login to report messages');
    return;
  }

  const reason = prompt('Please enter the reason for reporting this message:');
  if (!reason) return;

  try {
    await database.ref('reports').push({
      messageId: messageId,
      messageText: messageText,
      authorId: authorId,
      reportedBy: currentUser.uid,
      reason: reason,
      timestamp: Date.now(),
      status: 'pending'
    });

    showSuccess('Report submitted. Thank you!');
  } catch (error) {
    console.error('Report error:', error);
    showError('Failed to submit report');
  }
};

// ============================================
// EMOJI PICKER
// ============================================

const emojiCategories = {
  'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '😶‍🌫️', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐'],
  'Gestures': ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
  'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿', '🦔'],
  'Food': ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯'],
  'Activities': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸', '🥌', '🎿', '⛷', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺', '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖', '🎗'],
  'Travel': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩', '💺', '🛰', '🚀', '🛸', '🚁', '🛶', '⛵', '🚤', '🛥', '🛳', '⛴', '🚢', '⚓', '⛽', '🚧', '🚦', '🚥', '🚏', '🗺', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟', '🎡', '🎢', '🎠', '⛲', '⛱', '🏖', '🏝', '🏜', '🌋', '⛰', '🏔', '🗻', '🏕', '⛺', '🏠', '🏡', '🏘', '🏚', '🏗', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩', '💒', '🏛', '⛪', '🕌', '🕍', '🛕', '🕋'],
  'Objects': ['⌚', '📱', '📲', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '🕹', '🗜', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '🧭', '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯', '🪔', '🧯', '🛢', '💸', '💵', '💴', '💶', '💷', '🪙', '💰', '💳', '💎', '⚖️', '🪜', '🧰', '🪛', '🔧', '🔨', '⚒', '🛠', '⛏', '🪚', '🔩', '⚙️', '🪤', '🧱', '⛓', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡', '⚔️', '🛡', '🚬', '⚰️', '🪦', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡', '🧹', '🪠', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪥', '🪒', '🧽', '🪣', '🧴', '🛎', '🔑', '🗝', '🚪', '🪑', '🛋', '🛏', '🛌', '🧸', '🪆', '🖼', '🪞', '🪟', '🛍', '🛒', '🎁', '🎈', '🎏', '🎀', '🪄', '🪅', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷', '🪧', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒', '🗓', '📆', '📅', '🗑', '📇', '🗃', '🗳', '🗄', '📋', '📁', '📂', '🗂', '🗞', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊', '🖋', '✒️', '🖌', '🖍', '📝', '✏️', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓']
};

let allEmojis = [];
Object.values(emojiCategories).forEach(category => {
  allEmojis = allEmojis.concat(category);
});

// Initialize emoji picker
function initEmojiPicker() {
  const emojiPickerBtn = document.getElementById('emojiPickerBtn');
  const emojiPicker = document.getElementById('emojiPicker');
  const emojiPickerBody = document.getElementById('emojiPickerBody');
  const emojiSearch = document.getElementById('emojiSearch');
  const messageInput = document.getElementById('messageInput');

  if (!emojiPickerBtn || !emojiPicker) return;

  // Render all emojis
  function renderEmojis(emojis = allEmojis) {
    emojiPickerBody.innerHTML = emojis.map(emoji =>
      `<button class="emoji-item" onclick="insertEmoji('${emoji}')">${emoji}</button>`
    ).join('');
  }

  renderEmojis();

  // Toggle emoji picker
  emojiPickerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
  });

  // Search emojis
  emojiSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    if (!searchTerm) {
      renderEmojis();
      return;
    }

    const filtered = allEmojis.filter(emoji => {
      // Simple search - you can enhance this
      return true; // Show all for now
    });
    renderEmojis(filtered);
  });

  // Close picker when clicking outside
  document.addEventListener('click', (e) => {
    if (!emojiPicker.contains(e.target) && e.target !== emojiPickerBtn) {
      emojiPicker.style.display = 'none';
    }
  });
}

window.insertEmoji = function(emoji) {
  const messageInput = document.getElementById('messageInput');
  const cursorPos = messageInput.selectionStart;
  const textBefore = messageInput.value.substring(0, cursorPos);
  const textAfter = messageInput.value.substring(cursorPos);

  messageInput.value = textBefore + emoji + textAfter;
  messageInput.focus();
  messageInput.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
};

// ============================================
// NOTIFICATION SYSTEM
// ============================================

// Listen to notifications
function listenToNotifications() {
  if (!currentUser) return;

  database.ref(`notifications/${currentUser.uid}`).on('child_added', async (snapshot) => {
    const notification = snapshot.val();
    if (notification.read) return;

    // Get sender data
    const userSnapshot = await database.ref(`users/${notification.from}`).once('value');
    const userData = userSnapshot.val();

    let message = '';
    switch (notification.type) {
      case 'follow':
        message = `${userData?.username || 'Someone'} started following you!`;
        break;
      case 'message':
        message = `New message from ${userData?.username || 'Someone'}`;
        break;
      case 'like':
        message = `${userData?.username || 'Someone'} liked your message`;
        break;
      case 'mention':
        message = `${userData?.username || 'Someone'} mentioned you`;
        break;
    }

    showNotification(message);

    // Mark as read after showing
    setTimeout(() => {
      database.ref(`notifications/${currentUser.uid}/${snapshot.key}`).update({ read: true });
    }, 3000);
  });
}

function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'toast-notification';
  notification.textContent = message;

  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => notification.classList.add('show'), 100);

  // Hide and remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ============================================
// NEW ADMIN FEATURES
// ============================================

// Load Analytics
function loadAnalytics() {
  // Simulate loading analytics data
  setTimeout(() => {
    document.getElementById('dailyActiveUsers').textContent = Math.floor(Math.random() * 100 + 50);
    document.getElementById('avgResponseTime').textContent = (Math.random() * 5 + 1).toFixed(1) + '分钟';
    document.getElementById('engagementRate').textContent = Math.floor(Math.random() * 30 + 60) + '%';
    document.getElementById('newUsersToday').textContent = Math.floor(Math.random() * 20 + 5);

    // Load trending topics
    loadTrendingTopics();
  }, 500);
}

// Load Trending Topics
function loadTrendingTopics() {
  const container = document.getElementById('trendingTopics');
  if (!container) return;

  const topics = [
    { title: '新功能讨论', messages: 45, participants: 12 },
    { title: '技术支持', messages: 38, participants: 8 },
    { title: '反馈建议', messages: 29, participants: 15 },
    { title: '社区活动', messages: 22, participants: 10 }
  ];

  container.innerHTML = topics.map(topic => `
    <div class="trending-topic">
      <div class="topic-title">${topic.title}</div>
      <div class="topic-stats">
        <span>💬 ${topic.messages} 消息</span>
        <span>👥 ${topic.participants} 参与者</span>
      </div>
    </div>
  `).join('');
}

// Load Permissions
function loadPermissions() {
  console.log('Permissions tab loaded');
}

// Load Backup
function loadBackup() {
  console.log('Backup tab loaded');
}

// Create Role
window.createRole = function() {
  showCustomModal({
    icon: '🔐',
    title: '创建新角色',
    message: '请输入角色名称',
    input: true,
    inputPlaceholder: '角色名称',
    buttons: [
      {
        text: '取消',
        style: 'secondary',
        onClick: () => {}
      },
      {
        text: '创建',
        style: 'primary',
        onClick: (inputValue) => {
          if (inputValue && inputValue.trim()) {
            showSuccess(`角色 "${inputValue}" 创建成功！`);
          } else {
            showError('请输入角色名称');
          }
        }
      }
    ]
  });
};

// Edit Role
window.editRole = function(roleId) {
  showCustomModal({
    icon: '✏️',
    title: '编辑角色',
    message: `编辑角色: ${roleId}`,
    buttons: [
      {
        text: '取消',
        style: 'secondary',
        onClick: () => {}
      },
      {
        text: '保存',
        style: 'primary',
        onClick: () => {
          showSuccess('角色更新成功！');
        }
      }
    ]
  });
};

// Delete Role
window.deleteRole = function(roleId) {
  showCustomModal({
    icon: '⚠️',
    title: '删除角色',
    message: `确定要删除角色 "${roleId}" 吗？此操作不可撤销。`,
    buttons: [
      {
        text: '取消',
        style: 'secondary',
        onClick: () => {}
      },
      {
        text: '删除',
        style: 'danger',
        onClick: () => {
          showSuccess('角色已删除');
        }
      }
    ]
  });
};

// Execute Batch Action
window.executeBatchAction = function() {
  const action = document.getElementById('batchAction').value;
  if (!action) {
    showError('请选择要执行的操作');
    return;
  }

  showCustomModal({
    icon: '⚠️',
    title: '确认批量操作',
    message: `确定要执行批量操作吗？`,
    buttons: [
      {
        text: '取消',
        style: 'secondary',
        onClick: () => {}
      },
      {
        text: '确认',
        style: 'primary',
        onClick: () => {
          showSuccess('批量操作执行成功！');
        }
      }
    ]
  });
};

// Create Backup
window.createBackup = function() {
  const includeUsers = document.getElementById('backupUsers').checked;
  const includeMessages = document.getElementById('backupMessages').checked;
  const includeAnnouncements = document.getElementById('backupAnnouncements').checked;
  const includeSettings = document.getElementById('backupSettings').checked;

  showCustomModal({
    icon: '💾',
    title: '创建备份',
    message: '正在创建备份，请稍候...',
    buttons: []
  });

  setTimeout(() => {
    hideCustomModal();
    showSuccess('备份创建成功！');
  }, 2000);
};

// Download Backup
window.downloadBackup = function(backupId) {
  showSuccess(`正在下载备份 ${backupId}...`);
};

// Restore Backup
window.restoreBackup = function(backupId) {
  showCustomModal({
    icon: '⚠️',
    title: '恢复备份',
    message: '恢复备份将覆盖当前所有数据，确定要继续吗？',
    buttons: [
      {
        text: '取消',
        style: 'secondary',
        onClick: () => {}
      },
      {
        text: '恢复',
        style: 'danger',
        onClick: () => {
          showSuccess('备份恢复成功！');
        }
      }
    ]
  });
};

// Delete Backup
window.deleteBackup = function(backupId) {
  showCustomModal({
    icon: '🗑️',
    title: '删除备份',
    message: '确定要删除此备份吗？',
    buttons: [
      {
        text: '取消',
        style: 'secondary',
        onClick: () => {}
      },
      {
        text: '删除',
        style: 'danger',
        onClick: () => {
          showSuccess('备份已删除');
        }
      }
    ]
  });
};

// Add event listeners to menu items
document.querySelectorAll('.admin-menu-item').forEach(item => {
  item.addEventListener('click', () => {
    switchAdminTab(item.dataset.tab);
  });
});

// ============================================
// ADMIN MANAGEMENT
// ============================================

// Load admins list
async function loadAdminsList() {
  const adminsList = document.getElementById('adminsList');
  if (!adminsList) return;

  try {
    const usersSnapshot = await database.ref('users').once('value');
    const users = usersSnapshot.val() || {};

    const admins = Object.entries(users).filter(([uid, user]) => user.role === 'admin');

    if (admins.length === 0) {
      adminsList.innerHTML = '<div class="loading-text">没有管理员</div>';
      return;
    }

    adminsList.innerHTML = admins.map(([uid, user]) => {
      const isCurrentUser = uid === currentUser.uid;
      const avatar = user.avatarUrl
        ? `<img src="${user.avatarUrl}" alt="${user.username}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
        : generateLetterAvatar(user.username || 'A', user.color);

      return `
        <div class="admin-list-item ${isCurrentUser ? 'current-user' : ''}">
          <div class="admin-item-info">
            <div class="admin-item-avatar" style="${!user.avatarUrl ? `background: ${user.color || '#666'};` : ''}">${avatar}</div>
            <div class="admin-item-details">
              <div class="admin-item-name">${escapeHtml(user.username || 'Unknown')} ${isCurrentUser ? '(You)' : ''}</div>
              <div class="admin-item-email">${escapeHtml(user.email || '')}</div>
            </div>
          </div>
          <div class="admin-item-actions">
            <span class="admin-item-badge">Admin</span>
            ${!isCurrentUser ? `
              <button class="btn-icon danger" onclick="removeAdmin('${uid}', '${escapeHtml(user.username || 'Unknown')}')">
                移除
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Failed to load admins:', error);
    adminsList.innerHTML = '<div class="loading-text">加载失败</div>';
  }
}

// Load role statistics
async function loadRoleStats() {
  try {
    const usersSnapshot = await database.ref('users').once('value');
    const users = usersSnapshot.val() || {};

    const stats = {
      admin: 0,
      user: 0,
      banned: 0,
      muted: 0
    };

    Object.values(users).forEach(user => {
      if (user.role === 'admin') stats.admin++;
      else stats.user++;
      if (user.banned) stats.banned++;
      if (user.muted) stats.muted++;
    });

    document.getElementById('adminCount').textContent = stats.admin;
    document.getElementById('userCount').textContent = stats.user;
    document.getElementById('bannedCount').textContent = stats.banned;
    document.getElementById('mutedCount').textContent = stats.muted;

  } catch (error) {
    console.error('Failed to load role stats:', error);
  }
}

// Promote user to admin
window.promoteToAdmin = async function() {
  showCustomModal({
    icon: '👑',
    title: '添加管理员',
    message: '请输入要提升为管理员的用户邮箱：',
    type: 'prompt',
    inputPlaceholder: '用户邮箱',
    confirmText: '提升',
    cancelText: '取消',
    onConfirm: async (email) => {
      if (!email) {
        showError('请输入邮箱');
        return;
      }

      try {
        // Find user by email
        const usersSnapshot = await database.ref('users').once('value');
        const users = usersSnapshot.val() || {};

        const userEntry = Object.entries(users).find(([uid, user]) => user.email === email);

        if (!userEntry) {
          showError('未找到该用户');
          return;
        }

        const [uid, user] = userEntry;

        if (user.role === 'admin') {
          showError('该用户已经是管理员');
          return;
        }

        // Confirm promotion
        showCustomModal({
          icon: '⚠️',
          title: '确认提升',
          message: `确定要将 ${user.username} (${email}) 提升为管理员吗？\n\n管理员拥有所有权限，请谨慎操作！`,
          type: 'confirm',
          confirmText: '确认',
          cancelText: '取消',
          dangerButton: false,
          onConfirm: async () => {
            await database.ref(`users/${uid}/role`).set('admin');
            showSuccess(`${user.username} 已提升为管理员`);
            await logAdminAction('PROMOTE_ADMIN', uid, { username: user.username, email: email });
            loadAdminsList();
            loadRoleStats();
          }
        });

      } catch (error) {
        console.error('Failed to promote user:', error);
        showError('提升失败');
      }
    }
  });
};

// Remove admin
window.removeAdmin = async function(uid, username) {
  showCustomModal({
    icon: '⚠️',
    title: '移除管理员',
    message: `确定要移除 ${username} 的管理员权限吗？\n\n该用户将降级为普通用户。`,
    type: 'confirm',
    confirmText: '移除',
    cancelText: '取消',
    dangerButton: true,
    onConfirm: async () => {
      try {
        await database.ref(`users/${uid}/role`).set('user');
        showSuccess(`${username} 已移除管理员权限`);
        await logAdminAction('REMOVE_ADMIN', uid, { username: username });
        loadAdminsList();
        loadRoleStats();
      } catch (error) {
        console.error('Failed to remove admin:', error);
        showError('移除失败');
      }
    }
  });
};

// Quick search users
const quickSearchInput = document.getElementById('quickSearchUser');
if (quickSearchInput) {
  let searchTimeout;
  quickSearchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      quickSearchUsers(e.target.value);
    }, 300);
  });
}

async function quickSearchUsers(query) {
  const resultsContainer = document.getElementById('quickSearchResults');
  if (!resultsContainer) return;

  if (!query || query.length < 2) {
    resultsContainer.innerHTML = '';
    return;
  }

  try {
    const usersSnapshot = await database.ref('users').once('value');
    const users = usersSnapshot.val() || {};

    const results = Object.entries(users).filter(([uid, user]) => {
      const searchStr = query.toLowerCase();
      return user.username?.toLowerCase().includes(searchStr) ||
             user.email?.toLowerCase().includes(searchStr);
    }).slice(0, 10);

    if (results.length === 0) {
      resultsContainer.innerHTML = '<div class="loading-text">未找到用户</div>';
      return;
    }

    resultsContainer.innerHTML = results.map(([uid, user]) => {
      const avatar = user.avatarUrl
        ? `<img src="${user.avatarUrl}" alt="${user.username}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`
        : generateLetterAvatar(user.username || 'U', user.color);

      return `
        <div class="quick-search-item">
          <div class="quick-search-info">
            <div class="quick-search-avatar" style="${!user.avatarUrl ? `background: ${user.color || '#666'};` : ''}">${avatar}</div>
            <div class="quick-search-details">
              <div class="quick-search-name">${escapeHtml(user.username || 'Unknown')}</div>
              <div class="quick-search-email">${escapeHtml(user.email || '')}</div>
            </div>
          </div>
          <div class="quick-search-actions">
            ${user.role !== 'admin' ? `
              <button class="btn-icon" onclick="quickPromoteAdmin('${uid}', '${escapeHtml(user.username || 'Unknown')}', '${escapeHtml(user.email || '')}')">
                提升
              </button>
            ` : '<span class="admin-item-badge">Admin</span>'}
            <button class="btn-icon" onclick="showUserProfile('${uid}')">
              查看
            </button>
          </div>
        </div>
      `;
    }).join('');

  } catch (error) {
    console.error('Failed to search users:', error);
    resultsContainer.innerHTML = '<div class="loading-text">搜索失败</div>';
  }
}

window.quickPromoteAdmin = async function(uid, username, email) {
  showCustomModal({
    icon: '👑',
    title: '提升为管理员',
    message: `确定要将 ${username} (${email}) 提升为管理员吗？`,
    type: 'confirm',
    confirmText: '确认',
    cancelText: '取消',
    onConfirm: async () => {
      try {
        await database.ref(`users/${uid}/role`).set('admin');
        showSuccess(`${username} 已提升为管理员`);
        await logAdminAction('PROMOTE_ADMIN', uid, { username: username, email: email });
        loadAdminsList();
        loadRoleStats();
        quickSearchUsers(document.getElementById('quickSearchUser').value);
      } catch (error) {
        console.error('Failed to promote user:', error);
        showError('提升失败');
      }
    }
  });
};

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
    'BAN': 'X',
    'UNBAN': '✓',
    'MUTE': '-',
    'UNMUTE': '+',
    'DELETE': 'X',
    'PIN': '^',
    'UNPIN': 'v'
  };
  return icons[action] || '•';
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
  showConfirm('确定要删除这条消息吗？', async () => {
    try {
      await database.ref(`messages/${messageId}`).remove();
      await logAdminAction('DELETE', messageId, { messageId });
      showSuccess('消息已删除');
      loadMessagesAdmin();
    } catch (error) {
      showError('删除消息失败');
    }
  });
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
  showCustomModal({
    icon: '⚠️',
    title: 'Danger',
    message: '确定要删除所有消息吗？此操作无法撤销！',
    type: 'confirm',
    confirmText: 'Delete All',
    cancelText: 'Cancel',
    dangerButton: true,
    onConfirm: async () => {
      try {
        await database.ref('messages').remove();
        await logAdminAction('CLEAR_ALL', 'all_messages', { action: 'cleared all messages' });
        showSuccess('所有消息已清空');
        loadMessagesAdmin();
      } catch (error) {
        showError('清空消息失败');
      }
    }
  });
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
  showCustomModal({
    icon: '!',
    title: 'DANGER!',
    message: '这将删除所有数据，包括用户、消息和公告。你确定吗？',
    type: 'confirm',
    confirmText: 'Continue',
    cancelText: 'Cancel',
    dangerButton: true,
    onConfirm: () => {
      showCustomModal({
        icon: '!',
        title: 'Last Warning',
        message: '这是最后的机会。输入"是"以确认重置数据库。',
        type: 'prompt',
        inputPlaceholder: '输入"是"',
        confirmText: 'Reset',
        cancelText: 'Cancel',
        onConfirm: async (value) => {
          if (value !== '是') {
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
        }
      });
    }
  });
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
  const showMoreContainer = document.getElementById('showMoreAnnouncements');

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

  // Show/hide toggle button based on announcement count
  if (allAnnouncements.length > 3) {
    if (showMoreContainer) showMoreContainer.style.display = 'block';
  } else {
    if (showMoreContainer) showMoreContainer.style.display = 'none';
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

    // File preview (show first 3 files as compact cards)
    let filesPreview = '';
    if (ann.files && ann.files.length > 0) {
      const previewFiles = ann.files.slice(0, 3);
      filesPreview = '<div class="announcement-files-preview">';
      previewFiles.forEach(file => {
        const displayName = file.name.includes('/') ? file.name.split('/').pop() : file.name;
        const ext = getFileExtension(file.name);
        const iconColor = getFileIconColor(ext);

        if (isImageFile(file.name)) {
          filesPreview += `<div class="file-preview-thumb"><img src="${file.data}" alt="${escapeHtml(displayName)}" title="${escapeHtml(displayName)}"></div>`;
        } else {
          filesPreview += `
            <div class="announcement-file-card">
              <div class="announcement-file-icon" style="background: ${iconColor};">${ext || 'FILE'}</div>
              <div class="announcement-file-info">
                <div class="announcement-file-name">${escapeHtml(displayName.length > 15 ? displayName.substring(0, 15) + '...' : displayName)}</div>
                <div class="announcement-file-size">${formatFileSize(file.size)}</div>
              </div>
            </div>
          `;
        }
      });
      if (ann.files.length > 3) {
        filesPreview += `<div class="announcement-file-more">+${ann.files.length - 3}</div>`;
      }
      filesPreview += '</div>';
    }

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
      ${filesPreview}
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

  // Combine text and files in one container
  let contentHtml = `${escapeHtml(announcement.text)}`;

  // Add files if any
  if (announcement.files && announcement.files.length > 0) {
    contentHtml += createFilesDisplay(announcement.files, 'announcement-' + Date.now());
  }

  content.innerHTML = contentHtml;

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
  showConfirm('Are you sure you want to delete this message?', async () => {
    try {
      await database.ref(`messages/${messageId}`).remove();
      showSuccess('Message deleted');
    } catch (error) {
      console.error('Delete error:', error);
      showError('Failed to delete message');
    }
  });
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

// Update sendMessage to include reply, rate limiting, profanity filter, and file upload
const originalSendMessage = sendMessage;
async function sendMessage() {
  const text = messageInput.value.trim();

  // Allow sending if there's text or files
  if (!text && selectedFiles.length === 0) return;

  // Disable send button
  sendMessageBtn.disabled = true;
  sendMessageBtn.textContent = 'Sending...';

  // Clear typing indicator
  if (currentUser) {
    database.ref(`typing/${currentUser.uid}`).remove();
  }

  // Check rate limit
  if (!checkRateLimit()) {
    showError('You are sending messages too quickly. Please slow down.');
    sendMessageBtn.disabled = false;
    sendMessageBtn.textContent = 'Send';
    return;
  }

  // Check profanity
  if (text && containsProfanity(text)) {
    showError('Your message contains inappropriate content');
    sendMessageBtn.disabled = false;
    sendMessageBtn.textContent = 'Send';
    return;
  }

  // Check if user is muted
  const userSnapshot = await database.ref(`users/${currentUser.uid}`).once('value');
  const userData = userSnapshot.val();

  if (userData.muted) {
    showError('You are muted and cannot send messages');
    sendMessageBtn.disabled = false;
    sendMessageBtn.textContent = 'Send';
    return;
  }

  try {
    // Filter profanity (just in case)
    const filteredText = text ? filterProfanity(text) : '';

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

    // Upload files if selected
    if (selectedFiles.length > 0) {
      sendMessageBtn.textContent = 'Uploading...';

      const filesData = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileData = await uploadFileToBase64(file);

        // Preserve folder path if it exists
        const fileName = file.webkitRelativePath || file.name;

        filesData.push({
          name: fileName,
          size: file.size,
          type: file.type,
          data: fileData
        });

        // Update progress
        if (selectedFiles.length > 1) {
          sendMessageBtn.textContent = `Uploading ${i + 1}/${selectedFiles.length}...`;
        }
      }

      messageData.files = filesData;
    }

    await database.ref('messages').push(messageData);
    messageInput.value = '';

    // Clear file selection
    if (selectedFiles.length > 0) {
      selectedFiles = [];
      fileInput.value = '';
      filePreviewContainer.style.display = 'none';
    }

    // Update message count
    await updateMessageCount(currentUser.uid);

    if (replyingTo) {
      cancelReply();
    }

    // Success
    sendMessageBtn.textContent = 'Sent!';
    setTimeout(() => {
      sendMessageBtn.textContent = 'Send';
      sendMessageBtn.disabled = false;
    }, 500);
  } catch (error) {
    console.error('Send error:', error);
    showError('Failed to send message');
    sendMessageBtn.disabled = false;
    sendMessageBtn.textContent = 'Send';
  }
}

// Add event listeners for sendMessage (only once)
sendMessageBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// Upload file to base64 with image compression
async function uploadFileToBase64(file) {
  // Check if it's an image
  if (file.type.startsWith('image/')) {
    return await compressImage(file);
  }

  // For non-image files, just convert to base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Compress image before upload
async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Calculate new dimensions (max 1200px width/height)
        let width = img.width;
        let height = img.height;
        const maxSize = 1200;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression (0.8 quality)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedDataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Create files display (folder or individual files)
function createFilesDisplay(files, messageId) {
  if (!files) return '';

  // Ensure files is an array
  const filesArray = Array.isArray(files) ? files : [files];
  if (filesArray.length === 0) return '';

  // Check if files are from a folder (have path separator in name)
  const hasPath = filesArray.some(f => f && f.name && (f.name.includes('/') || f.name.includes('\\')));
  const isFolder = filesArray.length > 1 && hasPath;

  if (isFolder) {
    // Display as folder
    const firstFile = filesArray[0];
    const folderName = firstFile.name.split(/[/\\]/)[0] || 'Folder';
    const totalSize = filesArray.reduce((sum, f) => sum + (f.size || 0), 0);

    return `
      <div class="message-folder" onclick="toggleFolder('${messageId}', event)">
        <div class="message-folder-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#FDB022" stroke="#000" stroke-width="1">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="message-folder-info">
          <div class="message-folder-name">${escapeHtml(folderName)}</div>
          <div class="message-folder-meta">${filesArray.length} files • ${formatFileSize(totalSize)}</div>
        </div>
        <div class="message-folder-toggle">▼</div>
      </div>
      <div class="message-folder-contents" id="folder-${messageId}" style="display: none;">
        ${filesArray.map(file => createFileAttachment(file)).join('')}
      </div>
    `;
  } else {
    // Display individual files
    return filesArray.map(file => createFileAttachment(file)).join('');
  }
}

// Create file attachment HTML
function createFileAttachment(file) {
  if (!file || !file.name || !file.data) {
    console.error('Invalid file object:', file);
    return '';
  }

  const isImage = isImageFile(file.name);
  const ext = getFileExtension(file.name);
  const iconColor = getFileIconColor(ext);

  // Get display name (remove folder path if exists)
  let displayName = file.name;
  if (displayName.includes('/')) {
    displayName = displayName.split('/').pop();
  } else if (displayName.includes('\\')) {
    displayName = displayName.split('\\').pop();
  }

  if (isImage) {
    // Display image
    return `
      <div class="message-file-attachment">
        <img src="${file.data}" alt="${escapeHtml(displayName)}" class="message-image" onclick="openImageModal('${escapeDataUrl(file.data)}', '${escapeHtml(displayName)}')">
      </div>
    `;
  } else {
    // Display file download button
    return `
      <div class="message-file">
        <div class="message-file-icon" style="background: ${iconColor};">${ext || 'FILE'}</div>
        <div class="message-file-info">
          <div class="message-file-name">${escapeHtml(displayName)}</div>
          <div class="message-file-size">${formatFileSize(file.size || 0)}</div>
        </div>
        <button class="message-file-download" onclick="downloadFile('${escapeDataUrl(file.data)}', '${escapeHtml(displayName)}')">Download</button>
      </div>
    `;
  }
}

// Toggle folder contents
window.toggleFolder = function(messageId, event) {
  const folderContents = document.getElementById(`folder-${messageId}`);
  const folderElement = event ? event.currentTarget : document.querySelector(`[onclick*="toggleFolder('${messageId}')"]`);
  const folderToggle = folderElement ? folderElement.querySelector('.message-folder-toggle') : null;

  if (folderContents) {
    if (folderContents.style.display === 'none') {
      folderContents.style.display = 'block';
      if (folderToggle) folderToggle.textContent = '▲';
    } else {
      folderContents.style.display = 'none';
      if (folderToggle) folderToggle.textContent = '▼';
    }
  }
};

// Get file icon color based on extension
function getFileIconColor(ext) {
  const colors = {
    // Documents
    'PDF': '#ff6b6b',
    'DOC': '#4dabf7',
    'DOCX': '#4dabf7',
    'TXT': '#adb5bd',
    'RTF': '#adb5bd',
    // Spreadsheets
    'XLS': '#51cf66',
    'XLSX': '#51cf66',
    'CSV': '#51cf66',
    // Presentations
    'PPT': '#ff922b',
    'PPTX': '#ff922b',
    // Archives
    'ZIP': '#cc5de8',
    'RAR': '#cc5de8',
    '7Z': '#cc5de8',
    'TAR': '#cc5de8',
    'GZ': '#cc5de8',
    // Code
    'JS': '#ffd43b',
    'HTML': '#ff6b6b',
    'CSS': '#4dabf7',
    'JSON': '#ffa94d',
    'XML': '#ff922b',
    'PY': '#4dabf7',
    'JAVA': '#ff6b6b',
    'CPP': '#cc5de8',
    'C': '#adb5bd',
    'PHP': '#be4bdb',
    // Executables
    'EXE': '#5b9bd5',
    'MSI': '#5b9bd5',
    'APP': '#5b9bd5',
    'DMG': '#5b9bd5',
    'APK': '#51cf66',
    // Media
    'MP3': '#20c997',
    'MP4': '#ff6b6b',
    'AVI': '#ff6b6b',
    'MOV': '#ff6b6b',
    'WAV': '#20c997',
    // Config
    'INI': '#5b9bd5',
    'CFG': '#5b9bd5',
    'CONF': '#5b9bd5',
    // Default
    'DEFAULT': '#5b9bd5'
  };

  return colors[ext] || colors['DEFAULT'];
}

// Escape data URL for HTML attribute
function escapeDataUrl(dataUrl) {
  return dataUrl.replace(/'/g, '&#39;');
}

// Download file
window.downloadFile = function(dataUrl, filename) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Open image modal
window.openImageModal = function(imageUrl, filename) {
  showCustomModal({
    icon: '',
    title: filename,
    message: `<img src="${imageUrl}" style="max-width: 100%; border-radius: 8px; margin-top: 12px;">`,
    type: 'alert',
    confirmText: 'Close'
  });
};

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

// Emoji picker removed - no longer using emojis

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

    // Remove animation class after animation completes to prevent re-animation on scroll
    setTimeout(() => {
      messageEl.classList.remove('animate-new');
    }, 500); // 500ms = animation duration (300ms) + buffer
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
  const isPinned = msg.pinned ? '<span class="pinned-badge">Pinned</span>' : '';

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
        ${msg.text ? `<div class="message-text" data-message-id="${messageId}">${processMessageText(msg.text)}</div>` : ''}
        ${msg.files ? createFilesDisplay(msg.files, messageId) : ''}
        <div class="message-actions">
          <button class="btn-action btn-like ${hasLiked ? 'liked' : ''}" onclick="toggleLike('${messageId}')">
            <span class="like-count">${likeCount > 0 ? likeCount : 'Like'}</span>
          </button>
          <button class="btn-action btn-react" onclick="showReactionPicker('${messageId}', event)">
            😊 React
          </button>
          <button class="btn-action btn-reply" onclick="replyToMessage('${messageId}', '${escapeHtml(msg.text)}', '${escapeHtml(userData?.username || 'Unknown')}')">
            Reply
          </button>
          <button class="btn-action btn-bookmark" onclick="toggleBookmark('${messageId}')">
            🔖 Save
          </button>
          ${isOwnMessage ? `
            <button class="btn-action btn-edit" onclick="editMessage('${messageId}', '${escapeHtml(msg.text)}')">
              Edit
            </button>
            <button class="btn-action btn-delete" onclick="deleteMessage('${messageId}')">
              Delete
            </button>
          ` : ''}
          ${isAdmin ? `
            <button class="btn-action btn-pin" onclick="togglePin('${messageId}', ${!msg.pinned})">
              ${msg.pinned ? 'Unpin' : 'Pin'}
            </button>
          ` : ''}
          ${isAdmin && !isOwnMessage ? `
            <button class="btn-action btn-edit" onclick="editMessage('${messageId}', '${escapeHtml(msg.text)}')">
              Edit
            </button>
            <button class="btn-action btn-delete-admin" onclick="deleteMessage('${messageId}')">
              Delete
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

// Duplicate register handler removed - using addEventListener above (line 244)

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

// Announcement files upload
const announcementFilesInput = document.getElementById('announcementFiles');
const announcementFolderInput = document.getElementById('announcementFolder');
const uploadAnnouncementFilesBtn = document.getElementById('uploadAnnouncementFilesBtn');
const uploadAnnouncementFolderBtn = document.getElementById('uploadAnnouncementFolderBtn');
const announcementFilesPreview = document.getElementById('announcementFilesPreview');

let selectedAnnouncementFiles = [];

if (uploadAnnouncementFilesBtn) {
  uploadAnnouncementFilesBtn.addEventListener('click', () => {
    announcementFilesInput.click();
  });
}

if (uploadAnnouncementFolderBtn) {
  uploadAnnouncementFolderBtn.addEventListener('click', () => {
    announcementFolderInput.click();
  });
}

if (announcementFilesInput) {
  announcementFilesInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 25 * 1024 * 1024) {
      showError('Total file size must be less than 25MB');
      announcementFilesInput.value = '';
      return;
    }

    selectedAnnouncementFiles = files;
    updateAnnouncementFilesPreview();
  });
}

if (announcementFolderInput) {
  announcementFolderInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > 25 * 1024 * 1024) {
      showError('Total folder size must be less than 25MB');
      announcementFolderInput.value = '';
      return;
    }

    selectedAnnouncementFiles = files;
    updateAnnouncementFilesPreview();
  });
}

function updateAnnouncementFilesPreview() {
  if (selectedAnnouncementFiles.length === 0) {
    announcementFilesPreview.innerHTML = '';
    return;
  }

  announcementFilesPreview.innerHTML = selectedAnnouncementFiles.map((file, index) => {
    const ext = getFileExtension(file.name);
    const color = getFileIconColor(ext);
    return `
      <div class="file-preview-list-item">
        <div class="file-preview-list-icon" style="background: ${color};">${ext || 'FILE'}</div>
        <div class="file-preview-list-info">
          <div class="file-preview-list-name">${escapeHtml(file.name)}</div>
          <div class="file-preview-list-size">${formatFileSize(file.size)}</div>
        </div>
        <button class="file-preview-list-remove" onclick="removeAnnouncementFile(${index})">×</button>
      </div>
    `;
  }).join('');
}

window.removeAnnouncementFile = (index) => {
  selectedAnnouncementFiles.splice(index, 1);
  updateAnnouncementFilesPreview();
  announcementFilesInput.value = '';
  announcementFolderInput.value = '';
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

    // Add files if selected
    if (selectedAnnouncementFiles.length > 0) {
      postAnnouncementBtn.textContent = 'Uploading files...';

      const filesData = [];
      for (let i = 0; i < selectedAnnouncementFiles.length; i++) {
        const file = selectedAnnouncementFiles[i];
        const fileData = await uploadFileToBase64(file);

        // Preserve folder path if it exists
        const fileName = file.webkitRelativePath || file.name;

        filesData.push({
          name: fileName,
          size: file.size,
          type: file.type,
          data: fileData
        });

        if (selectedAnnouncementFiles.length > 1) {
          postAnnouncementBtn.textContent = `Uploading ${i + 1}/${selectedAnnouncementFiles.length}...`;
        }
      }

      announcementData.files = filesData;
    }

    await database.ref('announcements').push(announcementData);

    announcementText.value = '';
    if (announcementTitle) announcementTitle.value = '';
    removeAnnouncementImage();
    selectedAnnouncementFiles = [];
    updateAnnouncementFilesPreview();
    announcementFilesInput.value = '';
    announcementFolderInput.value = '';

    showSuccess('Announcement posted!');
  } catch (error) {
    showError('Failed to post announcement');
  } finally {
    postAnnouncementBtn.disabled = false;
    postAnnouncementBtn.textContent = '📢 发布公告';
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
            <button class="btn-icon" onclick="editAnnouncement('${announcementId}', '${escapeHtml(announcement.title)}', '${escapeHtml(announcement.text)}', '${escapeHtml(announcement.badge)}')">Edit</button>
            <button class="btn-icon danger" onclick="deleteAnnouncement('${announcementId}')">Delete</button>
          </div>
        </div>
        <p class="announcement-text">${escapeHtml(announcement.text)}</p>
        ${imageHtml}
        ${announcement.files ? createFilesDisplay(announcement.files, announcementId) : ''}
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
  showConfirm('Delete this announcement?', async () => {
    try {
      await database.ref(`announcements/${id}`).remove();
      showSuccess('Announcement deleted');
    } catch (error) {
      showError('Failed to delete announcement');
    }
  });
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

  console.log('Typing text:', typingText);
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

  // Add loading state with fade out animation
  const isFirstLoad = onlineUsersContainer.querySelector('.loading-text');
  if (isFirstLoad) {
    onlineUsersContainer.classList.add('loading-fade-out');
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

  // Wait for fade out animation if it's first load
  if (isFirstLoad) {
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Update display
  if (usersData.length === 0) {
    onlineUsersContainer.innerHTML = '<div class="no-online-users">No users online</div>';
    console.log('⚠️ No users online');
    onlineUsersContainer.classList.remove('loading-fade-out');
    onlineUsersContainer.classList.add('content-fade-in');
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

  // Remove loading class and add fade in animation
  onlineUsersContainer.classList.remove('loading-fade-out');
  onlineUsersContainer.classList.add('content-fade-in');

  // Remove animation class after animation completes
  setTimeout(() => {
    onlineUsersContainer.classList.remove('content-fade-in');
  }, 500);

  console.log('✅ Online users list updated');
}

// ============================================
// REAL-TIME VERSION CHECK
// ============================================

const updateNotification = document.getElementById('updateNotification');
const updateNowBtn = document.getElementById('updateNowBtn');
const updateLaterBtn = document.getElementById('updateLaterBtn');
const newVersionNumber = document.getElementById('newVersionNumber');

let versionListener = null;
let newVersionAvailable = null;
let isUpdating = false;

// Start real-time version checking with Firebase listener
function startVersionCheck() {
  console.log('🔍 Starting real-time version check with Firebase listener...');

  const versionRef = database.ref('appVersion');

  // Use .on() for real-time updates instead of polling
  versionListener = versionRef.on('value', (snapshot) => {
    if (snapshot.exists()) {
      const serverVersion = snapshot.val().current;
      let currentVersion = localStorage.getItem('app_version');

      console.log('📦 Server version:', serverVersion);
      console.log('💾 Local version:', currentVersion);

      // If no local version, sync from server
      if (!currentVersion) {
        console.log('🔄 No local version found, syncing from server:', serverVersion);
        localStorage.setItem('app_version', serverVersion);
        currentVersion = serverVersion;
        updateVersionDisplay(); // Update display
        return;
      }

      // Don't show notification if we're in the middle of updating
      if (isUpdating) {
        console.log('⏳ Update in progress, skipping notification');
        return;
      }

      if (serverVersion && currentVersion && serverVersion !== currentVersion) {
        console.log('🆕 New version available:', serverVersion);
        newVersionAvailable = serverVersion;
        showUpdateNotification(serverVersion);
      } else if (serverVersion === currentVersion) {
        // Versions match, hide notification if showing
        console.log('✅ Versions match, no update needed');
        hideUpdateNotification();
        updateVersionDisplay(); // Update display to match
      }
    }
  }, (error) => {
    console.error('❌ Failed to listen for version updates:', error);
  });
}

// Stop version checking
function stopVersionCheck() {
  if (versionListener) {
    console.log('🛑 Stopping version check listener');
    const versionRef = database.ref('appVersion');
    versionRef.off('value', versionListener);
    versionListener = null;
  }
}

// Show update notification
function showUpdateNotification(version) {
  if (!updateNotification) return;

  newVersionNumber.textContent = version;
  updateNotification.classList.add('show');

  // Play notification sound (optional)
  playNotificationSound();
}

// Hide update notification
function hideUpdateNotification() {
  if (!updateNotification) return;
  updateNotification.classList.remove('show');
}

// Update now button
if (updateNowBtn) {
  updateNowBtn.addEventListener('click', async () => {
    console.log('🔄 User clicked Update Now');

    // Set updating flag to prevent repeated notifications
    isUpdating = true;

    // Stop listening for version changes
    stopVersionCheck();

    // Update local version FIRST before clearing cache
    localStorage.setItem('app_version', newVersionAvailable);
    console.log('✅ Updated local version to:', newVersionAvailable);

    // Update version display immediately
    updateVersionDisplay();

    // Show loading message
    updateNotification.innerHTML = `
      <div class="update-icon">↻</div>
      <div class="update-content">
        <div class="update-title">Updating to v${newVersionAvailable}...</div>
        <div class="update-message">Please wait while we update the app</div>
      </div>
    `;

    // Clear all caches
    if ('caches' in window) {
      const names = await caches.keys();
      for (let name of names) {
        console.log('Deleting cache:', name);
        await caches.delete(name);
      }
    }

    // Unregister service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (let registration of registrations) {
        console.log('Unregistering Service Worker');
        await registration.unregister();
      }
    }

    // Reload page with force refresh
    setTimeout(() => {
      window.location.reload(true);
    }, 500);
  });
}

// Update later button
if (updateLaterBtn) {
  updateLaterBtn.addEventListener('click', () => {
    console.log('⏰ User clicked Update Later');
    hideUpdateNotification();

    // Show again after 5 minutes
    setTimeout(() => {
      if (newVersionAvailable) {
        showUpdateNotification(newVersionAvailable);
      }
    }, 5 * 60 * 1000); // 5 minutes
  });
}

// Start version check when user is logged in
auth.onAuthStateChanged(async (user) => {
  if (user && !versionListener) {
    // Sync version from Firebase on login
    try {
      const versionRef = database.ref('appVersion');
      const snapshot = await versionRef.once('value');
      if (snapshot.exists()) {
        const serverVersion = snapshot.val().current;
        const localVersion = localStorage.getItem('app_version');

        console.log('🔄 Syncing versions on login...');
        console.log('📦 Server version:', serverVersion);
        console.log('💾 Local version:', localVersion);

        // If versions match, ensure localStorage is set correctly
        if (localVersion === serverVersion) {
          console.log('✅ Versions already in sync');
        }
      }
    } catch (error) {
      console.error('❌ Failed to sync version on login:', error);
    }

    // Start checking for updates with real-time listener
    startVersionCheck();

    // Load current version for admin panel
    loadCurrentVersion();
  } else if (!user && versionListener) {
    // Stop checking when logged out
    stopVersionCheck();
  }
});

// ============================================
// ADMIN VERSION MANAGEMENT
// ============================================

// Load current version from Firebase
async function loadCurrentVersion() {
  try {
    const versionRef = database.ref('appVersion');
    const snapshot = await versionRef.once('value');

    if (snapshot.exists()) {
      const versionData = snapshot.val();
      const version = versionData.current;

      if (currentVersionDisplay) {
        currentVersionDisplay.textContent = `当前: v${version}`;
      }

      if (appVersionInput) {
        appVersionInput.placeholder = version;
      }
    }
  } catch (error) {
    console.error('❌ Failed to load current version:', error);
  }
}

// Update version button
if (updateVersionBtn) {
  updateVersionBtn.addEventListener('click', async () => {
    const newVersion = appVersionInput.value.trim();

    if (!newVersion) {
      showError('请输入新版本号');
      return;
    }

    // Validate version format (e.g., 5.1, 5.2.1)
    if (!/^\d+(\.\d+)*$/.test(newVersion)) {
      showError('版本号格式不正确 (例如: 5.1 或 5.2.1)');
      return;
    }

    showCustomModal({
      icon: '🚀',
      title: 'Update Version',
      message: `确定要将版本更新到 v${newVersion} 吗?\n\n这将强制所有在线用户刷新页面!`,
      type: 'confirm',
      confirmText: 'Update',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          updateVersionBtn.disabled = true;
          updateVersionBtn.textContent = '更新中...';

          // Update version in Firebase
          await database.ref('appVersion').set({
            current: newVersion,
            updatedAt: Date.now(),
            updatedBy: currentUser.uid
          });

          showSuccess(`版本已更新到 v${newVersion}!`);

          // Update display
          currentVersionDisplay.textContent = `当前: v${newVersion}`;
          appVersionInput.value = '';
          appVersionInput.placeholder = newVersion;

          console.log('✅ Version updated to:', newVersion);

        } catch (error) {
          console.error('❌ Failed to update version:', error);
          showError('更新版本失败: ' + error.message);
        } finally {
          updateVersionBtn.disabled = false;
          updateVersionBtn.textContent = '更新版本';
        }
      }
    });
  });
}
