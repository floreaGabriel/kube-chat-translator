using chat_backend.Hubs;
using chat_backend.Services;
using chat_backend.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using System;


namespace chat_backend;

public class Startup {

    public IConfiguration Configuration { get; }
    public Startup(IConfiguration configuration) {
        Configuration = configuration;
    }

    public void ConfigureServices(IServiceCollection services) {
        
        // configurare mongo
        services.Configure<MongoDbSettings>(
            Configuration.GetSection("MongoDbSettings")
        );
        services.AddSingleton<ChatService>();

        // adaugare CORS
        services.AddCors(options => {
            options.AddPolicy("CorsPolicy", builder => {
                builder.SetIsOriginAllowed(_ => true) // portul pentru froontend
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
            });
        });

        
        // aduagare signalR

        services.AddSignalR(options => {
            options.EnableDetailedErrors = true;
            options.ClientTimeoutInterval = TimeSpan.FromMinutes(2);
            options.KeepAliveInterval = TimeSpan.FromMinutes(1);
        });

        // aduagare controllers
        services.AddControllers();
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env) {

        if (env.IsDevelopment()) {
            app.UseDeveloperExceptionPage();
        }

        app.UseRouting();

        // activate cors

        app.UseCors("CorsPolicy");

        app.UseEndpoints(endpoints => {
            endpoints.MapControllers();
            endpoints.MapHub<ChatHub>("/chatHub"); // endpoint pentru hubul signalR
        });
    }
}