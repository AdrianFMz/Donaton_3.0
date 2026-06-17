namespace Donaton.API.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        // Aquí guardaremos la contraseña encriptada de forma segura
        public string PasswordHash { get; set; } = string.Empty;

        // Definirá los accesos: "Admin" o "Donor"
        public string Role { get; set; } = "Donor";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
