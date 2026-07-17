using Ezra.Api.Data;
using Ezra.Api.Models;
using Ezra.Api.Ordering;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Ezra.Api.Tests;

public class OrderingServiceTests
{
    private static TaskItem MakeTask(string title, TaskState status, int order) =>
        new() { Title = title, Status = status, Order = order };

    [Fact]
    public async Task NextOrder_EmptyColumn_ReturnsGap()
    {
        using var testDb = new TestDb();
        await using var db = testDb.NewContext();

        var next = await OrderingService.NextOrderForColumnAsync(db, TaskState.Todo);

        Assert.Equal(OrderingService.Gap, next);
    }

    [Fact]
    public async Task NextOrder_NonEmptyColumn_ReturnsMaxPlusGap()
    {
        using var testDb = new TestDb();
        await using var db = testDb.NewContext();
        db.Tasks.Add(MakeTask("a", TaskState.Todo, 1000));
        db.Tasks.Add(MakeTask("b", TaskState.Todo, 2500));
        await db.SaveChangesAsync();

        var next = await OrderingService.NextOrderForColumnAsync(db, TaskState.Todo);

        Assert.Equal(3500, next);
    }

    [Fact]
    public async Task Reorder_BetweenTwo_UsesMidpoint()
    {
        using var testDb = new TestDb();
        await using var db = testDb.NewContext();
        var a = MakeTask("a", TaskState.Todo, 1000);
        var b = MakeTask("b", TaskState.Todo, 3000);
        var moving = MakeTask("m", TaskState.Todo, 9000);
        db.Tasks.AddRange(a, b, moving);
        await db.SaveChangesAsync();

        await OrderingService.ReorderAsync(db, moving, TaskState.Todo, a.Id);
        await db.SaveChangesAsync();

        Assert.Equal(2000, moving.Order); // midpoint of 1000 and 3000
    }

    [Fact]
    public async Task Reorder_ToTop_SitsBelowFirst()
    {
        using var testDb = new TestDb();
        await using var db = testDb.NewContext();
        var a = MakeTask("a", TaskState.Todo, 2000);
        var moving = MakeTask("m", TaskState.Todo, 9000);
        db.Tasks.AddRange(a, moving);
        await db.SaveChangesAsync();

        await OrderingService.ReorderAsync(db, moving, TaskState.Todo, afterTaskId: null);
        await db.SaveChangesAsync();

        Assert.True(moving.Order < a.Order);
        Assert.Equal(1000, moving.Order);
    }

    [Fact]
    public async Task Reorder_ToEnd_AppendsAfterLast()
    {
        using var testDb = new TestDb();
        await using var db = testDb.NewContext();
        var a = MakeTask("a", TaskState.Todo, 1000);
        var b = MakeTask("b", TaskState.Todo, 2000);
        var moving = MakeTask("m", TaskState.Todo, 500);
        db.Tasks.AddRange(a, b, moving);
        await db.SaveChangesAsync();

        await OrderingService.ReorderAsync(db, moving, TaskState.Todo, b.Id);
        await db.SaveChangesAsync();

        Assert.Equal(3000, moving.Order); // b.Order + Gap
    }

    [Fact]
    public async Task Reorder_NoGapBetweenNeighbours_RenumbersColumn()
    {
        using var testDb = new TestDb();
        await using var db = testDb.NewContext();
        var a = MakeTask("a", TaskState.Todo, 1000);
        var b = MakeTask("b", TaskState.Todo, 1001); // adjacent — no integer between
        var moving = MakeTask("m", TaskState.Todo, 9000);
        db.Tasks.AddRange(a, b, moving);
        await db.SaveChangesAsync();

        await OrderingService.ReorderAsync(db, moving, TaskState.Todo, a.Id);
        await db.SaveChangesAsync();

        // Expect clean renumber of [a, moving, b].
        Assert.Equal(1000, a.Order);
        Assert.Equal(2000, moving.Order);
        Assert.Equal(3000, b.Order);
    }

    [Fact]
    public async Task Reorder_AcrossColumns_ChangesStatus()
    {
        using var testDb = new TestDb();
        await using var db = testDb.NewContext();
        var moving = MakeTask("m", TaskState.Todo, 1000);
        db.Tasks.Add(moving);
        await db.SaveChangesAsync();

        await OrderingService.ReorderAsync(db, moving, TaskState.Done, afterTaskId: null);
        await db.SaveChangesAsync();

        Assert.Equal(TaskState.Done, moving.Status);
        Assert.Equal(1000, moving.Order);
    }

    [Fact]
    public async Task Reorder_UnknownAnchor_Throws()
    {
        using var testDb = new TestDb();
        await using var db = testDb.NewContext();
        var moving = MakeTask("m", TaskState.Todo, 1000);
        db.Tasks.Add(moving);
        await db.SaveChangesAsync();

        await Assert.ThrowsAsync<ArgumentException>(() =>
            OrderingService.ReorderAsync(db, moving, TaskState.Todo, afterTaskId: 424242));
    }
}
