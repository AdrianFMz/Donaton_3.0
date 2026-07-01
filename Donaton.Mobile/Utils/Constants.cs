namespace Donaton.Mobile.Utils
{
    public static class Constants
    {
        // Tu puerto de la API de .NET (cámbialo si tu puerto es distinto a 7291/5137)
        // Usamos HTTP puro para evitar problemas de certificados SSL locales en los emuladores
        public static string LocalhostUrl = DeviceInfo.Platform == DevicePlatform.Android ? "http://10.0.2.2:5137" : "http://localhost:5137";

        public static string BaseApiUrl = $"{LocalhostUrl}/api";
    }
}