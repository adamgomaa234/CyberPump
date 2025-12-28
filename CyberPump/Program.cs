using System;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Add controllers (API)
builder.Services.AddControllers();

// 2. Add database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("Default")));

var app = builder.Build();

// 3. Middleware
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseAuthorization();

// 4. Map API endpoints
app.MapControllers();

app.Run();

