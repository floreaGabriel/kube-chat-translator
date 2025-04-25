import React, { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import './ChatComponent.css';


const ChatComponent = () => {

    // obtine usernameul din url
    const getBaseUrl = () => {
      const { protocol, hostname } = window.location;
      // Folosim nodePort corect
      return `${protocol}//${hostname.includes('localhost') ? 'localhost' : '192.168.65.3'}:30088`;
    };
    
    const apiUrl = getBaseUrl();
    const hubUrl = `${getBaseUrl()}/chatHub`;

  const [username, setUsername] = useState('');
  const [usernameFromUrl, setUsernameFromUrl] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  //const messagesEndRef = useRef(null);

  // Inițializarea conexiunii SignalR
  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, []);

  // Configurarea evenimentelor conexiunii
  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          setConnectionStatus('Connected');
          console.log('SignalR connection established');
        })
        .catch(err => {
          setConnectionStatus('Connection failed');
          console.error('SignalR connection error: ', err);
        });

      // Handler pentru primirea mesajelor
      connection.on('ReceiveMessage', (user, text, timestamp) => {
        const newMessage = {
          username: user,
          text: text,
          timestamp: new Date(timestamp)
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
      });

      // Inițializarea mesajelor existente
      fetchMessages();
    }
  }, [connection]);


  // Obține mesajele existente de la API
  const fetchMessages = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/chat`);
      const data = await response.json();
      const formattedMessages = data.map(msg => ({
        username: msg.username,
        text: msg.message,
        timestamp: new Date(msg.timestamp)
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages: ', error);
    }
  };

  // Trimiterea unui mesaj
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !message.trim() || !connection) return;
    
    try {
      await connection.invoke('SendMessage', username, message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };

  // Formatarea datei pentru afișare
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Chat in timp real</h2>
        <div className={`status-indicator ${connectionStatus === 'Connected' ? 'connected' : 'disconnected'}`}>
          {connectionStatus}
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <div className="message-header">
              <span className="username">{msg.username}</span>
              <span className="timestamp">{formatTime(msg.timestamp)}</span>
            </div>
            <div className="message-content">{msg.text}</div>
          </div>
        ))}
      </div>
      
      <form className="chat-input-form" onSubmit={sendMessage}>
        {!usernameFromUrl ? (
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Numele tau"
          className="username-input"
        />
        ) : (
          <div className="username-display">
            Conectat ca: <strong>{username}</strong>
          </div>
        )}
        
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Scrie un mesaj..."
          className="message-input"
        />

        <button 
          type="submit" 
          className="send-button"
          disabled={!username.trim() || !message.trim() || connectionStatus !== 'Connected'}
        >
          Trimite
        </button>
      </form>
    </div>
  );
};

export default ChatComponent;