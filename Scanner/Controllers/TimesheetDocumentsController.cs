using Microsoft.AspNetCore.Mvc;

namespace Scanner.Controllers;

public class TimesheetDocumentsController : Controller
{
    public IActionResult Files()
    {
        return View();
    }

    public IActionResult Timesheets()
    {
        return View();
    }
}
