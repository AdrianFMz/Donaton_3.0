using Donaton.Mobile.Services;
using Donaton.Mobile.Utils;

namespace Donaton.Mobile
{
    public partial class MainPage : ContentPage
    {
        private readonly ApiService _apiService;

        public MainPage(ApiService apiService)
        {
            InitializeComponent();
            _apiService = apiService;
        }

        // Este método se ejecuta automáticamente cada vez que la pantalla aparece
        protected override async void OnAppearing()
        {
            base.OnAppearing();
            await CargarCausas();
        }

        private async Task CargarCausas()
        {
            var causes = await _apiService.GetCausesAsync();

            // Concatenamos la URL de Render para que el celular descargue la imagen de la nube
            foreach (var cause in causes)
            {
                if (!string.IsNullOrEmpty(cause.ImageUrl) && !cause.ImageUrl.StartsWith("http"))
                {
                    // AQUÍ ESTÁ EL CAMBIO: Usamos BaseUrl en lugar de LocalhostUrl
                    cause.ImageUrl = Constants.BaseUrl + cause.ImageUrl;
                }
            }

            // Inyectamos la lista en la interfaz
            CausesCollectionView.ItemsSource = causes;
        }

        private async void OnDonarClicked(object sender, EventArgs e)
        {
            var button = sender as Button;
            var causeSeleccionada = button?.CommandParameter as Cause;

            if (causeSeleccionada != null)
            {
                // Viajamos a la nueva pantalla y le entregamos los datos de la causa elegida
                await Navigation.PushAsync(new CauseDetailPage(causeSeleccionada));
            }
        }

        private async void OnHistorialClicked(object sender, EventArgs e)
        {
            await Navigation.PushAsync(new DonationHistoryPage(_apiService));
        }

        private async void OnTransparenciaClicked(object sender, EventArgs e)
        {
            await Navigation.PushAsync(new TransparencyPage(_apiService));
        }
    }
}