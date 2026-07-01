using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Donaton.API.Migrations
{
    /// <inheritdoc />
    public partial class AddGalleriesAndTransparency : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CauseImages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ImageUrl = table.Column<string>(type: "text", nullable: false),
                    CauseId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CauseImages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TransparencyReports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CauseId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    AmountSpent = table.Column<decimal>(type: "numeric", nullable: false),
                    ReportDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EvidenceImageUrl = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TransparencyReports", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Donations_CauseId",
                table: "Donations",
                column: "CauseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Donations_Causes_CauseId",
                table: "Donations",
                column: "CauseId",
                principalTable: "Causes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Donations_Causes_CauseId",
                table: "Donations");

            migrationBuilder.DropTable(
                name: "CauseImages");

            migrationBuilder.DropTable(
                name: "TransparencyReports");

            migrationBuilder.DropIndex(
                name: "IX_Donations_CauseId",
                table: "Donations");
        }
    }
}
