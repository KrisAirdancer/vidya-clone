// using Microsoft.AspNetCore.SpaServices.Extensions;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// app.UseStaticFiles();

    app.UseStaticFiles();
    app.UseSpaStaticFiles();

   
    app.UseSpa(spa =>
    {
        if (env.IsDevelopment())
        {
            spa.UseProxyToSpaDevelopmentServer("http://localhost:4000");
        }
    });

app.MapGet("/", () => "Hello World!");
app.MapGet("/endpoint-test", () => "The endpoint connection works!");

app.Run();
