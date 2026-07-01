using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using System.IO;

namespace Donaton.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadsController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        // Inyectamos el entorno para saber dónde está la carpeta del proyecto en el disco duro
        public UploadsController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpPost("image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            // 1. Validamos que el archivo realmente venga en la petición
            if (file == null || file.Length == 0)
            {
                return BadRequest("No se proporcionó ningún archivo o el archivo está vacío.");
            }

            // 2. Definimos la carpeta pública (wwwroot/uploads)
            // Si WebRootPath es nulo, forzamos la ruta apuntando al directorio raíz del proyecto
            string rootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            string uploadsFolder = Path.Combine(rootPath, "uploads");

            // Si la carpeta "uploads" no existe, el servidor la crea automáticamente
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // 3. Generamos un nombre único matemático (UUID) para evitar que fotos con el mismo nombre se sobreescriban
            string uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
            string filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // 4. Guardamos el archivo físicamente en el disco duro del servidor
            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            // 5. Devolvemos la ruta relativa para que React la guarde en PostgreSQL
            string dbPath = $"/uploads/{uniqueFileName}";

            return Ok(new { url = dbPath });
        }
    }
}