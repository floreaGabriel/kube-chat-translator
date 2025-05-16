namespace ChatBackend.Services;

using ChatBackend.Models;

public interface IChatService
{
    Task SaveMessageAsync(ChatMessage message);
    Task<List<ChatMessage>> GetRecentMessagesAsync(int count);
}
