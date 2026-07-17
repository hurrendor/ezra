namespace Ezra.Api.Models;

/// <summary>
/// A label that can be attached to many tasks (many-to-many via
/// <see cref="TaskLabel"/>). <c>Name</c> is the text shown on the UI chip.
/// </summary>
public class Label
{
    public int Id { get; set; }

    public required string Name { get; set; }

    public int Order { get; set; }

    public List<TaskItem> Tasks { get; set; } = [];
}
