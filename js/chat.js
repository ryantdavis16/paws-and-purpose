/* =============================================
   PAWS & PURPOSE — Claude AI Chat Widget
   Powered by Anthropic Claude API
   ============================================= */

(function() {

  const SYSTEM_PROMPT = `You are the Paws & Purpose Assistant — a warm, friendly AI helper for Paws & Purpose, a nonprofit animal welfare organization founded by Addy Davis, a middle school student in San Jose, California.

Your personality:
- Warm, enthusiastic, and caring — you love animals just like Addy does
- Encouraging and positive — every interaction should feel uplifting
- Clear and simple language anyone can understand
- Always end your responses with 🐾

About Paws & Purpose:
- Founded by Addy Davis, a middle school student and aspiring veterinarian
- Mission: Collect and donate pet supplies to local animal shelters
- Addy volunteers regularly at local shelters and fosters animals including rabbits
- Partner shelters: Happy Tails Animal Shelter, Eastside Animal Rescue, Marin Humane
- Contact email: palidog30@gmail.com
- Website: https://ryantdavis16.github.io/paws-and-purpose/
- Board members: Ryan Davis and Gina Davis

How to help visitors:
1. Answer questions about the mission and Addy's story
2. Explain how to donate pet supplies (food, bedding, toys, medical supplies)
3. Explain how to make a monetary donation
4. Help people sign up to volunteer at a shelter
5. Explain sponsorship tiers: Gold ($500+), Silver ($250+), Bronze ($100+)
6. Tell people about the foster animal program
7. Collect name and email from anyone who wants to donate, volunteer, or sponsor
8. Thank them and let them know Addy will follow up within 48 hours

When someone wants to donate, volunteer, or sponsor:
- Ask for their first and last name
- Ask for their email address
- Ask what they would like to contribute
- Thank them warmly
- Tell them Addy will personally follow up at palidog30@gmail.com within 48 hours

Always stay focused on Paws & Purpose and animal welfare topics only.
Do not share private donor information.
Do not make up facts not listed above.
Keep responses concise — 2-4 sentences max unless more detail is needed.`;

  const COLORS = {
    terra: '#C4622D',
    brown: '#3D2B1F',
    cream: '#FDF6EC',
    tan: '#E8D5B7',
    sage: '#7A9E7E',
    white: '#FFFFFF',
    muted: '#7A6855',
  };

  let conversationHistory = [];
  let isOpen = false;
  let isTyping = false;
  let apiKey = null;

  // ── INJECT CSS ────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #paws-chat-bubble {
      position: fixed; bottom: 28px; right: 28px; z-index: 9999;
      width: 56px; height: 56px; border-radius: 50%;
      background: ${COLORS.terra}; color: white;
      border: none; cursor: pointer; font-size: 24px;
      box-shadow: 0 4px 20px rgba(196,98,45,0.4);
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      font-family: sans-serif;
    }
    #paws-chat-bubble:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(196,98,45,0.5);
    }
    #paws-chat-window {
      position: fixed; bottom: 96px; right: 28px; z-index: 9998;
      width: 360px; max-height: 560px;
      background: ${COLORS.white};
      border-radius: 20px;
      border: 1px solid ${COLORS.tan};
      box-shadow: 0 12px 48px rgba(61,43,31,0.15);
      display: flex; flex-direction: column;
      overflow: hidden;
      transform: scale(0.95) translateY(10px);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.25s ease, opacity 0.25s ease;
      font-family: 'DM Sans', sans-serif;
    }
    #paws-chat-window.open {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: all;
    }
    #paws-chat-header {
      background: ${COLORS.brown};
      padding: 16px 18px;
      display: flex; align-items: center; gap: 12px;
      flex-shrink: 0;
    }
    #paws-chat-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: ${COLORS.terra};
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; flex-shrink: 0;
    }
    #paws-chat-header-info { flex: 1; }
    #paws-chat-header-name {
      font-size: 14px; font-weight: 500; color: white; margin: 0;
    }
    #paws-chat-header-status {
      font-size: 11px; color: rgba(255,255,255,0.6); margin: 0;
      display: flex; align-items: center; gap: 5px;
    }
    #paws-chat-status-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: ${COLORS.sage};
      display: inline-block;
    }
    #paws-chat-close {
      background: none; border: none; color: rgba(255,255,255,0.6);
      cursor: pointer; font-size: 18px; padding: 4px; line-height: 1;
      transition: color 0.2s;
    }
    #paws-chat-close:hover { color: white; }
    #paws-chat-messages {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 12px;
      background: ${COLORS.cream};
    }
    #paws-chat-messages::-webkit-scrollbar { width: 4px; }
    #paws-chat-messages::-webkit-scrollbar-track { background: transparent; }
    #paws-chat-messages::-webkit-scrollbar-thumb { background: ${COLORS.tan}; border-radius: 2px; }
    .paws-msg {
      display: flex; gap: 8px; align-items: flex-end;
      animation: pawsMsgIn 0.2s ease;
    }
    @keyframes pawsMsgIn {
      from { opacity: 0; transform: translateY(6px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .paws-msg.user { flex-direction: row-reverse; }
    .paws-msg-avatar {
      width: 28px; height: 28px; border-radius: 50%;
      background: ${COLORS.terra};
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; flex-shrink: 0;
    }
    .paws-msg.user .paws-msg-avatar {
      background: ${COLORS.tan};
      color: ${COLORS.brown};
      font-size: 11px; font-weight: 600;
    }
    .paws-msg-bubble {
      max-width: 78%;
      padding: 10px 13px;
      border-radius: 16px;
      font-size: 13px;
      line-height: 1.55;
      color: ${COLORS.brown};
    }
    .paws-msg.bot .paws-msg-bubble {
      background: ${COLORS.white};
      border: 1px solid ${COLORS.tan};
      border-bottom-left-radius: 4px;
    }
    .paws-msg.user .paws-msg-bubble {
      background: ${COLORS.terra};
      color: white;
      border-bottom-right-radius: 4px;
    }
    .paws-typing-bubble {
      display: flex; gap: 4px; align-items: center;
      padding: 12px 14px;
    }
    .paws-typing-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: ${COLORS.muted};
      animation: pawsDot 1.2s infinite;
    }
    .paws-typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .paws-typing-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes pawsDot {
      0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }
    #paws-chat-input-area {
      padding: 12px 14px;
      border-top: 1px solid ${COLORS.tan};
      background: ${COLORS.white};
      display: flex; gap: 8px; align-items: flex-end;
      flex-shrink: 0;
    }
    #paws-chat-input {
      flex: 1;
      border: 1px solid ${COLORS.tan};
      border-radius: 20px;
      padding: 9px 14px;
      font-size: 13px;
      font-family: 'DM Sans', sans-serif;
      color: ${COLORS.brown};
      background: ${COLORS.cream};
      outline: none;
      resize: none;
      max-height: 100px;
      line-height: 1.4;
      transition: border 0.2s;
    }
    #paws-chat-input:focus { border-color: ${COLORS.terra}; }
    #paws-chat-input::placeholder { color: ${COLORS.muted}; opacity: 0.7; }
    #paws-chat-send {
      width: 36px; height: 36px; border-radius: 50%;
      background: ${COLORS.terra}; color: white;
      border: none; cursor: pointer; font-size: 15px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: background 0.2s, transform 0.15s;
    }
    #paws-chat-send:hover { background: #a8521f; transform: scale(1.05); }
    #paws-chat-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    #paws-api-notice {
      padding: 10px 14px;
      background: rgba(212,166,71,0.12);
      border-top: 1px solid rgba(212,166,71,0.3);
      font-size: 11px;
      color: ${COLORS.muted};
      text-align: center;
      flex-shrink: 0;
    }
    #paws-api-setup {
      padding: 16px;
      background: ${COLORS.cream};
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex-shrink: 0;
      border-top: 1px solid ${COLORS.tan};
    }
    #paws-api-setup p {
      font-size: 12px; color: ${COLORS.muted}; text-align: center; margin: 0;
    }
    #paws-api-key-input {
      width: 100%;
      border: 1px solid ${COLORS.tan};
      border-radius: 10px;
      padding: 9px 12px;
      font-size: 12px;
      font-family: 'DM Sans', sans-serif;
      color: ${COLORS.brown};
      background: ${COLORS.white};
      outline: none;
    }
    #paws-api-key-input:focus { border-color: ${COLORS.terra}; }
    #paws-api-submit {
      background: ${COLORS.terra}; color: white;
      border: none; border-radius: 10px;
      padding: 9px; font-size: 13px; font-weight: 500;
      cursor: pointer; font-family: 'DM Sans', sans-serif;
      transition: background 0.2s;
    }
    #paws-api-submit:hover { background: #a8521f; }
    @media (max-width: 480px) {
      #paws-chat-window { width: calc(100vw - 32px); right: 16px; bottom: 88px; }
      #paws-chat-bubble { right: 16px; bottom: 16px; }
    }
  `;
  document.head.appendChild(style);

  // ── BUILD HTML ────────────────────────────────────────────────────────────
  const bubble = document.createElement('button');
  bubble.id = 'paws-chat-bubble';
  bubble.innerHTML = '🐾';
  bubble.title = 'Chat with Paws & Purpose Assistant';
  bubble.setAttribute('aria-label', 'Open chat');

  const win = document.createElement('div');
  win.id = 'paws-chat-window';
  win.setAttribute('role', 'dialog');
  win.setAttribute('aria-label', 'Paws & Purpose Chat Assistant');
  win.innerHTML = `
    <div id="paws-chat-header">
      <div id="paws-chat-avatar">🐾</div>
      <div id="paws-chat-header-info">
        <p id="paws-chat-header-name">Paws & Purpose Assistant</p>
        <p id="paws-chat-header-status">
          <span id="paws-chat-status-dot"></span> Online — here to help!
        </p>
      </div>
      <button id="paws-chat-close" aria-label="Close chat">✕</button>
    </div>
    <div id="paws-chat-messages"></div>
    <div id="paws-api-setup">
      <p>Enter your Anthropic API key to activate the AI assistant</p>
      <input type="password" id="paws-api-key-input" placeholder="sk-ant-..." />
      <button id="paws-api-submit">Activate Assistant 🐾</button>
    </div>
  `;

  document.body.appendChild(bubble);
  document.body.appendChild(win);

  // ── EVENTS ────────────────────────────────────────────────────────────────
  bubble.addEventListener('click', toggleChat);
  document.getElementById('paws-chat-close').addEventListener('click', toggleChat);

  document.getElementById('paws-api-submit').addEventListener('click', activateWithKey);
  document.getElementById('paws-api-key-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') activateWithKey();
  });

  function toggleChat() {
    isOpen = !isOpen;
    win.classList.toggle('open', isOpen);
    bubble.innerHTML = isOpen ? '✕' : '🐾';
    bubble.style.fontSize = isOpen ? '18px' : '24px';
    if (isOpen && apiKey && conversationHistory.length === 0) {
      sendWelcome();
    }
  }

  function activateWithKey() {
    const key = document.getElementById('paws-api-key-input').value.trim();
    if (!key || !key.startsWith('sk-')) {
      document.getElementById('paws-api-key-input').style.borderColor = '#e24b4a';
      return;
    }
    apiKey = key;
    document.getElementById('paws-api-setup').remove();
    addInputArea();
    sendWelcome();
  }

  function addInputArea() {
    const area = document.createElement('div');
    area.id = 'paws-chat-input-area';
    area.innerHTML = `
      <textarea id="paws-chat-input" placeholder="Ask me anything about Paws & Purpose..." rows="1"></textarea>
      <button id="paws-chat-send" aria-label="Send message">➤</button>
    `;
    win.appendChild(area);

    const input = document.getElementById('paws-chat-input');
    const send  = document.getElementById('paws-chat-send');

    send.addEventListener('click', handleSend);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    });
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 100) + 'px';
    });
  }

  // ── MESSAGES ──────────────────────────────────────────────────────────────
  function addMessage(role, text) {
    const msgs = document.getElementById('paws-chat-messages');
    const div = document.createElement('div');
    div.className = 'paws-msg ' + role;

    const avatar = document.createElement('div');
    avatar.className = 'paws-msg-avatar';
    avatar.textContent = role === 'bot' ? '🐾' : 'You';

    const bubble = document.createElement('div');
    bubble.className = 'paws-msg-bubble';
    bubble.textContent = text;

    div.appendChild(avatar);
    div.appendChild(bubble);
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return bubble;
  }

  function showTyping() {
    const msgs = document.getElementById('paws-chat-messages');
    const div = document.createElement('div');
    div.className = 'paws-msg bot';
    div.id = 'paws-typing';

    const avatar = document.createElement('div');
    avatar.className = 'paws-msg-avatar';
    avatar.textContent = '🐾';

    const bubble = document.createElement('div');
    bubble.className = 'paws-msg-bubble paws-typing-bubble';
    bubble.innerHTML = `
      <div class="paws-typing-dot"></div>
      <div class="paws-typing-dot"></div>
      <div class="paws-typing-dot"></div>
    `;

    div.appendChild(avatar);
    div.appendChild(bubble);
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById('paws-typing');
    if (t) t.remove();
  }

  function sendWelcome() {
    setTimeout(() => {
      addMessage('bot', "Hi there! I'm the Paws & Purpose Assistant. I'm here to help you learn about our mission, donate supplies, volunteer, or become a sponsor. How can I help you today? 🐾");
    }, 300);
  }

  // ── API CALL ──────────────────────────────────────────────────────────────
  async function handleSend() {
    if (isTyping || !apiKey) return;
    const input = document.getElementById('paws-chat-input');
    const send  = document.getElementById('paws-chat-send');
    const text  = input.value.trim();
    if (!text) return;

    input.value = '';
    input.style.height = 'auto';
    addMessage('user', text);
    conversationHistory.push({ role: 'user', content: text });

    isTyping = true;
    send.disabled = true;
    showTyping();

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          system: SYSTEM_PROMPT,
          messages: conversationHistory,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error?.message || 'API error ' + response.status);
      }

      const data = await response.json();
      const reply = data.content?.[0]?.text || "I'm sorry, I didn't get a response. Please try again. 🐾";
      conversationHistory.push({ role: 'assistant', content: reply });
      removeTyping();
      addMessage('bot', reply);

    } catch(e) {
      removeTyping();
      const errMsg = e.message.includes('401')
        ? 'Invalid API key. Please refresh and try again.'
        : 'Something went wrong. Please try again in a moment. 🐾';
      addMessage('bot', errMsg);
    }

    isTyping = false;
    send.disabled = false;
    input.focus();
  }

})();
