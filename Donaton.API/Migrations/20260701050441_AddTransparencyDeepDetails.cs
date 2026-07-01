using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Donaton.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTransparencyDeepDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Actions",
                table: "TransparencyReports",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Beneficiaries",
                table: "TransparencyReports",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "TransparencyImages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ImageUrl = table.Column<string>(type: "text", nullable: false),
                    TransparencyReportId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransparencyImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TransparencyImages_TransparencyReports_TransparencyReportId",
                        column: x => x.TransparencyReportId,
                        principalTable: "TransparencyReports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TransparencyImages_TransparencyReportId",
                table: "TransparencyImages",
                column: "TransparencyReportId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TransparencyImages");

            migrationBuilder.DropColumn(
                name: "Actions",
                table: "TransparencyReports");

            migrationBuilder.DropColumn(
                name: "Beneficiaries",
                table: "TransparencyReports");
        }
    }
}
