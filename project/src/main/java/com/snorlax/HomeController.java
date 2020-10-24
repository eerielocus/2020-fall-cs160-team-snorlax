package com.snorlax;

import org.springframework.stereotype.Controller;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@Controller
public class HomeController {
  @RequestMapping(value = "/")
  public String index() {
    return "index";
  }

}

