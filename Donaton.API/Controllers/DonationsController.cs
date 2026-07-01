using Donaton.API.Data;
using Donaton.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace Donaton.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DonationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DonationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Donations (Para ver el historial general en el panel de Admin)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Donation>>> GetDonations()
        {
            return await _context.Donations.OrderByDescending(d => d.DonationDate).ToListAsync();
        }

        // POST: api/Donations (El endpoint crítico donde ocurre la magia)
        [Authorize] // Ahora el pago requiere estar logueado obligatoriamente
        [HttpPost]
        public async Task<ActionResult<Donation>> PostDonation(Donation donation)
        {
            // Extraemos de forma segura el ID del usuario desde su token JWT
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim != null)
            {
                donation.UserId = int.Parse(userIdClaim.Value); // Inyectamos el ID real del token
            }

            var cause = await _context.Causes.FindAsync(donation.CauseId);
            if (cause == null)
            {
                return NotFound("La causa especificada no existe.");
            }

            donation.DonationDate = DateTime.UtcNow;
            _context.Donations.Add(donation);

            cause.CurrentAmount += donation.Amount;
            _context.Entry(cause).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDonations), new { id = donation.Id }, donation);
        }

        // GET: api/Donations/MyDonations (Historial personal del usuario logueado)
        [Authorize]
        [HttpGet("my-history")]
        public async Task<ActionResult<IEnumerable<Donation>>> GetMyDonations()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);

            // 1. PRIMERO validamos que exista (Desactivamos la bomba)
            if (userIdClaim == null)
            {
                return Unauthorized("No se pudo identificar al usuario desde el token.");
            }



            // 2. LUEGO lo convertimos a número
            int userId = int.Parse(userIdClaim.Value);

            // 3. Filtramos en la base de datos
            var myDonations = await _context.Donations
                                .Include(d => d.Cause) // <--- Carga los datos de la tabla Causes
                                .Where(d => d.UserId == userId)
                                .OrderByDescending(d => d.DonationDate)
                                .ToListAsync();

            return Ok(myDonations);
        }
    }
}