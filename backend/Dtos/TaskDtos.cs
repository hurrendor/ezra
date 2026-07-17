using Ezra.Api.Models;

namespace Ezra.Api.Dtos;

/// <summary>Task shape returned to clients.</summary>
public record TaskResponse(
    int Id,
    string Title,
    string? Description,
    string Status,
    int Order,
    bool IsFlagged,
    DateTime CreatedDate,
    DateTime ModifiedDate,
    IReadOnlyList<LabelResponse> Labels);

/// <summary>Body for <c>POST /tasks</c>.</summary>
public record CreateTaskRequest(
    string? Title,
    string? Description,
    TaskState? Status,
    bool? IsFlagged,
    List<int>? LabelIds);

/// <summary>
/// Body for <c>PATCH /tasks/{id}</c>. All fields optional — only provided ones
/// are applied. Reordering is opt-in via <see cref="Reorder"/> so that omitting
/// the field is distinguishable from "move to top" (<see cref="AfterTaskId"/> null).
/// </summary>
public record UpdateTaskRequest(
    string? Title,
    string? Description,
    bool? IsFlagged,
    TaskState? Status,
    List<int>? LabelIds,
    bool Reorder = false,
    int? AfterTaskId = null);
