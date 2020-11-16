package com.snorlax;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

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

}
