using Ezra.Api.Models;
using Ezra.Api.Ordering;

namespace Ezra.Api.Data;

/// <summary>
/// Optional sample data for a generic tech-company onboarding board. Runs only
/// when enabled (config <c>Database:Seed</c>) and the DB is empty, so shipping
/// an empty schema is just "don't enable seeding".
/// </summary>
public static class DbSeeder
{
    public static void Seed(EzraDbContext db)
    {
        if (db.Tasks.Any() || db.Labels.Any())
        {
            return;
        }

        var setup = new Label { Name = "setup", Order = 0 };
        var docs = new Label { Name = "docs", Order = 1 };
        var team = new Label { Name = "team", Order = 2 };
        db.Labels.AddRange(setup, docs, team);

        var now = DateTime.UtcNow;
        var todo = new[]
        {
            ("Set up laptop and dev environment", "Install tooling, clone the main repos.", true, new[] { setup }),
            ("Read the engineering handbook", "Coding standards, on-call, release process.", false, new[] { docs }),
            ("Book 1:1s with your team", "Grab 30 minutes with each teammate.", false, new[] { team }),
        };
        var inProgress = new[]
        {
            ("Complete security & compliance training", "Assigned in the LMS — due first week.", false, Array.Empty<Label>()),
        };
        var done = new[]
        {
            ("Sign offer and onboarding paperwork", "Handled by People Ops.", false, Array.Empty<Label>()),
        };

        AddColumn(db, TaskState.Todo, todo, now);
        AddColumn(db, TaskState.InProgress, inProgress, now);
        AddColumn(db, TaskState.Done, done, now);

        db.SaveChanges();
    }

    private static void AddColumn(
        EzraDbContext db,
        TaskState status,
        (string Title, string Description, bool Flagged, Label[] Labels)[] rows,
        DateTime now)
    {
        var order = OrderingService.Gap;
        foreach (var (title, description, flagged, labels) in rows)
        {
            db.Tasks.Add(new TaskItem
            {
                Title = title,
                Description = description,
                Status = status,
                IsFlagged = flagged,
                Order = order,
                CreatedDate = now,
                ModifiedDate = now,
                Labels = labels.ToList()
            });
            order += OrderingService.Gap;
        }
    }
}
