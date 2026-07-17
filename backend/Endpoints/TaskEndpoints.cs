using Ezra.Api.Data;
using Ezra.Api.Dtos;
using Ezra.Api.Models;
using Ezra.Api.Ordering;
using Microsoft.EntityFrameworkCore;

namespace Ezra.Api.Endpoints;

public static class TaskEndpoints
{
    public static void MapTaskEndpoints(this IEndpointRouteBuilder app)
    {
        var tasks = app.MapGroup("/tasks");

        tasks.MapGet("/", async (EzraDbContext db) =>
        {
            var items = await db.Tasks
                .Include(t => t.Labels)
                .OrderBy(t => t.Status)
                .ThenBy(t => t.Order)
                .ThenBy(t => t.Id)
                .ToListAsync();
            return Results.Ok(items.Select(t => t.ToResponse()));
        });

        tasks.MapGet("/{id:int}", async (int id, EzraDbContext db) =>
        {
            var task = await db.Tasks.Include(t => t.Labels)
                .FirstOrDefaultAsync(t => t.Id == id);
            return task is null
                ? Results.NotFound(new ErrorResponse($"Task {id} not found."))
                : Results.Ok(task.ToResponse());
        });

        tasks.MapPost("/", async (CreateTaskRequest req, EzraDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(req.Title))
            {
                return Results.BadRequest(new ErrorResponse("Title is required."));
            }

            var status = req.Status ?? TaskState.Todo;
            var now = DateTime.UtcNow;

            var task = new TaskItem
            {
                Title = req.Title.Trim(),
                Description = req.Description,
                Status = status,
                IsFlagged = req.IsFlagged ?? false,
                Order = await OrderingService.NextOrderForColumnAsync(db, status),
                CreatedDate = now,
                ModifiedDate = now
            };

            if (req.LabelIds is { Count: > 0 })
            {
                var labels = await LoadLabelsAsync(db, req.LabelIds);
                if (labels is null)
                {
                    return Results.BadRequest(new ErrorResponse("One or more labelIds do not exist."));
                }
                task.Labels = labels;
            }

            db.Tasks.Add(task);
            await db.SaveChangesAsync();
            return Results.Created($"/tasks/{task.Id}", task.ToResponse());
        });

        tasks.MapPatch("/{id:int}", async (int id, UpdateTaskRequest req, EzraDbContext db) =>
        {
            var task = await db.Tasks.Include(t => t.Labels)
                .FirstOrDefaultAsync(t => t.Id == id);
            if (task is null)
            {
                return Results.NotFound(new ErrorResponse($"Task {id} not found."));
            }

            if (req.Title is not null)
            {
                if (string.IsNullOrWhiteSpace(req.Title))
                {
                    return Results.BadRequest(new ErrorResponse("Title cannot be empty."));
                }
                task.Title = req.Title.Trim();
            }

            if (req.Description is not null) task.Description = req.Description;
            if (req.IsFlagged is not null) task.IsFlagged = req.IsFlagged.Value;

            var targetStatus = req.Status ?? task.Status;

            if (req.LabelIds is not null)
            {
                var labels = await LoadLabelsAsync(db, req.LabelIds);
                if (labels is null)
                {
                    return Results.BadRequest(new ErrorResponse("One or more labelIds do not exist."));
                }
                task.Labels = labels;
            }

            // Ordering: explicit reorder wins; otherwise a bare status change
            // appends to the end of the destination column.
            if (req.Reorder)
            {
                try
                {
                    await OrderingService.ReorderAsync(db, task, targetStatus, req.AfterTaskId);
                }
                catch (ArgumentException ex)
                {
                    return Results.BadRequest(new ErrorResponse(ex.Message));
                }
            }
            else if (req.Status is not null && req.Status.Value != task.Status)
            {
                task.Status = targetStatus;
                task.Order = await OrderingService.NextOrderForColumnAsync(db, targetStatus);
            }

            task.ModifiedDate = DateTime.UtcNow;
            await db.SaveChangesAsync();
            return Results.Ok(task.ToResponse());
        });

        tasks.MapDelete("/{id:int}", async (int id, EzraDbContext db) =>
        {
            var task = await db.Tasks.FindAsync(id);
            if (task is null)
            {
                return Results.NotFound(new ErrorResponse($"Task {id} not found."));
            }
            db.Tasks.Remove(task);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }

    /// <summary>
    /// Load labels for the given ids, or <c>null</c> if any id is missing —
    /// callers turn null into a 400.
    /// </summary>
    private static async Task<List<Label>?> LoadLabelsAsync(EzraDbContext db, List<int> ids)
    {
        var distinct = ids.Distinct().ToList();
        var labels = await db.Labels.Where(l => distinct.Contains(l.Id)).ToListAsync();
        return labels.Count == distinct.Count ? labels : null;
    }
}
