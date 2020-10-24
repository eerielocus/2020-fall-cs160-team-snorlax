package com.snorlax;

import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.Id;

import org.springframework.hateoas.RepresentationModel;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;


/**
 * An image is stored with its generated filename, format, uploader ID, and
 * timestamp of the upload (miliseconds since Jan 1, 1970).
 */
@Data
@Entity
public class Image extends RepresentationModel<Image> {
  private @Id String filename;
  private String format;
  private String uploaderIp;
  private long timestamp; // miliseconds since Jan 1, 1970

  private Image() {}

  @JsonCreator
  public Image(
      @JsonProperty("filename") String filename,
      @JsonProperty("format") String format,
      @JsonProperty("uploaderIp") String uploaderIp,
      @JsonProperty("timestamp") long timestamp) {
    this.filename = filename;
    this.format = format;
    this.uploaderIp = uploaderIp;
    this.timestamp = timestamp;
  }
}
