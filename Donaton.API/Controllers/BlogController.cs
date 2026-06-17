using Donaton.API.Data;
using Donaton.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Donaton.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlogController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BlogController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Blog (Obtener todas las publicaciones)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BlogArticle>>> GetBlogArticles()
        {
            // Las ordenamos por fecha descendente para que la más nueva salga primero
            return await _context.BlogArticles
                                 .OrderByDescending(b => b.PublishedDate)
                                 .ToListAsync();
        }

        // GET: api/Blog/5 (Obtener una publicación específica para el "Detalle")
        [HttpGet("{id}")]
        public async Task<ActionResult<BlogArticle>> GetBlogArticle(int id)
        {
            var article = await _context.BlogArticles.FindAsync(id);

            if (article == null)
            {
                return NotFound("No se encontró el artículo del blog.");
            }

            return article;
        }

        // POST: api/Blog (Crear una nueva publicación)
        // [Authorize]
        [HttpPost]
        public async Task<ActionResult<BlogArticle>> PostBlogArticle(BlogArticle article)
        {
            // Asegurarnos de que la fecha sea la actual al momento de crearlo
            article.PublishedDate = DateTime.UtcNow;

            _context.BlogArticles.Add(article);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBlogArticle), new { id = article.Id }, article);
        }

        // PUT: api/Blog/5 (Editar una publicación)
        // [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutBlogArticle(int id, BlogArticle article)
        {
            if (id != article.Id)
            {
                return BadRequest("El ID de la ruta no coincide con el modelo.");
            }

            _context.Entry(article).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BlogArticleExists(id))
                {
                    return NotFound("El artículo no existe.");
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Blog/5 (Eliminar una publicación)
        // [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBlogArticle(int id)
        {
            var article = await _context.BlogArticles.FindAsync(id);
            if (article == null)
            {
                return NotFound();
            }

            _context.BlogArticles.Remove(article);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BlogArticleExists(int id)
        {
            return _context.BlogArticles.Any(e => e.Id == id);
        }
    }
}