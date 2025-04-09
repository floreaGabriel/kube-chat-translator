namespace chat_backend.Models;

public class MongoDbSettings
{
    public string ConnectionString { get; set; }
    public string DatabaseName { get; set; }
    public string MessagesCollectionName { get; set; }
}