using Donaton.Mobile.Services;

namespace Donaton.Mobile
{
    public partial class TransparencyDetailPage : ContentPage
    {
        public TransparencyDetailPage(TransparencyReport report)
        {
            InitializeComponent();

            // Mapeo directo de elementos base
            EvidenceImage.Source = report.EvidenceImageUrl;
            TitleLabel.Text = report.Title;
            DateLabel.Text = report.ReportDate.ToString("dd 'de' MMMM, yyyy");
            AmountLabel.Text = $"${report.AmountSpent:N2} MXN";
            DescriptionLabel.Text = report.Description;

            // Mapeo de detalles profundos (si están vacíos, colocamos un texto de marcador de posición)
            ActionsLabel.Text = string.IsNullOrWhiteSpace(report.Actions) ? "No se especificaron acciones adicionales." : report.Actions;
            BeneficiariesLabel.Text = string.IsNullOrWhiteSpace(report.Beneficiaries) ? "No se especificó información de beneficiarios." : report.Beneficiaries;

            // Administramos el carrusel de la galería secundaria
            if (report.ExtraImages != null && report.ExtraImages.Count > 0)
            {
                ExtraImagesCarousel.ItemsSource = report.ExtraImages;
            }
            else
            {
                // Si no hay fotos extra, ocultamos el título de la galería y el componente de carrusel
                GalleryTitle.IsVisible = false;
                ExtraImagesCarousel.IsVisible = false;
            }
        }
    }
}