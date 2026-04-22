/* =============================================
   PAWS & PURPOSE — AI Chat Widget
   Powered by Anthropic Claude
   ============================================= */

(function() {

  const systemPrompt = `You are the Paws & Purpose Assistant — a warm, friendly AI helper for Paws & Purpose, a nonprofit animal welfare organization founded by Addy Davis, a middle school student in San Jose, California.

Your personality:
- Warm, enthusiastic, and caring — you love animals just like Addy does
- Encouraging and positive — every interaction should feel uplifting
- Keep responses concise, warm, and helpful
- Don't overwhelm with info — answer what's asked
- Always end your responses with 🐾

About Paws & Purpose:
- Founded by Addy Davis, a middle school student and aspiring veterinarian
- Mission: Collect and donate pet supplies to local animal shelters
- Addy volunteers regularly at local shelters and fosters animals including rabbits
- Partner shelters: Happy Tails Animal Shelter, Eastside Animal Rescue, Marin Humane
- Board members: Ryan Davis and Gina Davis
- Contact email: palidog30@gmail.com
- Website: https://ryantdavis16.github.io/paws-and-purpose/

How to help visitors:
- Answer questions about the mission and Addy's story
- Explain how to donate pet supplies (food, bedding, toys, medical supplies)
- Explain how to make a monetary donation
- Help people sign up to volunteer at a shelter
- Explain sponsorship tiers: Gold, Silver, Bronze
- Tell people about the foster animal program

When users seem interested in donating, volunteering, or sponsoring, warmly offer to capture their info.
When collecting info ask for their name and email, then thank them and let them know Addy will follow up within 48 hours.
If asked something you don't know, suggest they email palidog30@gmail.com.`;

  const COLORS = {
    terra: '#C4622D', brown: '#3D2B1F', cream: '#FDF6EC',
    tan: '#E8D5B7', sage: '#7A9E7E', white: '#FFFFFF', muted: '#7A6855',
  };

  let chatHistory = [];
  let isOpen = false;
  let isTyping = false;

  const style = document.createElement('style');
  style.textContent = `
    #paws-bubble {
      position:fixed;bottom:28px;right:28px;z-index:9999;
      width:56px;height:56px;border-radius:50%;
      background:#C4622D;color:white;border:none;cursor:pointer;
      font-size:24px;box-shadow:0 4px 20px rgba(196,98,45,0.4);
      display:flex;align-items:center;justify-content:center;
      transition:transform 0.2s,box-shadow 0.2s;
    }
    #paws-bubble:hover{transform:scale(1.08);}
    #paws-window {
      position:fixed;bottom:96px;right:28px;z-index:9998;
      width:360px;max-height:560px;background:#FFFFFF;
      border-radius:20px;border:1px solid #E8D5B7;
      box-shadow:0 12px 48px rgba(61,43,31,0.15);
      display:flex;flex-direction:column;overflow:hidden;
      transform:scale(0.95) translateY(10px);opacity:0;pointer-events:none;
      transition:transform 0.25s ease,opacity 0.25s ease;
      font-family:'DM Sans',sans-serif;
    }
    #paws-window.open{transform:scale(1) translateY(0);opacity:1;pointer-events:all;}
    #paws-header{background:#3D2B1F;padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;}
    #paws-avatar{width:36px;height:36px;border-radius:50%;background:#C4622D;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
    #paws-header-info{flex:1;}
    #paws-header-name{font-size:13px;font-weight:500;color:white;margin:0;}
    #paws-header-status{font-size:11px;color:rgba(255,255,255,0.6);margin:0;display:flex;align-items:center;gap:4px;}
    .paws-dot{width:6px;height:6px;border-radius:50%;background:#7A9E7E;display:inline-block;}
    #paws-close{background:none;border:none;color:rgba(255,255,255,0.6);cursor:pointer;font-size:16px;padding:4px;}
    #paws-close:hover{color:white;}
    #paws-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;background:#FDF6EC;}
    #paws-messages::-webkit-scrollbar{width:4px;}
    #paws-messages::-webkit-scrollbar-thumb{background:#E8D5B7;border-radius:2px;}
    .pmsg{display:flex;gap:8px;align-items:flex-end;animation:pmsgIn 0.2s ease;}
    @keyframes pmsgIn{from{opacity:0;transform:translateY(5px);}to{opacity:1;transform:translateY(0);}}
    .pmsg.user{flex-direction:row-reverse;}
    .pmsg-av{width:26px;height:26px;border-radius:50%;background:#C4622D;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;}
    .pmsg.user .pmsg-av{background:#E8D5B7;color:#3D2B1F;font-size:10px;font-weight:600;}
    .pmsg-bub{max-width:80%;padding:9px 12px;border-radius:14px;font-size:13px;line-height:1.55;color:#3D2B1F;}
    .pmsg.bot .pmsg-bub{background:#FFFFFF;border:1px solid #E8D5B7;border-bottom-left-radius:3px;}
    .pmsg.user .pmsg-bub{background:#C4622D;color:white;border-bottom-right-radius:3px;}
    .pmsg-typing{display:flex;gap:4px;align-items:center;padding:10px 12px;}
    .pmsg-tdot{width:6px;height:6px;border-radius:50%;background:#7A6855;animation:ptdot 1.2s infinite;}
    .pmsg-tdot:nth-child(2){animation-delay:0.2s;}
    .pmsg-tdot:nth-child(3){animation-delay:0.4s;}
    @keyframes ptdot{0%,80%,100%{transform:scale(0.7);opacity:0.4;}40%{transform:scale(1);opacity:1;}}
    #paws-input-area{padding:10px 12px;border-top:1px solid #E8D5B7;background:#FFFFFF;display:flex;gap:8px;align-items:flex-end;flex-shrink:0;}
    #paws-input{flex:1;border:1px solid #E8D5B7;border-radius:18px;padding:8px 13px;font-size:13px;font-family:'DM Sans',sans-serif;color:#3D2B1F;background:#FDF6EC;outline:none;resize:none;max-height:90px;line-height:1.4;transition:border 0.2s;}
    #paws-input:focus{border-color:#C4622D;}
    #paws-input::placeholder{color:#7A6855;opacity:0.7;}
    #paws-send{width:34px;height:34px;border-radius:50%;background:#C4622D;color:white;border:none;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background 0.2s,transform 0.15s;}
    #paws-send:hover{background:#a8521f;transform:scale(1.05);}
    #paws-send:disabled{opacity:0.4;cursor:not-allowed;transform:none;}
    @media(max-width:480px){#paws-window{width:calc(100vw - 24px);right:12px;bottom:84px;}#paws-bubble{right:12px;bottom:12px;}}
  `;
  document.head.appendChild(style);

  document.body.insertAdjacentHTML('beforeend', `
    <button id="paws-bubble" aria-label="Chat with Paws and Purpose Assistant">🐾</button>
    <div id="paws-window" role="dialog" aria-label="Paws and Purpose Chat">
      <div id="paws-header">
        <div id="paws-avatar">🐾</div>
        <div id="paws-header-info">
          <p id="paws-header-name">Paws &amp; Purpose Assistant</p>
          <p id="paws-header-status"><span class="paws-dot"></span> Online now</p>
        </div>
        <button id="paws-close" aria-label="Close chat">✕</button>
      </div>
      <div id="paws-messages"></div>
      <div id="paws-input-area">
        <textarea id="paws-input" placeholder="Ask me about Paws &amp; Purpose..." rows="1"></textarea>
        <button id="paws-send" aria-label="Send">&#10148;</button>
      </div>
    </div>
  `);

  const bubble  = document.getElementById('paws-bubble');
  const win     = document.getElementById('paws-window');
  const msgs    = document.getElementById('paws-messages');
  const input   = document.getElementById('paws-input');
  const sendBtn = document.getElementById('paws-send');

  function toggleChat() {
    isOpen = !isOpen;
    win.classList.toggle('open', isOpen);
    bubble.textContent = isOpen ? '\u2715' : '\uD83D\uDC3E';
    bubble.style.fontSize = isOpen ? '16px' : '24px';
    if (isOpen && chatHistory.length === 0) showWelcome();
    if (isOpen) setTimeout(() => input.focus(), 300);
  }

  bubble.addEventListener('click', toggleChat);
  document.getElementById('paws-close').addEventListener('click', toggleChat);

  function addMsg(role, text) {
    const wrap = document.createElement('div');
    wrap.className = 'pmsg ' + role;
    const av = document.createElement('div');
    av.className = 'pmsg-av';
    av.textContent = role === 'bot' ? '\uD83D\uDC3E' : 'You';
    const bub = document.createElement('div');
    bub.className = 'pmsg-bub';
    bub.textContent = text;
    wrap.appendChild(av);
    wrap.appendChild(bub);
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'pmsg bot';
    wrap.id = 'paws-typing';
    const av = document.createElement('div');
    av.className = 'pmsg-av';
    av.textContent = '\uD83D\uDC3E';
    const bub = document.createElement('div');
    bub.className = 'pmsg-bub pmsg-typing';
    bub.innerHTML = '<div class="pmsg-tdot"></div><div class="pmsg-tdot"></div><div class="pmsg-tdot"></div>';
    wrap.appendChild(av);
    wrap.appendChild(bub);
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById('paws-typing');
    if (t) t.remove();
  }

  function showWelcome() {
    setTimeout(() => {
      addMsg('bot', "Hi there! I'm the Paws & Purpose Assistant. I can help you learn about our mission, donate supplies, volunteer, or become a sponsor. What can I help you with today? \uD83D\uDC3E");
    }, 400);
  }

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  });
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 90) + 'px';
  });

  async function handleSend() {
    if (isTyping) return;
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    input.style.height = 'auto';
    addMsg('user', text);
    chatHistory.push({ role: 'user', content: text });

    isTyping = true;
    sendBtn.disabled = true;
    showTyping();

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: chatHistory.slice(-10).map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();
      const reply = data.content?.[0]?.text || "I'm sorry, something went wrong. Please email palidog30@gmail.com for help! \uD83D\uDC3E";
      chatHistory.push({ role: 'assistant', content: reply });
      removeTyping();
      addMsg('bot', reply);

    } catch(e) {
      removeTyping();
      addMsg('bot', "Sorry, I'm having trouble connecting right now. Please email palidog30@gmail.com and Addy will get back to you within 48 hours! \uD83D\uDC3E");
    }

    isTyping = false;
    sendBtn.disabled = false;
    input.focus();
  }

})();
