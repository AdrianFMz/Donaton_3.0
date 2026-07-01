using System.Net.Http.Json;
using Donaton.Mobile.Utils;

namespace Donaton.Mobile.Services
{
    public class ApiService
    {
        private readonly HttpClient _httpClient;

        public ApiService()
        {
            _httpClient = new HttpClient();
            _httpClient.BaseAddress = new Uri(Constants.BaseApiUrl + "/");
        }

        // Ejemplo: Obtener todas las causas activas (Igual que en Home.jsx)
        public async Task<List<Cause>> GetCausesAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync("Causes");
                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadFromJsonAsync<List<Cause>>();
                }
                return new List<Cause>();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al conectar con la API: {ex.Message}");
                return new List<Cause>();
            }
        }
    }

    // Necesitamos recrear los modelos básicos para recibir los datos
    public class Cause
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal GoalAmount { get; set; }
        public decimal CurrentAmount { get; set; }
        public string ImageUrl { get; set; }
    }
}