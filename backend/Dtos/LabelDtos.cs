namespace Ezra.Api.Dtos;

/// <summary>Label shape returned to clients.</summary>
public record LabelResponse(int Id, string Name, int Order);

/// <summary>Body for <c>POST /labels</c>.</summary>
public record CreateLabelRequest(string? Name, int? Order);

/// <summary>Body for <c>PATCH /labels/{id}</c>. Provided fields only.</summary>
public record UpdateLabelRequest(string? Name, int? Order);
