import { AxiosInstance } from "axios";
import ApiConfig from "./api-config";
import { StorageService } from "./storage/storageService";
class HttpClientWrapper {

    private axiosClient: AxiosInstance;

    constructor() {
        this.axiosClient = new ApiConfig().getAxiosInstance();
    }

    public post = async (path: string, payload: any) => {
        // console.log("HttpClientWrapper post() start path = '" + path + "', payload = " + JSON.stringify(payload));
        try {
            let response: any = await this.axiosClient.post(path, payload, this.getJsonHeaderConfig());
            // console.log("HttpClientWrapper post() response data " + JSON.stringify(response.data));
            // console.log("HttpClientWrapper post() end");
            return response.data;
        } catch (err: any) {
            console.error("HttpClientWrapper post() error=== " + JSON.stringify(err));
            throw err;
        }
    }

    public get = async (path: string) => {
        // console.log("HttpClientWrapper get() start path = " + path);
        try {
            let response: any = await this.axiosClient.get(path, this.getJsonHeaderConfig());
            // console.log("HttpClientWrapper get() response data " + JSON.stringify(response.data));
            // console.log("HttpClientWrapper get() end path = " + path);
            return response.data;
        } catch (err: any) {
            console.log("HttpClientWrapper get() error=== " + JSON.stringify(err));
            throw err;
        }
    }

    public put = async (path: string, payload?: any) => {
        // console.log("HttpClientWrapper put() start path = " + path);
        try {
            let response: any = await this.axiosClient.put(path, payload, this.getJsonHeaderConfig());
            // console.log("HttpClientWrapper put() response data " + JSON.stringify(response.data));
            // console.log("HttpClientWrapper put() end path = " + path);
            return response.data;
        } catch (err: any) {
            console.log("HttpClientWrapper put() error=== " + JSON.stringify(err));
            throw err;
        }
    }

    public delete = async (path: string) => {
        console.log("HttpClientWrapper delete() start path = " + path);
        try {
            let response: any = await this.axiosClient.delete(path, this.getJsonHeaderConfig());
            console.log("HttpClientWrapper delete() response data " + JSON.stringify(response));
            console.log("HttpClientWrapper delete() end path = " + path);
            return response.data;
        } catch (err: any) {
            console.log("HttpClientWrapper delete() error=== " + JSON.stringify(err));
            throw err;
        }
    }

    public postFormData = async (path: string, formData: FormData) => {
        console.log("HttpClientWrapper post() start path = '" + path + "'");
        try {
            let response: any = await this.axiosClient.post(path, formData, this.getFormDataHeaderConfig());
            console.log("HttpClientWrapper post() end path = '" + path + "'");
            return response.data;
        } catch (err: any) {
            console.log("HttpClientWrapper post() error=== " + JSON.stringify(err));
            throw err;
        }
    }

    public putFormData = async (path: string, formData: FormData) => {
        console.log("HttpClientWrapper post() start path = '" + path + "'");
        try {
            let response: any = await this.axiosClient.put(path, formData, this.getFormDataHeaderConfig());
            console.log("HttpClientWrapper post() end path = '" + path + "'");
            return response.data;
        } catch (err: any) {
            console.log("HttpClientWrapper post() error=== " + JSON.stringify(err));
            throw err;
        }
    }

    getFormDataHeaderConfig = () => {
        return this.getHeaderConfig('multipart/form-data');
    }

    getHeaderConfig = (contentType: string) => {
        let headers: any = {};

        headers['Content-Type'] = contentType;
       
        return { headers: headers }
    }

    getJsonHeaderConfig = () => {
        return this.getHeaderConfig('application/json');
    }
}
export default HttpClientWrapper;