// Function to upload image and extract text from server
async function uploadImage() {
  const fileInput = document.getElementById('image');

  if (!fileInput.files.length) {
    alert('Please select an image first.');
    return;
  }

  const formData = new FormData();
  formData.append('image', fileInput.files[0]);

  try {
    const response = await fetch('http://localhost:5000/extract', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error(await response.text());

    const data = await response.json();
    document.getElementById('result').value = data.text;
  } catch (err) {
    console.error('OCR fetch error:', err);
    alert('Failed to extract text: ' + err.message);
  }
}

// Function to download extracted text as a PDF
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const text = document.getElementById('result').value;

  if (!text.trim()) {
    alert('There is no extracted text to download.');
    return;
  }

  const doc = new jsPDF();
  const margin = 10;
  const maxWidth = 180;
  const lineHeight = 10;

  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, margin, margin + lineHeight);
  doc.save('extracted-text.pdf');
}

// Function to speak the extracted text using browser's speech synthesis
function speakText() {
  const text = document.getElementById('result').value;

  if (!text.trim()) {
    alert('There is no text to speak.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // Optional: Set voice, pitch, and rate
  utterance.pitch = 1;   // default is 1 (0 to 2)
  utterance.rate = 1;    // default is 1 (0.1 to 10)
  utterance.lang = 'en-US';

  window.speechSynthesis.speak(utterance);
}
