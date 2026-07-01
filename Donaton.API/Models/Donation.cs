namespace Donaton.API.Models
{
    public class Donation
    {
        public int Id { get; set; }

        // Relación: ¿Quién hizo la donación?
        public int UserId { get; set; }

        // Relación: ¿A qué causa va el dinero?
        public int CauseId { get; set; }

        // Monto donado
        public decimal Amount { get; set; }

        // Fecha exacta de la transacción
        public DateTime DonationDate { get; set; } = DateTime.UtcNow;

        // Pasarela utilizada (Ej: "Mercado Pago", "PayPal")
        public string PaymentMethod { get; set; } = string.Empty;

        // Estado de la transacción (Ej: "Completed", "Pending", "Failed")
        public string Status { get; set; } = "Completed";

        public Cause? Cause { get; set; }
    }
}