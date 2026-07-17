using Ezra.Api.Data;
using Ezra.Api.Dtos;
using Ezra.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Ezra.Api.Endpoints;

public static class LabelEndpoints
{
    public static void MapLabelEndpoints(this IEndpointRouteBuilder app)
    {
        var labels = app.MapGroup("/labels");

        labels.MapGet("/", async (EzraDbContext db) =>
        {
            var items = await db.Labels.OrderBy(l => l.Order).ThenBy(l => l.Id).ToListAsync();
            return Results.Ok(items.Select(l => l.ToResponse()));
        });

        labels.MapGet("/{id:int}", async (int id, EzraDbContext db) =>
        {
            var label = await db.Labels.FindAsync(id);
            return label is null
                ? Results.NotFound(new ErrorResponse($"Label {id} not found."))
                : Results.Ok(label.ToResponse());
        });

        labels.MapPost("/", async (CreateLabelRequest req, EzraDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(req.Name))
            {
                return Results.BadRequest(new ErrorResponse("Name is required."));
            }

            var label = new Label { Name = req.Name.Trim(), Order = req.Order ?? 0 };
            db.Labels.Add(label);
            await db.SaveChangesAsync();
            return Results.Created($"/labels/{label.Id}", label.ToResponse());
        });

        labels.MapPatch("/{id:int}", async (int id, UpdateLabelRequest req, EzraDbContext db) =>
        {
            var label = await db.Labels.FindAsync(id);
            if (label is null)
            {
                return Results.NotFound(new ErrorResponse($"Label {id} not found."));
            }

            if (req.Name is not null)
            {
                if (string.IsNullOrWhiteSpace(req.Name))
                {
                    return Results.BadRequest(new ErrorResponse("Name cannot be empty."));
                }
                label.Name = req.Name.Trim();
            }
            if (req.Order is not null) label.Order = req.Order.Value;

            await db.SaveChangesAsync();
            return Results.Ok(label.ToResponse());
        });

        labels.MapDelete("/{id:int}", async (int id, EzraDbContext db) =>
        {
            var label = await db.Labels.FindAsync(id);
            if (label is null)
            {
                return Results.NotFound(new ErrorResponse($"Label {id} not found."));
            }
            db.Labels.Remove(label);
            await db.SaveChangesAsync();
            return Results.NoContent();
        });
    }
}
