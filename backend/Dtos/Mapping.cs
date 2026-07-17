using Ezra.Api.Models;

namespace Ezra.Api.Dtos;

/// <summary>Entity -> response DTO projections.</summary>
public static class Mapping
{
    public static TaskResponse ToResponse(this TaskItem t) => new(
        t.Id,
        t.Title,
        t.Description,
        t.Status.ToString(),
        t.Order,
        t.IsFlagged,
        t.CreatedDate,
        t.ModifiedDate,
        t.Labels.OrderBy(l => l.Order).Select(l => l.ToResponse()).ToList());

    public static LabelResponse ToResponse(this Label l) => new(l.Id, l.Name, l.Order);
}
