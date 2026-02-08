# 🤖 LLM Chat Application

A modern, feature-rich chatbot application with a ChatGPT-like user interface powered by Hugging Face Transformers and Flask.

## ✨ Features

### Core Features
- 🎨 **Modern UI** - Clean, responsive interface with dark/light mode
- ⚡ **Real-time Chat** - Instant message responses with typing indicators
- ✏️ **Edit Messages** - Modify your sent messages
- 🗑️ **Delete Messages** - Remove messages with undo capability
- 🔍 **Search** - Search through chat history
- 📥 **Export** - Save conversations as JSON

### Advanced Features
- 😊 **Reactions** - Add emoji reactions to messages
- ⭐ **Bookmarks** - Bookmark important messages for quick access
- 📝 **Summaries** - Generate AI summaries of messages
- 🎯 **Categories** - Organize chats by category
- **Text Formatting** - Bold, italic, code, lists, and quotes

### UI Enhancements
- 🔔 **Toast Notifications** - Success, error, and info feedback
- ⏰ **Timestamps** - Know when each message was sent
- 📋 **Copy to Clipboard** - Quick message copying
- ✨ **Animations** - Smooth transitions and effects
- ↩️ **Undo Delete** - Recover deleted messages within 3 seconds

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip (Python package manager)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/llm-chatbot.git
cd llm-chatbot
```

2. **Create virtual environment**
```bash
python -m venv app_venv
source app_venv/bin/activate  # On Windows: app_venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Run the application**
```bash
python app.py
```

5. **Open in browser**
```
http://localhost:5000
```

## 📁 Project Structure

```
.
├── app.py                      # Flask backend
├── requirements.txt            # Python dependencies
├── templates/
│   └── index.html             # Main HTML template
├── static/
│   ├── css/
│   │   └── style.css          # Complete styling
│   └── script.js              # Frontend logic
├── README.md                  # This file
├── LICENSE                    # MIT License
└── CONTRIBUTING.md            # Contribution guidelines
```

## 🛠️ Technology Stack

**Frontend:**
- HTML5 - Semantic markup
- CSS3 - Responsive design with theme variables
- JavaScript ES6+ - Modular code with 60+ functions

**Backend:**
- Python 3.8+
- Flask 3.x - Web framework
- Flask-CORS - Cross-origin requests
- Hugging Face Transformers - LLM inference
- PyTorch - Deep learning framework

**Storage:**
- Browser localStorage - Persistent chat history and preferences

## 💻 Browser Compatibility

- Chrome/Edge (Latest)
- Firefox (Latest)
- Safari (Latest)
- Mobile browsers

## 🎯 Usage

### Basic Chat
1. Type your message in the input field
2. Press Enter or click Send
3. Chat history persists across sessions

### Select Category
Choose a category from the dropdown before chatting to organize conversations.

### Edit/Delete Messages
- Click the edit icon (✏️) to modify your message
- Click the delete icon (🗑️) to remove a message
- Click undo notification to recover deleted messages

### Bookmark Messages
Click the bookmark icon (⭐) to save important messages in the right sidebar.

### Add Reactions
Hover over a message and click the reaction button to add emoji responses.

### Export Chat
Click the export button to download your entire conversation as JSON.

### Dark/Light Mode
Toggle the theme using the theme button in the header.

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory (optional):
```
FLASK_ENV=development
FLASK_DEBUG=True
```

### AI Model Configuration
Edit `app.py` to change:
- Model name: `model_name = "gpt2"` (or other Hugging Face models)
- Max tokens: `max_length=100`

## 🐛 Troubleshooting

**Chat not responding:**
- Check if Flask server is running on http://localhost:5000
- Check browser console for JavaScript errors (F12)
- Verify all dependencies are installed

**Messages not persisting:**
- Ensure localStorage is enabled in your browser
- Check browser storage quota

**UI looks broken:**
- Clear browser cache (Ctrl+Shift+Delete)
- Ensure CSS file is loaded (check Network tab in DevTools)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:
- Reporting bugs
- Suggesting features
- Submitting pull requests
- Code style standards

## 📬 Support

For issues, questions, or suggestions:
1. Check [CONTRIBUTING.md](CONTRIBUTING.md) for help
2. Open an issue on GitHub
3. Review the troubleshooting section above

---

**Version:** 1.0.0  
**Last Updated:** February 2026  
**Author:** Umesh

Enjoy chatting! 🎉

This project is open source and available for personal and educational use.

## 🤝 Support

For issues or feature requests, please check the code comments or contact the development team.

---

**Made with ❤️ using Flask, JavaScript, and Modern CSS**
