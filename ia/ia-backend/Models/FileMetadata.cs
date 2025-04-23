
namespace ia_backend.Models {

    public class FileMetadata {
        public Guid Id { get; set; }
        public string? FileName { get; set; }
        public long FileSize { get; set; }
        public string? ContentType { get; set; }
    }
}