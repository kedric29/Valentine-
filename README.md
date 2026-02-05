# Valentine's Day App 💘

A beautiful interactive Valentine's Day website where users enter their lover's name and get a romantic "I Love You" message with animations.

## Features ❤️

- ✨ Login system to enter lover's name
- 🎬 Animated kissing scene after clicking "Yes"
- 💕 Display "I Love You" with the entered name
- 🎉 Floating emoji background
- 🖥️ Backend server to track valentine messages
- 📱 Mobile-friendly responsive design

## How to Run

### Option 1: With Node.js Server (Recommended)

1. Make sure you have Node.js installed
2. Navigate to the project folder in terminal
3. Run the server:
   ```
   npm install
   node server.js
   ```
4. Open your browser and go to `http://localhost:3000`

### Optional: Enable WhatsApp (Twilio)

1. Create a Twilio account with WhatsApp Business API enabled
2. Get your `ACCOUNT_SID`, `AUTH_TOKEN`, and Twilio WhatsApp `FROM` number (format: `+1234567890`)
3. Set environment variables before running the server:

```bash
export TWILIO_ACCOUNT_SID=your_sid_here
export TWILIO_AUTH_TOKEN=your_token_here
export TWILIO_FROM=+1234567890
node server.js
```

On Windows PowerShell:
```powershell
$env:TWILIO_ACCOUNT_SID="your_sid_here"
$env:TWILIO_AUTH_TOKEN="your_token_here"
$env:TWILIO_FROM="+1234567890"
node server.js
```

If WhatsApp is configured, gift submissions will send a WhatsApp message to the lover's phone. If not configured, gifts are saved to `pending-gifts.json`.

### Option 2: Direct in Browser

Simply open `index.html` in your web browser.

## How It Works

1. **Login**: Enter your lover's name
2. **Question**: See the Valentine question with animations
3. **Click Yes**: Watch the kissing animation
4. **Love Message**: Get "I Love You" message with your lover's name

## Backend API

- `POST /api/login` - Save a lover's name
- `GET /api/messages` - View all valentine messages received

## Files

- `index.html` - Main page
- `script.js` - Interactive JavaScript
- `style.css` - Styling and animations
- `server.js` - Node.js backend server
- `valentine-visitors.json` - Stored messages (auto-created)

Enjoy! 💕
