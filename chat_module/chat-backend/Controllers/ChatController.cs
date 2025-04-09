using System.Collections.Generic;
using System.Threading.Tasks;
using chat_backend.Models;
using chat_backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace chat_backend.Controllers;


[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly ChatService _chatService;

    public ChatController(ChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpGet]
    public async Task<ActionResult<List<ChatMessage>>> GetMessages()
    {
        var messages = await _chatService.GetMessagesAsync();
        return Ok(messages);
    }
}