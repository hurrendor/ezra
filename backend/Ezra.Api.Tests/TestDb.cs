using Ezra.Api.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Ezra.Api.Tests;

/// <summary>
/// Builds an <see cref="EzraDbContext"/> backed by a fresh in-memory SQLite
/// database. The connection is kept open for the life of the handle so the
/// schema survives across contexts; dispose the handle to drop the DB.
/// </summary>
public sealed class TestDb : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly DbContextOptions<EzraDbContext> _options;

    public TestDb()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();
        _options = new DbContextOptionsBuilder<EzraDbContext>()
            .UseSqlite(_connection)
            .Options;

        using var db = new EzraDbContext(_options);
        db.Database.EnsureCreated();
    }

    public EzraDbContext NewContext() => new(_options);

    public void Dispose() => _connection.Dispose();
}
