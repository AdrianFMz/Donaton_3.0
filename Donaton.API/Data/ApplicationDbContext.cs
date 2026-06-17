using Donaton.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Donaton.API.Data
{
    // Heredamos de DbContext para que Entity Framework sepa que esta clase maneja la BD
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Esta propiedad le dice a .NET que queremos una tabla llamada "Causes" basada en nuestro modelo
        public DbSet<Cause> Causes { get; set; }


        // Nueva tabla para la gestión de usuarios
        public DbSet<User> Users { get; set; }

        // Nueva tabla para las publicaciones del blog
        public DbSet<BlogArticle> BlogArticles { get; set; }

        // Nueva tabla para el registro de transacciones
        public DbSet<Donation> Donations { get; set; }
    }
}