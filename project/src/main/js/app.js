'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const client = require('./client');
import Dropzone from 'react-dropzone';

const root = '/api';

// For now, just ask for the upload.
class App extends React.Component {
  render() {
    return (
      <Upload />
    )
  }
}

// Upload an image to the server with a drag and drop box
class Upload extends React.Component {
  constructor(props) {
    super(props);
    this.onFileDrop = this.onFileDrop.bind(this);
  }

  // When someone drops a file in, lookup their IP address, then send the
  // file information and their IP address to the server.
  onFileDrop(inputFile) {
    fetch("https://api.ipify.org?format=json")
      .then(response => {
        return response.json();
      }, "jsonp")
      .then(res => {
        const formData = new FormData();
        formData.append('file', inputFile[0]);
        formData.append('ip', res.ip);
        console.log(inputFile);
        console.log(res.ip);

        client({
          method: 'POST',
          path: '/api/upload',
          entity: formData,
          headers: {'Content-Type': 'multipart/form-data'}
        }).then(res => {
          // res.entity is the key to find this image. We can now look that
          // image up to find more information about it.
          console.log(res.entity);

          // this is just for handy feedback. I expect that we won't have
          // such an annoying feature in the finished product.
          alert("File uploaded successfully.");
        }).catch(err => console.log(err))
      }).catch(err => console.log(err));
  }

  // render a dropzone box that accepts any type of image.
  // Dropzone handles file uploads in a drag and drop style. The look can be
  // modified by changing .fileDrop in src/main/resources/static/main.css
  render() {
    return(
      <Dropzone
        accept="image/*"
        onDrop={this.onFileDrop}
      >
        {({getRootProps, getInputProps}) => (
          <section>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <div className='fileDrop'>
                Drag a file here or click to upload.
              </div>
            </div>
          </section>
        )}
      </Dropzone>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('react')
)
