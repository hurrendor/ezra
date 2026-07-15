using Microsoft.Data.Sqlite;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=ezra.db";

InitializeDatabase(connectionString);

var app = builder.Build();

app.MapGet("/", () => Results.Ok(new { message = "Ezra API is running" }));

app.MapGet("/api/todos", () =>
{
    using var connection = new SqliteConnection(connectionString);
    connection.Open();

    using var command = connection.CreateCommand();
    command.CommandText = "SELECT id, title, is_done FROM todos ORDER BY id;";

    using var reader = command.ExecuteReader();
    var todos = new List<TodoItem>();

    while (reader.Read())
    {
        todos.Add(new TodoItem(
            reader.GetInt64(0),
            reader.GetString(1),
            reader.GetInt64(2) == 1));
    }

    return Results.Ok(todos);
});

app.Run();

static void InitializeDatabase(string connectionString)
{
    using var connection = new SqliteConnection(connectionString);
    connection.Open();

    using var command = connection.CreateCommand();
    command.CommandText = @"
        CREATE TABLE IF NOT EXISTS todos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            is_done INTEGER NOT NULL DEFAULT 0
        );

        INSERT INTO todos (title, is_done)
        SELECT 'First task', 0
        WHERE NOT EXISTS (SELECT 1 FROM todos);
    ";

    command.ExecuteNonQuery();
}

record TodoItem(long Id, string Title, bool IsDone);
