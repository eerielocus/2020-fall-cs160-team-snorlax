package com.snorlax.model;

import org.springframework.data.repository.PagingAndSortingRepository;

public interface EmployeeRepository
  extends PagingAndSortingRepository<Employee, Long> {

}
