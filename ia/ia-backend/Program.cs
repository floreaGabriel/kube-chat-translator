using ia_backend.Data;
using ia_backend.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// add db context
builder.Services.AddDbContextFactory<AppDbContext>(options => 
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// add custom services
builder.Services.AddScoped<BlobStorageService>();
builder.Services.AddScoped<SpeechTranslationService>();
builder.Services.AddScoped<DatabaseService>();

// add cors

builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", builder => 
        builder.WithOrigins(
            "http://localhost:3000"
        ).AllowAnyHeader().AllowAnyMethod().AllowCredentials());
});

var app = builder.Build();

if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
} else {
    // Utilizează redirecționarea HTTPS doar în producție
    app.UseHttpsRedirection();
}

app.UseRouting();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();

