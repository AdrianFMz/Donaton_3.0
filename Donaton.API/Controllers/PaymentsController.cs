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
        private readonly string _frontendUrl; // <-- NUEVO: Declaramos la variable a nivel de clase

        public PaymentsController(IConfiguration configuration)
        {
            _configuration = configuration;
            MercadoPagoConfig.AccessToken = _configuration["MercadoPago:AccessToken"];

            // <-- NUEVO: Leemos la URL desde Render. Si no existe (ej. en tu laptop), usa el localhost por defecto.
            _frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";
        }

        [HttpPost("mercadopago")]
        public async Task<IActionResult> CreateMercadoPagoPreference([FromBody] PaymentRequestDto request)
        {
            try
            {
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
                    BackUrls = new PreferenceBackUrlsRequest
                    {
                        // <-- MODIFICADO: Reemplazamos el string quemado por la variable _frontendUrl
                        Success = $"{_frontendUrl}/causas?causeId={request.CauseId}&amount={request.Amount}",
                        Failure = $"{_frontendUrl}/causas",
                        Pending = $"{_frontendUrl}/causas"
                    },
                    AutoReturn = "approved"
                };

                var client = new PreferenceClient();
                Preference preference = await client.CreateAsync(preferenceRequest);

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
                string clientId = _configuration["PayPal:ClientId"];
                string secret = _configuration["PayPal:Secret"];

                var environment = new SandboxEnvironment(clientId, secret);
                var client = new PayPalHttpClient(environment);

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
                                Value = request.Amount.ToString("0.00")
                            },
                            Description = $"Donativo a Causa #{request.CauseId}"
                        }
                    },
                    ApplicationContext = new ApplicationContext()
                    {
                        // <-- MODIFICADO: Reemplazamos el string quemado por la variable _frontendUrl
                        ReturnUrl = $"{_frontendUrl}/causas?causeId={request.CauseId}&amount={request.Amount}",
                        CancelUrl = $"{_frontendUrl}/causas",
                        UserAction = "PAY_NOW"
                    }
                };

                var paypalRequest = new OrdersCreateRequest();
                paypalRequest.Prefer("return=representation");
                paypalRequest.RequestBody(order);

                var response = await client.Execute(paypalRequest);
                var result = response.Result<Order>();

                var approveLink = result.Links.FirstOrDefault(link => link.Rel == "approve")?.Href;

                if (string.IsNullOrEmpty(approveLink))
                {
                    return BadRequest("No se pudo generar el enlace de pago de PayPal.");
                }

                return Ok(new { initPoint = approveLink });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"Error al generar el pago en PayPal: {ex.Message}");
            }
        }
    }

    public class PaymentRequestDto
    {
        public int CauseId { get; set; }
        public decimal Amount { get; set; }
    }
}