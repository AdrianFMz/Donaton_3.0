using Donaton.Mobile.Services;

namespace Donaton.Mobile
{
    public partial class RegisterPage : ContentPage
    {
        private readonly ApiService _apiService;

        public RegisterPage(ApiService apiService)
        {
            InitializeComponent();
            _apiService = apiService;
        }

        private async void OnRegisterClicked(object sender, EventArgs e)
        {
            if (string.IsNullOrWhiteSpace(NameEntry.Text) || string.IsNullOrWhiteSpace(EmailEntry.Text) || string.IsNullOrWhiteSpace(PasswordEntry.Text))
            {
                await DisplayAlert("Atención", "Todos los campos son obligatorios.", "OK");
                return;
            }

            var boton = sender as Button;
            boton.IsEnabled = false;

            // Pasamos el NameEntry como Username
            var result = await _apiService.RegisterAsync(NameEntry.Text.Trim(), EmailEntry.Text.Trim(), PasswordEntry.Text.Trim());

            boton.IsEnabled = true;

            if (result.Success)
            {
                // Mostrará: "Usuario registrado exitosamente."
                await DisplayAlert("¡Excelente!", result.Message, "OK");
                await Navigation.PopAsync();
            }
            else
            {
                // Mostrará: "El correo ya está registrado." u otros errores
                await DisplayAlert("Error", result.Message, "OK");
            }
        }
    }
}