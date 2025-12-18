// 從分割的 vocab fragments 載入所有詞彙（支援分檔維護）
let vocab = [];
if (window.vocabParts && window.vocabParts.length) {
    // 合併所有 fragment 陣列
    vocab = [].concat(...window.vocabParts);
} else if (typeof vocabList !== 'undefined') {
    // 向後相容：如果只有一個 vocabList（舊的單一檔案），使用它
    vocab = [...vocabList];
} else {
    vocab = [];
}
let currentIndex = -1;
// 用於保存隨機排序的單字隊列
let wordQueue = [];

// 重新填充單字隊列
function refillWordQueue() {
    // 複製所有單字並打亂順序
    wordQueue = [...vocab].sort(() => Math.random() - 0.5);
}

// 從隊列中取出符合當前選擇範圍的單字
function getNextWordFromQueue() {
    const checked = Array.from(document.querySelectorAll('#lessonContainer input[type=checkbox]:checked')).map(ch => ch.value);
    // 如果隊列是空的，重新填充
    if (wordQueue.length === 0) {
        refillWordQueue();
    }
    // 持續從隊列中取出單字，直到找到符合條件的或隊列空了
    while (wordQueue.length > 0) {
        const word = wordQueue.shift();
        if (checked.length === 0 || checked.includes(word.lesson || '')) {
            return word;
        }
    }
    // 如果整個隊列都找不到符合的單字，重新填充並再試一次
    refillWordQueue();
    return getNextWordFromQueue();
}

// 初始化隊列
refillWordQueue();
// 測驗模式相關變數（若之前被誤刪，這裡還原）
let isExamMode = false;
let examQueue = [];
let wrongWords = [];

// 測驗模式按鈕事件監聽（若頁面上有 #examMode 按鈕）
const examBtn = document.getElementById("examMode");
if (examBtn) examBtn.addEventListener("click", startExamMode);

function startExamMode() {
    const checked = Array.from(document.querySelectorAll('#lessonContainer input[type=checkbox]:checked')).map(ch => ch.value);
    if (checked.length === 0) {
        alert('請至少選擇一個課程範圍！');
        return;
    }

    // 根據選擇的課程範圍篩選單字並打亂順序
    examQueue = vocab.filter(w => checked.includes((w.lesson || '')));
    if (examQueue.length === 0) {
        alert('選擇的範圍內沒有單字！');
        return;
    }

    // 檢查當前顯示的單字是否在選擇的範圍內
    const currentWord = vocab[currentIndex];
    if (currentWord && !checked.includes(currentWord.lesson || '')) {
        // 如果當前單字不在範圍內，清空介面
        document.getElementById("translation").textContent = "";
        document.getElementById("inputs").style.display = "none";
        document.getElementById("check").style.display = "none";
        document.getElementById("feedback").style.display = "none";
        document.getElementById("showAnswer").style.display = "none";
    }

    examQueue = examQueue.sort(() => Math.random() - 0.5);
    wrongWords = [];
    isExamMode = true;

    // 更新界面
    if (examBtn) examBtn.style.display = "none";
    document.getElementById("lessonContainer").style.pointerEvents = "none";
    document.getElementById("check").style.display = "block";
    document.getElementById("examResult").style.display = "none"; // 隱藏結果區域

    // 立即顯示第一個測驗單字
    nextWord();
}

// 將變體母音與替代輸入標準化為同一形式 (使用 ae/oe/ue/ss)
function normalizeGerman(s) {
    if (!s && s !== "") return "";
    s = String(s).toLowerCase().trim();
    // 先把特殊字元轉成替代形式
    s = s.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
    // 支援 é（如 Café），接受使用 e' 作為替代輸入
    s = s.replace(/é/g, 'e\u0301');
    // 接受使用冒號的替代寫法 a: o: u:
    s = s.replace(/a:/g, 'ae').replace(/o:/g, 'oe').replace(/u:/g, 'ue');
    // 把多個空白合併為單一空白，方便片語比對
    s = s.replace(/\s+/g, ' ');
    // 接受使用者以 e' 表示 é 的輸入（如 cafe' -> cafe + combining acute）
    s = s.replace(/e'/g, 'e\u0301');
    return s;
}

// 取得可接受的複數變體（原始顯示字串與標準化字串）
function getPluralVariants(word) {
    const raws = [];
    const addRaw = (v) => {
        if (!v && v !== '') return;
        if (Array.isArray(v)) {
            v.forEach(x => addRaw(x));
            return;
        }
        // 若包含多重寫法，支援以 / , | 或中文「或」分隔
        if (typeof v === 'string' && /[\\/|,或]/.test(v)) {
            v.split(/[\\/|,或]+/).map(s => s.trim()).filter(Boolean).forEach(x => raws.push(x));
        } else {
            raws.push(String(v).trim());
        }
    };

    // 以不區分大小寫的欄位名稱找到可能的 plural 欄位
    const candidateKeys = ['plural', 'pl', 'altplural', 'altpl', 'altdeutsch'];
    for (const k of Object.keys(word || {})) {
        const kl = k.toLowerCase();
        if (candidateKeys.includes(kl)) addRaw(word[k]);
    }

    // 如果找不到任何 plural 欄位，但 onlyplural 為 true，則使用 deutsch 作為複數形式
    if (raws.length === 0 && word.onlyplural) addRaw(word.deutsch);

    // 移除重複並標準化
    const uniqueRaws = Array.from(new Set(raws));
    const norms = uniqueRaws.map(r => normalizeGerman(r));
    return { raws: uniqueRaws, norms };
}

// 取得可接受的德文拼字變體（原始顯示字串與標準化字串）
function getDeutschVariants(word) {
    const raws = [];
    const addRaw = (v) => {
        if (!v && v !== '') return;
        if (Array.isArray(v)) {
            v.forEach(x => addRaw(x));
            return;
        }
        // 支援以 / , | 或中文「或」分隔的多重寫法
        if (typeof v === 'string' && /[\\/|,或]/.test(v)) {
            v.split(/[\\/|,或]+/).map(s => s.trim()).filter(Boolean).forEach(x => raws.push(x));
        } else {
            raws.push(String(v).trim());
        }
    };

    // 以不區分大小寫的欄位名稱找到可能的 deutsch 欄位
    const candidateKeys = ['deutsch', 'altdeutsch'];
    for (const k of Object.keys(word || {})) {
        const kl = k.toLowerCase();
        if (candidateKeys.includes(kl)) addRaw(word[k]);
    }

    // 移除重複並標準化
    const uniqueRaws = Array.from(new Set(raws));
    const norms = uniqueRaws.map(r => normalizeGerman(r));
    return { raws: uniqueRaws, norms };
}

document.getElementById("next").addEventListener("click", nextWord);
document.getElementById("check").addEventListener("click", checkAnswer);
document.getElementById("showAnswer").addEventListener("click", showAnswer);
let currentErrors = [];

function nextWord() {
    // 統一的 nextWord：若為測驗模式，從 examQueue 取第一個；否則從隨機隊列取
    // 隱藏顯示答案按鈕
    if(!isExamMode) document.getElementById("examResult").style.display = "none";
    document.getElementById("showAnswer").style.display = "none";
    if (vocab.length === 0) return;
    // 禁用下一個按鈕直到回答完成
    document.getElementById("next").disabled = true;
    // 重置檢查按鈕
    document.getElementById("check").disabled = false;
    document.getElementById("check").style.display = "block";

    let chosen;
    if (isExamMode) {
        console.log(examQueue.length);
        if (examQueue.length === 0) {
            endExamMode();
            return;
        }
        chosen = examQueue[0]; // 取第一個但不移除（checkAnswer 會在檢查後移除）
    } else {
        // 從隊列中取出下一個符合條件的單字
        chosen = getNextWordFromQueue();
    }
    currentIndex = vocab.indexOf(chosen);
    const translation = chosen.chinese;
    document.getElementById("translation").textContent = translation; // 顯示中文翻譯

    const inputsDiv = document.getElementById("inputs");
    inputsDiv.innerHTML = ""; // 清空

    if (chosen.type === "noun" && chosen.onlyplural) {
        // 僅複數名詞：行為同 other，只顯示中文並讓使用者輸入複數拼字（placeholder 為「複數」）
        inputsDiv.innerHTML = `
            <input type="text" id="deutschInput" placeholder="複數" required>
        `;
    } else if (chosen.type === "noun") {
        // 名詞：三個輸入
        inputsDiv.innerHTML = `
            <select id="genderInput" required>
                <option value="default">性別</option>
                <option value="der">der (陽性)</option>
                <option value="das">das (中性)</option>
                <option value="die">die (陰性)</option>
            </select>
            <input type="text" id="deutschInput" placeholder="德文拼字${chosen.hint ? ' (提示：' + chosen.hint + ')' : ''}" required>
        `;
        if(chosen.countable){
            inputsDiv.innerHTML += `
                <input type="text" id="pluralInput" placeholder="複數" required>
            `;
        }
    } else if (chosen.type === "verb") {
        // 依據該動詞已有的欄位決定可選型態
        const candidates = [];
        const personForms = ['ich', 'du', 'er', 'wir', 'ihr', 'sie'];
        // 若定義了 infinitiv，視為可用
        if (chosen.infinitiv) candidates.push('infinitiv');
        // 檢查各人稱是否有提供
        personForms.forEach(f => { if (chosen[f]) candidates.push(f); });

        // 決定要出題的欄位：若可用欄位少於等於3，全部出題；否則若有 infinitiv 則必定包含它，再隨機抽到總共3個；否則隨機抽取3個
        const selected = [];
        if (candidates.length <= 3) {
            selected.push(...candidates);
        } else {
            // 如果有 infinitiv，先加入
            if (candidates.includes('infinitiv')) {
                selected.push('infinitiv');
            }
            // 建立剩餘候選（排除已選）
            const remaining = candidates.filter(x => !selected.includes(x) && x !== 'infinitiv');
            while (selected.length < 3 && remaining.length > 0) {
                const idx = Math.floor(Math.random() * remaining.length);
                selected.push(remaining.splice(idx, 1)[0]);
            }
        }

        // placeholder 顯示（infinitiv 使用固定文字，其餘使用簡短人稱提示）
        const hinttext = {
            infinitiv: '原形 (Infinitiv)',
            ich: 'ich', du: 'du', er: 'er/es/sie', wir: 'wir', ihr: 'ihr', sie: 'sie/Sie'
        };

        // 記錄被選中的欄位到 chosen 物件，供檢查時使用
        chosen.selectedFields = selected;

        // 動詞：將選中的欄位依序生出輸入欄位
        let inputsHtml = '';
        selected.forEach(f => {
            if (f === 'infinitiv') {
                inputsHtml += `<input type="text" id="infinitivInput" placeholder="${hinttext.infinitiv}${chosen.hint ? ' (提示：' + chosen.hint + ')' : ''}" required>`;
            } else {
                inputsHtml += `<input type="text" id="${f}Input" placeholder="${hinttext[f]}" required>`;
            }
        });
        inputsDiv.innerHTML = inputsHtml;
    } else if (chosen.type === "konjunktiv") {
        // konjunktiv：沒有 infinitiv，隨機選擇三個不同人稱型態
        const forms = ['ich', 'du', 'er', 'wir', 'ihr', 'sie'];
        const hinttext = ['ich', 'du', 'er/es/sie', 'wir', 'ihr', 'sie/Sie'];
        const selected = [];
        const placeholderselected = [];
        while (selected.length < 3) {
            const idx = Math.floor(Math.random() * forms.length);
            if (!selected.includes(forms[idx])) {
                selected.push(forms[idx]);
                placeholderselected.push(hinttext[idx]);
            }
        }
        // 記錄被選中的形態到 word 物件，供檢查時使用
        chosen.selectedForms = selected;
        inputsDiv.innerHTML = `
            <input type="text" id="${selected[0]}Input" placeholder="${placeholderselected[0]}" required>
            <input type="text" id="${selected[1]}Input" placeholder="${placeholderselected[1]}" required>
            <input type="text" id="${selected[2]}Input" placeholder="${placeholderselected[2]}" required>
        `;
    } else if (chosen.type === "country"){
        if(chosen.countable){
            inputsDiv.innerHTML = `
            <select id="numberInput" required>
                <option value="singular">單數</option>
                <option value="plural">複數</option>
            </select>
        `;
        }
        inputsDiv.innerHTML += `
            <input type="text" id="deutschInput" placeholder="德文拼字${chosen.hint ? ' (提示：' + chosen.hint + ')' : ''}" required>
        `;
    } else if (chosen.type === "adjective" || chosen.type === "adverb" || chosen.type === "question" || chosen.type === "other") {
        // 形容詞、副詞、疑問詞：只需要一個德文輸入
        inputsDiv.innerHTML = `
            <input type="text" id="deutschInput" placeholder="德文拼字${chosen.hint ? ' (提示：' + chosen.hint + ')' : ''}" required>
        `;
    }

    // 支援片語型態：使用一般的 input，但加上 class="phrase" 以便用 CSS 調整寬度
    if (chosen.type === 'phrase') {
        inputsDiv.innerHTML = `
            <input type="text" id="deutschInput" class="phrase" placeholder="片語${chosen.hint ? ' (提示：' + chosen.hint + ')' : ''}" required />
        `;
    }

    document.getElementById("inputs").style.display = "block";
    document.getElementById("check").style.display = "block";
    document.getElementById("feedback").style.display = "none";
    document.getElementById("feedback").className = "";
}

function showAnswer() {
    const feedback = document.getElementById("feedback");
    // 只顯示使用者答錯的部分（來自 currentErrors），不額外列出使用者答對的欄位
    // currentErrors 預先已經以 "欄位：答案1 或 答案2" 的格式填好
    if (!Array.isArray(currentErrors) || currentErrors.length === 0) {
        feedback.innerHTML = '<ul style="text-align:left; display:inline-block; margin:8px 0 0 0; padding-left:18px;">' +
                             '<li><strong>正確答案：</strong></li><li><em>無需顯示，您已答對或尚未作答。</em></li></ul>';
    } else {
        const items = currentErrors.map(item => `<li>${item}</li>`).join('');
        feedback.innerHTML = `<ul style="text-align:left; display:inline-block; margin:8px 0 0 0; padding:8px 12px; padding-left:18px;">` +
                             `<li><strong>正確答案：</strong></li>` +
                             `${items}</ul>`;
    }
    feedback.className = "incorrect";
    
    // 啟用下一個按鈕
    document.getElementById("next").disabled = false;
    // 隱藏顯示答案按鈕
    document.getElementById("showAnswer").style.display = "none";
}

// 填充 lesson 核取方塊（依 vocab 中的 lesson 欄位）
function populateLessonCheckboxes() {
    const container = document.getElementById('lessonContainer');
    if (!container) return;
    // 收集所有 lesson 值（若沒有 lesson 屬性，視為空字串 '')
    const set = new Set();
    vocab.forEach(w => set.add((w.lesson !== undefined ? w.lesson : '')));
    // 清空容器
    container.innerHTML = '';
    // 依序建立核取方塊，空字串顯示為「未分類」
    Array.from(set).forEach(lesson => {
        const val = lesson || '';
        const labelText = lesson === '' ? '未分類' : lesson;
        const id = `lesson_${labelText.replace(/\s+/g,'_')}`;
        const wrapper = document.createElement('label');
        wrapper.style.display = 'inline-flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '6px';
        wrapper.style.padding = '4px 6px';
        wrapper.style.border = '1px solid #ddd';
        wrapper.style.borderRadius = '6px';
        wrapper.style.background = '#fff';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = val;
        cb.id = id;
        cb.name = 'lessonCheckbox';
        const span = document.createElement('span');
        span.textContent = labelText;
        wrapper.appendChild(cb);
        wrapper.appendChild(span);
        container.appendChild(wrapper);
    });
}

// 在載入時填充 lesson 核取方塊
populateLessonCheckboxes();

function setupInputFields(word) {
    const inputsDiv = document.getElementById("inputs");
    inputsDiv.innerHTML = "";
    if (word.type === "noun" && word.onlyplural) {
        // 僅複數名詞：同 other，只要一個輸入並提示為「複數」
        inputsDiv.innerHTML = `
            <input type="text" id="deutschInput" placeholder="複數" required>
        `;
    } else if (word.type === "noun") {
        inputsDiv.innerHTML = `
            <select id="genderInput" required>
                <option value="default">性別</option>
                <option value="der">der (陽性)</option>
                <option value="das">das (中性)</option>
                <option value="die">die (陰性)</option>
            </select>
            <input type="text" id="deutschInput" placeholder="德文拼字${word.hint ? ' (提示：' + word.hint + ')' : ''}" required>
        `;
        if(word.countable){
            inputsDiv.innerHTML += `
                <input type="text" id="pluralInput" placeholder="複數" required>
            `;
        }
    } else if (word.type === "verb") {
        // 依據該動詞已有的欄位決定可選型態
        const candidates = [];
        const personForms = ['ich', 'du', 'er', 'wir', 'ihr', 'sie'];
        if (word.infinitiv) candidates.push('infinitiv');
        personForms.forEach(f => { if (word[f]) candidates.push(f); });

        const selected = [];
        if (candidates.length <= 3) {
            selected.push(...candidates);
        } else {
            if (candidates.includes('infinitiv')) selected.push('infinitiv');
            const remaining = candidates.filter(x => !selected.includes(x) && x !== 'infinitiv');
            while (selected.length < 3 && remaining.length > 0) {
                const idx = Math.floor(Math.random() * remaining.length);
                selected.push(remaining.splice(idx, 1)[0]);
            }
        }

        const hinttext = {
            infinitiv: '原形 (Infinitiv)',
            ich: 'ich', du: 'du', er: 'er/es/sie', wir: 'wir', ihr: 'ihr', sie: 'sie/Sie'
        };

        word.selectedFields = selected;
        let inputsHtml = '';
        selected.forEach(f => {
            if (f === 'infinitiv') {
                inputsHtml += `<input type="text" id="infinitivInput" placeholder="${hinttext.infinitiv}${word.hint ? ' (提示：' + word.hint + ')' : ''}" required>`;
            } else {
                inputsHtml += `<input type="text" id="${f}Input" placeholder="${hinttext[f]}" required>`;
            }
        });
        inputsDiv.innerHTML = inputsHtml;
    } else if (word.type === "konjunktiv") {
        // konjunktiv：沒有 infinitiv，隨機選擇三個不同人稱型態
        const forms = ['ich', 'du', 'er', 'wir', 'ihr', 'sie'];
        const hinttext = ['ich', 'du', 'er/es/sie', 'wir', 'ihr', 'sie/Sie'];
        const selected = [];
        const placeholderselected = [];
        while (selected.length < 3) {
            const idx = Math.floor(Math.random() * forms.length);
            if (!selected.includes(forms[idx])) {
                selected.push(forms[idx]);
                placeholderselected.push(hinttext[idx]);
            }
        }
        word.selectedForms = selected;
        inputsDiv.innerHTML = `
            <input type="text" id="${selected[0]}Input" placeholder="${placeholderselected[0]}" required>
            <input type="text" id="${selected[1]}Input" placeholder="${placeholderselected[1]}" required>
            <input type="text" id="${selected[2]}Input" placeholder="${placeholderselected[2]}" required>
        `;
    } else if (word.type === "country") {
        if(word.countable){
            inputsDiv.innerHTML = `
                <select id="numberInput" required>
                    <option value="singular">單數</option>
                    <option value="plural">複數</option>
                </select>
            `;
        }
        inputsDiv.innerHTML += `
            <input type="text" id="deutschInput" placeholder="德文拼字${word.hint ? ' (提示：' + word.hint + ')' : ''}" required>
        `;
    } else if (word.type === 'phrase') {
        inputsDiv.innerHTML = `
            <input type="text" id="deutschInput" class="phrase" placeholder="片語${word.hint ? ' (提示：' + word.hint + ')' : ''}" required>
        `;
    } else {
        inputsDiv.innerHTML = `
            <input type="text" id="deutschInput" placeholder="德文拼字${word.hint ? ' (提示：' + word.hint + ')' : ''}" required>
        `;
    }
}

function checkAnswer() {
    const word = vocab[currentIndex];
    const feedback = document.getElementById("feedback");
    feedback.style.display = "block";
    let allCorrect = true;
    currentErrors = [];

    if (word.type === "noun" && word.onlyplural) {
        // 只複數名詞：使用者輸入複數形式（placeholder 為 複數）；支援多重可接受複數
        const deutschInput = normalizeGerman(document.getElementById("deutschInput").value.trim());
        const { raws: pluralRaws, norms: pluralNorms } = getPluralVariants(word);
        if (!pluralNorms.includes(deutschInput)) {
            allCorrect = false;
            const answers = pluralRaws.length ? pluralRaws : [word.plural || word.deutsch];
            currentErrors.push(`複數：${answers.join(' 或 ')}`);
        }
    } else if (word.type === "noun") {
        const genderInput = document.getElementById("genderInput").value;
        const deutschInputRaw = document.getElementById("deutschInput").value.trim();
        const pluralInputRaw = (word.countable ? document.getElementById("pluralInput").value.trim() : "");
        const deutschInput = normalizeGerman(deutschInputRaw);
        const pluralInput = normalizeGerman(pluralInputRaw);

        const correctGender = word.gender || 'none'; // 直接使用 word.gender 的值 (der/das/die/none)
        const { raws: deutschRaws, norms: deutschNorms } = getDeutschVariants(word);
        const correctPlural = normalizeGerman(word.plural || '');

        if (genderInput !== correctGender) {
            allCorrect = false;
            currentErrors.push(`性別：${correctGender}`);
        }
        if (!deutschNorms.includes(deutschInput)) {
            allCorrect = false;
            const answers = deutschRaws.length ? deutschRaws : [word.deutsch].concat(word.altdeutsch ? [word.altdeutsch] : []);
            currentErrors.push(`德文：${answers.join(' 或 ')}`);
        }
        // 檢查複數型：支援多重可接受複數（plural、Pl、altplural、altdeutsch 等）
        if (word.countable) {
            const { raws: pluralRaws, norms: pluralNorms } = getPluralVariants(word);
            // 若沒有定義任何 plural 資料，仍嘗試使用原本的 plural 欄位備援
            if (pluralNorms.length === 0) {
                const correctPluralAlt = normalizeGerman(word.Pl || '');
                if (pluralInput !== correctPlural && (word.Pl === undefined || pluralInput !== correctPluralAlt)) {
                    allCorrect = false;
                    const pluralAnswers = [word.plural];
                    if (word.Pl) pluralAnswers.push(word.Pl);
                    currentErrors.push(`複數：${pluralAnswers.join(' 或 ')}`);
                }
            } else {
                if (!pluralNorms.includes(pluralInput)) {
                    allCorrect = false;
                    const answers = pluralRaws.length ? pluralRaws : [word.plural];
                    currentErrors.push(`複數：${answers.join(' 或 ')}`);
                }
            }
        }
    } else if (word.type === "verb") {
        // 檢查依 selectedFields 決定的欄位（支援不存在所有型態的動詞）
        const fields = word.selectedFields || [];
        for (const field of fields) {
            if (field === 'infinitiv') {
                const infinitivInputEl = document.getElementById('infinitivInput');
                const infinitivInput = infinitivInputEl ? normalizeGerman(infinitivInputEl.value.trim()) : '';
                const correctInfinitiv = normalizeGerman(word.infinitiv || '');
                if (infinitivInput !== correctInfinitiv) {
                    allCorrect = false;
                    currentErrors.push(`原形：${word.infinitiv}`);
                }
            } else {
                const el = document.getElementById(field + 'Input');
                const input = el ? normalizeGerman(el.value.trim()) : '';
                const correct = normalizeGerman(word[field] || '');
                if (input !== correct) {
                    allCorrect = false;
                    currentErrors.push(`${field}：${word[field]}`);
                }
            }
        }
    } else if (word.type === "konjunktiv") {
        // konjunktiv：沒有 infinitiv，檢查被選中的三個形態
        for (const form of (word.selectedForms || [])) {
            const el = document.getElementById(form + "Input");
            const inputVal = el ? normalizeGerman(el.value.trim()) : '';
            const correct = normalizeGerman(word[form] || '');
            if (inputVal !== correct) {
                allCorrect = false;
                currentErrors.push(`${form}：${word[form]}`);
            }
        }
    } else if (word.type === "country") {
        // 國家/語言：檢查德文拼字；若 countable=true 則檢查單/複數
        const numberInput = document.getElementById("numberInput");
        const numberSelected = numberInput ? numberInput.value : null;
        const deutschInput = normalizeGerman(document.getElementById("deutschInput").value.trim());
        const { raws: deutschRawsC, norms: deutschNormsC } = getDeutschVariants(word);
        if (word.countable) {
            // 使用者需要回答是單數或複數
            const correctPlural = word.plural ? `複數` : `單數`;
            if (numberSelected !== (word.plural ? "plural" : "singular")) {
                allCorrect = false;
                currentErrors.push(`單複數：${correctPlural}`);
            }
        }
        if (!deutschNormsC.includes(deutschInput)) {
            allCorrect = false;
            const answers = deutschRawsC.length ? deutschRawsC : [word.deutsch].concat(word.altdeutsch ? [word.altdeutsch] : []);
            currentErrors.push(`德文：${answers.join(' 或 ')}`);
        }
    } else if (word.type === "adjective" || word.type === "adverb" || word.type === "question" || word.type === "other") {
        // 形容詞、副詞、疑問詞：只需檢查德文拼字
        const deutschInput = normalizeGerman(document.getElementById("deutschInput").value.trim());
        const { raws: deutschRawsO, norms: deutschNormsO } = getDeutschVariants(word);
        if (!deutschNormsO.includes(deutschInput)) {
            allCorrect = false;
            const answers = deutschRawsO.length ? deutschRawsO : [word.deutsch].concat(word.altdeutsch ? [word.altdeutsch] : []);
            currentErrors.push(`德文：${answers.join(' 或 ')}`);
        }
    }

    // 片語型態：行為同 other，但使用 textarea 輸入（比對已在 normalizeGerman 處理空白）
    else if (word.type === 'phrase') {
        const deutschInput = normalizeGerman(document.getElementById("deutschInput").value.trim());
        const { raws: deutschRawsP, norms: deutschNormsP } = getDeutschVariants(word);
        if (!deutschNormsP.includes(deutschInput)) {
            allCorrect = false;
            const answers = deutschRawsP.length ? deutschRawsP : [word.deutsch].concat(word.altdeutsch ? [word.altdeutsch] : []);
            currentErrors.push(`德文：${answers.join(' 或 ')}`);
        }
    }

    if (allCorrect) {
        feedback.textContent = "正確";
        feedback.className = "correct";
    } else {
        feedback.textContent = "錯誤";
        feedback.className = "incorrect";
        
        if (isExamMode) {
            // 在測驗模式中，直接顯示答案
            showAnswer();
            // 儲存此次題目的錯誤細節到該詞條的暫存屬性，供結束時顯示
            try { word._lastErrors = currentErrors.slice(); } catch (e) { /* ignore */ }
            wrongWords.push(word);
        } else {
            // 在練習模式中，顯示"顯示答案"按鈕
            document.getElementById("showAnswer").style.display = "block";
        }
    }

    if (isExamMode) {
        // 在測驗模式中，檢查後立即鎖定輸入並啟用下一個按鈕
        document.getElementById("check").disabled = true;
        document.getElementById("next").disabled = false;
        // 移除當前單字
        examQueue.shift();
    } else {
        // 在練習模式中，只有答對時才啟用下一個按鈕
        if (allCorrect) {
            document.getElementById("next").disabled = false;
            document.getElementById("showAnswer").style.display = "none";
        }
    }

    // 無需儲存難度，僅儲存 vocab 如果有其他變更
    saveVocab();
}

function saveVocab() {
    localStorage.setItem("vocab", JSON.stringify(vocab));
}

// 啟動時載入
nextWord();

// 播放目前單字的德文發音（會使用 vocaltest.js 中的 speakGerman）
function speakCurrent() {
    try {
        const w = vocab && vocab[currentIndex];
        const text = w ? (w.deutsch || w.infinitiv || '') : '';
        if (!text) return;
        if (typeof speakGerman === 'function') {
            speakGerman(text);
        } else {
            // 若 speakGerman 尚未載入，嘗試使用 speechSynthesis 直接發音
            const u = new SpeechSynthesisUtterance(text);
            u.lang = 'de-DE';
            speechSynthesis.speak(u);
        }
    } catch (e) {
        console.error('speakCurrent error', e);
    }
}

