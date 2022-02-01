const languages = [
  { text: 'English', value: 'en' },
  { text: 'Afrikaans', value: 'af' },
  { text: 'Arabic', value: 'ar' },
  { text: 'Catalan', value: 'ca' },
  { text: 'Chinese', value: 'zh' },
  { text: 'Chinese (Mandarin)', value: 'zh-CN' },
  { text: 'Chinese (Cantonese)', value: 'zh-HK' },
  { text: 'Croatian', value: 'hr' },
  { text: 'Czech', value: 'cs' },
  { text: 'Danish', value: 'da' },
  { text: 'Dutch', value: 'nl' },
  { text: 'English (British)', value: 'en-GB' },
  { text: 'Finnish', value: 'fi' },
  { text: 'French', value: 'fr' },
  { text: 'German', value: 'de' },
  { text: 'Greek', value: 'el' },
  { text: 'Hebrew', value: 'he' },
  { text: 'Hindi', value: 'hi' },
  { text: 'Hungarian', value: 'hu' },
  { text: 'Indonesian', value: 'id' },
  { text: 'Italian', value: 'it' },
  { text: 'Japanese', value: 'ja' },
  { text: 'Korean', value: 'ko' },
  { text: 'Malay', value: 'ms' },
  { text: 'Norwegian', value: 'nb' },
  { text: 'Polish', value: 'pl' },
  { text: 'Portuguese - Brazil', value: 'pt-BR' },
  { text: 'Portuguese', value: 'pt' },
  { text: 'Romanian', value: 'ro' },
  { text: 'Russian', value: 'ru' },
  { text: 'Spanish', value: 'es' },
  { text: 'Swedish', value: 'sv' },
  { text: 'Tagalog', value: 'tl' },
  { text: 'Thai', value: 'th' },
  { text: 'Turkish', value: 'tr' },
  { text: 'Vietnamese', value: 'vi' },
];

const select = document.getElementById('select-language');

for (let i = 0; i < languages.length; i++) {
  const opt = languages[i];

  const el = document.createElement('option');
  el.textContent = opt.text;
  el.value = opt.value;
  select.appendChild(el);
}
