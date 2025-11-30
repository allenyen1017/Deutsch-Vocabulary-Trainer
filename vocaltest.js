let germanVoice = null;
function loadVoices() {
  const voices = speechSynthesis.getVoices();

  // 找到真正的德語語音
  germanVoice = voices.find(v =>
      v.lang.startsWith("de") ||
      v.name.toLowerCase().includes("german") ||
      v.name.toLowerCase().includes("deutsch")
  );
}

function speakGerman(text) {
  if (!germanVoice) loadVoices();

  const u = new SpeechSynthesisUtterance(text);
  u.voice = germanVoice;
  u.lang = "de-DE";
  speechSynthesis.speak(u);
}
