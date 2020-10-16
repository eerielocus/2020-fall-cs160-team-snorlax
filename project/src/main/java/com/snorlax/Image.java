package com.uploader.aight;

import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Id;

@Data
@Entity
public class Image {
  private @Id String filename;
  private String format;
  private String uploaderId;
  private long timestamp;

  private Image() {}

  public Image(
      String filename,
      String format,
      String uploaderId,
      long timestamp) {
    this.filename = filename;
    this.format = format;
    this.uploaderId = uploaderId;
    this.timestamp = timestamp;
  }
}
