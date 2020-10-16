package com.uploader.aight;

import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Id;

/**
 * An image is stored with its generated filename, format, uploader ID, and
 * timestamp of the upload (miliseconds since Jan 1, 1970).
 */
@Data
@Entity
public class Image {
  private @Id String filename;
  private String format;
  private String uploaderId;
  private long timestamp; // miliseconds since Jan 1, 1970

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
