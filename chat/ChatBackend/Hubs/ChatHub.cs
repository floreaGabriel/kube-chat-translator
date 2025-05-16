namespace ChatBackend.Hubs;

using Microsoft.AspNetCore.SignalR;
using ChatBackend.Models;
using ChatBackend.Services;
using System.Threading.Tasks;

public class ChatHub : Hub
{
    private readonly IChatService _chatService;

    public ChatHub(IChatService chatService)
    {
        _chatService = chatService ?? throw new ArgumentNullException(nameof(chatService));
        Console.WriteLine("ChatHub instance created");
    }

    public override async Task OnConnectedAsync()
    {
        Console.WriteLine($"Client connected: {Context.ConnectionId}");
        
        try
        {
            // Send chat history when client connects
            var messages = await _chatService.GetRecentMessagesAsync(50);
            Console.WriteLine($"Sending history with {messages.Count} messages to client {Context.ConnectionId}");
            await Clients.Caller.SendAsync("ReceiveHistory", messages);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in OnConnectedAsync: {ex.Message}");
        }
        
        await base.OnConnectedAsync();
    }

    public async Task SendMessage(string user, string message)
    {
        Console.WriteLine($"=================================================");
        Console.WriteLine($"SendMessage called with user: {user}, message: {message}");
        Console.WriteLine($"Connection ID: {Context.ConnectionId}");
        
        if (string.IsNullOrEmpty(user) || string.IsNullOrEmpty(message))
        {
            Console.WriteLine("SendMessage: user or message is empty, returning");
            return;
        }

        try
        {
            var chatMessage = new ChatMessage
            {
                User = user,
                Message = message,
                Timestamp = DateTime.UtcNow
            };

            Console.WriteLine($"Created message object: {chatMessage}");
            
            // IMPORTANT: Trimite mesajul direct către clients conectați la acest pod
            // Acest lucru asigură că utilizatorul vede mesajul imediat
            Console.WriteLine($"Sending message directly to clients on this pod");
            await Clients.All.SendAsync("ReceiveMessage", chatMessage);
            Console.WriteLine($"Message sent directly to this pod's clients");
            
            // Apoi salvează în Redis pentru distribuție cross-pod și persistență
            Console.WriteLine($"Saving message to Redis: {user}: {message}");
            await _chatService.SaveMessageAsync(chatMessage);
            Console.WriteLine($"Message saved to Redis successfully");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in SendMessage: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            
            // Încercăm din nou să trimitem direct, chiar dacă Redis eșuează
            try 
            {
                var fallbackMessage = new ChatMessage
                {
                    User = user,
                    Message = message,
                    Timestamp = DateTime.UtcNow
                };
                await Clients.All.SendAsync("ReceiveMessage", fallbackMessage);
                Console.WriteLine("Message sent via fallback method");
            }
            catch (Exception fallbackEx)
            {
                Console.WriteLine($"Even fallback send failed: {fallbackEx.Message}");
            }
        }
        
        Console.WriteLine($"=================================================");
    }
    
    public override Task OnDisconnectedAsync(Exception exception)
    {
        Console.WriteLine($"Client disconnected: {Context.ConnectionId}, Exception: {exception?.Message ?? "none"}");
        return base.OnDisconnectedAsync(exception);
    }
}
