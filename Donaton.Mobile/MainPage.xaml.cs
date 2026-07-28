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

            decimal totalRecaudado = 0;

            // 1. Buscamos el valor más alto (meta o recaudado) para saber cuál será el tope de nuestra gráfica
            decimal maxValor = causes.Any() ? causes.Max(c => Math.Max(c.GoalAmount, c.CurrentAmount)) : 1;
            if (maxValor == 0) maxValor = 1; // Evitamos dividir por cero

            double alturaMaximaGrafica = 150.0; // La gráfica medirá 150 píxeles de alto

            foreach (var cause in causes)
            {
                totalRecaudado += cause.CurrentAmount;

                if (!string.IsNullOrEmpty(cause.ImageUrl) && !cause.ImageUrl.StartsWith("http"))
                {
                    cause.ImageUrl = Constants.BaseUrl + cause.ImageUrl;
                }

                // 2. MAGIA: Calculamos el porcentaje de altura que le toca a cada barra
                cause.ChartRecaudadoHeight = (double)(cause.CurrentAmount / maxValor) * alturaMaximaGrafica;
                cause.ChartMetaHeight = (double)(cause.GoalAmount / maxValor) * alturaMaximaGrafica;

                // Le damos un mínimo de 2 píxeles para que la barra nunca desaparezca por completo
                if (cause.ChartRecaudadoHeight < 2) cause.ChartRecaudadoHeight = 2;
                if (cause.ChartMetaHeight < 2) cause.ChartMetaHeight = 2;
            }

            // Inyectamos el total Histórico idéntico a la Web
            LblTotalHistorico.Text = $"${totalRecaudado:N2}";

            // Alimentamos el listado de tarjetas
            CausesCollectionView.ItemsSource = causes;

            // Alimentamos nuestra nueva Gráfica XAML
            BindableLayout.SetItemsSource(ChartBindableLayout, causes);
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