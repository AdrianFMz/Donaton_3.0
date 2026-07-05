using Donaton.Mobile.Services;

namespace Donaton.Mobile
{
    public partial class LoginPage : ContentPage
    {
        private readonly ApiService _apiService;

        public LoginPage(ApiService apiService)
        {
            InitializeComponent();
            _apiService = apiService;
        }

        private async void OnLoginClicked(object sender, EventArgs e)
        {
            if (string.IsNullOrWhiteSpace(EmailEntry.Text) || string.IsNullOrWhiteSpace(PasswordEntry.Text))
            {
                await DisplayAlert("Atención", "Por favor ingresa tu correo y contraseña.", "OK");
                return;
            }

            var boton = sender as Button;
            boton.IsEnabled = false;

            // Llamamos a tu API
            var result = await _apiService.LoginAsync(EmailEntry.Text.Trim(), PasswordEntry.Text.Trim());

            boton.IsEnabled = true;

            if (result.Success)
            {
                // 1. Guardamos el Gafete (JWT) de forma ultra segura
                await SecureStorage.Default.SetAsync("jwt_token", result.Token);

                // 2. Guardamos datos básicos para la interfaz gráfica
                Preferences.Set("UsuarioNombre", result.Name);
                Preferences.Set("UsuarioId", result.UserId);

                // 3. Pasamos al catálogo de causas
                Application.Current.MainPage = new NavigationPage(new MainPage(_apiService));
            }
            else
            {
                // Mostrará exactamente lo que mande tu API ("Usuario no encontrado.", etc)
                await DisplayAlert("Error", result.Message, "OK");
            }
        }

        private async void OnGoToRegisterTapped(object sender, TappedEventArgs e)
        {
            await Navigation.PushAsync(new RegisterPage(_apiService));
        }
    }
}