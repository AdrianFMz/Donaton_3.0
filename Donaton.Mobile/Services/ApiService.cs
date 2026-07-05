using System.Net.Http.Json;
using Donaton.Mobile.Utils;
using System.Net.Http.Headers;

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
            catch { return new List<Cause>(); }
        }

        // --- CONECTADO A TU AUTHCONTROLLER REAL ---

        public async Task<LoginResult> LoginAsync(string email, string password)
        {
            try
            {
                // Enviamos el UserLoginDto esperado por tu API
                var response = await _httpClient.PostAsJsonAsync("Auth/login", new { Email = email, Password = password });

                if (response.IsSuccessStatusCode)
                {
                    // Deserializamos la respuesta que contiene el JWT y los datos del usuario
                    var data = await response.Content.ReadFromJsonAsync<LoginResult>();
                    data.Success = true;
                    return data;
                }

                // Si la API devuelve BadRequest("Usuario no encontrado.") o ("Contraseña incorrecta.")
                var errorMsg = await response.Content.ReadAsStringAsync();
                return new LoginResult { Success = false, Message = errorMsg };
            }
            catch (Exception ex)
            {
                return new LoginResult { Success = false, Message = $"Error de conexión: {ex.Message}" };
            }
        }

        public async Task<RegisterResult> RegisterAsync(string username, string email, string password)
        {
            try
            {
                // Enviamos el UserRegisterDto esperado por tu API
                var response = await _httpClient.PostAsJsonAsync("Auth/register", new { Username = username, Email = email, Password = password });

                // Tu API devuelve un string plano (Ok o BadRequest), así que lo leemos como texto
                var message = await response.Content.ReadAsStringAsync();

                return new RegisterResult { Success = response.IsSuccessStatusCode, Message = message };
            }
            catch (Exception ex)
            {
                return new RegisterResult { Success = false, Message = $"Error de conexión: {ex.Message}" };
            }
        }

        // --- MÉTODOS DE PAGO ---
        public async Task<string> GenerarPagoMercadoPagoAsync(int causeId, decimal amount)
        {
            try
            {
                // Apunta al endpoint exacto que creaste en tu PaymentsController
                var response = await _httpClient.PostAsJsonAsync("Payments/mercadopago", new { CauseId = causeId, Amount = amount });

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadFromJsonAsync<Dictionary<string, string>>();
                    return result != null && result.ContainsKey("initPoint") ? result["initPoint"] : null;
                }
                return null;
            }
            catch { return null; }
        }

        public async Task<string> GenerarPagoPayPalAsync(int causeId, decimal amount)
        {
            try
            {
                var response = await _httpClient.PostAsJsonAsync("Payments/paypal", new { CauseId = causeId, Amount = amount });

                if (response.IsSuccessStatusCode)
                {
                    var result = await response.Content.ReadFromJsonAsync<Dictionary<string, string>>();
                    return result != null && result.ContainsKey("initPoint") ? result["initPoint"] : null;
                }
                return null;
            }
            catch { return null; }
        }

        // --- NUEVO: MÉTODO PARA INYECTAR EL TOKEN ---
        private async Task AñadirTokenAsync()
        {
            var token = await SecureStorage.Default.GetAsync("jwt_token");
            if (!string.IsNullOrEmpty(token))
            {
                _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }
        }

        // --- NUEVO: REGISTRAR DONACIÓN ---
        public async Task<bool> RegistrarDonacionAsync(int causeId, decimal amount)
        {
            try
            {
                await AñadirTokenAsync(); // Pegamos el gafete

                // Obtenemos el ID del usuario que guardamos en Preferences
                int userId = Preferences.Get("UsuarioId", 0);

                // Ajusta el endpoint "Donations" a como lo tengas en tu backend
                var response = await _httpClient.PostAsJsonAsync("Donations", new
                {
                    UserId = userId,
                    CauseId = causeId,
                    Amount = amount
                });

                return response.IsSuccessStatusCode;
            }
            catch { return false; }
        }

        // --- NUEVO: OBTENER HISTORIAL ---
        public async Task<List<Donation>> GetHistorialDonacionesAsync()
        {
            try
            {
                await AñadirTokenAsync();

                // ¡AQUÍ ESTÁ LA MAGIA! Apuntamos a la ruta exacta de tu controlador
                var response = await _httpClient.GetAsync("Donations/my-history");

                if (response.IsSuccessStatusCode)
                {
                    return await response.Content.ReadFromJsonAsync<List<Donation>>();
                }
                return new List<Donation>();
            }
            catch
            {
                return new List<Donation>();
            }
        }

        // --- NUEVO: OBTENER REPORTES DE TRANSPARENCIA ---
        public async Task<List<TransparencyReport>> GetTransparencyReportsAsync()
        {
            try
            {
                // 1. MODIFICADO: Apuntamos al nombre exacto de tu TransparencyReportsController
                var response = await _httpClient.GetAsync("TransparencyReports");

                if (response.IsSuccessStatusCode)
                {
                    var reports = await response.Content.ReadFromJsonAsync<List<TransparencyReport>>();

                    if (reports != null)
                    {
                        // Sincronizamos la URL base de Render para la imagen principal y su galería
                        foreach (var report in reports)
                        {
                            if (!string.IsNullOrEmpty(report.EvidenceImageUrl) && !report.EvidenceImageUrl.StartsWith("http"))
                            {
                                report.EvidenceImageUrl = Constants.BaseUrl + report.EvidenceImageUrl;
                            }

                            // Sincronizamos las imágenes de la galería secundaria
                            if (report.ExtraImages != null)
                            {
                                foreach (var img in report.ExtraImages)
                                {
                                    if (!string.IsNullOrEmpty(img.ImageUrl) && !img.ImageUrl.StartsWith("http"))
                                    {
                                        img.ImageUrl = Constants.BaseUrl + img.ImageUrl;
                                    }
                                }
                            }
                        }
                        return reports;
                    }
                }
                return new List<TransparencyReport>();
            }
            catch { return new List<TransparencyReport>(); }
        }
    }

        // Modelos para las Causas
        public class Cause
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal GoalAmount { get; set; }
        public decimal CurrentAmount { get; set; }
        public string ImageUrl { get; set; }
    }

    // Modelos que coinciden EXACTAMENTE con las respuestas de tu AuthController
    public class LoginResult
    {
        public bool Success { get; set; }
        public string Token { get; set; }
        public int UserId { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public string Message { get; set; }
    }

    public class RegisterResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
    }

    public class Donation
    {
        public int Id { get; set; }
        public int CauseId { get; set; }
        public decimal Amount { get; set; }
        public DateTime DonationDate { get; set; }

        // <-- NUEVO: Recibimos el objeto Causa completo que nos manda el Include() de tu API
        public Cause Cause { get; set; }
    }

        public class TransparencyReport
        {
            public int Id { get; set; }
            public int CauseId { get; set; }
            public string Title { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public decimal AmountSpent { get; set; }
            public DateTime ReportDate { get; set; } // <-- CORREGIDO: Coincide con tu backend
            public string EvidenceImageUrl { get; set; } = string.Empty;
            public string Actions { get; set; } = string.Empty; // <-- Agregado para detalle profundo
            public string Beneficiaries { get; set; } = string.Empty; // <-- Agregado para detalle profundo
            public List<TransparencyImage> ExtraImages { get; set; } = new List<TransparencyImage>(); // <-- Galería integrada
        }

        public class TransparencyImage
        {
            public int Id { get; set; }
            public string ImageUrl { get; set; } = string.Empty;
            public int TransparencyReportId { get; set; }
        }
    }