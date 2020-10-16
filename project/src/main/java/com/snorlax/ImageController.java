package com.uploader.aight;

import org.springframework.stereotype.Controller;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;

import java.util.UUID;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;


@CrossOrigin("*")
@RestController
public class ImageController {
  private final ImageRepository repository;

  ImageController(ImageRepository repository) {
    this.repository = repository;
  }

  // private static final Logger logger =
    // LoggerFactory.getLogger(ApiController.class);

  // Receive image file data and IP address of uploader. Upload that image
  // to the database.
  @PostMapping(value = "/api/upload",
    consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<String> uploadFile(@RequestParam MultipartFile file,
      @RequestParam String ip) {

    // logger.info(String.format("File name '%s' uploaded successfully.",
    //   file.getOriginalFilename()));

    String filename = UUID.randomUUID().toString();
    String type = file.getContentType().substring(6); // strip off "image/"
    long timestamp = System.currentTimeMillis();

    Image img = new Image(filename, type, ip, timestamp);

    Path path = Paths.get(String.format("data/images/%s.%s", filename, type));
    try {
      file.transferTo(path);
      repository.save(img);
    } catch (IOException e) {
      System.err.println("Internal error: Could not download file to server.");
    }

    return ResponseEntity
      .ok()
      .contentType(MediaType.TEXT_PLAIN)
      .body(filename);
  }
}
