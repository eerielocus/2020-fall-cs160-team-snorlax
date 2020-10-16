'use strict';

const React = require('react');
const ReactDOM = require('react-dom');
const client = require('./client');
import axios from 'axios';
import Dropzone from 'react-dropzone';

// const DropZone = require('dropzone');
// const api = require('./api');
// import './api';

import {useMemo} from 'react';
import {useCallback} from 'react';
import {useDropzone} from 'react-dropzone';

const root = '/api';

class App extends React.Component {
  render() {
    return (
      <Upload />
    )
  }
}

class Upload extends React.Component {
  constructor(props) {
    super(props);
    // this.state = { selectedFile: null };
    this.onFileDrop = this.onFileDrop.bind(this);
    this.onFileChangeHandler = this.onFileChangeHandler.bind(this);
  }

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
        }).done(res => {
          console.log(res.data);
          alert("File uploaded successfully.");
        });
      })
      .catch(err => console.log(err));
  }

  onFileChangeHandler(e) {
    // console.log("k man");
    e.preventDefault();
    // this.setState({
    //   selectedFile: e.target.files[0]
    // });
    const formData = new FormData();
    // formData.append('file', this.state.selectedFile);
    formData.append('file', e.target.files[0]);

    console.log(e.target.files[0]); // perfect!

    // Options for sending the data:
    //
    // Option 1, fetch
    // fetch('http://localhost:8080/api/upload', {
    //   method: 'post',
    //   body: formData
    // }).then(res => {
    //   if(res.ok) {
    //     console.log("k man");
    //     console.log(res.data);
    //     alert("File uploaded successfully.");
    //   }
    // });

    // Option 2, client
    client({
      method: 'POST',
      path: '/api/upload',
      entity: formData,
      headers: {'Content-Type': 'multipart/form-data'}
    }).done(res => {
      console.log(res.data);
      alert("File uploaded successfully.");
    });

    // Option 3, axios
    // ok this shit has to work somehow, but I can't figure out the confusing
    // ass import and export styles of javascript. Unhelpfully, the guide
    // I'm following did not provide an example of how our ApiService is
    // imported.
    // Alright, I got it working by skipping the extra file and simply using
    // axios inline, thereby bypassing any need for import/export other than
    // importing axios itself, which they did provide the import statement for.
    // Notably, console.log(res.data) is an empty string for axios, but
    // undefined for both fetch and client.
    // axios.post("http://localhost:8080/api/upload", formData)
    //   .then(res => {
    //     console.log(res.data);
    //     alert("File uploaded successfully.")
    //   });

  }

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
