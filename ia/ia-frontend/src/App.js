import React, { useState } from 'react';
import './App.css';
import UploadForm from './components/UploadForm';
import TranslationHistory from './components/TranslationHistory';
import TranslationResult from './components/TranslationResult';

function App() {
  // State pentru a urmări cererea de traducere curentă (dacă există)
  const [currentRequest, setCurrentRequest] = useState(null);
  // State pentru a ști dacă se afișează istoric sau formularul de upload
  const [showHistory, setShowHistory] = useState(false);
  // State pentru rezultatul traducerii
  const [translationResult, setTranslationResult] = useState(null);

  // Handler pentru când un fișier a fost încărcat și procesarea a început
  const handleUploadSuccess = (requestData) => {
    setCurrentRequest(requestData);
    // Resetăm rezultatul traducerii anterioare
    setTranslationResult(null);
    // Ascundem istoricul atunci când o nouă încărcare este în curs
    setShowHistory(false);
    
    // Începem să verificăm statusul traducerii la fiecare 3 secunde
    checkTranslationStatus(requestData.requestId);
  };

  // Funcție pentru a verifica statusul unei traduceri
  const checkTranslationStatus = (requestId) => {
    fetch(`${process.env.REACT_APP_API_URL}/translation/${requestId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
          // Dacă avem resultText, traducerea este completă
          if (data.resultText) {
            setTranslationResult({...data, status: 'Completed'});
          } else if (data.errorMessage) {
            setTranslationResult({...data, status: 'Failed'});
          } else {
            // Dacă nu avem nici resultText, nici errorMessage, încă procesează
            setTimeout(() => checkTranslationStatus(requestId), 3000);
          }
      })
      .catch(error => {
        console.error("Error checking translation status:", error);
        
        // Chiar și în caz de eroare, încercăm din nou după un timp
        setTimeout(() => checkTranslationStatus(requestId), 5000);
      });
  };

  // Handler pentru a comuta între istoric și formularul de upload
  const toggleHistory = () => {
    setShowHistory(!showHistory);
    // Resetăm traducerea curentă când ne uităm la istoric
    if (!showHistory) {
      setCurrentRequest(null);
      setTranslationResult(null);
    }
  };

  // Handler pentru a selecta o traducere din istoric
  const handleSelectTranslation = (requestId) => {
    fetch(`${process.env.REACT_APP_API_URL}/translation/${requestId}`)
      .then(response => response.json())
      .then(data => {
        setTranslationResult(data);
        setCurrentRequest({ requestId: requestId });
      })
      .catch(error => console.error("Error fetching translation:", error));
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Serviciu de Traducere Audio</h1>
        <button 
          className="toggle-button" 
          onClick={toggleHistory}
        >
          {showHistory ? 'Încarcă Audio' : 'Vezi Istoric'}
        </button>
      </header>

      <main className="app-main">
        {showHistory ? (
          <TranslationHistory onSelectTranslation={handleSelectTranslation} />
        ) : (
          <UploadForm onUploadSuccess={handleUploadSuccess} />
        )}

        {currentRequest && !translationResult && (
          <div className="processing-message">
            <p>Procesăm traducerea. Te rugăm să aștepți...</p>
            <div className="loading-spinner"></div>
          </div>
        )}

        {translationResult && (
          <TranslationResult result={translationResult} />
        )}
      </main>

      <footer className="app-footer">
        <p>Serviciu de traducere audio bazat pe Azure Speech Translation</p>
      </footer>
    </div>
  );
}

export default App;