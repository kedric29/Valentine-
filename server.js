const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// Store lover names for valentine messages
const valentineData = {
  visitors: []
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API endpoint: Login and save lover name
  if (pathname === '/api/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const timestamp = new Date().toISOString();

        // Server-side validation
        function validName(n){
          if(!n) return false;
          const cleaned = (''+n).trim();
          if(cleaned.length < 2) return false;
          const lower = cleaned.toLowerCase();
          const bad = ['uwongo','fake','test','1234','namba','0000','asdf','qwerty'];
          for(const w of bad) if(lower.includes(w)) return false;
          const letters = cleaned.replace(/[^\p{L}]/gu, '');
          return letters.length > 0;
        }
        function validPhone(p){
          if(!p) return true; // optional
          return /^\+\d{7,15}$/.test((''+p).trim());
        }

        if(!validName(data.loverName)){
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid lover name' }));
          return;
        }
        if(!validPhone(data.loverPhone)){
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid phone format; use +countrycode...' }));
          return;
        }

        valentineData.visitors.push({
          loverName: data.loverName,
          loverPhone: data.loverPhone || null,
          timestamp: timestamp
        });

        // Save to file
        fs.writeFileSync(
          path.join(__dirname, 'valentine-visitors.json'),
          JSON.stringify(valentineData, null, 2)
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          message: `I love you ${data.loverName}! ❤️` 
        }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid data' }));
      }
    });
    return;
  }

  // API endpoint: Send gift (tries Twilio if configured, otherwise saves locally)
  if (pathname === '/api/send-gift' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);

        // Server-side validation for gifts
        function validName(n){
          if(!n) return false;
          const cleaned = (''+n).trim();
          if(cleaned.length < 2) return false;
          const lower = cleaned.toLowerCase();
          const bad = ['uwongo','fake','test','1234','namba','0000','asdf','qwerty'];
          for(const w of bad) if(lower.includes(w)) return false;
          const letters = cleaned.replace(/[^\p{L}]/gu, '');
          return letters.length > 0;
        }
        function validPhone(p){
          if(!p) return true; // optional
          return /^\+\d{7,15}$/.test((''+p).trim());
        }

        if(!validName(data.loverName)){
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid lover name' }));
          return;
        }
        if(!validPhone(data.loverPhone)){
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid phone format; use +countrycode...' }));
          return;
        }

        const record = {
          loverName: data.loverName,
          loverPhone: data.loverPhone || null,
          giftId: data.giftId,
          note: data.note || '',
          timestamp: new Date().toISOString()
        };

        // Save to pending file
        const pendingPath = path.join(__dirname, 'pending-gifts.json');
        let pending = [];
        try { pending = JSON.parse(fs.readFileSync(pendingPath)); } catch (e) { pending = []; }
        pending.push(record);
        fs.writeFileSync(pendingPath, JSON.stringify(pending, null, 2));

        // Try Twilio WhatsApp if env configured
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM && data.loverPhone) {
          try {
            const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
            const giftNames = {
              'chocolate': '🍫 Chocolate Box',
              'flowers': '🌹 Red Roses',
              'teddy': '🧸 Teddy Bear',
              'ring': '💍 Promise Ring',
              'card': '💌 Handwritten Card'
            };
            const giftName = giftNames[data.giftId] || data.giftId;
            const msg = `💘 ${data.loverName}, you received a gift: ${giftName} 🎁\n\n${data.note || 'I love you!'}`;
            
            // WhatsApp format: from and to must be "whatsapp:+1234567890"
            const fromWhatsApp = `whatsapp:${process.env.TWILIO_FROM}`;
            const toWhatsApp = `whatsapp:${data.loverPhone}`;
            
            twilio.messages.create({ body: msg, from: fromWhatsApp, to: toWhatsApp })
              .then(() => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, sent: true }));
              })
              .catch(err => {
                console.error('WhatsApp send error', err);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, sent: false }));
              });
            return;
          } catch (e) {
            console.error('Twilio init error', e);
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, sent: false }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid data' }));
      }
    });
    return;
  }

  // API endpoint: Get all valentine messages
  if (pathname === '/api/messages' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(valentineData));
    return;
  }

  // Serve static files
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - File Not Found</h1>');
      return;
    }

    const ext = path.extname(filePath);
    let contentType = 'text/html';
    if (ext === '.js') contentType = 'application/javascript';
    if (ext === '.css') contentType = 'text/css';
    if (ext === '.json') contentType = 'application/json';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`💘 Valentine Server running at http://localhost:${PORT}`);
  console.log(`Open your browser and go to http://localhost:${PORT}`);
  console.log(`\nTo view all valentine messages: http://localhost:${PORT}/api/messages`);
});
