// Interactive emoji background + kiss overlay
const EMOJIS = ['❤️','�','💗','💘','💝','💞','😍','😘','💋','💕'];
const DENSITY = 40;

const emojiBg = document.getElementById('emoji-bg');
const yesBtn = document.getElementById('yes');
const noBtn = document.getElementById('no');
const card = document.getElementById('card');
const overlay = document.getElementById('kiss-overlay');
const leftEmojiEl = document.querySelector('.left-emoji');
const rightEmojiEl = document.querySelector('.right-emoji');
const heartsContainer = document.querySelector('.hearts');

// Validation helpers
function isValidName(name){
  if(!name) return false;
  const cleaned = name.trim();
  if(cleaned.length < 2) return false;
  const lower = cleaned.toLowerCase();
  // reject obvious fake words
  const bad = ['uwongo','fake','test','1234','namba','0000','asdf','qwerty'];
  for(const w of bad) if(lower.includes(w)) return false;
  // reject names that are mostly digits or punctuation
  const letters = cleaned.replace(/[^\p{L}]/gu, '');
  if(letters.length < 1) return false;
  return true;
}

function isValidPhone(phone){
  if(!phone) return true; // phone optional; only validate if provided
  // require E.164-ish format: + followed by 7-15 digits
  return /^\+\d{7,15}$/.test(phone.trim());
}

// Login elements
const loginCard = document.getElementById('login-card');
const loginBtn = document.getElementById('login-btn');
const loverNameInput = document.getElementById('lover-name');
const loverPhoneInput = document.getElementById('lover-phone');
const loveMessageBox = document.getElementById('love-message');
const loverDisplay = document.getElementById('lover-display');
const giftBtn = document.getElementById('gift-btn');
const giftModal = document.getElementById('gift-modal');
const giftOptions = Array.from(document.querySelectorAll('.gift-option'));
const sendGiftBtn = document.getElementById('send-gift-btn');
const closeGiftBtn = document.getElementById('close-gift');
const giftNote = document.getElementById('gift-note');
const againBtn = document.getElementById('again-btn');

let currentLoverName = '';
let currentLoverPhone = '';
let selectedGift = null;

// Login functionality
loginBtn.addEventListener('click', handleLogin);
loverNameInput.addEventListener('keypress', (e) => {
  if(e.key === 'Enter') handleLogin();
});

function handleLogin(){
  const name = loverNameInput.value.trim();
  if(!name){
    alert('Please enter your lover\'s name 💕');
    return;
  }
  const phone = (loverPhoneInput && loverPhoneInput.value.trim()) || '';
  // validate name and phone
  if(!isValidName(name)){
    alert('Tafadhali ingiza jina halisi (usitumie "uwongo" au majina ya majaribio).');
    return;
  }
  if(!isValidPhone(phone)){
    alert('Tafadhali ingiza namba ya simu sahihi kwa muundo wa kimataifa, mfano: +2547xxxxxxx');
    return;
  }
  currentLoverName = name;
  currentLoverPhone = phone;

  // Save to server (check response for validation errors)
  fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loverName: name, loverPhone: phone })
  }).then(r => r.json().then(data => ({ ok: r.ok, data })))
    .then(({ ok, data }) => {
      if(!ok){
        alert(data && data.error ? data.error : 'Server validation failed');
        return;
      }
    }).catch(() => {});

  // Show valentine card
  loginCard.style.display = 'none';
  card.style.display = 'block';
  loverNameInput.value = '';
  if(loverPhoneInput) loverPhoneInput.value = '';
}

// helper to create one emoji element floating up
function createEmoji(){
  const el = document.createElement('span');
  el.className = 'emoji';
  el.textContent = EMOJIS[Math.floor(Math.random()*EMOJIS.length)];
  const size = 18 + Math.random()*38; // 18 - 56px
  el.style.fontSize = size + 'px';
  el.style.left = Math.random()*100 + '%';
  const duration = 8 + Math.random()*10; // 8-18s
  el.style.animationDuration = duration + 's';
  el.style.animationDelay = (Math.random()*-duration) + 's';

  // clicking toggles selection
  el.addEventListener('click', e => {
    e.stopPropagation();
    el.classList.toggle('selected');
  });

  emojiBg.appendChild(el);

  // remove after animation finishes
  setTimeout(()=>{ el.remove(); }, (duration+1)*1000);
}

// seed initial emojis and keep creating them
for(let i=0;i<DENSITY;i++) setTimeout(createEmoji, i*180);
setInterval(()=> createEmoji(), 900);

// make No dodge and grow Yes text like before
let yesSize = 18;
function noMove(){
  const no = noBtn;
  const btns = document.querySelector('.btns');
  const rect = btns.getBoundingClientRect();
  const x = Math.random() * (rect.width - 80);
  const y = Math.random() * (rect.height - 40);
  no.style.left = x + 'px';
  no.style.top = y + 'px';
  yesSize += 4;
  yesBtn.style.fontSize = yesSize + 'px';
  document.getElementById('why').innerText = "Why? 😢 am i not your type";
}


noBtn.addEventListener('mouseover', noMove);

// show kissing overlay when Yes is clicked
yesBtn.addEventListener('click', ()=>{
  document.getElementById('question').innerText = 'Yaaay 😍❤️';
  card.classList.add('hidden');
  showKiss();
});

function showKiss(){
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden','false');

  // pick two emojis: use selected ones if user clicked some, else pick random
  const selected = Array.from(document.querySelectorAll('.emoji.selected'));
  let left = selected[0] ? selected[0].textContent : EMOJIS[Math.floor(Math.random()*EMOJIS.length)];
  let right = selected[1] ? selected[1].textContent : EMOJIS[Math.floor(Math.random()*EMOJIS.length)];

  leftEmojiEl.textContent = left;
  rightEmojiEl.textContent = right;

  // create hearts animation
  heartsContainer.innerHTML = '';
  const heartsCount = 6;
  for(let i=0;i<heartsCount;i++){
    const h = document.createElement('span');
    h.textContent = i%2? '💗':'💖';
    h.style.left = (45 + Math.random()*12) + '%';
    h.style.top = (40 + Math.random()*10) + '%';
    h.style.fontSize = (12 + Math.random()*18) + 'px';
    h.style.animationDelay = (i*120) + 'ms';
    heartsContainer.appendChild(h);
  }

  // hide overlay after animation completes
  setTimeout(()=>{
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden','true');
    // Show love message with lover's name
    loveMessageBox.classList.remove('hidden');
    loverDisplay.innerText = `for ${currentLoverName} 💕`;
  }, 2200);
}

// Again button - reset and show login
againBtn.addEventListener('click', () => {
  loveMessageBox.classList.add('hidden');
  card.style.display = 'none';
  loginCard.style.display = 'block';
  currentLoverName = '';
  yesSize = 18;
  yesBtn.style.fontSize = yesSize + 'px';
  document.getElementById('question').innerText = 'Would you be my Valentine? 💖';
  document.getElementById('why').innerText = '';
});

// Gift modal handlers
if(giftBtn){
  giftBtn.addEventListener('click', ()=>{
    // warn if phone missing
    if(!currentLoverPhone){
      const ok = confirm('No lover number provided. Gift will be saved but cannot be sent as SMS. Continue?');
      if(!ok) return;
    }
    giftModal.classList.remove('hidden');
    giftModal.setAttribute('aria-hidden','false');
  });
}

giftOptions.forEach(btn => {
  btn.addEventListener('click', ()=>{
    giftOptions.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    selectedGift = btn.dataset.gift;
  });
});

if(closeGiftBtn) closeGiftBtn.addEventListener('click', ()=>{
  giftModal.classList.add('hidden');
  giftModal.setAttribute('aria-hidden','true');
  selectedGift = null;
  giftOptions.forEach(b=>b.classList.remove('active'));
  if(giftNote) giftNote.value = '';
});

if(sendGiftBtn){
  sendGiftBtn.addEventListener('click', ()=>{
    if(!selectedGift){ alert('Please choose a gift first 🎁'); return; }
    if(!isValidName(currentLoverName)) { alert('Invalid lover name; please login with a real name.'); return; }
    if(!isValidPhone(currentLoverPhone)) { alert('Invalid phone number; use +2547... format.'); return; }
    const payload = { loverName: currentLoverName, loverPhone: currentLoverPhone, giftId: selectedGift, note: (giftNote && giftNote.value) || '' };
    fetch('/api/send-gift', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(r => r.json().then(data => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if(!ok){
          alert(data && data.error ? data.error : 'Server rejected the gift request.');
        } else if(data && data.success){
          alert('Gift request saved' + (data.sent? ' and sent via WhatsApp! 🎉' : '.'));
        } else {
          alert('Could not send gift; saved locally.');
        }
        giftModal.classList.add('hidden');
        giftModal.setAttribute('aria-hidden','true');
        selectedGift = null;
        giftOptions.forEach(b=>b.classList.remove('active'));
        if(giftNote) giftNote.value = '';
      })
      .catch(()=>{
        alert('Network error. Gift saved locally.');
        giftModal.classList.add('hidden');
      });
  });
}

// dismiss overlay on click or Esc key
overlay.addEventListener('click', ()=>{ overlay.classList.add('hidden'); overlay.setAttribute('aria-hidden','true'); });
document.addEventListener('keydown', e => { if(e.key === 'Escape') overlay.classList.add('hidden'); });

// clicking the page toggles unselect for emojis
document.addEventListener('click', ()=>{
  document.querySelectorAll('.emoji.selected').forEach(el=>el.classList.remove('selected'));
});
