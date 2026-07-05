using Microsoft.Extensions.Logging;

namespace Donaton.Mobile
{
    public static class MauiProgram
    {
        public static MauiApp CreateMauiApp()
        {
            var builder = MauiApp.CreateBuilder();
            builder
                .UseMauiApp<App>()
                .ConfigureFonts(fonts =>
                {
                    fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                    fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
                });

#if DEBUG
    		builder.Logging.AddDebug();
#endif

            // Registramos el servicio y la página principal
            // Registramos el servicio principal
            builder.Services.AddSingleton<Donaton.Mobile.Services.ApiService>();

            // Registramos todas las pantallas de la app
            builder.Services.AddTransient<LoginPage>();
            builder.Services.AddTransient<RegisterPage>();
            builder.Services.AddTransient<MainPage>();

            // Registramos la App en sí misma para poder inyectarle la pantalla de inicio
            builder.Services.AddSingleton<App>();

            return builder.Build();
        }
    }
}
