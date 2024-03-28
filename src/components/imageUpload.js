import React, { useState, useRef } from 'react';
import axios from 'axios';

function ImageUpload() {
    const [files, setFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [uploadProgress, setUploadProgress] = useState([]);
    const [uploadStatus, setUploadStatus] = useState([]);
    const dropRef = useRef(null);


    const handleFileChange = (event) => {
        setFiles([...files, ...event.target.files]);
        setPreviewUrls([...previewUrls, ...Array.from(event.target.files).map(file => URL.createObjectURL(file))]);
        handleUpload([...files, ...event.target.files]);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const droppedFiles = [...event.dataTransfer.files];
        setFiles([...files, ...droppedFiles]);
        setPreviewUrls([...previewUrls, ...Array.from(droppedFiles).map(file => URL.createObjectURL(file))]);
        handleUpload([...files, ...droppedFiles]);
    };

    const handleUpload = async (filesToUpload) => {
        const uploadPromises = filesToUpload.map((file, index) => {
            const formData = new FormData();
            formData.append('image', file);
    
            return axios({
                method: 'post',
                url: `https://api.imgbb.com/1/upload?expiration=600&key=2d684c8aa8ee2b5120ed6b7533f0b920`,
                data: formData,
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(prevProgress => ({
                        ...prevProgress,
                        [file.name]: percentCompleted,
                    }));
                },
            });
        });
    
        Promise.all(uploadPromises)
            .then(responses => {
                setUploadStatus(responses.map(response => response.data.success ? 'Upload successful' : 'Upload failed'));
            })
            .catch(error => {
                console.error('Error uploading images: ', error);
                setUploadStatus(filesToUpload.map(() => 'Upload failed'));
            });
    };

    return (
        <div>
            <div ref={dropRef} onDragOver={handleDragOver} onDrop={handleDrop} style={{ display: 'flex', flexDirection: 'column',justifyContent: 'center',alignItems: 'center', border: '2px dashed #D3D3D3', padding: '10px', width:'70%', height: '200px'}}>
                <input type="file" onChange={handleFileChange} multiple />
            </div>
            {files.map((file, index) => (
                <div key={index} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'q0px', border: '1px solid #D3D3D3', margin: '5px', borderRadius:'5px',width:'40%',}}>
                    {previewUrls[index] && <img src={previewUrls[index]} alt="Preview" style={{width: '50px', height: '50px', marginLeft: '10px', padding: '10px'}} />}
                    <p>{file.name}</p>
                    {uploadStatus[index] !== 'Upload successful' && uploadProgress[file.name] < 100 && <progress value={uploadProgress[file.name]} max="100" />}
                    <p>{uploadStatus[index]}</p>
                </div>
            ))}
        </div>
    );
}

export default ImageUpload;