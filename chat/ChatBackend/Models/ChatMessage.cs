namespace ChatBackend.Models;

using System.Text.Json.Serialization;

public class ChatMessage
{
    [JsonPropertyName("user")]
    public string User { get; set; } = string.Empty;
    
    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;
    
    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; set; }
    
    public override string ToString()
    {
        return $"ChatMessage {{ User = {User}, Message = {Message}, Timestamp = {Timestamp} }}";
    }
}
