using Donaton.Mobile.Services;

namespace Donaton.Mobile
{
    public partial class CauseDetailPage : ContentPage
    {
        private Cause _cause;
        private readonly ApiService _apiService;

        public CauseDetailPage(Cause cause)
        {
            InitializeComponent();
            _cause = cause;
            _apiService = new ApiService(); // Instanciamos el servicio

            CargarDatos();
        }

        private void CargarDatos()
        {
            HeroImage.Source = _cause.ImageUrl;
            TitleLabel.Text = _cause.Title;
            DescriptionLabel.Text = _cause.Description;
            GoalLabel.Text = $"${_cause.GoalAmount:N2}";
            CurrentLabel.Text = $"${_cause.CurrentAmount:N2}";
        }

        private async void OnMercadoPagoClicked(object sender, EventArgs e)
        {
            if (!ValidarMonto(out decimal monto)) return;

            BtnMercadoPago.IsEnabled = false;
            BtnMercadoPago.Text = "Cargando...";

            string initPoint = await _apiService.GenerarPagoMercadoPagoAsync(_cause.Id, monto);

            BtnMercadoPago.IsEnabled = true;
            BtnMercadoPago.Text = "Mercado Pago";

            ProcesarRedireccion(initPoint, monto);
        }

        private async void OnPayPalClicked(object sender, EventArgs e)
        {
            if (!ValidarMonto(out decimal monto)) return;

            BtnPayPal.IsEnabled = false;
            BtnPayPal.Text = "Cargando...";

            string initPoint = await _apiService.GenerarPagoPayPalAsync(_cause.Id, monto);

            BtnPayPal.IsEnabled = true;
            BtnPayPal.Text = "PayPal";

            ProcesarRedireccion(initPoint, monto);
        }

        // Método auxiliar para validar que el input sea un número correcto
        private bool ValidarMonto(out decimal monto)
        {
            if (string.IsNullOrWhiteSpace(MontoEntry.Text) || !decimal.TryParse(MontoEntry.Text, out monto) || monto <= 0)
            {
                DisplayAlert("Atención", "Por favor ingresa un monto válido mayor a 0.", "OK");
                monto = 0;
                return false;
            }
            return true;
        }

        // <-- NUEVO: Forzar a la pantalla a repintar los datos cuando regresas del pago
        protected override void OnAppearing()
        {
            base.OnAppearing();
            CargarDatos();
        }


        // Método auxiliar para abrir nuestro navegador interno
        // <-- MODIFICADO: Ahora pasamos el objeto _cause completo en lugar de solo el ID
        private async void ProcesarRedireccion(string url, decimal monto)
        {
            if (!string.IsNullOrEmpty(url))
            {
                // Pasamos una función (Callback) que se ejecutará solo si el pago fue un éxito
                await Navigation.PushAsync(new PaymentWebPage(url, _cause, monto, _apiService, () =>
                {
                    // Obligamos al hilo de la interfaz gráfica a repintar los números con el nuevo monto
                    MainThread.BeginInvokeOnMainThread(() =>
                    {
                        CargarDatos();
                    });
                }));
            }
            else
            {
                await DisplayAlert("Error", "No se pudo generar el enlace de pago. Intenta de nuevo.", "OK");
            }
        }
    }
}