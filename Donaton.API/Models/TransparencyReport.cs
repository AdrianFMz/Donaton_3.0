using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Donaton.API.Models
{
    public class TransparencyReport
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int CauseId { get; set; }

        [Required]
        [StringLength(150)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public decimal AmountSpent { get; set; }

        public DateTime ReportDate { get; set; } = DateTime.UtcNow;

        public string EvidenceImageUrl { get; set; } = string.Empty;

        // --- NUEVOS CAMPOS PARA EL DETALLE PROFUNDO ---
        public string Actions { get; set; } = string.Empty; // Ej. "Se compraron materiales, se construyó el techo..."

        public string Beneficiaries { get; set; } = string.Empty; // Ej. "Más de 500 familias y 30 animales"

        // Relación con la nueva tabla de galería de imágenes
        public List<TransparencyImage> ExtraImages { get; set; } = new List<TransparencyImage>();
    }
}