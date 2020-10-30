package com.snorlax;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.hateoas.RepresentationModel;

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
  private String uploaderIp;
  private long timestamp; // miliseconds since Jan 1, 1970
  private int views;

  private Image() {}

  @JsonCreator
  public Image(
      @JsonProperty("filename") String filename,
      @JsonProperty("format") String format,
      @JsonProperty("uploaderIp") String uploaderIp,
      @JsonProperty("timestamp") long timestamp,
      @JsonProperty("views") int views) {
    this.filename = filename;
    this.format = format;
    this.uploaderIp = uploaderIp;
    this.timestamp = timestamp;
    this.views = views;
  }
}
