(function() {
  'use strict';

  // ── Config ──────────────────────────────────────────────────────────────────
  const WORKER_URL = 'https://paws-chat.ryantdavis.workers.dev';

  const _SYSTEM_PROMPT = `You are Addy's Helper, the friendly chat assistant for Paws & Purpose — a nonprofit animal welfare organization founded by Addy Davis, a middle school student and aspiring veterinarian in San Jose, California.

Your role is to warmly welcome visitors and answer questions about the organization.

ABOUT PAWS & PURPOSE:
- Mission: Collect and donate pet supplies to local animal shelters
- Founded by: Addy Davis, a middle school student who volunteers at shelters and fosters animals (including rabbits)
- Contact: palidog30@gmail.com
- Website: https://ryantdavis16.github.io/paws-and-purpose/
- Location: San Jose, California

LEADERSHIP TEAM:
- Addy Davis — Founder & Executive Director (middle school student, aspiring vet, fosters animals including Holland Lop and Mini Rex rabbits)
- Ryan Davis — Board Member
- Gina Davis — Board Member

PARTNER SHELTERS:
1. Happy Tails Animal Shelter — San Jose, CA
2. Eastside Animal Rescue — San Jose, CA
3. Marin Humane — Novato, CA

HOW TO DONATE SUPPLIES:
- We accept: dry/wet food, treats, cat litter, bedding, blankets, toys, grooming supplies, leashes, collars, carriers
- To donate: email palidog30@gmail.com and Addy will arrange pickup or drop-off
- Tax acknowledgment provided for all donations

HOW TO DONATE MONEY:
- Email palidog30@gmail.com for payment instructions
- All monetary donations go directly toward shelter supplies

HOW TO VOLUNTEER:
- Email palidog30@gmail.com with your name and availability
- Volunteer activities: dog walking, cat socialization, rabbit care, adoption events, supply sorting, fundraising

SPONSORSHIP TIERS:
- 🥇 Gold Sponsor: highest tier, prominent website logo/name placement
- 🥈 Silver Sponsor: name and description on website
- 🥉 Bronze Sponsor: name featured on website
- To sponsor: email palidog30@gmail.com

FOSTER PROGRAM:
- We foster rabbits (specialty), cats, dogs, and small animals
- Email palidog30@gmail.com to inquire about fostering

RESPONSE GUIDELINES:
- Be warm, friendly, and encouraging — this is a youth-led nonprofit
- Keep responses concise and helpful (2-4 sentences max unless more detail is needed)
- Always direct people to palidog30@gmail.com for next steps
- If you don't know something specific, direct them to email Addy
- Addy personally responds to all emails within 48 hours
- Use a friendly, approachable tone that matches the organization's mission`;

  // ── State ────────────────────────────────────────────────────────────────────
  let chatHistory = [];
  let isOpen = false;
  let isTyping = false;

  // ── Styles ───────────────────────────────────────────────────────────────────
  const styles = `
    #paws-chat-bubble {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      background: #8B4513;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 4px 16px rgba(139,69,19,0.4);
      z-index: 9999;
      transition: transform 0.2s, box-shadow 0.2s;
      border: none;
    }
    #paws-chat-bubble:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 20px rgba(139,69,19,0.5);
    }
    #paws-chat-window {
      position: fixed;
      bottom: 92px;
      right: 24px;
      width: 340px;
      max-height: 480px;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      display: flex;
      flex-direction: column;
      z-index: 9998;
      overflow: hidden;
      transition: opacity 0.2s, transform 0.2s;
      font-family: 'Georgia', serif;
    }
    #paws-chat-window.hidden {
      opacity: 0;
      transform: translateY(12px) scale(0.97);
      pointer-events: none;
    }
    #paws-chat-header {
      background: #8B4513;
      color: #fff;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-radius: 16px 16px 0 0;
    }
    #paws-chat-header .header-icon { font-size: 22px; }
    #paws-chat-header .header-text { flex: 1; }
    #paws-chat-header .header-title { font-weight: bold; font-size: 15px; letter-spacing: 0.3px; }
    #paws-chat-header .header-sub { font-size: 11px; opacity: 0.85; margin-top: 1px; }
    #paws-chat-close {
      background: none;
      border: none;
      color: #fff;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      opacity: 0.8;
    }
    #paws-chat-close:hover { opacity: 1; }
    #paws-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px 14px 8px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #fdf8f3;
    }
    .paws-msg {
      max-width: 85%;
      padding: 9px 13px;
      border-radius: 14px;
      font-size: 13.5px;
      line-height: 1.5;
    }
    .paws-msg.bot {
      background: #f0e6d6;
      color: #3b1f0a;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
    .paws-msg.user {
      background: #8B4513;
      color: #fff;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
    .paws-typing {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 10px 14px;
      background: #f0e6d6;
      border-radius: 14px;
      border-bottom-left-radius: 4px;
      align-self: flex-start;
    }
    .paws-typing span {
      width: 7px;
      height: 7px;
      background: #8B4513;
      border-radius: 50%;
      animation: pawsBounce 1.2s infinite;
      opacity: 0.6;
    }
    .paws-typing span:nth-child(2) { animation-delay: 0.2s; }
    .paws-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes pawsBounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-6px); }
    }
    #paws-chat-input-row {
      display: flex;
      gap: 8px;
      padding: 10px 12px;
      border-top: 1px solid #e8d8c4;
      background: #fff;
    }
    #paws-chat-input {
      flex: 1;
      border: 1px solid #c9aa84;
      border-radius: 20px;
      padding: 8px 14px;
      font-size: 13px;
      font-family: inherit;
      outline: none;
      background: #fdf8f3;
      color: #3b1f0a;
    }
    #paws-chat-input:focus { border-color: #8B4513; }
    #paws-chat-send {
      background: #8B4513;
      color: #fff;
      border: none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
      flex-shrink: 0;
    }
    #paws-chat-send:hover { background: #6b3410; }
    #paws-chat-send:disabled { background: #c9aa84; cursor: not-allowed; }
    @media (max-width: 400px) {
      #paws-chat-window { width: calc(100vw - 20px); right: 10px; bottom: 80px; }
    }
  `;

  // ── DOM setup ─────────────────────────────────────────────────────────────────
  function init() {
    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // Chat bubble
    const bubble = document.createElement('button');
    bubble.id = 'paws-chat-bubble';
    bubble.innerHTML = '🐾';
    bubble.setAttribute('aria-label', 'Open chat');
    bubble.addEventListener('click', toggleChat);
    document.body.appendChild(bubble);

    // Chat window
    const win = document.createElement('div');
    win.id = 'paws-chat-window';
    win.classList.add('hidden');
    win.innerHTML = `
      <div id="paws-chat-header">
        <span class="header-icon">🐾</span>
        <div class="header-text">
          <div class="header-title">Addy's Helper</div>
          <div class="header-sub">Paws &amp; Purpose</div>
        </div>
        <button id="paws-chat-close" aria-label="Close chat">✕</button>
      </div>
      <div id="paws-chat-messages"></div>
      <div id="paws-chat-input-row">
        <input id="paws-chat-input" type="text" placeholder="Ask us anything…" maxlength="500" autocomplete="off" />
        <button id="paws-chat-send" aria-label="Send">➤</button>
      </div>
    `;
    document.body.appendChild(win);

    // Event listeners
    document.getElementById('paws-chat-close').addEventListener('click', toggleChat);
    document.getElementById('paws-chat-send').addEventListener('click', sendMessage);
    document.getElementById('paws-chat-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
  }

  // ── Toggle ────────────────────────────────────────────────────────────────────
  function toggleChat() {
    isOpen = !isOpen;
    const win = document.getElementById('paws-chat-window');
    if (isOpen) {
      win.classList.remove('hidden');
      document.getElementById('paws-chat-input').focus();
      if (chatHistory.length === 0) {
        addMessage('bot', 'Hi there! 🐾 I\'m Addy\'s Helper for Paws & Purpose. I can answer questions about donating supplies, volunteering, sponsorship, or fostering animals. How can I help you today?');
      }
    } else {
      win.classList.add('hidden');
    }
  }

  // ── Messages ──────────────────────────────────────────────────────────────────
  function addMessage(role, text) {
    const messages = document.getElementById('paws-chat-messages');
    const div = document.createElement('div');
    div.className = 'paws-msg ' + role;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;

    if (role === 'user') {
      chatHistory.push({ role: 'user', content: text });
    } else {
      chatHistory.push({ role: 'assistant', content: text });
    }
    return div;
  }

  function showTyping() {
    const messages = document.getElementById('paws-chat-messages');
    const div = document.createElement('div');
    div.className = 'paws-typing';
    div.id = 'paws-typing-indicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function hideTyping() {
    const el = document.getElementById('paws-typing-indicator');
    if (el) el.remove();
  }

  // ── API call ──────────────────────────────────────────────────────────────────
  async function sendMessage() {
    if (isTyping) return;
    const input = document.getElementById('paws-chat-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    addMessage('user', text);

    isTyping = true;
    document.getElementById('paws-chat-send').disabled = true;
    showTyping();

    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: chatHistory.slice(-10).filter(m => m.role === 'user' || m.role === 'assistant').map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error('API error: ' + response.status);
      }

      const data = await response.json();
      const reply = data.content && data.content[0] && data.content[0].text
        ? data.content[0].text
        : 'I\'m sorry, I couldn\'t get a response. Please email palidog30@gmail.com and Addy will help you! 🐾';

      hideTyping();
      addMessage('bot', reply);

    } catch (err) {
      console.error('Paws chat error:', err);
      hideTyping();
      addMessage('bot', 'Sorry, I\'m having trouble connecting right now. Please email palidog30@gmail.com and Addy will get back to you within 48 hours! 🐾');
    } finally {
      isTyping = false;
      document.getElementById('paws-chat-send').disabled = false;
      document.getElementById('paws-chat-input').focus();
    }
  }

  // ── Boot ──────────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
