namespace Donaton.API.Models
{
    public class Cause
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty; // Educación, Alimentos, Salud
        public decimal GoalAmount { get; set; } // Meta monetaria a alcanzar
        public decimal CurrentAmount { get; set; } // Lo que se ha donado hasta ahora
        public string ImageUrl { get; set; } = string.Empty;
    }
}