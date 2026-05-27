import HttpClientWrapper from "../http-client-wrapper"

export class LoginApiService {

    private httpWrapper: HttpClientWrapper;

    constructor() {
        this.httpWrapper = new HttpClientWrapper();
    }

    public loginUser = async (payload: any) => {
        try {
            let url = '/v1/login';
            const response: any = await this.httpWrapper.post(url, payload);
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public changePassword = async (payload: any) => {
        try {
            let url = '/v1/change-password';
            const response: any = await this.httpWrapper.post(url, payload);
            return response;
        } catch (error: any) {
            throw error
        }
    }
    
    public getMe = async () => {
        try {
            let url = '/v1/getLoginUser';
            const response: any = await this.httpWrapper.get(url);
            return response;
        } catch (error: any) {
            throw error
        }
    }
}