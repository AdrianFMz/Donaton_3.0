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

            // Concatenamos la IP local para que el emulador pueda descargar la imagen del backend
            foreach (var cause in causes)
            {
                if (!string.IsNullOrEmpty(cause.ImageUrl) && !cause.ImageUrl.StartsWith("http"))
                {
                    cause.ImageUrl = Constants.LocalhostUrl + cause.ImageUrl;
                }
            }

            // Inyectamos la lista en la interfaz
            CausesCollectionView.ItemsSource = causes;
        }
    }
}