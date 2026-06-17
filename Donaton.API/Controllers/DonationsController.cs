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
        // [Authorize] <-- Comentado temporalmente para pruebas en Swagger
        [HttpPost]
        public async Task<ActionResult<Donation>> PostDonation(Donation donation)
        {
            // 1. Buscamos la causa a la que se le va a donar
            var cause = await _context.Causes.FindAsync(donation.CauseId);

            // Validación: ¿Qué pasa si intentan donar a una causa que ya fue borrada?
            if (cause == null)
            {
                return NotFound("La causa especificada no existe.");
            }

            // 2. Aseguramos que la fecha sea la exacta del servidor
            donation.DonationDate = DateTime.UtcNow;

            // 3. Agregamos el registro de la donación
            _context.Donations.Add(donation);

            // 4. LA MAGIA: Sumamos el monto donado al acumulado de la causa
            cause.CurrentAmount += donation.Amount;
            _context.Entry(cause).State = EntityState.Modified;

            // 5. Guardamos ambos cambios de golpe (Transacción atómica)
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDonations), new { id = donation.Id }, donation);
        }

        // GET: api/Donations/MyDonations (Historial personal del usuario logueado)
        [Authorize] // Este SI debe estar protegido para poder leer el token
        [HttpGet("MyDonations")]
        public async Task<ActionResult<IEnumerable<Donation>>> GetMyDonations()
        {
            // 1. Extraemos el Claim del ID del usuario que guardamos al crear el token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized("No se pudo identificar al usuario desde el token.");
            }

            // 2. Convertimos el ID de texto a número entero
            int userId = int.Parse(userIdClaim.Value);

            // 3. Buscamos en la base de datos únicamente las donaciones que le pertenecen a ese ID
            var myDonations = await _context.Donations
                                            .Where(d => d.UserId == userId)
                                            .OrderByDescending(d => d.DonationDate)
                                            .ToListAsync();

            return Ok(myDonations);
        }
    }
}