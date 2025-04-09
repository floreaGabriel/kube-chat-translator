using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace chat_backend.Models;

public class ChatMessage
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; }
    public string Username { get; set; }
    public string Message { get; set; }
    public DateTime Timestamp { get; set; }
}
