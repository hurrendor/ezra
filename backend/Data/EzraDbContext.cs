using Ezra.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Ezra.Api.Data;

public class EzraDbContext(DbContextOptions<EzraDbContext> options) : DbContext(options)
{
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Label> Labels => Set<Label>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TaskItem>(entity =>
        {
            entity.ToTable("tasks");
            entity.HasKey(t => t.Id);
            entity.Property(t => t.Title).IsRequired();

            // Store the enum as its name ("Todo"/"InProgress"/"Done") rather
            // than an int, so the DB is readable and stable across enum edits.
            entity.Property(t => t.Status)
                .HasConversion<string>()
                .IsRequired();

            // Query tasks column-by-column in board order.
            entity.HasIndex(t => new { t.Status, t.Order });
        });

        modelBuilder.Entity<Label>(entity =>
        {
            entity.ToTable("labels");
            entity.HasKey(l => l.Id);
            entity.Property(l => l.Name).IsRequired();
        });

        // Many-to-many through an explicit join table.
        modelBuilder.Entity<TaskItem>()
            .HasMany(t => t.Labels)
            .WithMany(l => l.Tasks)
            .UsingEntity<TaskLabel>(
                j => j.HasOne<Label>().WithMany().HasForeignKey(tl => tl.LabelId),
                j => j.HasOne<TaskItem>().WithMany().HasForeignKey(tl => tl.TaskId),
                j =>
                {
                    j.ToTable("task_labels");
                    j.HasKey(tl => new { tl.TaskId, tl.LabelId });
                });
    }
}
