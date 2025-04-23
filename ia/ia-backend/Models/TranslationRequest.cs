

namespace ia_backend.Models {
    public class TranslationRequest {
        public Guid Id { get; set;}
        public string? FileName {get; set;}
        public string? BlobUrl {get; set;}
        public DateTime UploadTimestamp {get;set;}
        public string? Status {get;set;}
        public string? SourceLanguage {get;set;}
        public string? TargetLanguage {get;set;}
    }
}