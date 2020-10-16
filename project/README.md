# Snorlax project
Drag and drop an image to upload it to the database.<br />

Run the server by using command: ./mvnw spring-boot:run<br />
On Windows, use mvnw.cmd instead<br />

Visit localhost:8080 on a browser to see how React has rendered the page.
You can upload an image on this page. Nothing is preloaded into the database,
but with an image uploaded, you can navigate to it with the API.<br/>

Visit localhost:8080/api to view the API datastructure. You can follow the
links to find any uploaded images, so for instance, localhost:8080/api/images
will show you the list of images in the database. You can navigate to a
particular image by visiting its self link (this does not display the image, it
merely shows the API of that particular image).<br />

Note that right now, there is no way to actually view an image in the database
(to be implemented).
