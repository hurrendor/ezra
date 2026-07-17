using System.Text.Json.Serialization;
using Ezra.Api.Data;
using Ezra.Api.Dtos;
using Ezra.Api.Endpoints;
using Ezra.Api.Middleware;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Data Source=tasks.db";

builder.Services.AddDbContext<EzraDbContext>(opt => opt.UseSqlite(connectionString));

// Serialize/deserialize enums as their names ("Todo") rather than numbers.
builder.Services.ConfigureHttpJsonOptions(opt =>
    opt.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// Dev CORS so the Vite frontend can call the API. Tighten for production.
const string DevCors = "dev";
builder.Services.AddCors(o => o.AddPolicy(DevCors, p => p
    .AllowAnyOrigin()
    .AllowAnyHeader()
    .AllowAnyMethod()));

var app = builder.Build();

// Turn unhandled exceptions into the consistent { "error": ... } shape.
app.UseExceptionHandler(errApp => errApp.Run(async context =>
{
    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
    await context.Response.WriteAsJsonAsync(new ErrorResponse("An unexpected error occurred."));
}));

app.UseMiddleware<RequestLoggingMiddleware>();
app.UseCors(DevCors);

// Apply pending EF migrations on startup; optionally seed sample data.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<EzraDbContext>();
    db.Database.Migrate();
    if (app.Configuration.GetValue<bool>("Database:Seed"))
    {
        DbSeeder.Seed(db);
    }
}

app.MapGet("/", () => Results.Ok(new { message = "Ezra API is running" }));
app.MapTaskEndpoints();
app.MapLabelEndpoints();

app.Run();

// Exposed for integration tests (WebApplicationFactory<Program>).
public partial class Program;
