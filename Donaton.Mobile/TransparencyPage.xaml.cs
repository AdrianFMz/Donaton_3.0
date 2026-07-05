using Donaton.Mobile.Services;

namespace Donaton.Mobile
{
    public partial class TransparencyPage : ContentPage
    {
        private readonly ApiService _apiService;

        public TransparencyPage(ApiService apiService)
        {
            InitializeComponent();
            _apiService = apiService;
        }

        protected override async void OnAppearing()
        {
            base.OnAppearing();

            var reports = await _apiService.GetTransparencyReportsAsync();
            ReportsCollectionView.ItemsSource = reports;
        }

        private async void OnVerDetalleClicked(object sender, EventArgs e)
        {
            var button = sender as Button;
            var reportSeleccionado = button?.CommandParameter as TransparencyReport;

            if (reportSeleccionado != null)
            {
                await Navigation.PushAsync(new TransparencyDetailPage(reportSeleccionado));
            }
        }
    }
}