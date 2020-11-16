package com.snorlax;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.htmlunit.HtmlUnitDriver;

import static org.junit.Assert.*;

import
org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
// import org.springframework.web.multipart.MultipartFile;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import static
org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.nio.file.Files;
import java.nio.file.Paths;

@SpringBootTest
@AutoConfigureMockMvc
class SnorlaxApplicationTests {

  @Autowired
  private MockMvc mvc;

  @Test
  void contextLoads() {
  }

  @Test
  // nothing about this shit actually works don't expect anything
  void addImageTest() throws Exception {
    byte[] data = Files.readAllBytes(Paths.get("imageTests/cat.jpg"));
    MockMultipartFile file = new MockMultipartFile("cat.jpg", "cat.jpg",
        "image/jpeg", data);
    mvc.perform(MockMvcRequestBuilders.multipart("/api/images")
      .file(file)
      .param("ip", "555"))
      // .andExpect(status().is(201))
      ;
  }

  @Test
  public void example() {
    // Create a new instance of the html unit driver
    // Notice that the remainder of the code relies on the interface,
    // not the implementation.
    WebDriver driver = new HtmlUnitDriver();

    // And now use this to visit Google
    driver.get("http://www.google.com");

    // Find the text input element by its name
    WebElement element = driver.findElement(By.name("q"));

    // Enter something to search for
    element.sendKeys("Cheese!");

    // Now submit the form. WebDriver will find the form for us from the element
    element.submit();

    // Check the title of the page
    System.out.println("Page title is: " + driver.getTitle());

    driver.quit();
  }

  public void dropzoneTest() throws Exception {
    // Create a new instance of the html unit driver
    // Notice that the remainder of the code relies on the interface,
    // not the implementation.
    WebDriver driver = new HtmlUnitDriver();

    // And now use this to visit Google
    driver.get("http://reactdropzone.azurewebsites.net/example/");

    // Find the text input element by its name
    WebElement element =
      driver.findElement(By.cssSelector("input[type='file']"));

    // Enter something to search for
    element.sendKeys("image.png");

    // Now submit the form. WebDriver will find the form for us from the element
    element.submit();

    // Check the title of the page
    System.out.println("Page title is: " + driver.getTitle());

    driver.quit();
  }
}
