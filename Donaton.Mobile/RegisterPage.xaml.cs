using Donaton.Mobile.Services;
using System.Text.RegularExpressions;

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
            if (string.IsNullOrWhiteSpace(NameEntry.Text) ||
                string.IsNullOrWhiteSpace(EmailEntry.Text) ||
                string.IsNullOrWhiteSpace(PasswordEntry.Text) ||
                string.IsNullOrWhiteSpace(ConfirmPasswordEntry.Text))
            {
                await DisplayAlert("Atención", "Todos los campos son obligatorios.", "OK");
                return;
            }

            string passwordRegexPattern = @"^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$";

            if (!Regex.IsMatch(PasswordEntry.Text, passwordRegexPattern))
            {
                await DisplayAlert("Contraseña débil", "La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo.", "Entendido");
                return;
            }

            if (PasswordEntry.Text != ConfirmPasswordEntry.Text)
            {
                await DisplayAlert("Atención", "Las contraseñas no coinciden.", "OK");
                return;
            }

            var boton = sender as Button;
            boton.IsEnabled = false;

            // NUEVO: Limpiamos espacios y forzamos minúsculas antes de enviarlo
            string correoNormalizado = EmailEntry.Text.Trim().ToLowerInvariant();

            // Pasamos el correo ya procesado a la API
            var result = await _apiService.RegisterAsync(NameEntry.Text.Trim(), correoNormalizado, PasswordEntry.Text.Trim());

            boton.IsEnabled = true;

            if (result.Success)
            {
                await DisplayAlert("¡Excelente!", result.Message, "OK");
                await Navigation.PopAsync();
            }
            else
            {
                await DisplayAlert("Error", result.Message, "OK");
            }
        }
    }
}