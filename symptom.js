const LANGUAGES = ['en', 'zh', 'ko'];
const DEFAULT_SECONDARY = 'ko';

let currentLanguage = 'en';

function setLanguage(lang) {
  currentLanguage = lang;
  updateTranslations();
  updateDepartmentOptions();

  LANGUAGES.forEach(code => {
    const isPrimary = code === lang;
    const elements = document.querySelectorAll(`.lang-${code}`);
    elements.forEach(el => {
      el.style.display = isPrimary || code === DEFAULT_SECONDARY ? 'inline' : 'none';
    });
  });

  // Always show Korean summary
  document.querySelectorAll('.lang-ko-summary').forEach(el => {
    el.style.display = 'block';
  });

  const dropdown = document.getElementById('language-select');
  if (dropdown) dropdown.value = lang;
}

function updateTranslations() {
  const elements = {
    pageTitle: document.title,
    languageTitle: document.getElementById('languageTitle'),
    checklistTitle: document.getElementById('checklistTitle'),
    nameLabel: document.getElementById('nameLabel'),
    birthLabel: document.getElementById('birthLabel'),
    departmentLabel: document.getElementById('departmentLabel'),
    symptomStartLabel: document.getElementById('symptomStartLabel'),
    notesLabel: document.getElementById('notesLabel'),
    generateButton: document.getElementById('generateButton')
  };

  for (const [key, element] of Object.entries(elements)) {
    if (element) {
      element.textContent = translations[currentLanguage][key];
    }
  }
}

function resetLanguageSelection() {
  document.getElementById('language-select').value = '';
  setLanguage('en');
}

function onLanguageSelect(lang) {
  if (lang) {
    setLanguage(lang);
  } else {
    resetLanguageSelection();
  }
}

function createSymptomElement(symptomKey, symptomText) {
  const div = document.createElement('div');
  div.className = 'symptom-item';
  
  const labelGroup = document.createElement('div');
  labelGroup.className = 'label-group';
  
  const label = document.createElement('label');
  label.textContent = symptomText;
  
  const koLabel = document.createElement('label');
  koLabel.className = 'ko-text';
  koLabel.textContent = translations.ko.symptoms[currentDepartment][symptomKey];
  
  labelGroup.appendChild(label);
  labelGroup.appendChild(koLabel);
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'symptom';
  checkbox.value = translations.ko.symptoms[currentDepartment][symptomKey];
  
  const severityGroup = document.createElement('div');
  severityGroup.className = 'severity-button-group';
  
  const severityLabelGroup = document.createElement('div');
  severityLabelGroup.className = 'label-group';
  
  const severityLabel = document.createElement('label');
  severityLabel.textContent = translations[currentLanguage].severity;
  
  const koSeverityLabel = document.createElement('label');
  koSeverityLabel.className = 'ko-text';
  koSeverityLabel.textContent = translations.ko.severity;
  
  severityLabelGroup.appendChild(severityLabel);
  severityLabelGroup.appendChild(koSeverityLabel);
  
  severityGroup.appendChild(severityLabelGroup);
  
  for (let i = 1; i <= 5; i++) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = i;
    button.onclick = () => setSeverity(button, i);
    severityGroup.appendChild(button);
  }
  
  const hiddenInput = document.createElement('input');
  hiddenInput.type = 'hidden';
  hiddenInput.className = 'symptom-severity';
  severityGroup.appendChild(hiddenInput);
  
  div.appendChild(labelGroup);
  div.appendChild(checkbox);
  div.appendChild(document.createTextNode(' Check'));
  div.appendChild(document.createElement('br'));
  div.appendChild(severityGroup);
  
  return div;
}

function createDepartmentSection(deptId) {
  const section = document.createElement('div');
  section.id = deptId;
  section.className = 'symptom-category';
  
  const titleGroup = document.createElement('div');
  titleGroup.className = 'title-group';
  
  const title = document.createElement('h4');
  title.textContent = translations[currentLanguage].departments[deptId];
  
  const koTitle = document.createElement('h4');
  koTitle.className = 'ko-text';
  koTitle.textContent = translations.ko.departments[deptId];
  
  titleGroup.appendChild(title);
  titleGroup.appendChild(koTitle);
  section.appendChild(titleGroup);
  
  const symptoms = translations[currentLanguage].symptoms[deptId];
  for (const [key, text] of Object.entries(symptoms)) {
    section.appendChild(createSymptomElement(key, text));
  }
  
  return section;
}

function initializeSymptomCategories() {
  const container = document.getElementById('symptomCategories');
  const departments = Object.keys(translations.en.departments);
  
  departments.forEach(deptId => {
    container.appendChild(createDepartmentSection(deptId));
  });
}

function onDepartmentSelect(deptId) {
  document.querySelectorAll('.symptom-category').forEach(div => {
    div.style.display = 'none';
  });
  if (deptId) {
    document.getElementById(deptId).style.display = 'block';
  }
}

function setSeverity(button, value) {
  const group = button.parentElement;
  const buttons = group.querySelectorAll('button');
  buttons.forEach(btn => btn.classList.remove('selected'));
  button.classList.add('selected');

  const hiddenInput = group.querySelector('.symptom-severity');
  hiddenInput.value = value;
}

function generateSummary() {
  const name = document.getElementById('name').value;
  const birth = document.getElementById('birth').value;
  const duration = document.getElementById('duration').value;
  const notes = document.getElementById('generalNotes').value;
  
  const selectedSymptoms = [];
  document.querySelectorAll('.symptom:checked').forEach(checkbox => {
    const severity = checkbox.parentElement.querySelector('.symptom-severity').value;
    selectedSymptoms.push(`${checkbox.value} (${severity}/5)`);
  });
  
  const summary = `
    환자 정보:
    이름: ${name}
    생년월일: ${birth}
    
    증상:
    ${selectedSymptoms.join('\n')}
    
    증상 시작: ${duration}
    
    추가 메모: ${notes}
  `;
  
  document.getElementById('koreanSummary').textContent = summary;
  document.getElementById('summary').style.display = 'block';
}

function updateDepartmentOptions() {
  const select = document.getElementById('department-select');
  const options = select.options;
  
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    if (option.value) {
      const enText = option.querySelector('.en-text');
      const koText = option.querySelector('.ko-text');
      
      if (enText && koText) {
        enText.textContent = translations[currentLanguage].departments[option.value];
        koText.textContent = translations.ko.departments[option.value];
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeSymptomCategories();
  setLanguage('en');
});