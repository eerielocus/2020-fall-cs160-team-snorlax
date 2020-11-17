import java.io.File;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.htmlunit.HtmlUnitDriver;
import org.openqa.selenium.chrome.*;

public class Tester  {
    public static void main(String[] args) {
    	System.setProperty("webdriver.chrome.driver", "chromedriver.exe");
    	File image = new File("image.jpg");
        WebDriver driver = new ChromeDriver();
        driver.get("http://localhost:8080/");

        WebElement droparea = driver.findElement(By.xpath(".//input[@type='file']"));
        // dropFile(image, droparea, driver, 0, 0);
        droparea.sendKeys("D:\\Programs\\Eclipse\\Workspace\\SnorlaxTester\\image.jpg");
        //droparea.submit();
        
        WebElement text = driver.findElement(By.xpath(".//div[@id='react']/div/div/div/text()[4]"));
        System.out.println("Contains: " + text.getText());

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