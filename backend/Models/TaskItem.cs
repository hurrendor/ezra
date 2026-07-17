namespace Ezra.Api.Models;

/// <summary>
/// A single task/card on the board. Named <c>TaskItem</c> rather than
/// <c>Task</c> to avoid colliding with <see cref="System.Threading.Tasks.Task"/>.
/// </summary>
public class TaskItem
{
    public int Id { get; set; }

    public required string Title { get; set; }

    public string? Description { get; set; }

    public TaskState Status { get; set; } = TaskState.Todo;

    /// <summary>
    /// Sparse position within its column. Gaps of 1000 leave room to insert
    /// between neighbours without renumbering (see <see cref="Ordering.OrderingService"/>).
    /// </summary>
    public int Order { get; set; }

    public bool IsFlagged { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime ModifiedDate { get; set; }

    public List<Label> Labels { get; set; } = [];
}
