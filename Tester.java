import java.io.File;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.htmlunit.HtmlUnitDriver;
import org.openqa.selenium.remote.RemoteWebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Wait;

import com.gargoylesoftware.htmlunit.javascript.background.JavaScriptExecutor;

import org.openqa.selenium.chrome.ChromeDriver;

public class Tester  {
    public static void main(String[] args) {
        // Create a new instance of the html unit driver
        // Notice that the remainder of the code relies on the interface,
        // not the implementation.
    	/*
        WebDriver driver = new HtmlUnitDriver();

        // And now use this to visit react dropzone.
        driver.get("http://reactdropzone.azurewebsites.net/example/");

        // Find the text input element by its name
        // Currently not able to find
        WebElement element = driver.findElement(By.cssSelector("input[type='file']"));

        // Enter something to upload
        element.sendKeys("image.png");

        // Now submit the form. WebDriver will find the form for us from the element
        element.submit();

        // Check the title of the page
        // Default printout, will need to change to confirm
        System.out.println("Page title is: " + driver.getTitle());

        driver.quit();
        */
    	File image = new File("image.jpg");
        WebDriver driver = new HtmlUnitDriver();
        driver.get("https://react-dropzone.js.org/");

        WebElement droparea = driver.findElement(By.cssSelector("div[data-preview='Basic example'] [style]"));
        dropFile(image, droparea, driver, 0, 0);
        // droparea.sendKeys("image.jpg");

        driver.quit();
    }
    
    public static void dropFile(File filePath, WebElement target, WebDriver driver, int offsetX, int offsetY) {
        if (!filePath.exists())
            throw new WebDriverException("File not found: " + filePath.toString());

        JavascriptExecutor jse = (JavascriptExecutor) driver;

        String JS_DROP_FILE =
                "var target = arguments[0]," +
                        "    offsetX = arguments[1]," +
                        "    offsetY = arguments[2]," +
                        "    document = target.ownerDocument || document," +
                        "    window = document.defaultView || window;" +
                        "" +
                        "var input = document.createElement('INPUT');" +
                        "input.type = 'file';" +
                        "input.style.display = 'none';" +
                        "input.onchange = function () {" +
                        "  var rect = target.getBoundingClientRect()," +
                        "      x = rect.left + (offsetX || (rect.width >> 1))," +
                        "      y = rect.top + (offsetY || (rect.height >> 1))," +
                        "      dataTransfer = { files: this.files };" +
                        "" +
                        "  ['dragenter', 'dragover', 'drop'].forEach(function (name) {" +
                        "    var evt = document.createEvent('MouseEvent');" +
                        "    evt.initMouseEvent(name, !0, !0, window, 0, 0, 0, x, y, !1, !1, !1, !1, 0, null);" +
                        "    evt.dataTransfer = dataTransfer;" +
                        "    target.dispatchEvent(evt);" +
                        "  });" +
                        "" +
                        "  setTimeout(function () { document.body.removeChild(input); }, 25);" +
                        "};" +
                        "document.body.appendChild(input);" +
                        "return input;";

        WebElement input = (WebElement) jse.executeScript(JS_DROP_FILE, target, offsetX, offsetY);
        input.sendKeys(filePath.getAbsoluteFile().toString());
        // Wait.until(ExpectedConditions.stalenessOf(input));
    }
}