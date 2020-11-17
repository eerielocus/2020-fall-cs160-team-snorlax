package com.snorlax;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import org.springframework.boot.test.context.SpringBootTest;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.htmlunit.HtmlUnitDriver;

// import static org.junit.Assert.*;

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
import java.util.stream.StreamSupport;

import com.snorlax.ImageRepository;
import com.snorlax.Image;

@SpringBootTest
@AutoConfigureMockMvc
class SnorlaxApplicationTests {

  @Autowired
  private MockMvc mvc;

  @Autowired
  private ImageRepository repository;

  @Test
  void contextLoads() {
  }

  @Test
  void addImageTest() throws Exception {
    byte[] data = Files.readAllBytes(Paths.get("imageTests/cat.jpg"));
    MockMultipartFile file = new MockMultipartFile("cat.jpg", "cat.jpg",
        "image/jpeg", data);
    mvc.perform(MockMvcRequestBuilders.multipart("/api/images")
      .file(file)
      .param("ip", "555"))
      .andExpect(status().is(201))
      ;
  }

  @Test
  void dataNotMissingTest() throws Exception {
    StreamSupport.stream(repository.findAll().spliterator(), false)
      .map(Image::getData)
      .forEach(data -> assertTrue(data != null && data.length != 0))
      ;
  }

  @Test
  void formatNotMissingTest() throws Exception {
    StreamSupport.stream(repository.findAll().spliterator(), false)
      .map(Image::getFormat)
      .forEach(format -> assertTrue(format != null
            && "image/".equals(format.substring(0, 6))))
      ;
  }

  @Test
  void ipNotMissingTest() throws Exception {
    StreamSupport.stream(repository.findAll().spliterator(), false)
      .map(Image::getUploaderIp)
      .forEach(ip -> assertTrue(ip != null && !"".equals(ip)))
      ;
  }

  @Test
  void viewsNotNegativeTest() throws Exception {
    StreamSupport.stream(repository.findAll().spliterator(), false)
      .mapToInt(Image::getViews)
      .forEach(views -> assertTrue(views != 0))
      ;
  }
}
