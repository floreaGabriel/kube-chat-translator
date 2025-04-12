
using Microsoft.EntityFrameworkCore;
using ia_backend.Models;

namespace ia_backend.Data {
    public class AppDbContext : DbContext {

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {

        }

        public DbSet<TranslationRequest> TranslationRequests {get;set;}
        public DbSet<TranslationResult> TranslationResults {get;set;}

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // configuram relatiile
            modelBuilder.Entity<TranslationResult>()
                .HasOne<TranslationRequest>()
                .WithMany()
                .HasForeignKey(r => r.RequestId);
        }

    }
}