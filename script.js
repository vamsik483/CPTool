const apiKey = '$2a$10$iy1l4EeXdSkzRqhImCA4/evMFAqIuhtZBV5oSnShGtKrg62HJ5NwG'; // Replace with your JSONBin Secret Key //OPRxTOXIC-JSONBin.io
const binUrl = 'https://api.jsonbin.io/v3/b/68fed48cd0ea881f40be7893'; // Your Bin URL
const hashKey = location.hash.substring(1) || 'default';
const editor = document.getElementById('editor');
const docTitle = document.getElementById('doc-title');

// Load note and title from JSONBin
fetch(binUrl, {
  headers: { 'X-Master-Key': apiKey }
})
.then(res => {
  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${res.status}`);
  }
  return res.json();
})
.then(data => {
  const note = data.record[hashKey]?.content || '';
  const title = data.record[hashKey]?.title || 'Untitled Document';
  editor.innerHTML = note || '<p>Paste your content here...</p>';
  docTitle.value = title;
})
.catch(err => {
  console.error('Fetch error:', err);
  editor.innerHTML = '<p>Error loading note</p>';
});

// Clean up Word's HTML on paste
editor.addEventListener('paste', (e) => {
  e.preventDefault();
  const clipboardData = e.clipboardData || window.clipboardData;
  let pastedData = clipboardData.getData('text/html') || clipboardData.getData('text/plain');
  
  // Basic cleanup: Remove excessive spans and Word-specific attributes
  pastedData = pastedData
    .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
    .replace(/<span[^>]*>(.*?)<\/span>/g, '$1') // Remove unnecessary spans
    .replace(/ class="Mso[^"]*"/g, ''); // Remove Word-specific classes

  // Insert the cleaned HTML
  document.execCommand('insertHTML', false, pastedData);
});

// Save note and title to JSONBin on change with a debounce
let timeout;
editor.addEventListener('input', saveContent);
docTitle.addEventListener('input', saveContent);

function saveContent() {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    const updatedNote = editor.innerHTML;
    const updatedTitle = docTitle.value;
    // Fetch current data, update it, then save
    fetch(binUrl, {
      headers: { 'X-Master-Key': apiKey }
    })
    .then(res => res.json())
    .then(data => {
      const currentData = data.record || {};
      currentData[hashKey] = { content: updatedNote, title: updatedTitle };
      return fetch(binUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': apiKey
        },
        body: JSON.stringify(currentData)
      });
    })
    .catch(err => console.error('Error saving:', err));
  }, 1000); // Wait 1 second after typing stops
}

// Make document title editable on click
docTitle.addEventListener('click', () => {
  docTitle.removeAttribute('readonly');
});

// Dark mode toggle
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Load dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
}

