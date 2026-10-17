(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = "thanhhuyen_gemini_api_key";
  const MODEL_KEY = "thanhhuyen_gemini_model";
  const conversationEl = $("conversation");
  const welcomeEl = $("welcome");
  const messagesEl = $("messages");
  const inputEl = $("userInput");
  const formEl = $("chatForm");
  const sendBtn = $("sendBtn");
  const modal = $("settingsModal");
  let history = [];
  let busy = false;
  let toastTimer;
  let selectedImage = null;

  const getKey = () => {
    try { return localStorage.getItem(STORAGE_KEY) || ""; } catch (_) { return ""; }
  };
  const getModel = () => {
    try { return localStorage.getItem(MODEL_KEY) || "gemini-2.5-flash"; } catch (_) { return "gemini-2.5-flash"; }
  };
  function toast(message) {
    const el = $("toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }
  function openSettings() {
    $("apiKeyInput").value = getKey();
    $("modelSelect").value = getModel();
    $("settingsStatus").textContent = "";
    modal.hidden = false;
    $("apiKeyInput").focus();
  }
  function closeSettings() { modal.hidden = true; }
  function scrollToBottom() { conversationEl.scrollTop = conversationEl.scrollHeight; window.scrollTo(0, document.body.scrollHeight); }

  // Convert a small, safe subset of Markdown to HTML. All text is escaped first.
  function escapeHTML(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function inlineFormat(text) {
    let s = escapeHTML(text);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
    return s;
  }
  function markdownToHTML(markdown) {
    const lines = String(markdown || "").replace(/\r/g, "").split("\n");
    const out = [];
    let listType = "";
    let paragraph = [];
    let code = false;
    let codeLines = [];
    const closeList = () => { if (listType) { out.push(`</${listType}>`); listType = ""; } };
    const flushParagraph = () => {
      if (paragraph.length) { out.push("<p>" + paragraph.map(inlineFormat).join("<br>") + "</p>"); paragraph = []; }
    };
    for (const line of lines) {
      if (/^\s*```/.test(line)) {
        flushParagraph(); closeList();
        if (!code) { code = true; codeLines = []; }
        else { out.push("<pre><code>" + escapeHTML(codeLines.join("\n")) + "</code></pre>"); code = false; }
        continue;
      }
      if (code) { codeLines.push(line); continue; }
      const heading = line.match(/^(#{1,3})\s+(.+)$/);
      const unordered = line.match(/^\s*[-*]\s+(.+)$/);
      const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
      if (heading) { flushParagraph(); closeList(); const level = Math.min(heading[1].length + 1, 4); out.push(`<h${level}>${inlineFormat(heading[2])}</h${level}>`); }
      else if (unordered || ordered) {
        flushParagraph();
        const wanted = unordered ? "ul" : "ol";
        if (listType !== wanted) { closeList(); listType = wanted; out.push(`<${listType}>`); }
        out.push("<li>" + inlineFormat((unordered || ordered)[1]) + "</li>");
      } else if (!line.trim()) { flushParagraph(); closeList(); }
      else { closeList(); paragraph.push(line); }
    }
    flushParagraph(); closeList();
    if (code) out.push("<pre><code>" + escapeHTML(codeLines.join("\n")) + "</code></pre>");
    return out.join("");
  }
  function addMessage(role, text, options = {}) {
    welcomeEl.hidden = true;
    const article = document.createElement("article");
    article.className = `message ${role}`;
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = role === "user" ? "TH" : "✦";
    avatar.setAttribute("aria-hidden", "true");
    const body = document.createElement("div");
    body.className = "message-body";
    const name = document.createElement("div");
    name.className = "message-name";
    name.textContent = role === "user" ? "Bạn" : "Trợ Lý AI của Thanh Huyền";
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerHTML = markdownToHTML(text);
    if (role === "user" && options.imageUrl) {
      const image = document.createElement("img");
      image.className = "message-image";
      image.src = options.imageUrl;
      image.alt = "Ảnh bài tập người dùng gửi";
      bubble.prepend(image);
    }
    body.append(name, bubble);
    if (role === "assistant" && !options.typing) {
      const actions = document.createElement("div");
      actions.className = "message-actions";
      const copy = document.createElement("button");
      copy.type = "button";
      copy.textContent = "Sao chép câu trả lời";
      copy.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(text); toast("Đã sao chép câu trả lời."); }
        catch (_) { toast("Trình duyệt không cho phép sao chép tự động."); }
      });
      actions.append(copy);
      body.append(actions);
    }
    article.append(avatar, body);
    messagesEl.append(article);
    scrollToBottom();
    return { article, bubble };
  }
  function showTyping() {
    const msg = addMessage("assistant", "", { typing: true });
    msg.bubble.innerHTML = '<div class="typing" aria-label="AI đang trả lời"><i></i><i></i><i></i></div>';
    return msg.article;
  }
  function setBusy(value) {
    busy = value;
    sendBtn.disabled = value;
    sendBtn.innerHTML = value ? "<span>Đang nghĩ</span> ···" : "<span>Gửi</span> ↑";
  }
  function friendlyAPIError(status, message) {
    if (status === 400) return "Yêu cầu chưa hợp lệ. Hãy kiểm tra câu hỏi hoặc thử lại với mô hình khác.";
    if (status === 401 || status === 403) return "API key không hợp lệ hoặc chưa được cấp quyền. Hãy mở Cài đặt AI, kiểm tra key và quyền sử dụng Gemini API.";
    if (status === 404) return "Không tìm thấy mô hình được chọn. Hãy thử chọn Gemini 2.5 Flash trong Cài đặt AI.";
    if (status === 429) return "Bạn đã chạm giới hạn yêu cầu hoặc hạn mức API. Hãy đợi một lúc rồi thử lại, đồng thời kiểm tra hạn mức của Google AI Studio.";
    if (status >= 500) return "Dịch vụ AI đang gặp sự cố. Hãy thử lại sau ít phút.";
    return message || "Không thể kết nối AI. Hãy kiểm tra mạng và thử lại.";
  }
  async function askGemini(userText, imageData) {
    const apiKey = getKey();
    if (!apiKey) {
      openSettings();
      throw new Error("Bạn cần thêm Gemini API key trong Cài đặt AI trước khi gửi câu hỏi.");
    }
    const model = getModel();
    const parts = [];
    if (userText) parts.push({ text: userText });
    if (imageData) parts.push({ inlineData: { mimeType: imageData.mimeType, data: imageData.base64 } });
    const contents = history.concat([{ role: "user", parts }]);
    const systemInstruction = {
      parts: [{ text: "Bạn là Trợ Lý AI của Thanh Huyền, một trợ lý học tập thân thiện bằng tiếng Việt. Giải thích rõ ràng, đúng trình độ học sinh THPT khi phù hợp; trình bày có tiêu đề và gạch đầu dòng khi hữu ích; hướng dẫn giải từng bước, không bịa dữ kiện. Nếu đề bài thiếu thông tin, hãy hỏi lại. Với bài tập trong ảnh, hãy đọc nội dung ảnh cẩn thận, nêu lại dữ kiện nhìn thấy được và giải thích cách làm từng bước. Nếu ảnh mờ hoặc không đọc được, hãy nói rõ và đề nghị gửi ảnh rõ hơn. Khi luyện tiếng Anh, dùng từ vựng phù hợp trình độ và sửa lỗi nhẹ nhàng." }]
    };
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction,
        contents,
        generationConfig: { temperature: 0.65, maxOutputTokens: 4096 }
      })
    });
    let data = {};
    try { data = await response.json(); } catch (_) {}
    if (!response.ok) {
      const detail = data && data.error && data.error.message ? data.error.message : "";
      throw new Error(friendlyAPIError(response.status, detail));
    }
    const answer = (data.candidates || []).flatMap(c => c.content && c.content.parts ? c.content.parts : []).map(p => p.text || "").join("").trim();
    if (!answer) {
      const reason = data.candidates && data.candidates[0] && data.candidates[0].finishReason;
      throw new Error(reason ? `AI chưa tạo được câu trả lời (lý do: ${reason}). Hãy thử hỏi lại ngắn gọn hơn.` : "AI trả về nội dung trống. Hãy thử gửi lại câu hỏi.");
    }
    return answer;
  }
  async function submitPrompt(rawText) {
    const text = String(rawText || "").trim();
    const imageData = selectedImage;
    if ((!text && !imageData) || busy) return;
    if (text.length > 12000) { toast("Câu hỏi quá dài. Hãy rút gọn còn dưới 12.000 ký tự."); return; }
    inputEl.value = "";
    inputEl.style.height = "auto";
    const shownText = text || "Hãy đọc ảnh bài tập này và hướng dẫn mình giải từng bước nhé.";
    addMessage("user", shownText, { imageUrl: imageData ? imageData.dataUrl : null });
    clearSelectedImage();
    setBusy(true);
    const typing = showTyping();
    try {
      const answer = await askGemini(text || "Hãy đọc ảnh bài tập này và hướng dẫn mình giải từng bước nhé.", imageData);
      typing.remove();
      addMessage("assistant", answer);
      const parts = [];
      if (text || !imageData) parts.push({ text: text || shownText });
      if (imageData) parts.push({ inlineData: { mimeType: imageData.mimeType, data: imageData.base64 } });
      history.push({ role: "user", parts }, { role: "model", parts: [{ text: answer }] });
      if (history.length > 24) history = history.slice(-24);
    } catch (error) {
      typing.remove();
      addMessage("assistant", "Mình chưa thể trả lời câu hỏi này.\n\n" + (error && error.message ? error.message : "Đã xảy ra lỗi không xác định."));
    } finally {
      setBusy(false);
      inputEl.focus();
    }
  }
  function clearSelectedImage() {
    selectedImage = null;
    const imageInput = $("imageInput");
    if (imageInput) imageInput.value = "";
    $("imagePreview").hidden = true;
    $("previewImage").removeAttribute("src");
    $("imageFilename").textContent = "";
  }
  function resetChat() {
    if (busy) return;
    history = [];
    messagesEl.replaceChildren();
    welcomeEl.hidden = false;
    $("sidebar").classList.remove("open");
    toast("Đã tạo cuộc trò chuyện mới.");
  }

  formEl.addEventListener("submit", event => { event.preventDefault(); submitPrompt(inputEl.value); });
  inputEl.addEventListener("input", () => {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 180) + "px";
  });
  inputEl.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); formEl.requestSubmit(); }
  });
  $("settingsBtn").addEventListener("click", openSettings);
  $("inlineSettingsBtn").addEventListener("click", openSettings);
  $("closeSettingsBtn").addEventListener("click", closeSettings);
  modal.addEventListener("click", event => { if (event.target === modal) closeSettings(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeSettings(); });
  $("saveSettingsBtn").addEventListener("click", () => {
    const key = $("apiKeyInput").value.trim();
    const model = $("modelSelect").value;
    if (!key) { $("settingsStatus").textContent = "Hãy nhập API key trước khi lưu."; return; }
    try {
      localStorage.setItem(STORAGE_KEY, key);
      localStorage.setItem(MODEL_KEY, model);
      $("settingsStatus").textContent = "Đã lưu cài đặt trên trình duyệt này.";
      toast("Đã lưu cài đặt AI.");
      setTimeout(closeSettings, 700);
      $("setupHint").hidden = true;
    } catch (_) {
      $("settingsStatus").textContent = "Trình duyệt không cho phép lưu. Hãy bật lưu trữ trang web rồi thử lại.";
    }
  });
  $("removeKeyBtn").addEventListener("click", () => {
    try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(MODEL_KEY); } catch (_) {}
    $("apiKeyInput").value = "";
    $("settingsStatus").textContent = "Đã xóa key đã lưu trên trình duyệt này.";
    $("setupHint").hidden = false;
  });
  $("toggleKeyBtn").addEventListener("click", () => {
    const input = $("apiKeyInput");
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    $("toggleKeyBtn").textContent = show ? "Ẩn" : "Hiện";
  });
  $("newChatBtn").addEventListener("click", resetChat);
  $("clearBtn").addEventListener("click", resetChat);
  $("mobileMenuBtn").addEventListener("click", () => $("sidebar").classList.toggle("open"));
  document.querySelectorAll("[data-prompt]").forEach(button => {
    button.addEventListener("click", () => {
      const prompt = button.getAttribute("data-prompt") || "";
      $("sidebar").classList.remove("open");
      if (welcomeEl.hidden) { inputEl.value = prompt; inputEl.focus(); inputEl.dispatchEvent(new Event("input")); }
      else submitPrompt(prompt);
    });
  });

  // Intro screen: the landing page appears whenever the site is opened.
  $("startBtn").addEventListener("click", () => {
    $("introScreen").classList.add("intro-leaving");
    setTimeout(() => {
      $("introScreen").hidden = true;
      $("appShell").hidden = false;
      window.scrollTo(0, 0);
    }, 260);
  });
  $("backIntroBtn").addEventListener("click", () => {
    $("appShell").hidden = true;
    $("introScreen").hidden = false;
    $("introScreen").classList.remove("intro-leaving");
    window.scrollTo(0, 0);
  });

  // Local music picker. The chosen audio file stays on the user's device.
  let currentMusicUrl = "";
  $("musicInput").addEventListener("change", () => {
    const file = $("musicInput").files && $("musicInput").files[0];
    if (!file) return;
    if (!file.type.startsWith("audio/")) { toast("Hãy chọn một tệp âm thanh."); return; }
    if (currentMusicUrl) URL.revokeObjectURL(currentMusicUrl);
    currentMusicUrl = URL.createObjectURL(file);
    $("musicPlayer").src = currentMusicUrl;
    $("musicFilename").textContent = file.name;
    $("musicPlayer").load();
    $("musicPlayer").play().catch(() => toast("Đã thêm nhạc. Nhấn nút phát để nghe nhé."));
  });
  window.addEventListener("beforeunload", () => { if (currentMusicUrl) URL.revokeObjectURL(currentMusicUrl); });

  // Image attachment for Gemini vision.
  $("imageInput").addEventListener("change", () => {
    const file = $("imageInput").files && $("imageInput").files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast("Hãy chọn tệp ảnh như JPG, PNG hoặc WEBP."); clearSelectedImage(); return; }
    if (file.size > 10 * 1024 * 1024) { toast("Ảnh hơi lớn. Hãy chọn ảnh nhỏ hơn 10 MB."); clearSelectedImage(); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const comma = dataUrl.indexOf(",");
      if (comma < 0) { toast("Không đọc được ảnh này. Hãy thử ảnh khác."); return; }
      selectedImage = { dataUrl, mimeType: file.type || "image/jpeg", base64: dataUrl.slice(comma + 1), name: file.name };
      $("previewImage").src = dataUrl;
      $("imageFilename").textContent = file.name;
      $("imagePreview").hidden = false;
      toast("Đã thêm ảnh. Bạn có thể nhập thêm câu hỏi rồi nhấn Gửi.");
    };
    reader.onerror = () => toast("Không đọc được ảnh. Hãy thử lại.");
    reader.readAsDataURL(file);
  });
  $("removeImageBtn").addEventListener("click", clearSelectedImage);

  if (getKey()) $("setupHint").hidden = true;
})();