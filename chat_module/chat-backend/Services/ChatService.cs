using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using chat_backend.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using ZstdSharp.Unsafe;

namespace chat_backend.Services;

public class ChatService {
    private readonly IMongoCollection<ChatMessage> _messages;

    // constructor
    public ChatService(IOptions<MongoDbSettings> mongoDbSettings) {
        var client = new MongoClient(mongoDbSettings.Value.ConnectionString);
        var database = client.GetDatabase(mongoDbSettings.Value.DatabaseName);
        _messages = database.GetCollection<ChatMessage>(mongoDbSettings.Value.MessagesCollectionName);
    }

    public async Task<List<ChatMessage>> GetMessagesAsync() {
        return await _messages.Find(message => true)
            .SortBy(message => message.Timestamp)
            .ToListAsync();        
    }

    public async Task<ChatMessage> CreateMessageAsync(ChatMessage message) {
        await _messages.InsertOneAsync(message);
        return message;
    }

}