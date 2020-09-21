# Snorlax software architecture prototype
This is a relatively simple connection of React, Spring Boot REST, and H2.
The database is just a throwaway example using employees for simplicity.

Run the server by using command: ./mvnw spring-boot:run
Visit localhost:8080 on a browser to see how React has rendered the page.
Use curl localhost:8080/api to view the api data structure

For now, you can manually add entries to the database using the command:
curl -X POST localhost:8080/api/employees -d "{\"firstName\": \"Bilbo\", \"lastName\": \"Baggins\", \"description\": \"burglar\"}" -H "Content-Type:application/json"
