namespace Ezra.Api.Models;

/// <summary>
/// The board column a task lives in. Stored as a string in SQLite (see
/// <see cref="Data.EzraDbContext"/>) so the DB stays human-readable and
/// resilient to enum-value reordering.
/// </summary>
public enum TaskState
{
    Todo,
    InProgress,
    Done
}
