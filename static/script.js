// ==================== STATE MANAGEMENT ====================
let conversationHistory = [];
let isLoading = false;
let chatSessions = [];
let isDarkMode = false;
let editingMessageId = null;
let deletingMessageId = null;
let searchQuery = '';
let currentCategory = 'General';
let bookmarkedMessages = [];
let messageReactions = {};
let messageSummaries = {};

// ==================== DOM ELEMENTS ====================
const messagesContainer = document.getElementById('messagesContainer');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const editModal = document.getElementById('editModal');
const deleteModal = document.getElementById('deleteModal');
const editTextarea = document.getElementById('editTextarea');
const searchInput = document.getElementById('searchInput');

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  loadThemePreference();
  loadChatHistory();
  loadBookmarks();
  setupEventListeners();
  setupAutoResize();
  removeSuggestionsOnScroll();
});

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
  chatForm.addEventListener('submit', sendMessage);
  messageInput.addEventListener('input', adjustTextareaHeight);
}

function setupAutoResize() {
  adjustTextareaHeight();
}

function adjustTextareaHeight() {
  messageInput.style.height = 'auto';
  const newHeight = Math.min(messageInput.scrollHeight, 200);
  messageInput.style.height = newHeight + 'px';
}

function handleKeydown(event) {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    sendMessage(event);
  }
}

// ==================== MESSAGE HANDLING ====================
async function sendMessage(event) {
  event.preventDefault();
  
  const message = messageInput.value.trim();
  if (!message || isLoading) return;

  // Clear input
  messageInput.value = '';
  adjustTextareaHeight();

  // Remove welcome screen if exists
  removeWelcomeScreen();

  // Add user message
  addMessage(message, 'user');
  conversationHistory.push({ role: 'user', content: message });

  // Show loading animation
  showLoadingAnimation();

  try {
    // Call backend
    const response = await fetch('http://127.0.0.1:5000/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: message,
        conversation_history: conversationHistory
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    removeLoadingAnimation();

    if (data.response) {
      addMessage(data.response, 'aibot');
      conversationHistory.push({ role: 'assistant', content: data.response });
      showToast('Response received', 'success', 1500);
    } else if (data.error) {
      addMessage('Error: ' + data.error, 'error');
      showToast('Error: ' + data.error, 'error');
    } else {
      addMessage('Error: Unexpected response from server', 'error');
      showToast('Unexpected response', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    removeLoadingAnimation();
    addMessage('Sorry, there was an error processing your request. Please try again.', 'error');
    showToast('Request failed', 'error');
  }

  focusInput();
}

function addMessage(text, role) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${role}`;
  messageElement.id = `msg-${Date.now()}`;

  const avatarElement = document.createElement('div');
  avatarElement.className = 'message-avatar';
  
  if (role === 'user') {
    avatarElement.innerHTML = '<i class="fas fa-user"></i>';
  } else if (role === 'aibot') {
    avatarElement.innerHTML = '<i class="fas fa-robot"></i>';
  } else if (role === 'error') {
    avatarElement.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
  }

  const contentElement = document.createElement('div');
  contentElement.className = 'message-content';
  contentElement.innerHTML = formatMessageContent(text);

  const wrapper = document.createElement('div');
  wrapper.className = 'message-wrapper';

  const actionsElement = document.createElement('div');
  actionsElement.className = 'message-actions';

  if (role === 'user') {
    const editBtn = document.createElement('button');
    editBtn.className = 'message-edit-btn';
    editBtn.title = 'Edit message';
    editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
    editBtn.onclick = (e) => { e.stopPropagation(); openEditModal(messageElement.id, text); };

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'message-delete-btn';
    deleteBtn.title = 'Delete message';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
    deleteBtn.onclick = (e) => { e.stopPropagation(); openDeleteModal(messageElement.id); };

    const bookmarkBtn = document.createElement('button');
    bookmarkBtn.className = 'bookmark-btn';
    bookmarkBtn.title = 'Bookmark message';
    bookmarkBtn.innerHTML = '<i class="fas fa-star"></i>';
    bookmarkBtn.onclick = (e) => { e.stopPropagation(); toggleBookmark(messageElement.id, text); };

    actionsElement.appendChild(editBtn);
    actionsElement.appendChild(deleteBtn);
    actionsElement.appendChild(bookmarkBtn);
  } else if (role === 'aibot') {
    const summarizeBtn = document.createElement('button');
    summarizeBtn.className = 'summarize-btn';
    summarizeBtn.title = 'Summarize response';
    summarizeBtn.innerHTML = '<i class="fas fa-compress"></i> Summarize';
    summarizeBtn.onclick = (e) => { e.stopPropagation(); toggleSummarize(messageElement.id, text); };

    const bookmarkBtn = document.createElement('button');
    bookmarkBtn.className = 'bookmark-btn';
    bookmarkBtn.title = 'Bookmark message';
    bookmarkBtn.innerHTML = '<i class="fas fa-star"></i>';
    bookmarkBtn.onclick = (e) => { e.stopPropagation(); toggleBookmark(messageElement.id, text); };

    actionsElement.appendChild(summarizeBtn);
    actionsElement.appendChild(bookmarkBtn);
  }

  wrapper.appendChild(contentElement);
  wrapper.appendChild(actionsElement);
  messageElement.appendChild(avatarElement);
  messageElement.appendChild(wrapper);

  // Add timestamp (Phase 3)
  addTimestampToMessage(messageElement);

  // Add reactions section (Phase 2)
  const reactionsContainer = document.createElement('div');
  reactionsContainer.className = 'message-reactions';
  reactionsContainer.id = `reactions-${messageElement.id.replace('msg-', '')}`;
  
  if (role !== 'error') {
    const addReactionBtn = document.createElement('button');
    addReactionBtn.className = 'add-reaction-btn';
    addReactionBtn.innerHTML = '😊 +';
    addReactionBtn.title = 'Add reaction';
    addReactionBtn.onclick = (e) => { e.stopPropagation(); showReactionPicker(e, messageElement.id); };
    reactionsContainer.appendChild(addReactionBtn);
  }

  messageElement.appendChild(reactionsContainer);
  messagesContainer.appendChild(messageElement);
  scrollToBottom();
  applySearchHighlight(contentElement);
}

function formatMessageContent(text) {
  // Basic HTML escaping and formatting
  let formatted = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  // Convert URLs to links
  formatted = formatted.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank">$1</a>'
  );
  
  // Convert code blocks
  formatted = formatted.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');
  
  return formatted;
}

function showLoadingAnimation() {
  isLoading = true;
  sendBtn.disabled = true;

  const loadingElement = document.createElement('div');
  loadingElement.className = 'loading-animation';
  loadingElement.id = 'loadingAnimation';

  const avatarElement = document.createElement('div');
  avatarElement.className = 'loading-avatar';
  avatarElement.innerHTML = '<i class="fas fa-robot"></i>';

  const textElement = document.createElement('div');
  textElement.className = 'loading-text';
  textElement.id = 'loadingText';
  textElement.innerHTML = '<span></span><span></span><span></span>';

  loadingElement.appendChild(avatarElement);
  loadingElement.appendChild(textElement);
  messagesContainer.appendChild(loadingElement);

  scrollToBottom();
}

function removeLoadingAnimation() {
  isLoading = false;
  sendBtn.disabled = false;

  const loadingElement = document.getElementById('loadingAnimation');
  if (loadingElement) {
    loadingElement.remove();
  }
}

function removeWelcomeScreen() {
  const welcomeScreen = document.querySelector('.welcome-screen');
  if (welcomeScreen) {
    welcomeScreen.remove();
  }
}

function scrollToBottom() {
  messagesContainer.parentElement.scrollTop = messagesContainer.parentElement.scrollHeight;
}

function focusInput() {
  messageInput.focus();
}

// ==================== SUGGESTION HANDLING ====================
function insertSuggestion(text) {
  messageInput.value = text;
  adjustTextareaHeight();
  focusInput();
}

// ==================== UTILITY FUNCTIONS ====================
function startNewChat() {
  // Save current session if it has messages
  if (conversationHistory.length > 0) {
    saveChatSession();
  }

  // Reset conversation
  conversationHistory = [];
  messagesContainer.innerHTML = `
    <div class="welcome-screen">
      <div class="welcome-content">
        <div class="logo-section">
          <i class="fas fa-robot"></i>
        </div>
        <h2>Welcome to Chat AI Bot</h2>
        <p>Ask me anything and I'll help you get the answers you need</p>
        <div class="suggestions">
          <div class="suggestion-item" onclick="insertSuggestion('Explain quantum computing')">
            <i class="fas fa-brain"></i>
            <span>Explain quantum computing</span>
          </div>
          <div class="suggestion-item" onclick="insertSuggestion('Write a Python function')">
            <i class="fas fa-code"></i>
            <span>Write Python code</span>
          </div>
          <div class="suggestion-item" onclick="insertSuggestion('Tell me a joke')">
            <i class="fas fa-laugh"></i>
            <span>Tell me a joke</span>
          </div>
          <div class="suggestion-item" onclick="insertSuggestion('Summarize AI trends')">
            <i class="fas fa-chart-line"></i>
            <span>AI trends</span>
          </div>
        </div>
      </div>
    </div>
  `;

  messageInput.value = '';
  focusInput();
}

function saveChatSession() {
  const session = {
    id: Date.now(),
    date: new Date().toLocaleDateString(),
    preview: conversationHistory[0]?.content.substring(0, 50) || 'New Chat',
    messages: conversationHistory
  };

  chatSessions.push(session);
  localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
  updateChatHistory();
}

function loadChatHistory() {
  const saved = localStorage.getItem('chatSessions');
  if (saved) {
    chatSessions = JSON.parse(saved);
    updateChatHistory();
  }
}

function updateChatHistory() {
  const historyContainer = document.querySelector('.chat-history');
  if (!historyContainer) return;

  const historySectionDiv = historyContainer.querySelector('.history-title') || 
    (() => {
      const div = document.createElement('div');
      div.className = 'history-title';
      div.textContent = 'Recent Chats';
      historyContainer.insertBefore(div, historyContainer.firstChild);
      return div;
    })();

  // Clear old history items
  const items = historyContainer.querySelectorAll('.history-item');
  items.forEach(item => item.remove());

  // Add new items
  chatSessions.slice(-5).reverse().forEach(session => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `
      <div class="history-item-content">
        <p class="history-item-title">${session.preview}</p>
        <p class="history-item-date">${session.date}</p>
      </div>
    `;
    item.style.cssText = `
      padding: 12px;
      cursor: pointer;
      border-radius: 8px;
      margin-bottom: 8px;
      background: #f7f7f7;
      transition: all 0.3s ease;
      border: 1px solid #e5e5e5;
    `;
    item.onclick = () => loadChatSession(session.id);
    item.onmouseover = () => item.style.background = '#efefef';
    item.onmouseout = () => item.style.background = '#f7f7f7';
    historyContainer.appendChild(item);
  });
}

function loadChatSession(sessionId) {
  const session = chatSessions.find(s => s.id === sessionId);
  if (!session) return;

  conversationHistory = session.messages;
  messagesContainer.innerHTML = '';

  // Render all messages
  session.messages.forEach(msg => {
    addMessage(msg.content, msg.role === 'user' ? 'user' : 'aibot');
  });

  scrollToBottom();
  focusInput();
}

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.style.transform = sidebar.style.transform === 'translateX(-100%)' 
      ? 'translateX(0)' 
      : 'translateX(-100%)';
  }
}

function showSettings() {
  alert('Settings panel coming soon!');
}

function removeSuggestionsOnScroll() {
  // Auto-remove welcome screen on first scroll
  const wrapper = document.querySelector('.messages-wrapper');
  if (wrapper) {
    wrapper.addEventListener('scroll', () => {
      if (wrapper.scrollTop > 50 && messagesContainer.innerHTML.includes('welcome-screen')) {
        removeWelcomeScreen();
      }
    }, { once: true });
  }
}

// ==================== THEME MANAGEMENT ====================
function toggleTheme() {
  isDarkMode = !isDarkMode;
  applyTheme();
  localStorage.setItem('darkMode', isDarkMode);
  updateThemeButton();
}

function applyTheme() {
  if (isDarkMode) {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
}

function loadThemePreference() {
  const saved = localStorage.getItem('darkMode');
  if (saved !== null) {
    isDarkMode = JSON.parse(saved);
    applyTheme();
  }
  updateThemeButton();
}

function updateThemeButton() {
  const btn = document.querySelector('.theme-toggle-btn i');
  if (btn) {
    btn.className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// ==================== EDIT & DELETE MESSAGES ====================
function openEditModal(messageId, text) {
  editingMessageId = messageId;
  editTextarea.value = text;
  editModal.classList.add('show');
  editTextarea.focus();
}

function closeEditModal() {
  editModal.classList.remove('show');
  editingMessageId = null;
  editTextarea.value = '';
}

function saveEditedMessage() {
  if (!editingMessageId) return;

  const newText = editTextarea.value.trim();
  if (!newText) return;

  const messageElement = document.getElementById(editingMessageId);
  if (messageElement) {
    const contentElement = messageElement.querySelector('.message-content');
    contentElement.innerHTML = formatMessageContent(newText);
    
    // Update conversation history
    const index = conversationHistory.length - 1;
    if (index >= 0) {
      conversationHistory[index].content = newText;
    }
  }

  closeEditModal();
}

function openDeleteModal(messageId) {
  deletingMessageId = messageId;
  deleteModal.classList.add('show');
}

function closeDeleteModal() {
  deleteModal.classList.remove('show');
  deletingMessageId = null;
}

function confirmDelete() {
  if (!deletingMessageId) return;

  const messageElement = document.getElementById(deletingMessageId);
  if (messageElement) {
    // Save message for undo
    const msgText = messageElement.querySelector('.message-content')?.innerText || '';
    lastDeletedMessage = { role: 'user', content: msgText };
    lastDeletedIndex = conversationHistory.length - 1;
    
    if (conversationHistory.length > 0) {
      conversationHistory.pop();
    }
    
    messageElement.style.animation = 'slideOutDown 0.3s ease';
    setTimeout(() => {
      messageElement.remove();
      showUndoNotification(messageElement, lastDeletedIndex);
    }, 300);
  }

  closeDeleteModal();
}

// ==================== MESSAGE SEARCH ====================
function searchMessages() {
  searchQuery = searchInput.value.toLowerCase();
  clearSearchHighlights();
  
  if (searchQuery.length === 0) {
    return;
  }

  const messages = document.querySelectorAll('.message-content');
  messages.forEach(msg => {
    if (msg.textContent.toLowerCase().includes(searchQuery)) {
      applySearchHighlight(msg);
    }
  });
}

function clearSearchHighlights() {
  document.querySelectorAll('.message-highlight').forEach(el => {
    el.classList.remove('message-highlight');
  });
}

function applySearchHighlight(contentElement) {
  if (!searchQuery) return;

  let html = contentElement.innerHTML;
  const regex = new RegExp(`(${searchQuery})`, 'gi');
  html = html.replace(regex, '<mark class="message-highlight">$1</mark>');
  contentElement.innerHTML = html;
}

// ==================== EXPORT CONVERSATION ====================
function exportConversation() {
  if (conversationHistory.length === 0) {
    alert('No messages to export!');
    return;
  }

  const format = confirm('Click OK for JSON format, or Cancel for TXT format');
  
  if (format) {
    exportAsJSON();
  } else {
    exportAsTXT();
  }
}

function exportAsJSON() {
  const data = {
    date: new Date().toISOString(),
    messages: conversationHistory,
    messageCount: conversationHistory.length
  };

  const jsonString = JSON.stringify(data, null, 2);
  downloadFile(jsonString, 'chat-export.json', 'application/json');
}

function exportAsTXT() {
  let txtContent = `Chat Export\n`;
  txtContent += `Generated: ${new Date().toLocaleString()}\n`;
  txtContent += `Messages: ${conversationHistory.length}\n\n`;
  txtContent += '='.repeat(50) + '\n\n';

  conversationHistory.forEach((msg, idx) => {
    const role = msg.role === 'user' ? 'You' : 'AI Assistant';
    txtContent += `${role}:\n${msg.content}\n\n`;
  });

  downloadFile(txtContent, 'chat-export.txt', 'text/plain');
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// ==================== MODAL CLICK OUTSIDE ====================
window.addEventListener('click', (event) => {
  if (event.target === editModal) {
    closeEditModal();
  }
  if (event.target === deleteModal) {
    closeDeleteModal();
  }
});

// ==================== PHASE 2: MESSAGE REACTIONS ====================
function showReactionPicker(event, messageId) {
  event.preventDefault();
  
  let picker = document.getElementById(`picker-${messageId}`);
  if (picker && picker.classList.contains('show')) {
    picker.classList.remove('show');
    return;
  }

  // Remove other pickers
  document.querySelectorAll('.reaction-picker.show').forEach(p => p.classList.remove('show'));

  if (!picker) {
    picker = document.createElement('div');
    picker.className = 'reaction-picker';
    picker.id = `picker-${messageId}`;
    
    const reactions = ['❤️', '👍', '😂', '😮', '😢', '🔥'];
    reactions.forEach(reaction => {
      const btn = document.createElement('button');
      btn.textContent = reaction;
      btn.onclick = () => addReaction(messageId, reaction);
      picker.appendChild(btn);
    });

    event.target.parentElement.appendChild(picker);
  }

  picker.classList.add('show');
}

function addReaction(messageId, emoji) {
  if (!messageReactions[messageId]) {
    messageReactions[messageId] = {};
  }

  const currentUser = 'You';
  if (!messageReactions[messageId][emoji]) {
    messageReactions[messageId][emoji] = [];
  }

  const index = messageReactions[messageId][emoji].indexOf(currentUser);
  if (index > -1) {
    messageReactions[messageId][emoji].splice(index, 1);
  } else {
    messageReactions[messageId][emoji].push(currentUser);
  }

  renderReactions(messageId);
  saveReactions();
  
  document.getElementById(`picker-${messageId}`).classList.remove('show');
}

function renderReactions(messageId) {
  const reactionsContainer = document.getElementById(`reactions-${messageId.replace('msg-', '')}`);
  if (!reactionsContainer) return;

  const existingReactions = reactionsContainer.querySelectorAll('.reaction-btn');
  existingReactions.forEach(r => r.remove());

  const reactions = messageReactions[messageId];
  if (reactions) {
    Object.entries(reactions).forEach(([emoji, users]) => {
      if (users.length > 0) {
        const btn = document.createElement('button');
        btn.className = 'reaction-btn';
        if (users.includes('You')) {
          btn.classList.add('active');
        }
        btn.innerHTML = `${emoji} <span class="reaction-count">${users.length}</span>`;
        btn.title = users.join(', ');
        btn.onclick = (e) => { e.stopPropagation(); addReaction(messageId, emoji); };
        reactionsContainer.appendChild(btn);
      }
    });
  }

  // Re-add the + button at the end
  const addBtn = document.createElement('button');
  addBtn.className = 'add-reaction-btn';
  addBtn.innerHTML = '😊 +';
  addBtn.onclick = (e) => { e.stopPropagation(); showReactionPicker(e, messageId); };
  reactionsContainer.appendChild(addBtn);
}

function saveReactions() {
  localStorage.setItem('messageReactions', JSON.stringify(messageReactions));
}

function loadReactions() {
  const saved = localStorage.getItem('messageReactions');
  if (saved) {
    messageReactions = JSON.parse(saved);
  }
}

// ==================== PHASE 2: MESSAGE BOOKMARKS ====================
function toggleBookmark(messageId, text) {
  const msgElement = document.getElementById(messageId);
  const bookmarkBtn = msgElement.querySelector('.bookmark-btn');
  
  const index = bookmarkedMessages.findIndex(b => b.id === messageId);
  if (index > -1) {
    bookmarkedMessages.splice(index, 1);
    bookmarkBtn.classList.remove('active');
  } else {
    bookmarkedMessages.push({
      id: messageId,
      text: text.substring(0, 200),
      date: new Date().toLocaleString(),
      fullText: text
    });
    bookmarkBtn.classList.add('active');
  }

  saveBookmarks();
  updateBookmarksPanel();
}

function toggleBookmarks() {
  const panel = document.getElementById('bookmarksPanel');
  panel.classList.toggle('show');
}

function updateBookmarksPanel() {
  const content = document.getElementById('bookmarksContent');
  
  if (bookmarkedMessages.length === 0) {
    content.innerHTML = '<p style="text-align: center; color: var(--text-tertiary); padding: 20px;">No bookmarks yet. Star messages to bookmark them!</p>';
    return;
  }

  content.innerHTML = '';
  bookmarkedMessages.forEach(bookmark => {
    const item = document.createElement('div');
    item.className = 'bookmark-item';
    item.innerHTML = `
      <div class="bookmark-item-preview">${escapeHtml(bookmark.text)}</div>
      <div class="bookmark-item-date">${bookmark.date}</div>
    `;
    item.onclick = () => {
      const msgEl = document.getElementById(bookmark.id);
      if (msgEl) {
        msgEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        msgEl.style.animation = 'none';
        setTimeout(() => {
          msgEl.style.animation = 'slideInUp 0.5s ease';
        }, 100);
      }
    };
    content.appendChild(item);
  });
}

function saveBookmarks() {
  localStorage.setItem('bookmarkedMessages', JSON.stringify(bookmarkedMessages));
}

function loadBookmarks() {
  const saved = localStorage.getItem('bookmarkedMessages');
  if (saved) {
    bookmarkedMessages = JSON.parse(saved);
  }
}

// ==================== PHASE 2: AI RESPONSE SUMMARIES ====================
function toggleSummarize(messageId, text) {
  const msgElement = document.getElementById(messageId);
  const contentElement = msgElement.querySelector('.message-content');

  if (messageSummaries[messageId]) {
    contentElement.innerHTML = formatMessageContent(text);
    delete messageSummaries[messageId];
  } else {
    const summary = generateSummary(text);
    const summaryHtml = `
      <div class="message-summary">
        <div class="summary-label">Summary</div>
        ${formatMessageContent(summary)}
      </div>
      <details style="margin-top: 8px; cursor: pointer;">
        <summary style="color: var(--text-secondary); font-size: 12px;">Show full response</summary>
        <div style="margin-top: 8px; border-top: 1px solid var(--border-color); padding-top: 8px;">
          ${formatMessageContent(text)}
        </div>
      </details>
    `;
    contentElement.innerHTML = summaryHtml;
    messageSummaries[messageId] = summary;
  }
}

function generateSummary(text) {
  // Simple extractive summary - get first 2-3 sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  if (sentences.length <= 2) {
    return text.substring(0, 150) + (text.length > 150 ? '...' : '');
  }
  
  const summary = sentences.slice(0, 2).join('').trim();
  return summary.length > 200 ? summary.substring(0, 200) + '...' : summary;
}

// ==================== PHASE 2: TEXT FORMATTING ====================
function formatMessageContent(text) {
  let formatted = escapeHtml(text);
  
  // Convert URLs to links
  formatted = formatted.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" style="color: #10a37f; text-decoration: underline;">$1</a>'
  );
  
  // Convert code blocks (```code```)
  formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Convert inline code (`code`)
  formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Convert bold (**text**)
  formatted = formatted.replace(/\*\*([^\*]+)\*\*/g, '<strong class="text-bold">$1</strong>');
  
  // Convert italic (*text*)
  formatted = formatted.replace(/(?<!\*)\*([^\*]+)\*(?!\*)/g, '<em class="text-italic">$1</em>');
  
  // Convert blockquotes (> text)
  formatted = formatted.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
  
  // Convert lists (- item or * item)
  formatted = formatted.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
  formatted = formatted.replace(/(<li>.*?<\/li>)/s, '<ul class="text-list">$1</ul>');
  
  // Convert line breaks
  formatted = formatted.replace(/\n/g, '<br>');
  
  return formatted;
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// ==================== PHASE 2: CONVERSATION CATEGORIES ====================
function selectCategory(category) {
  currentCategory = category;
  
  // Update button styles
  document.querySelectorAll('.category-tag').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
}

// ==================== PHASE 3: TOAST NOTIFICATIONS ====================
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠'
  };
  
  toast.innerHTML = `<span class="toast-icon">${icons[type] || '•'}</span><span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutDown 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ==================== PHASE 3: MESSAGE TIMESTAMPS ====================
function getFormattedTime(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${mins}`;
}

function addTimestampToMessage(messageElement, timestamp = new Date()) {
  const contentElement = messageElement.querySelector('.message-content');
  const timestampEl = document.createElement('span');
  timestampEl.className = 'message-timestamp';
  timestampEl.textContent = getFormattedTime(timestamp);
  timestampEl.style.cursor = 'pointer';
  timestampEl.title = 'Click to copy message';
  timestampEl.onclick = (e) => {
    e.stopPropagation();
    const text = contentElement.innerText || contentElement.textContent;
    copyToClipboard(text);
  };
  contentElement.parentElement.appendChild(timestampEl);
}

// ==================== PHASE 3: COPY TO CLIPBOARD ====================
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!', 'success', 2000);
  }).catch(() => {
    showToast('Failed to copy', 'error', 2000);
  });
}

function addCopyButton(contentElement) {
  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
  copyBtn.onclick = (e) => {
    e.stopPropagation();
    const text = contentElement.innerText || contentElement.textContent;
    copyToClipboard(text);
  };
  return copyBtn;
}

// ==================== PHASE 3: UNDO DELETE ====================
let lastDeletedMessage = null;
let lastDeletedIndex = null;
let deleteUndoTimeout = null;

function showUndoNotification(originalElement, originalIndex) {
  const notification = document.createElement('div');
  notification.className = 'undo-notification';
  notification.innerHTML = `
    <span>Message deleted</span>
    <button class="undo-btn" onclick="undoDelete(this.parentElement)">Undo</button>
  `;
  
  messagesContainer.appendChild(notification);
  scrollToBottom();
  
  deleteUndoTimeout = setTimeout(() => {
    notification.style.animation = 'slideOutDown 0.3s ease';
    setTimeout(() => notification.remove(), 300);
    lastDeletedMessage = null;
    lastDeletedIndex = null;
  }, 3000);
}

function undoDelete(notification) {
  if (lastDeletedMessage) {
    if (lastDeletedIndex !== null && lastDeletedIndex < conversationHistory.length) {
      conversationHistory.splice(lastDeletedIndex, 0, lastDeletedMessage);
    }
    
    const newElement = document.createElement('div');
    newElement.className = `message user`;
    newElement.id = `msg-${Date.now()}`;
    newElement.innerHTML = lastDeletedMessage.content;
    
    notification.replaceWith(newElement);
    showToast('Message restored!', 'success', 2000);
    
    lastDeletedMessage = null;
    lastDeletedIndex = null;
    clearTimeout(deleteUndoTimeout);
  }
}

// ==================== EXPORT FOR DEBUGGING ====================
window.chatAPI = {
  sendMessage,
  startNewChat,
  loadChatSession,
  conversationHistory: () => conversationHistory,
  currentCategory: () => currentCategory,
  bookmarkedMessages: () => bookmarkedMessages,
  showToast
};
