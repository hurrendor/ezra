namespace Ezra.Api.Models;

/// <summary>
/// Join row for the task &lt;-&gt; label many-to-many. Explicit join entity so
/// the relationship table has a clear name and composite key.
/// </summary>
public class TaskLabel
{
    public int TaskId { get; set; }
    public int LabelId { get; set; }
}
