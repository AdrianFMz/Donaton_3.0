using Donaton.Mobile.Services;

namespace Donaton.Mobile
{
    public partial class DonationHistoryPage : ContentPage
    {
        private readonly ApiService _apiService;

        public DonationHistoryPage(ApiService apiService)
        {
            InitializeComponent();
            _apiService = apiService;
        }

        protected override async void OnAppearing()
        {
            base.OnAppearing();

            // Cargamos el historial cada vez que la pantalla aparece
            var history = await _apiService.GetHistorialDonacionesAsync();
            HistoryCollectionView.ItemsSource = history;
        }
    }
}