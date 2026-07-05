using Microsoft.Extensions.DependencyInjection;

namespace Donaton.Mobile
{
    public partial class App : Application
    {
        public App(LoginPage loginPage)
        {
            InitializeComponent();

            // Forzamos a que la app inicie en la pantalla de Login
            MainPage = new NavigationPage(loginPage);
        }
    }
}