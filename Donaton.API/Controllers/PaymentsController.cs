using Microsoft.AspNetCore.Mvc;
using MercadoPago.Config;
using MercadoPago.Client.Preference;
using MercadoPago.Resource.Preference;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading.Tasks;
using PayPalCheckoutSdk.Core;
using PayPalCheckoutSdk.Orders;
using System.Linq;

namespace Donaton.API.Controllers // Reemplaza con tu namespace real
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public PaymentsController(IConfiguration configuration)
        {
            _configuration = configuration;

            // Inicializamos Mercado Pago con el token de tu appsettings
            MercadoPagoConfig.AccessToken = _configuration["MercadoPago:AccessToken"];
        }

        [HttpPost("mercadopago")]
        public async Task<IActionResult> CreateMercadoPagoPreference([FromBody] PaymentRequestDto request)
        {
            try
            {
                // 1. Configuramos los detalles del cobro
                var preferenceRequest = new PreferenceRequest
                {
                    Items = new List<PreferenceItemRequest>
                    {
                        new PreferenceItemRequest
                        {
                            Title = $"Donativo a Causa #{request.CauseId}",
                            Quantity = 1,
                            CurrencyId = "MXN",
                            UnitPrice = request.Amount
                        }
                    },
                    // 2. ¿A dónde vuelve el usuario tras pagar?
                    BackUrls = new PreferenceBackUrlsRequest
                    {
                        // Le pegamos las variables a la URL
                        Success = $"https://localhost:5173/causas?causeId={request.CauseId}&amount={request.Amount}",
                        Failure = "https://localhost:5173/causas",
                        Pending = "https://localhost:5173/causas"
                    },
                    AutoReturn = "approved"
                };

                // 3. Enviamos la orden a Mercado Pago
                var client = new PreferenceClient();
                Preference preference = await client.CreateAsync(preferenceRequest);

                // 4. Devolvemos el link de pago a React
                return Ok(new { initPoint = preference.InitPoint });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"Error al generar el pago: {ex.Message}");
            }
        }

        [HttpPost("paypal")]
        public async Task<IActionResult> CreatePayPalOrder([FromBody] PaymentRequestDto request)
        {
            try
            {
                // 1. Obtenemos las credenciales del appsettings
                string clientId = _configuration["PayPal:ClientId"];
                string secret = _configuration["PayPal:Secret"];

                // 2. Configuramos el entorno Sandbox de PayPal
                var environment = new SandboxEnvironment(clientId, secret);
                var client = new PayPalHttpClient(environment);

                // 3. Armamos la orden de cobro
                var order = new OrderRequest()
                {
                    CheckoutPaymentIntent = "CAPTURE",
                    PurchaseUnits = new List<PurchaseUnitRequest>()
                    {
                        new PurchaseUnitRequest()
                        {
                            AmountWithBreakdown = new AmountWithBreakdown()
                            {
                                CurrencyCode = "MXN",
                                Value = request.Amount.ToString("0.00") // PayPal requiere formato con decimales
                            },
                            Description = $"Donativo a Causa #{request.CauseId}"
                        }
                    },
                    ApplicationContext = new ApplicationContext()
                    {
                        // Le pegamos las variables a la URL
                        ReturnUrl = $"https://localhost:5173/causas?causeId={request.CauseId}&amount={request.Amount}",
                        CancelUrl = "https://localhost:5173/causas",
                        UserAction = "PAY_NOW"
                    }
                };

                var paypalRequest = new OrdersCreateRequest();
                paypalRequest.Prefer("return=representation");
                paypalRequest.RequestBody(order);

                // 4. Ejecutamos la petición a PayPal
                var response = await client.Execute(paypalRequest);
                var result = response.Result<Order>();

                // 5. PayPal nos devuelve varios enlaces, buscamos el de "approve" (donde paga el cliente)
                var approveLink = result.Links.FirstOrDefault(link => link.Rel == "approve")?.Href;

                if (string.IsNullOrEmpty(approveLink))
                {
                    return BadRequest("No se pudo generar el enlace de pago de PayPal.");
                }

                // Homologamos la respuesta para que el frontend la lea igual que Mercado Pago
                return Ok(new { initPoint = approveLink });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"Error al generar el pago en PayPal: {ex.Message}");
            }
        }
    }

    // Un DTO sencillo para recibir los datos desde React
    public class PaymentRequestDto
    {
        public int CauseId { get; set; }
        public decimal Amount { get; set; }
    }
}