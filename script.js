const apiKey = '$2a$10$/GuryZIcDGwtlt8Km10a7eoRQKU3qLO4PsvYmxYgV6c9YjmQN8swS'; // Replace with your JSONBin Secret Key
const binUrl = 'https://api.jsonbin.io/v3/b/67fcfca98561e97a50ff4606'; // Your Bin URL
const hashKey = location.hash.substring(1) || 'default';
const editor = document.getElementById('editor');

// Load note from JSONBin
fetch(binUrl, {
  headers: { 'X-Master-Key': apiKey }
})
.then(res => res.json())
.then(data => {
  const note = data.record[hashKey] || '';
  editor.innerHTML = note || '<p>Paste your content here...</p>';
})
.catch(() => editor.innerHTML = '<p>Error loading note</p>');

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

// Save note to JSONBin on change with a debounce
let timeout;
editor.addEventListener('input', () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    const updatedNote = editor.innerHTML;
    // Fetch current data, update it, then save
    fetch(binUrl, {
      headers: { 'X-Master-Key': apiKey }
    })
    .then(res => res.json())
    .then(data => {
      const currentData = data.record || {};
      currentData[hashKey] = updatedNote;
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
});
