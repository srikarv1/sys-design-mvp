# 🤖 Claude API Setup Guide

## Quick Setup

1. **Get your Anthropic API key**:
   - Go to [console.anthropic.com](https://console.anthropic.com)
   - Sign up/login and create an API key
   - Copy the key (starts with `sk-ant-...`)

2. **Configure the environment**:
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and add your API key
   VITE_ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
   ```

3. **Restart the development server**:
   ```bash
   npm run dev
   ```

## How It Works

### 🛡️ Smart API Usage
- **Hard checks** prevent unnecessary API calls
- **Request limit**: 10 calls per session
- **Caching**: Results cached for 5 minutes
- **Cost-effective**: Uses Claude 3 Haiku model

### 🎯 When Claude Analysis Triggers
- System has 3+ components
- Includes required components (database, etc.)
- Sufficient complexity for meaningful analysis

### 💰 Cost Management
- **Estimated cost**: ~$0.01-0.05 per analysis
- **With $25 budget**: 500-2500 analyses possible
- **Smart filtering**: Only analyzes worthwhile systems

## Features

### 📊 Intelligent Feedback
- **Enhanced scoring** with nuanced analysis
- **Pros & cons** of your system design
- **Architecture grade** (A-F)
- **Detailed insights** on cost, scalability, security

### 🎮 User Interface
- **Claude Feedback Panel** in metrics section
- **Usage Stats Modal** (click "🤖 Claude Usage" button)
- **Visual indicators** for API status and usage

## Troubleshooting

### ❌ "API Key Missing" Error
- Check that `.env` file exists and contains your API key
- Restart the development server after adding the key
- Ensure the key starts with `sk-ant-`

### ⚠️ "Claude analysis not available"
- Add more components (minimum 3)
- Include database and load balancer components
- Build more complex systems for better feedback

### 🔄 Reset Usage
- Click "🤖 Claude Usage" button
- Click "Reset Usage" to start fresh session

## Security Note

The `dangerouslyAllowBrowser: true` option is required for browser usage but exposes your API key in the client-side code. This is acceptable for development and learning purposes, but for production:

1. Use a backend proxy to hide the API key
2. Implement proper authentication
3. Add rate limiting and usage controls

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your API key is valid and has credits
3. Ensure you have a stable internet connection
