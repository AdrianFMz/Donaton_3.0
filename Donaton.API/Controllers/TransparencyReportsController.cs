using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Donaton.API.Data;
using Donaton.API.Models;

namespace Donaton.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransparencyReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TransparencyReportsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/TransparencyReports (Lista general)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TransparencyReport>>> GetAllReports()
        {
            return await _context.TransparencyReports
                                 .Include(r => r.ExtraImages) // Incluimos la galería
                                 .OrderByDescending(r => r.ReportDate)
                                 .ToListAsync();
        }

        // GET: api/TransparencyReports/5 (Para la pantalla de detalles específica)
        [HttpGet("{id}")]
        public async Task<ActionResult<TransparencyReport>> GetReport(int id)
        {
            var report = await _context.TransparencyReports
                                       .Include(r => r.ExtraImages)
                                       .FirstOrDefaultAsync(r => r.Id == id);
            if (report == null) return NotFound();
            return Ok(report);
        }

        // POST: api/TransparencyReports (Creación básica)
        [HttpPost]
        public async Task<ActionResult<TransparencyReport>> PostReport(TransparencyReport report)
        {
            var causeExists = await _context.Causes.AnyAsync(c => c.Id == report.CauseId);
            if (!causeExists) return BadRequest("La causa no existe.");

            report.ReportDate = DateTime.UtcNow;
            _context.TransparencyReports.Add(report);
            await _context.SaveChangesAsync();

            return Ok(report);
        }

        // PUT: api/TransparencyReports/5/details (Para que el Admin le agregue texto extra)
        // PUT: api/TransparencyReports/5/details
        [HttpPut("{id}/details")]
        public async Task<IActionResult> UpdateDetails(int id, [FromBody] UpdateDetailsDto data)
        {
            var report = await _context.TransparencyReports.FindAsync(id);
            if (report == null) return NotFound();

            // Ahora solo leemos los dos campos que mandó React
            report.Actions = data.Actions;
            report.Beneficiaries = data.Beneficiaries;

            await _context.SaveChangesAsync();
            return Ok(report);
        }

        // POST: api/TransparencyReports/5/images (Para que el Admin suba fotos a la galería)
        [HttpPost("{id}/images")]
        public async Task<IActionResult> AddExtraImage(int id, [FromBody] TransparencyImage imgData)
        {
            var reportExists = await _context.TransparencyReports.AnyAsync(r => r.Id == id);
            if (!reportExists) return NotFound("El reporte no existe.");

            imgData.TransparencyReportId = id;
            _context.TransparencyImages.Add(imgData);
            await _context.SaveChangesAsync();

            return Ok(imgData);
        }

        // Esta clase solo sirve para recibir el paquete parcial desde React
        public class UpdateDetailsDto
        {
            public string Actions { get; set; } = string.Empty;
            public string Beneficiaries { get; set; } = string.Empty;
        }
    }
}