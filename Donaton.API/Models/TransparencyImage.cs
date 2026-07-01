using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Donaton.API.Models
{
    public class TransparencyImage
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string ImageUrl { get; set; } = string.Empty;

        [Required]
        public int TransparencyReportId { get; set; }

        [JsonIgnore] // Esto evita que el servidor se trabe enviando datos en bucle
        public TransparencyReport? TransparencyReport { get; set; }
    }
}