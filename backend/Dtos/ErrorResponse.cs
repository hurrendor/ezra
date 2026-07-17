namespace Ezra.Api.Dtos;

/// <summary>
/// Consistent error body shape for all endpoints: <c>{ "error": "message" }</c>.
/// </summary>
public record ErrorResponse(string Error);
