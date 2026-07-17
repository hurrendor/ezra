using System.Net;
using System.Net.Http.Json;
using Ezra.Api.Dtos;
using Xunit;

namespace Ezra.Api.Tests;

public class TaskEndpointsTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Post_ValidTask_Returns201WithBody()
    {
        var resp = await _client.PostAsJsonAsync("/tasks",
            new CreateTaskRequest("Ship MVP", "the whole thing", null, true, null));

        Assert.Equal(HttpStatusCode.Created, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<TaskResponse>();
        Assert.NotNull(body);
        Assert.Equal("Ship MVP", body!.Title);
        Assert.Equal("Todo", body.Status);
        Assert.True(body.IsFlagged);
        Assert.True(body.Order > 0);
    }

    [Fact]
    public async Task Post_MissingTitle_Returns400WithErrorShape()
    {
        var resp = await _client.PostAsJsonAsync("/tasks",
            new CreateTaskRequest(null, "no title", null, null, null));

        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
        var error = await resp.Content.ReadFromJsonAsync<ErrorResponse>();
        Assert.NotNull(error);
        Assert.False(string.IsNullOrWhiteSpace(error!.Error));
    }

    [Fact]
    public async Task Patch_StatusChange_MovesColumn()
    {
        var created = await (await _client.PostAsJsonAsync("/tasks",
            new CreateTaskRequest("move me", null, null, null, null)))
            .Content.ReadFromJsonAsync<TaskResponse>();

        var resp = await _client.PatchAsJsonAsync($"/tasks/{created!.Id}",
            new UpdateTaskRequest(null, null, null, Models.TaskState.Done, null));

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<TaskResponse>();
        Assert.Equal("Done", body!.Status);
    }

    [Fact]
    public async Task Delete_ThenGet_Returns404()
    {
        var created = await (await _client.PostAsJsonAsync("/tasks",
            new CreateTaskRequest("delete me", null, null, null, null)))
            .Content.ReadFromJsonAsync<TaskResponse>();

        var del = await _client.DeleteAsync($"/tasks/{created!.Id}");
        Assert.Equal(HttpStatusCode.NoContent, del.StatusCode);

        var get = await _client.GetAsync($"/tasks/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, get.StatusCode);
    }

    [Fact]
    public async Task Get_Tasks_ReturnsOk()
    {
        var resp = await _client.GetAsync("/tasks");
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
    }
}
