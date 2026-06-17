namespace Donaton.API.Models
{
    public class BlogArticle
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public DateTime PublishedDate { get; set; } = DateTime.UtcNow; // Se guarda la fecha exacta automáticamente
    }
}