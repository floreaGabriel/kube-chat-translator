import React, { useState } from 'react';
import './UploadForm.css';

const UploadForm = ({ onUploadSuccess }) => {
  // State pentru fișierul selectat
  const [selectedFile, setSelectedFile] = useState(null);
  // State pentru limba sursă selectată
  const [sourceLanguage, setSourceLanguage] = useState('ro-RO');
  // State pentru limba țintă selectată
  const [targetLanguage, setTargetLanguage] = useState('en-US');
  // State pentru a urmări dacă un upload este în curs
  const [isUploading, setIsUploading] = useState(false);
  // State pentru orice eroare apărută
  const [errorMessage, setErrorMessage] = useState('');

  // Opțiuni pentru limbile disponibile
  const languageOptions = [
    { code: 'ro-RO', name: 'Română' },
    { code: 'en-US', name: 'Engleză' },
    { code: 'fr-FR', name: 'Franceză' },
    { code: 'de-DE', name: 'Germană' },
    { code: 'es-ES', name: 'Spaniolă' },
    { code: 'it-IT', name: 'Italiană' },
    { code: 'ru-RU', name: 'Rusă' },
  ];

  // Handler pentru schimbarea fișierului selectat
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Verificăm dacă fișierul este de tip audio
      if (!file.type.startsWith('audio/')) {
        setErrorMessage('Te rugăm să selectezi un fișier audio.');
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
        setErrorMessage('');
      }
    }
  };

  // Handler pentru schimbarea limbii sursă
  const handleSourceLanguageChange = (event) => {
    setSourceLanguage(event.target.value);
  };

  // Handler pentru schimbarea limbii țintă
  const handleTargetLanguageChange = (event) => {
    setTargetLanguage(event.target.value);
  };

  // Handler pentru trimiterea formularului
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Verificăm dacă utilizatorul a selectat un fișier
    if (!selectedFile) {
      setErrorMessage('Te rugăm să selectezi un fișier audio.');
      return;
    }

    // Verificăm dacă utilizatorul a selectat aceeași limbă pentru sursă și țintă
    if (sourceLanguage === targetLanguage) {
      setErrorMessage('Limba sursă și limba țintă nu pot fi identice.');
      return;
    }

    // Indicăm că un upload este în curs
    setIsUploading(true);
    setErrorMessage('');

    // Creăm un FormData pentru a trimite fișierul și metadatele
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('sourceLanguage', sourceLanguage);
    formData.append('targetLanguage', targetLanguage);

    try {
      // Trimitem cererea de upload către backend
      const response = await fetch('http://localhost:5090/api/translation', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Eroare HTTP: ${response.status}`);
      }

      // Prelucrăm răspunsul (ar trebui să conțină ID-ul cererii)
      const responseData = await response.json();
      
      // Notificăm componenta părinte că upload-ul a reușit
      onUploadSuccess(responseData);
      
      // Resetăm formularul
      setSelectedFile(null);
      setErrorMessage('');
    } catch (error) {
        console.error('Eroare la încărcarea fișierului:', error);
        setErrorMessage('Eroare la încărcarea fișierului. Te rugăm să încerci din nou.');
    } finally {
      // Încărcarea s-a terminat, indiferent de rezultat
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-form-container">
      <h2>Încarcă un fișier audio pentru traducere</h2>
      
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="file-upload">Fișier audio:</label>
          <input
            type="file"
            id="file-upload"
            accept="audio/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          {selectedFile && (
            <div className="file-info">
              <p>Fișier selectat: {selectedFile.name}</p>
              <p>Dimensiune: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>

        <div className="form-group language-selectors">
          <div className="language-select">
            <label htmlFor="source-language">Limba sursă:</label>
            <select
              id="source-language"
              value={sourceLanguage}
              onChange={handleSourceLanguageChange}
              disabled={isUploading}
            >
              {languageOptions.map(lang => (
                <option key={`source-${lang.code}`} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="language-select">
            <label htmlFor="target-language">Limba țintă:</label>
            <select
              id="target-language"
              value={targetLanguage}
              onChange={handleTargetLanguageChange}
              disabled={isUploading}
            >
              {languageOptions.map(lang => (
                <option key={`target-${lang.code}`} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={isUploading || !selectedFile}
          >
            {isUploading ? 'Se încarcă...' : 'Încarcă și Traduce'}
          </button>
        </div>
      </form>
      
      <div className="upload-instructions">
        <h3>Instrucțiuni</h3>
        <p>1. Selectează un fișier audio (wav, mp3, etc.)</p>
        <p>2. Alege limba sursă a fișierului audio</p>
        <p>3. Alege limba în care dorești să traduci</p>
        <p>4. Apasă butonul "Încarcă și Traduce"</p>
        <p>5. Așteptă procesarea (poate dura câteva momente)</p>
      </div>
    </div>
  );
};

export default UploadForm;