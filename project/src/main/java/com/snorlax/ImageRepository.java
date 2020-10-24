package com.snorlax;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

// magic CRUD operations
public interface ImageRepository extends CrudRepository<Image, String> {
  Image findByFilename(@Param("filename") String filename);
}
