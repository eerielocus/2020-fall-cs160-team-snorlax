package com.snorlax;

import org.springframework.stereotype.Controller;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import java.net.URI;

import java.util.Collection;
import java.util.UUID;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;


@CrossOrigin("*")
@RestController
// @RequestMapping("/api/images")
public class ImageController {
  private final ImageRepository repository;

  @Autowired
  ImageController(ImageRepository repository) {
    this.repository = repository;
  }


  // Receive image file data and IP address of uploader. Upload that image
  // to the database.
  @PostMapping(value = "/api/images",
    consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public HttpEntity<Image> uploadFile(@RequestParam MultipartFile file,
      @RequestParam String ip) {

    byte[] data = null;
    try {
      data = file.getBytes();
    } catch (IOException e) {
      System.err.println("Internal error: Could not upload file to server.");
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }

    String type = file.getContentType();
    long timestamp = System.currentTimeMillis();
    int views = 0;

    Image img = new Image(data, type, ip, timestamp, views);
    Image response = repository.save(img);

    URI location =
      ServletUriComponentsBuilder.fromCurrentRequest().build().toUri();

    return ResponseEntity
      .created(location)
      .body(response);
  }

  // Get the first image blob in our database. This is just for testing.
  @GetMapping(value = "/api/images/test")
  public HttpEntity<byte[]> getFirstImage() {
    if (repository.count() == 0) {
      return ResponseEntity.ok(new byte[0]);
    }

    Image images = repository.findById(1L).get();
    return ResponseEntity
      .ok()
      .body(images.getData());
  }

  // Get the blob of this image.
  @GetMapping(value = "api/images/blob/{id}")
  public HttpEntity<byte[]> getBlob(@PathVariable Long id) {
    byte[] data = repository.findById(id)
      .map(Image::getData)
      .orElse(new byte[0]);

    return ResponseEntity
      .ok()
      .body(data);
  }
}
