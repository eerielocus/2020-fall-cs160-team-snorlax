package com.snorlax;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Lob;
import javax.persistence.Id;


/**
 * An image is stored with its generated filename, format, uploader ID, and
 * timestamp of the upload (miliseconds since Jan 1, 1970).
 */
@Data
@Entity
public class Image {
  @JsonProperty("id")
  private @Id @GeneratedValue Long id;

  @JsonProperty("data")
  private @Lob byte[] data;

  @JsonProperty("format")
  private String format;

  @JsonProperty("uploaderIp")
  private String uploaderIp;

  @JsonProperty("timestamp")
  private long timestamp;

  @JsonProperty("views")
  private int views;

  private Image() {}

  @JsonCreator
  public Image(
      byte[] data,
      String format,
      String uploaderIp,
      long timestamp,
      int views) {
    this.data = data;
    this.format = format;
    this.uploaderIp = uploaderIp;
    this.timestamp = timestamp;
    this.views = views;
  }
}
