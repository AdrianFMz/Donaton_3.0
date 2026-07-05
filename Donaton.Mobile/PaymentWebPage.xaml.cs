using Donaton.Mobile.Services;

namespace Donaton.Mobile
{
    public partial class PaymentWebPage : ContentPage
    {
        private readonly Cause _cause;
        private readonly decimal _amount;
        private readonly ApiService _apiService;
        private readonly Action _onSuccess; // <-- Aquí guardaremos la función

        // <-- Modificamos el constructor para recibir el Action
        public PaymentWebPage(string paymentUrl, Cause cause, decimal amount, ApiService apiService, Action onSuccess)
        {
            InitializeComponent();
            _cause = cause;
            _amount = amount;
            _apiService = apiService;
            _onSuccess = onSuccess;

            PaymentWebView.Source = paymentUrl;
            PaymentWebView.Navigating += OnWebViewNavigating;
        }

        private async void OnWebViewNavigating(object sender, WebNavigatingEventArgs e)
        {
            if (e.Url.Contains("donaton-3-0.vercel.app"))
            {
                e.Cancel = true;
                await Navigation.PopAsync();

                if (e.Url.Contains("amount") && !e.Url.Contains("failure"))
                {
                    bool exito = await _apiService.RegistrarDonacionAsync(_cause.Id, _amount);

                    if (exito)
                    {
                        _cause.CurrentAmount += _amount;

                        // <-- ¡EJECUTAMOS EL AVISO! Esto hace que la pantalla anterior se repinte instantáneamente.
                        _onSuccess?.Invoke();

                        await Application.Current.MainPage.DisplayAlert("¡Gracias!", "Tu donación se registró y reflejó con éxito.", "OK");
                    }
                    else
                    {
                        await Application.Current.MainPage.DisplayAlert("Aviso", "Pago procesado, pero hubo un retraso al reflejarlo.", "OK");
                    }
                }
                else
                {
                    await Application.Current.MainPage.DisplayAlert("Cancelado", "El pago fue cancelado o no se completó.", "OK");
                }
            }
        }
    }
}