
using Microsoft.CognitiveServices.Speech;
using Microsoft.CognitiveServices.Speech.Audio;
using Microsoft.CognitiveServices.Speech.Translation;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Threading.Tasks;

namespace ia_backend.Services {

    public class SpeechTranslationService {

        private readonly string? _subscriptionKey;
        private readonly string? _region;

        public SpeechTranslationService(IConfiguration configuration) {
            _subscriptionKey = configuration["AzureSpeechService:SubscriptionKey"];
            _region = configuration["AzureSpeechService:Region"];
        }

        public async Task<string> TranslateAudioAsync(Stream audioStream, string sourceLanguage, string targetLanguage) {
            Console.WriteLine("Preparing speech translation configuration...");
        var speechConfig = SpeechTranslationConfig.FromSubscription(_subscriptionKey, _region);
        
        // Set languages
        Console.WriteLine($"Setting languages: source={sourceLanguage}, target={targetLanguage}");
        speechConfig.SpeechRecognitionLanguage = sourceLanguage;
        speechConfig.AddTargetLanguage(targetLanguage);

        // If the audio is too big, this might fail
        // Let's reset the stream to ensure we're at the beginning
        audioStream.Position = 0;
        
        Console.WriteLine("Creating temporary file for audio...");
        // Create a temporary file for the audio (more reliable than direct stream)
        var tempFilePath = Path.GetTempFileName() + ".wav";
        using (var fileStream = File.Create(tempFilePath))
        {
            await audioStream.CopyToAsync(fileStream);
        }
        
        Console.WriteLine($"Temporary file created at: {tempFilePath}");
        
        // Create audio configuration from file (more reliable than in-memory)
        using var audioInput = AudioConfig.FromWavFileInput(tempFilePath);
        
        Console.WriteLine("Creating translation recognizer...");
        // Create translation recognizer
        using var recognizer = new TranslationRecognizer(speechConfig, audioInput);
        
        Console.WriteLine("Starting recognition...");
        // Start recognition with timeout
        var recognizeTask = recognizer.RecognizeOnceAsync();
        if (await Task.WhenAny(recognizeTask, Task.Delay(TimeSpan.FromSeconds(30))) != recognizeTask)
        {
            throw new TimeoutException("Speech recognition timed out after 30 seconds");
        }
        
        var result = await recognizeTask;
        
        // Clean up temporary file
        try { File.Delete(tempFilePath); } catch { /* Ignore cleanup errors */ }
        
        Console.WriteLine($"Recognition reason: {result.Reason}");
        
        // Process result
        if (result.Reason == ResultReason.TranslatedSpeech)
        {
            return result.Translations[targetLanguage];
        }
        else if (result.Reason == ResultReason.RecognizedSpeech)
        {
            throw new Exception($"Speech was recognized but not translated. Recognized text: {result.Text}");
        }
        else if (result.Reason == ResultReason.NoMatch)
        {
            throw new Exception("No speech could be recognized from the audio");
        }
        else
        {
            throw new Exception($"Translation failed: {result.Reason}");
        }

        }
    }
}