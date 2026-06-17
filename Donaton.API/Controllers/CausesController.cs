using Donaton.API.Data;
using Donaton.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace Donaton.API.Controllers
{
    [Route("api/[controller]")] // Esto define que la ruta será midominio.com/api/causes
    [ApiController]
    public class CausesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Inyectamos la base de datos a través del constructor
        public CausesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Causes (Este endpoint lo usará React y MAUI para mostrar las tarjetas)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Cause>>> GetCauses()
        {
            return await _context.Causes.ToListAsync();
        }

        // POST: api/Causes (Este endpoint lo usarás en el panel de Admin para agregar causas)
        //[Authorize]
        [HttpPost]
        public async Task<ActionResult<Cause>> PostCause(Cause cause)
        {
            _context.Causes.Add(cause);
            await _context.SaveChangesAsync();

            // Retorna un estatus 201 (Creado) y devuelve el objeto recién creado
            return CreatedAtAction(nameof(GetCauses), new { id = cause.Id }, cause);

        }

        // PUT: api/Causes/5 (Actualizar una causa existente)
        //[Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCause(int id, Cause cause)
        {
            // Validación 1: Que el ID de la URL coincida con el ID del objeto que se envía
            if (id != cause.Id)
            {
                return BadRequest("El ID de la ruta no coincide con el ID del modelo.");
            }

            // Le decimos a Entity Framework que este objeto fue modificado
            _context.Entry(cause).State = EntityState.Modified;

            try
            {
                // Intentamos guardar los cambios en PostgreSQL
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Validación 2: ¿Qué pasa si intentan editar algo que alguien más ya borró?
                if (!CauseExists(id))
                {
                    return NotFound("La causa especificada no existe en la base de datos.");
                }
                else
                {
                    throw; // Si es un error de conexión u otro problema, lanzamos la excepción
                }
            }

            // 204 No Content es el estándar de éxito para un PUT
            return NoContent();
        }

        // DELETE: api/Causes/5 (Eliminar una causa)
        //[Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCause(int id)
        {
            // Buscamos la causa en la base de datos
            var cause = await _context.Causes.FindAsync(id);

            // Validación: Si no existe, devolvemos un error 404
            if (cause == null)
            {
                return NotFound("No se encontró la causa a eliminar.");
            }

            // Removemos y guardamos los cambios
            _context.Causes.Remove(cause);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Método auxiliar privado para comprobar si una causa existe
        private bool CauseExists(int id)
        {
            return _context.Causes.Any(e => e.Id == id);
        }
    }
}