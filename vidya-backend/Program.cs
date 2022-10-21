// using Microsoft.AspNetCore.StaticFiles;
// using Microsoft.AspNetCore.SpaServices.Extensions;
using BackendTesting;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// app.UseStaticFiles();

    // app.UseStaticFiles();
    // app.UseSpaStaticFiles();

   
    // app.UseSpa(spa =>
    // {
    //     if (env.IsDevelopment())
    //     {
    //         spa.UseProxyToSpaDevelopmentServer("http://localhost:4000");
    //     }
    // });

app.MapGet("/", () => "Hello World!");



// app.MapGet("/endpoint-test", () => "The endpoint connection works!");
app.MapGet("/endpoint-test", () => {
    return Test.returnString(10);
});

app.Run();
