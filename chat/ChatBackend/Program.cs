using ChatBackend.Services;
using ChatBackend.Hubs;
using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);

// Add SignalR
builder.Services.AddSignalR();

// Configurare CORS pentru a permite WebSockets de oriunde
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", builder =>
        builder
            .SetIsOriginAllowed(_ => true) // Permite orice origine
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()); // Necesar pentru WebSockets
});

// IMPORTANT: Nu mai încercăm să înregistrăm manual IHubContext
// ASP.NET Core îl înregistrează automat și îl putem injecta direct

// Add Redis configuration
var redisConnection = builder.Configuration["Redis:ConnectionString"] ?? "localhost:6379";
// Înregistrăm IChatService cu Redis ca implementare
builder.Services.AddSingleton<IChatService>(provider => 
    new RedisChatService(
        redisConnection, 
        provider.GetRequiredService<IHubContext<ChatHub>>()));

var app = builder.Build();

// Debugging information
Console.WriteLine($"Server starting in {app.Environment.EnvironmentName} mode");
Console.WriteLine($"CORS policy configured with AllowCredentials");

// Folosește CORS înainte de alte middleware-uri
app.UseCors("CorsPolicy");

// Logging middleware pentru debugging
app.Use(async (context, next) =>
{
    Console.WriteLine($"Request path: {context.Request.Path}, method: {context.Request.Method}");
    await next.Invoke();
});

// Map SignalR hub
app.MapHub<ChatHub>("/chatHub");
Console.WriteLine("SignalR hub mapped to: /chatHub");

// Health check endpoint
app.MapGet("/health", () => "Healthy");

// Add a route to check Redis connection
app.MapGet("/health/redis", async (IChatService chatService) => {
    try 
    {
        await chatService.GetRecentMessagesAsync(1);
        return "Redis connection: Healthy";
    }
    catch (Exception ex)
    {
        return $"Redis connection: Unhealthy - {ex.Message}";
    }
});

app.Run();
