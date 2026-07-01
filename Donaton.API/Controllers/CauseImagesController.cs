using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Donaton.API.Data;
using Donaton.API.Models;

namespace Donaton.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CauseImagesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CauseImagesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/CauseImages/5
        // (Trae la galería completa de fotos de una causa)
        [HttpGet("{causeId}")]
        public async Task<ActionResult<IEnumerable<CauseImage>>> GetImagesByCause(int causeId)
        {
            var images = await _context.CauseImages
                                       .Where(img => img.CauseId == causeId)
                                       .ToListAsync();
            return Ok(images);
        }

        // POST: api/CauseImages
        // (Agrega una nueva foto a la galería de la causa)
        [HttpPost]
        public async Task<ActionResult<CauseImage>> PostCauseImage(CauseImage causeImage)
        {
            _context.CauseImages.Add(causeImage);
            await _context.SaveChangesAsync();
            return Ok(causeImage);
        }
    }
}