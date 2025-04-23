using ia_backend.Models;
using ia_backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;

namespace ia_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TranslationController : ControllerBase
    {
        private readonly BlobStorageService _blobStorageService;
        private readonly SpeechTranslationService _speechTranslationService;
        private readonly DatabaseService _databaseService;

        public TranslationController(
            BlobStorageService blobStorageService,
            SpeechTranslationService speechTranslationService,
            DatabaseService databaseService)
        {
            _blobStorageService = blobStorageService;
            _speechTranslationService = speechTranslationService;
            _databaseService = databaseService;
        }

        [HttpPost]
        public async Task<IActionResult> TranslateAudio(IFormFile file, [FromForm] string sourceLanguage, [FromForm] string targetLanguage)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            try
            {
                // Upload to blob storage
                using var stream = file.OpenReadStream();
                var blobUrl = await _blobStorageService.UploadFileAsync(stream, file.FileName);

                // Create database entry
                var request = await _databaseService.CreateTranslationRequestAsync(
                    file.FileName, blobUrl, sourceLanguage, targetLanguage);

                // Process translation asynchronously (simplified for example)
                _ = ProcessTranslationAsync(request.Id, blobUrl, sourceLanguage, targetLanguage);

                return Ok(new { requestId = request.Id, status = "Processing" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private async Task ProcessTranslationAsync(Guid requestId, string blobUrl, string sourceLanguage, string targetLanguage)
        {
            try
            {
                // Log the start of processing
                Console.WriteLine($"Starting translation process for request {requestId}");
                
                // Download from blob storage
                using var audioStream = await _blobStorageService.DownloadFileAsync(blobUrl);
                
                // Log the download
                Console.WriteLine($"Downloaded audio from {blobUrl}");
                
                // Translate
                var translatedText = await _speechTranslationService.TranslateAudioAsync(
                    audioStream, sourceLanguage, targetLanguage);
                
                // Log the translation result
                Console.WriteLine($"Translation completed: {translatedText}");
                
                // Save result
                await _databaseService.SaveTranslationResultAsync(requestId, translatedText, "");
                
                // Log the save
                Console.WriteLine($"Saved translation result for request {requestId}");

            }
            catch (Exception ex)
            {
                await _databaseService.SaveTranslationResultAsync(requestId, null, ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTranslation(Guid id)
        {
            try
            {
                var result = await _databaseService.GetTranslationResultAsync(id);
                // This might be the issue - check if result is null
                if (result == null)
                {
                    // First, check if the request exists but doesn't have a result yet
                    var request = await _databaseService.GetTranslationRequestAsync(id);
                    if (request != null)
                    {
                        return Ok(new { requestId = id, status = request.Status, message = "Translation is still processing." });
                    }
                    
                    return NotFound("Translation result not found");
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}