using System;
using System.Threading.Tasks;
using chat_backend.Models;
using chat_backend.Services;
using Microsoft.AspNetCore.SignalR;

namespace chat_backend.Hubs;

public class ChatHub : Hub {
    private readonly ChatService _chatService;

    public ChatHub(ChatService chatService) {
        _chatService = chatService;
    }

    public async Task SendMessage(string username, string message) {
        var chatMessage = new ChatMessage {
            Username = username,
            Message = message,
            Timestamp = DateTime.UtcNow
        };

        await _chatService.CreateMessageAsync(chatMessage);
        await Clients.All.SendAsync("ReceiveMessage", chatMessage.Username, chatMessage.Message, chatMessage.Timestamp);
    }

    public override async Task OnConnectedAsync()
        {
            await Clients.Caller.SendAsync("Connected");
            await base.OnConnectedAsync();
        }
}