
namespace ia_backend.Models {

    public class TranslationResult {
        public Guid Id {get;set;}
        public Guid RequestId {get;set;}
        public string? ResultText {get;set;}
        public DateTime ProcessingTimestamp {get;set;}
        public string? ErrorMessage {get;set;}
    }
}