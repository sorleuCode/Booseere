
export const uploadToCloudinary = (
  file,
  options = {}
) => {
  return new Promise((resolve, reject) => {
    // Validate environment variables
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    
    if (!cloudName || !uploadPreset) {
      reject(new Error('Cloudinary configuration is missing. Please check your environment variables.'));
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', options.folder || 'booseere/members');

    const xhr = new XMLHttpRequest();

    // Progress tracking
    if (options.onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          options.onProgress(progress);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response.error) {
            reject(new Error(response.error.message || 'Cloudinary upload error'));
            return;
          }
          resolve({
            secure_url: response.secure_url,
            public_id: response.public_id,
            url: response.url
          });
        } catch (parseError) {
          reject(new Error('Invalid response from Cloudinary'));
        }
      } else {
        let errorMessage = 'Upload failed';
        try {
          const errorResponse = JSON.parse(xhr.responseText);
          errorMessage = errorResponse.error?.message || errorMessage;
        } catch (e) {
          errorMessage = `Upload failed with status: ${xhr.status}`;
        }
        reject(new Error(errorMessage));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload. Please check your connection.'));
    });

    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timed out. Please try again.'));
    });

    // Set timeout to 30 seconds
    xhr.timeout = 30000;
    
    xhr.open(
      'POST',
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      true
    );

    xhr.send(formData);
  });
};