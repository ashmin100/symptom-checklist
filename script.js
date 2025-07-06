let currentLang = 'en'; // 항상 영어로 시작

const dualTextElements = [
  { id: 'languageTitle', key: 'languageTitle' },
  { id: 'checklistTitle', key: 'checklistTitle' },
  { id: 'nameLabel', key: 'nameLabel' },
  { id: 'birthLabel', key: 'birthLabel' },
  { id: 'departmentLabel', key: 'departmentLabel' },
  { id: 'notesLabel', key: 'notesLabel' },
  { id: 'generateButton', key: 'generateButton' }
];

// 진료과별로 선택된 증상과 증상 정도를 저장할 객체
const selectedSymptomsByDept = {};

function setDualText(element, key, tag = 'textContent', placeholder = false) {
  if (!element) return;
  const main = translations[currentLang]?.[key] ?? key;
  const ko = translations['ko']?.[key] ?? key;
  if (currentLang === 'ko') {
    if (placeholder) {
      element.placeholder = ko;
    } else {
      element[tag] = ko;
    }
  } else {
    if (placeholder) {
      element.placeholder = `${main} / ${ko}`;
    } else {
      element[tag] = `${main} / ${ko}`;
    }
  }
}

function getDepartmentEmoji(department) {
  // translations.js의 en/ko/zh 중 아무 언어에서나 이모티콘만 추출
  const en = translations['en'].departments[department] || '';
  const match = en.match(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\u1F300-\u1F6FF]|[\u1F900-\u1F9FF]|[\u1F1E6-\u1F1FF])/);
  return match ? match[0] : '';
}

function updateAllTranslations() {
  dualTextElements.forEach(({ id, key }) => {
    setDualText(document.getElementById(id), key);
  });
  setDualText(document.getElementById('generalNotes'), 'notesLabel', 'placeholder', true);
  // 진료과 select 옵션
  const deptSelect = document.getElementById('department-select');
  if (deptSelect) {
    Array.from(deptSelect.options).forEach(opt => {
      const val = opt.value;
      if (translations[currentLang].departments && translations['ko'].departments && translations[currentLang].departments[val]) {
        const emoji = getDepartmentEmoji(val);
        opt.textContent = val ? `${emoji} ${translations[currentLang].departments[val].replace(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\u1F300-\u1F6FF]|[\u1F900-\u1F9FF]|[\u1F1E6-\u1F1FF])/, '').trim()} / ${translations['ko'].departments[val].replace(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\u1F300-\u1F6FF]|[\u1F900-\u1F9FF]|[\u1F1E6-\u1F1FF])/, '').trim()}` : '--';
      }
    });
  }
  // 'Entered Values' 라벨 동적 변경
  const notesLabelInputEn = document.getElementById('notesLabelInputEn');
  if (notesLabelInputEn) {
    const main = translations[currentLang]?.notesLabelInput || 'Entered Values';
    const ko = translations['ko']?.notesLabelInput || '입력하신 값';
    notesLabelInputEn.textContent = `${main} / ${ko}`;
  }
}

function setLanguage(lang) {
  currentLang = lang;
  const langSelect = document.getElementById('language-select');
  if (langSelect) langSelect.value = lang;
  updateAllTranslations();
  updateSymptomCategories();
}

document.addEventListener('DOMContentLoaded', () => {
  setLanguage('en');
});

function createSymptomCategory(department) {
  const category = document.createElement('div');
  category.className = 'symptom-category';
  category.id = `${department}-symptoms`;
  category.style.display = 'none';

  const title = document.createElement('h3');
  const emoji = getDepartmentEmoji(department);
  title.textContent = `${emoji} ${translations[currentLang].departments[department].replace(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\u1F300-\u1F6FF]|[\u1F900-\u1F9FF]|[\u1F1E6-\u1F1FF])/, '').trim()} / ${translations['ko'].departments[department].replace(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\u1F300-\u1F6FF]|[\u1F900-\u1F9FF]|[\u1F1E6-\u1F1FF])/, '').trim()}`;
  category.appendChild(title);

  // 증상 시작일 섹션
  const symptomStartSection = document.createElement('div');
  symptomStartSection.className = 'symptom-start-section';
  const symptomStartLabel = document.createElement('label');
  symptomStartLabel.className = 'symptom-start-label';
  symptomStartLabel.textContent = `${translations[currentLang].symptomStartLabel} / ${translations['ko'].symptomStartLabel}`;
  symptomStartSection.appendChild(symptomStartLabel);
  const symptomStartSelect = document.createElement('select');
  symptomStartSelect.className = 'symptom-start-select';
  symptomStartSelect.addEventListener('change', () => {
    category.dataset.symptomStart = symptomStartSelect.value;
    updateSummary();
  });
  for (let i = 0; i <= 30; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    symptomStartSelect.appendChild(option);
  }
  const daysAgoSpan = document.createElement('span');
  daysAgoSpan.className = 'days-ago-text';
  daysAgoSpan.textContent = `${translations[currentLang].daysAgo} / ${translations['ko'].daysAgo}`;
  symptomStartSection.appendChild(symptomStartSelect);
  symptomStartSection.appendChild(daysAgoSpan);
  category.appendChild(symptomStartSection);

  // 증상 리스트
  const symptomList = document.createElement('div');
  symptomList.className = 'symptom-list';
  const symptoms = Object.entries(translations[currentLang].symptoms[department]);
  symptoms.forEach(([key, symptom], index) => {
    const symptomItem = document.createElement('div');
    symptomItem.className = 'symptom-item';
    symptomItem.dataset.symptomKey = key;
    const label = document.createElement('label');
    label.textContent = `${symptom} / ${translations['ko'].symptoms[department][key]}`;
    symptomItem.appendChild(label);
    const severityPanel = document.createElement('div');
    severityPanel.className = 'severity-panel';
    const severityGroup = document.createElement('div');
    severityGroup.className = 'severity-button-group';
    const severityLabel = document.createElement('span');
    severityLabel.className = 'label-group';
    severityLabel.textContent = `${translations[currentLang].severity} / ${translations['ko'].severity}`;
    severityGroup.appendChild(severityLabel);
    for (let i = 1; i <= 5; i++) {
      const button = document.createElement('button');
      button.setAttribute('data-severity', i);
      button.textContent = i;
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        // 여러 증상 동시 선택 가능, 같은 증상에 대해 마지막에 누른 값으로 저장
        const buttons = severityGroup.querySelectorAll('button');
        buttons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        symptomItem.classList.add('selected');
        severityPanel.classList.add('show');
        symptomItem.dataset.severity = i;
        // 상태 저장
        if (!selectedSymptomsByDept[department]) selectedSymptomsByDept[department] = {};
        selectedSymptomsByDept[department][key] = i;
        updateSummary();
      });
      severityGroup.appendChild(button);
    }
    severityPanel.appendChild(severityGroup);
    symptomItem.appendChild(severityPanel);
    // 클릭 시 패널을 토글하지 않고, 선택된 증상은 항상 열려 있도록 유지
    symptomItem.addEventListener('click', (e) => {
      if (!symptomItem.classList.contains('selected')) {
        symptomItem.classList.add('selected');
        severityPanel.classList.add('show');
        // 상태 저장
        if (!selectedSymptomsByDept[department]) selectedSymptomsByDept[department] = {};
        if (!symptomItem.dataset.severity) selectedSymptomsByDept[department][key] = null;
      } else {
        symptomItem.classList.remove('selected');
        severityPanel.classList.remove('show');
        // 선택 해제 시 증상 정도도 초기화
        const buttons = severityGroup.querySelectorAll('button');
        buttons.forEach(btn => btn.classList.remove('selected'));
        delete symptomItem.dataset.severity;
        // 상태에서 제거
        if (selectedSymptomsByDept[department]) delete selectedSymptomsByDept[department][key];
      }
      updateSummary();
    });
    // 진료과 복귀 시 이전 선택 상태 복원
    if (selectedSymptomsByDept[department] && key in selectedSymptomsByDept[department]) {
      symptomItem.classList.add('selected');
      severityPanel.classList.add('show');
      const val = selectedSymptomsByDept[department][key];
      if (val) {
        const btn = severityGroup.querySelector(`button[data-severity='${val}']`);
        if (btn) btn.classList.add('selected');
        symptomItem.dataset.severity = val;
      }
    }
    symptomList.appendChild(symptomItem);
  });

  // 기타 증상 입력
  const otherSymptomsSection = document.createElement('div');
  otherSymptomsSection.className = 'other-symptoms-section';
  const otherSymptomsTitle = document.createElement('h4');
  otherSymptomsTitle.textContent = `${translations[currentLang].otherSymptoms || 'Other Symptoms'} / ${translations['ko'].otherSymptoms || '기타 증상'}`;
  otherSymptomsSection.appendChild(otherSymptomsTitle);
  const otherSymptomsInput = document.createElement('div');
  otherSymptomsInput.className = 'other-symptoms-input';
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = `${translations[currentLang].enterOtherSymptoms || 'Enter other symptoms'} / ${translations['ko'].enterOtherSymptoms || '기타 증상을 입력하세요'}`;
  const addButton = document.createElement('button');
  addButton.className = 'add-symptom-btn';
  addButton.textContent = '+';
  addButton.addEventListener('click', () => {
    if (input.value.trim()) {
      addOtherSymptom(input.value.trim());
      input.value = '';
      updateSummary();
    }
  });
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      addOtherSymptom(input.value.trim());
      input.value = '';
      updateSummary();
    }
  });
  otherSymptomsInput.appendChild(input);
  otherSymptomsInput.appendChild(addButton);
  otherSymptomsSection.appendChild(otherSymptomsInput);
  const otherSymptomsList = document.createElement('div');
  otherSymptomsList.className = 'other-symptoms-list';
  otherSymptomsSection.appendChild(otherSymptomsList);
  category.appendChild(symptomList);
  category.appendChild(otherSymptomsSection);
  return category;
}

function addOtherSymptom(text) {
  const department = document.getElementById('department-select').value;
  const otherSymptomsList = document.querySelector(`#${department}-symptoms .other-symptoms-list`);
  const symptomItem = document.createElement('div');
  symptomItem.className = 'other-symptom-item';
  const label = document.createElement('span');
  label.textContent = text;
  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete-symptom-btn';
  deleteButton.textContent = '×';
  deleteButton.addEventListener('click', () => {
    symptomItem.remove();
    updateSummary();
  });
  symptomItem.appendChild(label);
  symptomItem.appendChild(deleteButton);
  otherSymptomsList.appendChild(symptomItem);
}

function updateSummary() {
  const department = document.getElementById('department-select').value;
  if (!department) return;
  // 증상 선택, 기타 증상 등은 summary로만 사용하고, textarea는 건드리지 않는다.
}

function updateSymptomCategories() {
  const container = document.getElementById('symptomCategories');
  container.innerHTML = '';
  const departments = ['internal', 'ent', 'dentistry', 'plastics', 'dermatology', 'neuro', 'gastro'];
  departments.forEach(dept => {
    container.appendChild(createSymptomCategory(dept));
  });
}

function changeLanguage(lang) {
  setLanguage(lang);
}

function onDepartmentSelect(department) {
  const categories = document.querySelectorAll('.symptom-category');
  categories.forEach(category => {
    category.style.display = 'none';
  });
  if (department) {
    const selectedCategory = document.getElementById(`${department}-symptoms`);
    if (selectedCategory) {
      selectedCategory.style.display = 'block';
    }
  }
}

function generateSummary() {
  const name = document.getElementById('name').value;
  const birth = document.getElementById('birth').value;
  const department = document.getElementById('department-select').value;
  // 사용자가 직접 입력한 notes만 가져오기
  const notes = document.getElementById('generalNotes').value.trim();

  let summary = '';
  summary += `<b>이름:</b> ${name}\n`;
  summary += `<b>생년월일:</b> ${birth}\n`;
  summary += `<b>진료과:</b> ${translations['ko'].departments[department] || ''}\n`;

  // 증상 시작일
  const symptomCategory = document.getElementById(`${department}-symptoms`);
  const symptomStart = symptomCategory ? symptomCategory.dataset.symptomStart : '';
  if (symptomStart && symptomStart !== '0') {
    summary += `<b>증상 시작:</b> ${symptomStart}일 전\n`;
  }

  // 주요 증상
  const selectedSymptoms = [];
  if (department) {
    document.querySelectorAll(`#${department}-symptoms .symptom-item.selected`).forEach(item => {
      const severity = item.dataset.severity;
      const key = item.dataset.symptomKey;
      const symptomKo = translations['ko'].symptoms[department][key];
      selectedSymptoms.push(`${symptomKo} (증상 정도: ${severity})`);
    });
  }
  if (selectedSymptoms.length > 0) {
    summary += `<b>주요 증상:</b>\n- ${selectedSymptoms.join('\n- ')}\n`;
  }

  // 기타 증상
  const otherSymptoms = [];
  if (department) {
    document.querySelectorAll(`#${department}-symptoms .other-symptom-item span`).forEach(item => {
      otherSymptoms.push(item.textContent);
    });
  }
  if (otherSymptoms.length > 0) {
    summary += `<b>기타 증상:</b>\n- ${otherSymptoms.join('\n- ')}\n`;
  }

  // 추가 메모: 사용자가 직접 입력한 값만
  if (notes) {
    summary += `<b>추가 메모:</b>\n${notes}`;
  }

  document.getElementById('koreanSummary').innerHTML = `<pre style="font-size:1.1em;line-height:1.7;">${summary}</pre>`;
  document.getElementById('summary').style.display = 'block';
} 