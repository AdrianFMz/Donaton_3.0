using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Donaton.API.Models
{
    public class CauseImage
    {
        [Key]
        public int Id { get; set; }

        // Ruta física donde se guardó la imagen en el servidor (Ej: "/uploads/causa1_foto2.jpg")
        [Required]
        public string ImageUrl { get; set; } = string.Empty;

        // Relación con la causa
        [Required]
        public int CauseId { get; set; }
    }
}