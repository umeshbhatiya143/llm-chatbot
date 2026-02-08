# Contributing to LLM Chat Application

Thank you for your interest in contributing! We welcome all contributions, from bug reports to new features.

## 🎯 How to Contribute

### Reporting Bugs
1. **Check existing issues** - Avoid duplicates
2. **Provide clear description** - What happened vs what should happen
3. **Include environment** - Python version, browser, OS
4. **Add reproduction steps** - How to reproduce the bug
5. **Attach logs** - Include error messages or console logs

### Suggesting Features
1. **Check roadmap** - Feature may already be planned
2. **Describe use case** - Why is this feature needed
3. **Provide examples** - Show how it would work
4. **Get feedback** - Discuss before implementing

### Submitting Code

#### Setup Development Environment
```bash
# Clone your fork
git clone https://github.com/yourusername/llm-chatbot.git
cd llm-chatbot

# Create virtual environment
python3 -m venv app_venv
source app_venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Create Feature Branch
```bash
git checkout -b feature/your-feature-name
```

Use descriptive branch names:
- `feature/add-user-auth` - New feature
- `fix/login-bug` - Bug fix
- `docs/update-readme` - Documentation
- `refactor/optimize-search` - Code improvement

#### Make Changes

1. **Code Style**
   - Use 2 spaces for indentation (CSS/JS)
   - Use 4 spaces for Python
   - Keep lines under 100 characters
   - Use meaningful variable names

2. **JavaScript**
   ```javascript
   // Good
   function showNotification(message, type) {
     const notification = createElement(message);
     notification.classList.add(`notify-${type}`);
     document.body.appendChild(notification);
   }
   
   // Bad
   function sn(m, t) {
     const n = ce(m);
     n.classList.add(`n-${t}`);
     document.body.appendChild(n);
   }
   ```

3. **CSS**
   ```css
   /* Good - Use variables and semantic naming */
   .message-container {
     background: var(--message-bg);
     padding: var(--spacing-md);
     border-radius: var(--border-radius);
   }
   
   /* Bad - Hard-coded values */
   .msg { background: #fff; padding: 12px; border-radius: 8px; }
   ```

4. **Python**
   ```python
   # Follow PEP 8
   from flask import Flask, request, jsonify
   
   app = Flask(__name__)
   
   @app.route('/api/chat', methods=['POST'])
   def handle_chat():
       """Handle chat requests from frontend."""
       data = request.get_json()
       # Process...
       return jsonify({'response': 'result'})
   ```

#### Test Your Changes

1. **Manual Testing**
   - Start the app: `./start.sh`
   - Open http://127.0.0.1:5000
   - Test your feature on Chrome, Firefox, Safari
   - Test on mobile (use browser DevTools)

2. **Check Console**
   - Open Developer Tools (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests

#### Commit Changes

```bash
# Stage changes
git add .

# Commit with clear message
git commit -m "feature: add emoji reactions to messages

- Implemented reaction picker with 6 emoji options
- Added reaction counts and user indicators
- Reactions persist in localStorage
- Fixes #123"
```

**Commit Message Format:**
```
<type>: <subject>

<body>

<footer>
```

Types:
- `feature` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Adding tests
- `chore` - Build, dependencies

#### Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# - Provide clear title and description
# - Link related issues (#123)
# - Include before/after screenshots if UI change
# - Mention any breaking changes
```

#### PR Checklist

- [ ] Code follows style guide
- [ ] Changes tested locally
- [ ] No console errors
- [ ] Works on mobile
- [ ] Documentation updated
- [ ] No breaking changes (or noted)
- [ ] Commits are clean and descriptive

---

## 📋 Code Review Process

1. **Automated Checks**
   - Code style validation
   - File size checks

2. **Manual Review**
   - Code quality
   - Performance impact
   - Documentation completeness

3. **Testing**
   - Feature functionality
   - Browser compatibility
   - Mobile responsiveness

4. **Approval & Merge**
   - Requires 1 approval
   - All checks must pass
   - Squash merge to main

---

## 🎓 Learning Resources

### Project Structure
- **app.py** - Flask backend (50 lines)
- **static/script.js** - Frontend logic (1012 lines)
- **static/css/style.css** - Styling (1423 lines)
- **templates/index.html** - HTML template (202 lines)

### Key Concepts
- **Phases**: Features organized in 3 phases (Phase 1-3)
- **State Management**: Using JavaScript variables
- **localStorage**: Persistent browser storage
- **DOM Manipulation**: Dynamic HTML creation

### Important Functions

**Frontend (script.js):**
- `sendMessage()` - Handle message sending
- `addMessage()` - Add message to UI
- `showToast()` - Show notifications
- `toggleTheme()` - Switch dark/light mode
- `addReaction()` - Handle emoji reactions

**Backend (app.py):**
- `@app.route('/chatbot', methods=['POST'])` - Chat endpoint
- `process_prompt()` - Handle user input
- `get_ai_response()` - Get AI response

---

## 🐛 Common Issues

### JavaScript Console Errors
- Check DevTools → Console tab
- Look for `undefined` variables
- Check DOM elements exist

### CSS Not Applying
- Verify CSS is loaded (Network tab)
- Check selector specificity
- Clear browser cache (Ctrl+Shift+Delete)

### Backend Errors
- Check Flask logs in terminal
- Verify Python packages installed
- Check requirements.txt versions

---

## 🎉 Rewards

Contributors who submit merged PRs get:
- ⭐ Mentioned in README
- 🏆 Contributor badge
- 📝 Listed in CONTRIBUTORS.md

---

## 📞 Questions?

- **Documentation**: Check [DEVELOPER.md](DEVELOPER.md)
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions
- **Email**: Include in repo details

---

## 📜 Agreement

By contributing, you agree to:
- Release your contribution under MIT License
- Your contribution may be modified
- No additional compensation expected

---

Thank you for making this project better! 🚀

Made with ❤️ by the community
