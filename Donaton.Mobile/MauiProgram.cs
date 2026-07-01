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
            builder.Services.AddSingleton<Donaton.Mobile.Services.ApiService>();
            builder.Services.AddTransient<MainPage>();

            return builder.Build();
        }
    }
}
