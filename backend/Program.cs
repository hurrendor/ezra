using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=tasks.db";
builder.Services.AddDbContext<TaskDbContext>(opt =>
    opt.UseSqlite(connectionString));

InitializeDatabase(builder.Services, connectionString);

var app = builder.Build();
app.MapGet("/", () => Results.Ok(new { message = "Ezra API is running" }));

app.MapGet("/api/todos", async (TaskDbContext db) =>
{
    var todos = await db.Tasks
        .OrderBy(todo => todo.Id)
        .ToListAsync();

    return Results.Ok(todos);
});

app.Run();

static void InitializeDatabase(IServiceCollection services, string connectionString)
{
    var options = new DbContextOptionsBuilder<TaskDbContext>()
        .UseSqlite(connectionString)
        .Options;

    using var db = new TaskDbContext(options);
    db.Database.EnsureCreated();

    if (!db.Tasks.Any())
    {
        db.Tasks.Add(new TodoItem
        {
            Title = "First task",
            IsDone = false
        });

        db.SaveChanges();
    }
}

class TaskDbContext(DbContextOptions<TaskDbContext> options) : DbContext(options)
{
    public DbSet<TodoItem> Todos => Set<TodoItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TodoItem>(entity =>
        {
            entity.ToTable("todos");
            entity.HasKey(todo => todo.Id);

            entity.Property(todo => todo.Id)
                .HasColumnName("id");

            entity.Property(todo => todo.Title)
                .HasColumnName("title")
                .IsRequired();

            entity.Property(todo => todo.IsDone)
                .HasColumnName("is_done")
                .HasDefaultValue(false);
        });
    }
}

class TodoItem
{
    public long Id { get; set; }
    public required string Title { get; set; }
    public bool IsDone { get; set; }
}
