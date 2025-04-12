// Services/DatabaseService.cs
using ia_backend.Data;
using ia_backend.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ia_backend.Services
{
    public class DatabaseService
    {
         private readonly IDbContextFactory<AppDbContext> _dbContextFactory;

        public DatabaseService(IDbContextFactory<AppDbContext> dbContextFactory)
        {
            _dbContextFactory = dbContextFactory;
        }

        public async Task<TranslationRequest> CreateTranslationRequestAsync(string fileName, string blobUrl, string sourceLanguage, string targetLanguage)
        {
            using var _dbContext = await _dbContextFactory.CreateDbContextAsync();

            var request = new TranslationRequest
            {
                Id = Guid.NewGuid(),
                FileName = fileName,
                BlobUrl = blobUrl,
                UploadTimestamp = DateTime.UtcNow,
                Status = "Pending",
                SourceLanguage = sourceLanguage,
                TargetLanguage = targetLanguage
            };

            _dbContext.TranslationRequests.Add(request);
            await _dbContext.SaveChangesAsync();
            
            return request;
        }

        public async Task SaveTranslationResultAsync(Guid requestId, string resultText, string errorMessage = null)
        {
            try {
                using var _dbContext = await _dbContextFactory.CreateDbContextAsync();

                Console.WriteLine($"Attempting to save translation result for request {requestId}");
                
                var request = await _dbContext.TranslationRequests.FindAsync(requestId);
                if (request == null) {
                    Console.WriteLine($"Request {requestId} not found in database");
                    throw new Exception("Translation request not found");
                }
                
                Console.WriteLine($"Found request, updating status from {request.Status} to {(errorMessage == null ? "Completed" : "Failed")}");
                request.Status = errorMessage == null ? "Completed" : "Failed";
                
                var result = new TranslationResult
                {
                    Id = Guid.NewGuid(),
                    RequestId = requestId,
                    ResultText = resultText,
                    ProcessingTimestamp = DateTime.UtcNow,
                    ErrorMessage = errorMessage
                };
                
                Console.WriteLine($"Adding new translation result with ID {result.Id}");
                _dbContext.TranslationResults.Add(result);
                
                Console.WriteLine("Saving changes to database...");
                await _dbContext.SaveChangesAsync();
                
                Console.WriteLine("Translation result saved successfully");
            }
            catch (Exception ex) {
                Console.WriteLine($"Error in SaveTranslationResultAsync: {ex.Message}");
                if (ex.InnerException != null) {
                    Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                }
                throw; // Re-throw to be caught by the caller
            }
        }

        public async Task<List<TranslationRequest>> GetTranslationHistoryAsync(int page = 1, int pageSize = 10)
        {
            using var _dbContext = await _dbContextFactory.CreateDbContextAsync();

            return await _dbContext.TranslationRequests
                .OrderByDescending(r => r.UploadTimestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<TranslationResult> GetTranslationResultAsync(Guid requestId)
        {
            using var _dbContext = await _dbContextFactory.CreateDbContextAsync();

            var result = await _dbContext.TranslationResults
                .FirstOrDefaultAsync(r => r.RequestId == requestId);

            if (result == null)
            {
                throw new InvalidOperationException($"No translation result found for request ID {requestId}");
            }

            return result;
        }

        public async Task<TranslationRequest> GetTranslationRequestAsync(Guid id)
        {
            using var _dbContext = await _dbContextFactory.CreateDbContextAsync();
            return await _dbContext.TranslationRequests.FindAsync(id);
        }
    }
}