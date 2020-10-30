package com.snorlax;

import org.springframework.stereotype.Controller;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;


@CrossOrigin("*")
@RestController
public class ImageController {
  private final ImageRepository repository;
  
  @Autowired
  ImageController(ImageRepository repository) {
    this.repository = repository;
  }
  

  // Receive image file data and IP address of uploader. Upload that image
  // to the database.
  // TODO: change URI to /api/image
  @PostMapping(value = "/api/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public HttpEntity<Image> uploadFile(@RequestParam MultipartFile file, @RequestParam String ip) {

    String filename = UUID.randomUUID().toString();
    String type = file.getContentType().substring(6); // strip off "image/"
    long timestamp = System.currentTimeMillis();
    int views = 0;

    Image img = new Image(filename, type, ip, timestamp, views);

    Path path = Paths.get(String.format("data/images/%s.%s", filename, type));
    Image response = null;
    try {
      file.transferTo(path);
      response = repository.save(img);
    } catch (IOException e) {
      System.err.println("Internal error: Could not download file to server.");
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
    }

    // create a link to itself
    response.add(linkTo(methodOn(ImageRepository.class)
      .findByFilename(filename))
      .withSelfRel());

    return ResponseEntity.ok().body(response);
  }
}
