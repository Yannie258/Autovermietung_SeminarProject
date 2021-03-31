import axios from 'axios'

const API_URL = process.env.VUE_APP_API_SERVER_URL || 'http://localhost:3000/'

class UserService {
    removeFile(path) {
        return axios.delete(API_URL + 'file?path=' + path)
    }
    getImageUrl(image){
        return `${API_URL}get-image/?path=${image.path}&origName=${image.originalname}&&mimeType=${image.mimetype}`;
    }
}

export default new UserService()
