namespace ChatBackend.Services;

using ChatBackend.Models;
using Microsoft.AspNetCore.SignalR;
using ChatBackend.Hubs;
using StackExchange.Redis;
using System.Text.Json;

public class RedisChatService : IChatService
{
    private readonly ConnectionMultiplexer _redis;
    private readonly IDatabase _database;
    private readonly IHubContext<ChatHub> _hubContext;
    private const string CHAT_HISTORY_KEY = "chat:history";
    private bool _redisConnected = false;

    public RedisChatService(string connectionString, IHubContext<ChatHub> hubContext)
    {
        _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
        Console.WriteLine($"RedisChatService created with HubContext: {_hubContext != null}");
        
        // Adaugă opțiuni de configurare pentru conexiunea Redis
        var options = ConfigurationOptions.Parse(connectionString);
        options.AbortOnConnectFail = false;  // Important pentru robustețe
        options.ConnectRetry = 5;
        options.ConnectTimeout = 5000;
        
        try 
        {
            Console.WriteLine($"Connecting to Redis at: {connectionString}");
            _redis = ConnectionMultiplexer.Connect(options);
            _database = _redis.GetDatabase();
            _redisConnected = true;
            
            // Subscribe to Redis pubsub for cross-pod communication
            var subscriber = _redis.GetSubscriber();
            subscriber.Subscribe("chat:messages", async (channel, message) => {
                try
                {
                    Console.WriteLine($"Received message from Redis pubsub: {message}");
                    
                    // Parse the message
                    var chatMessage = JsonSerializer.Deserialize<ChatMessage>(message.ToString());
                    if (chatMessage != null)
                    {
                        Console.WriteLine($"Broadcasting message from Redis to all clients: {chatMessage.User}: {chatMessage.Message}");
                        
                        // Broadcast to all SignalR clients connected to this pod
                        await _hubContext.Clients.All.SendAsync("ReceiveMessage", chatMessage);
                        
                        Console.WriteLine("Redis message broadcast completed");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error in Redis pubsub handler: {ex.Message}");
                    Console.WriteLine($"Stack trace: {ex.StackTrace}");
                }
            });
            
            Console.WriteLine("Successfully connected to Redis and subscribed to messages");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error connecting to Redis: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            _redisConnected = false;
            // Continuăm fără Redis - nu aruncăm excepția
        }
    }

    public async Task SaveMessageAsync(ChatMessage message)
    {
        // Verificăm direct dacă mesajul este valid
        if (message == null)
        {
            Console.WriteLine("Cannot save null message to Redis");
            return;
        }
        
        Console.WriteLine($"SaveMessageAsync called for message: {message.User}: {message.Message}");
        
        // Verificăm dacă Redis este conectat
        if (!_redisConnected)
        {
            Console.WriteLine("Redis not connected, cannot save message");
            return;
        }
        
        try 
        {
            var json = JsonSerializer.Serialize(message);
            Console.WriteLine($"Serialized message: {json}");
            
            // Store in a Redis list
            await _database.ListRightPushAsync(CHAT_HISTORY_KEY, json);
            Console.WriteLine("Message added to Redis list");
            
            // Trim to keep only recent messages (e.g., 1000)
            await _database.ListTrimAsync(CHAT_HISTORY_KEY, 0, 999);
            Console.WriteLine("Redis list trimmed");
            
            // Publish to channel for cross-pod communication
            await _database.PublishAsync("chat:messages", json);
            Console.WriteLine("Message published to Redis channel");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in SaveMessageAsync: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            // Nu aruncăm excepția mai departe - continuăm fără Redis
        }
    }

    public async Task<List<ChatMessage>> GetRecentMessagesAsync(int count)
    {
        var messages = new List<ChatMessage>();
        
        // Verificăm dacă Redis este conectat
        if (!_redisConnected)
        {
            Console.WriteLine("Redis not connected, returning empty message list");
            return messages;
        }
        
        try
        {
            Console.WriteLine($"GetRecentMessagesAsync called for {count} messages");
            
            var messagesJson = await _database.ListRangeAsync(CHAT_HISTORY_KEY, -count, -1);
            Console.WriteLine($"Retrieved {messagesJson.Length} messages from Redis");
            
            foreach (var msgJson in messagesJson)
            {
                try
                {
                    var msg = JsonSerializer.Deserialize<ChatMessage>(msgJson.ToString());
                    if (msg != null)
                    {
                        messages.Add(msg);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error deserializing message from Redis: {ex.Message}");
                }
            }
            
            Console.WriteLine($"Deserialized {messages.Count} messages");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetRecentMessagesAsync: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
        }
        
        return messages;
    }
}
