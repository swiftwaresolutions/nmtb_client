import axios, { AxiosInstance } from "axios";
import himsConfig from "../himsConfig";
import { StorageService } from "./storage/storageService";
import { routerBaseUrl } from "../himsConfig";
import { store } from "../state/store";
import { authLogout } from "../login/components/state/loginSlice";

let isHandlingUnauthorized = false;

class ApiConfig {

    private baseURL: string;

    private apiBaseUrl: string;

    private storageService: StorageService = new StorageService();

    private axiosInstance: AxiosInstance;

    constructor() {
        this.baseURL = himsConfig.apiBaseName;
        this.apiBaseUrl = this.baseURL + '/api/';
        this.axiosInstance = axios.create({ baseURL: this.getApiBaseURL() });
        this.attachInterceptors();
    }

    private getApiBaseURL = () => {
        return this.apiBaseUrl;
    }

    private attachInterceptors = () => {

        this.axiosInstance.interceptors.request.use(
            (config) => {
                const token = this.storageService.getToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.axiosInstance.interceptors.response.use(
            (response) => {
                const authHeader = response.headers["authorization"] || response.headers["Authorization"];
                if (authHeader?.startsWith("Bearer ")) {
                    this.storageService.setToken(authHeader.substring(7));
                }
                return response;
            },
            (error) => {
                if (error.response?.status === 401) {
                    if (!isHandlingUnauthorized) {
                        isHandlingUnauthorized = true;
                        store.dispatch(authLogout());
                        window.location.href = routerBaseUrl + "/login";
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    public getAxiosInstance = () => {
        return this.axiosInstance;
    }

}
export default ApiConfig;
