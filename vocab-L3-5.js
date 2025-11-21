// 特殊字符 Ä ä Ö ö Ü ü ẞ ß
// 由於專案改為分檔維護，載入時把此檔的詞彙推入 window.vocabParts
window.vocabParts = window.vocabParts || [];
window.vocabParts.push([
    // 名詞
    //{ type: 'noun', deutsch: '', chinese: '', gender: '', plural: '', Pl: '', countable: true, lesson: '', hint: '' },
    { type: 'noun', deutsch: 'Kaffee', chinese: '咖啡', gender: 'der', plural: 'Kaffees', Pl: '-s', countable: true, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Tee', chinese: '茶', gender: 'der', plural: 'Tees', Pl: '-s', countable: true, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Kakao', chinese: '可可飲', gender: 'der', plural: 'Kakaos', Pl: '-s', countable: true, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Cappuccino', chinese: '卡布奇諾', gender: 'der', plural: 'Cappuccinos', Pl: '-s', countable: true, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Espresso', chinese: '義式濃縮咖啡', gender: 'der', plural: 'Espressos', Pl: '-s', countable: true, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Saft', chinese: '果汁', gender: 'der', plural: 'Säfte', Pl: '-:e', countable: true, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Apfel', chinese: '蘋果', gender: 'der', plural: 'Äpfel', Pl: '-:', countable: true, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Latte Macchiato', chinese: '焦糖瑪奇朵', gender: 'der', plural: 'Latte Macchiatos', Pl: '-s', countable: true, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Apfelsaft', chinese: '蘋果汁', gender: 'der', plural: 'Apfelsäfte', Pl: '-:e', countable: true, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Orangensaft', chinese: '橙汁', gender: 'der', plural: 'Orangensäfte', Pl: '-:e', countable: true, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Eistee', chinese: '冰茶', gender: 'der', plural: 'Eistees', Pl: '-s', countable: true, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Chai', chinese: '印度香料奶茶', gender: 'der', plural: 'Chais', Pl: '-s', countable: true, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Milchkaffee', chinese: '拿鐵', gender: 'der', plural: 'Milchkaffees', Pl: '-s', countable: true, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Wasser', chinese: '水', gender: 'das', countable: false, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Mineralwasser', chinese: '礦泉水', gender: 'das', plural: 'Mineralwasser', Pl: '-', countable: true, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Eis', chinese: '冰', gender: 'das', countable: false, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Orange', chinese: '柳橙', gender: 'die', plural: 'Orangen', Pl: '-n', countable: true, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Cola', chinese: '可樂', gender: 'die', plural: 'Colas', Pl: '-s', countable: true, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Limonade', chinese: '汽水', gender: 'die', plural: 'Limonaden', Pl: '-n', countable: true, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Milch', chinese: '(牛)奶', gender: 'die', countable: false, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Kellner', chinese: '侍者', gender: 'der', plural: 'Kellner', Pl: '-', countable: true, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Kellnerin', chinese: '女侍者', gender: 'die', plural: 'Kellnerinnen', Pl: '-nen', countable: true, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Zucker', chinese: '糖', gender: 'der', plural: 'Zucker', Pl: '-', countable: true, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Getränk', chinese: '飲料', gender: 'das', plural: 'Getränke', Pl: '-e', countable: true, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Portemonnaie', chinese: '錢夾', gender: 'das', plural: 'Portemonnaies', Pl: '-s', countable: true, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Croissant', chinese: '牛角麵包 可頌', gender: 'das', plural: 'Croissants', Pl: '-s', countable: true, lesson: 'lesson 3' },
    { type: 'noun', deutsch: 'Brille', chinese: '眼鏡', gender: 'die', plural: 'Brillen', Pl: '-n', countable: true, lesson: 'lesson 3' },
  //{ type: 'noun', deutsch: '', chinese: '', gender: '', plural: '', Pl: '', countable: true, lesson: 'lesson 3' },


    // 動詞
    //{ type: 'verb', infinitiv: '', ich: '', du: '', er: '', wir: '', ihr: '', sie: '', chinese: '', lesson: '', hint: '' },
    //{ type: 'konjunktiv', ich: '', du: '', er: '', wir: '', ihr: '', sie: '', chinese: '', lesson: '', hint: '' },
    { type: 'verb', infinitiv: 'trinken', ich: 'trinke', du: 'trinkst', er: 'trinkt', wir: 'trinken', ihr: 'trinkt', sie: 'trinken', chinese: '喝', lesson: 'lesson 3' },
    { type: 'verb', infinitiv: 'bestellen', ich: 'bestelle', du: 'bestellst', er: 'bestellt', wir: 'bestellen', ihr: 'bestellt', sie: 'bestellen', chinese: '點...飲料/食物', lesson: 'lesson 3' },
    { type: 'verb', infinitiv: 'nehmen', ich: 'nehme', du: 'nimmst', er: 'nimmt', wir: 'nehmen', ihr: 'nehmt', sie: 'nehmen', chinese: '喝... 吃...', lesson: 'lesson 3' },
  //{ type: 'verb', infinitiv: '', ich: '', du: '', er: '', wir: '', ihr: '', sie: '', chinese: '', lesson: 'lesson 3' },
    { type: 'konjunktiv', ich: 'möchte', du: 'möchtest', er: 'möchte', wir: 'möchten', ihr: 'möchtet', sie: 'möchten', chinese: '想要... 若有...多好', lesson: 'lesson 3' },
    // 形容詞
    //{ type: 'adjective', deutsch: '', chinese: '', lesson: '' },
    { type: 'adjective', deutsch: 'schwarz', chinese: '黑的', lesson: 'lesson 3' },

    // 副詞
    //{ type: 'adverb', deutsch: '', chinese: '', lesson: '' },
    { type: 'adverb', deutsch: 'lieber', chinese: '寧願 比較喜歡', lesson: 'lesson 3' },

    // 疑問詞
    //{ type: 'question', deutsch: '', chinese: '', lesson: '' },

    // 其他(人稱代名詞 介係詞 連接詞 所有格冠詞 片語)
    { type: 'other', deutsch: 'mit', chinese: '有... 和... 加...', lesson: 'lesson 3' },
    { type: 'other', deutsch: 'ohne', chinese: '無... 去(不加)...', lesson: 'lesson 3' },
    { type: 'other', deutsch: 'von', chinese: '...的(所有格)', lesson: 'lesson 3' },

    // 國家 語言 城市(名詞)
    { type: 'country', deutsch: 'Indien', chinese: '印度', countable: false, lesson: 'lesson 3' }
]);