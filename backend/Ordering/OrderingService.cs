using Ezra.Api.Data;
using Ezra.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Ezra.Api.Ordering;

/// <summary>
/// Sparse integer ordering within a column. New tasks are spaced <see cref="Gap"/>
/// apart so items can be inserted between neighbours by taking the midpoint,
/// with no writes to the surrounding rows. When two neighbours are adjacent
/// (no integer between them) the whole column is renumbered back to clean gaps.
/// Tradeoff: O(1) writes on the common case, O(n) only on the rare collision.
/// </summary>
public static class OrderingService
{
    public const int Gap = 1000;

    /// <summary>Order value for appending a task to the end of a column.</summary>
    public static async Task<int> NextOrderForColumnAsync(EzraDbContext db, TaskState status)
    {
        var max = await db.Tasks
            .Where(t => t.Status == status)
            .MaxAsync(t => (int?)t.Order);
        return (max ?? 0) + Gap;
    }

    /// <summary>
    /// Move <paramref name="task"/> into <paramref name="targetStatus"/>, positioned
    /// directly after the task whose id is <paramref name="afterTaskId"/> (null = top
    /// of the column). Mutates tracked entities; the caller is responsible for saving.
    /// </summary>
    /// <exception cref="ArgumentException">
    /// <paramref name="afterTaskId"/> is given but is not a task in the target column.
    /// </exception>
    public static async Task ReorderAsync(
        EzraDbContext db, TaskItem task, TaskState targetStatus, int? afterTaskId)
    {
        // Column contents excluding the task being moved, in board order.
        var column = await db.Tasks
            .Where(t => t.Status == targetStatus && t.Id != task.Id)
            .OrderBy(t => t.Order)
            .ThenBy(t => t.Id)
            .ToListAsync();

        int insertIndex;
        if (afterTaskId is null)
        {
            insertIndex = 0;
        }
        else
        {
            var anchorIndex = column.FindIndex(t => t.Id == afterTaskId.Value);
            if (anchorIndex < 0)
            {
                throw new ArgumentException(
                    $"afterTaskId {afterTaskId} is not a task in the target column.");
            }
            insertIndex = anchorIndex + 1;
        }

        var before = insertIndex > 0 ? column[insertIndex - 1] : null;
        var after = insertIndex < column.Count ? column[insertIndex] : null;

        task.Status = targetStatus;

        if (before is null && after is null)
        {
            task.Order = Gap;
        }
        else if (before is null)
        {
            // Insert at top: prefer a full gap below the first item, else the
            // midpoint down to 0, else renumber when the first item sits at 1.
            if (after!.Order - Gap >= 1)
            {
                task.Order = after.Order - Gap;
            }
            else if (after.Order > 1)
            {
                task.Order = after.Order / 2;
            }
            else
            {
                Renumber(column, insertIndex, task);
            }
        }
        else if (after is null)
        {
            task.Order = before.Order + Gap;
        }
        else
        {
            var span = after.Order - before.Order;
            if (span > 1)
            {
                task.Order = before.Order + span / 2;
            }
            else
            {
                Renumber(column, insertIndex, task);
            }
        }
    }

    /// <summary>
    /// Reassign clean <see cref="Gap"/>-spaced order values to an entire column,
    /// with <paramref name="task"/> spliced in at <paramref name="insertIndex"/>.
    /// </summary>
    private static void Renumber(List<TaskItem> column, int insertIndex, TaskItem task)
    {
        var sequence = new List<TaskItem>(column);
        sequence.Insert(insertIndex, task);
        for (var i = 0; i < sequence.Count; i++)
        {
            sequence[i].Order = (i + 1) * Gap;
        }
    }
}
