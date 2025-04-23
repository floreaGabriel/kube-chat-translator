import React from 'react';
import './TranslationResult.css';

const TranslationResult = ({ result }) => {
  console.log("TranslationResult received:", result); // Adaugă acest log
  
  // Determinăm statusul bazat pe datele disponibile
  const isCompleted = result.resultText && !result.errorMessage;
  const isFailed = !!result.errorMessage;
  const isProcessing = !isCompleted && !isFailed;

  // Funcție pentru a împărți textul în paragrafe
  const formatText = (text) => {
    if (!text) return [];
    
    // Împărțim textul în paragrafe bazate pe linie nouă
    return text.split('\n').filter(paragraph => paragraph.trim() !== '');
  };

  // Formatarea datei într-un format prietenos
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Funcție pentru a crea un text descriptiv pentru limbile implicate
  const getLanguageDescription = (sourceLanguage, targetLanguage) => {
    // Un map simplu pentru a obține numele limbilor din coduri
    const languageMap = {
      'en': 'Engleză',
      'en-US': 'Engleză (SUA)',
      'en-GB': 'Engleză (UK)',
      'ro': 'Română',
      'ro-RO': 'Română',
      'fr': 'Franceză',
      'fr-FR': 'Franceză',
      'de': 'Germană',
      'de-DE': 'Germană',
      'es': 'Spaniolă',
      'es-ES': 'Spaniolă',
      'it': 'Italiană',
      'it-IT': 'Italiană',
      'ru': 'Rusă',
      'ru-RU': 'Rusă',
    };
    
    const sourceName = languageMap[sourceLanguage] || sourceLanguage;
    const targetName = languageMap[targetLanguage] || targetLanguage;
    
    return `${sourceName} → ${targetName}`;
  };

  return (
    <div className="translation-result">
      <h2>Rezultatul Traducerii</h2>
      
      <div className="result-status">
        <span className={`status-indicator ${isCompleted ? 'completed' : isFailed ? 'failed' : 'processing'}`}>
          {isCompleted ? 'Traducere completă' : isFailed ? 'Traducere eșuată' : 'În procesare'}
        </span>
      </div>
      
      {isCompleted && result.resultText && (
        <div className="translation-content">
          <h3>Text Tradus:</h3>
          <div className="translated-text">
            {formatText(result.resultText).map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      )}
      
      {isFailed && result.errorMessage && (
        <div className="translation-error">
          <h3>Eroare:</h3>
          <p className="error-message">{result.errorMessage}</p>
        </div>
      )}
      
      <div className="translation-details">
        <h3>Detalii:</h3>
        <table className="details-table">
          <tbody>
            {result.requestId && (
              <tr>
                <td>ID Cerere:</td>
                <td>{result.requestId}</td>
              </tr>
            )}
            
            {result.processingTimestamp && (
              <tr>
                <td>Data Procesării:</td>
                <td>{formatDate(result.processingTimestamp)}</td>
              </tr>
            )}
            
            {(result.sourceLanguage && result.targetLanguage) && (
              <tr>
                <td>Limbi:</td>
                <td>{getLanguageDescription(result.sourceLanguage, result.targetLanguage)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="result-actions">
        {isCompleted && result.resultText && (
          <button 
            className="copy-button"
            onClick={() => navigator.clipboard.writeText(result.resultText)}
          >
            Copiază Textul Tradus
          </button>
        )}
        
        {isFailed && (
          <button className="retry-button">
            Încearcă Din Nou
          </button>
        )}
      </div>
    </div>
  );
};

export default TranslationResult;