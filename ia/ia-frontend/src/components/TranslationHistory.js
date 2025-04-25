import React, { useState, useEffect } from 'react';
import './TranslationHistory.css';

const TranslationHistory = ({ onSelectTranslation }) => {
  // State pentru lista de traduceri
  const [translations, setTranslations] = useState([]);
  // State pentru încărcare
  const [isLoading, setIsLoading] = useState(true);
  // State pentru erori
  const [error, setError] = useState(null);
  // State pentru paginare
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Funcție pentru a încărca istoricul traducerilor
  const fetchTranslations = async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/History?page=${page}&pageSize=${pageSize}`);
      
      if (!response.ok) {
        throw new Error(`Eroare HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Data: ", data);
      setTranslations(data);
    } catch (error) {
      console.error('Eroare la încărcarea istoricului:', error);
      setError('Nu am putut încărca istoricul traducerilor. Te rugăm să încerci din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  // Încărcăm traducerile când componenta este montată sau când se schimbă pagina
  useEffect(() => {
    fetchTranslations(currentPage);
  }, [currentPage, pageSize]);

  // Handler pentru navigarea la pagina anterioară
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handler pentru navigarea la pagina următoare
  const handleNextPage = () => {
    // Presupunem că dacă avem pageSize elemente, ar putea exista o pagină următoare
    if (translations.length === pageSize) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Funcție pentru formatarea datei într-un format mai prietenos
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Funcție pentru a determina clasa CSS în funcție de status
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'status-completed';
      case 'failed':
        return 'status-failed';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  };

  // Funcție pentru a crea un text scurt pentru limbile implicate
  const getLanguagePair = (sourceLanguage, targetLanguage) => {
    // Extragem doar codul de limbă principal (ex: "ro" din "ro-RO")
    const source = sourceLanguage?.split('-')[0]?.toUpperCase() || '?';
    const target = targetLanguage?.split('-')[0]?.toUpperCase() || '?';
    
    return `${source} → ${target}`;
  };

  // Afișăm un spinner de încărcare
  if (isLoading && translations.length === 0) {
    return (
      <div className="translation-history loading">
        <div className="loading-spinner"></div>
        <p>Se încarcă istoricul traducerilor...</p>
      </div>
    );
  }

  // Afișăm mesajul de eroare
  if (error) {
    return (
      <div className="translation-history error">
        <p className="error-message">{error}</p>
        <button onClick={() => fetchTranslations(currentPage)} className="retry-button">
          Încearcă din nou
        </button>
      </div>
    );
  }

  // Afișăm mesaj dacă nu există traduceri
  if (translations.length === 0) {
    return (
      <div className="translation-history empty">
        <p>Nu există traduceri în istoric.</p>
      </div>
    );
  }

  return (
    <div className="translation-history">
      <h2>Istoricul Traducerilor</h2>

      <div className="translations-list">
        {translations.map(translation => (
          <div 
            key={translation.id} 
            className="translation-item"
            onClick={() => onSelectTranslation(translation.id)}
          >
            <div className="translation-info">
              <span className="translation-file">{translation.fileName}</span>
              <span className="translation-date">{formatDate(translation.uploadTimestamp)}</span>
            </div>
            
            <div className="translation-details">
              <span className="translation-language">
                {getLanguagePair(translation.sourceLanguage, translation.targetLanguage)}
              </span>
              <span className={`translation-status ${getStatusClass(translation.status)}`}>
                {translation.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination-controls">
        <button 
          onClick={handlePreviousPage} 
          disabled={currentPage === 1 || isLoading}
          className="pagination-button"
        >
          Pagina anterioară
        </button>
        
        <span className="page-info">Pagina {currentPage}</span>
        
        <button 
          onClick={handleNextPage} 
          disabled={translations.length < pageSize || isLoading}
          className="pagination-button"
        >
          Pagina următoare
        </button>
      </div>
    </div>
  );
};

export default TranslationHistory;