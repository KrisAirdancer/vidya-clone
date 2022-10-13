var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Hello World!");
app.MapGet("/endpoint-test", () => "The endpoint connection works!");

app.Run();
