# Snorlax software architecture prototype
This is a relatively simple connection of React, Spring Boot REST, and H2.<br />
The database is just a throwaway example using employees for simplicity.<br />

Run the server by using command: ./mvnw spring-boot:run<br />
Visit localhost:8080 on a browser to see how React has rendered the page.<br />
Use curl localhost:8080/api to view the api data structure<br />

For now, you can manually add entries to the database using the command:<br />
curl -X POST localhost:8080/api/employees -d "{\"firstName\": \"Bilbo\", \"lastName\": \"Baggins\", \"description\": \"burglar\"}" -H "Content-Type:application/json"

This prototype was put together using this guide:
https://spring.io/guides/tutorials/react-and-spring-data-rest/
