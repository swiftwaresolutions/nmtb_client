import HttpClientWrapper from "../http-client-wrapper"

export class AppApiService {

    private httpWrapper: HttpClientWrapper;

    constructor() {
        this.httpWrapper = new HttpClientWrapper();
    }

    public fetchOrganizationDetails = async () => {
        try {
            let url = '/v1/fetchOrganizationDetails';
            const response: any = await this.httpWrapper.get(url);
            return response;
        } catch (error: any) {
            throw error
        }
    }
    public fetchClinicalModuleDetails = async () => {
        try {
            let url = '/v1/fetchClinicalModuleDetails';
            const response: any = await this.httpWrapper.get(url);
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public getModulesByUser = async (userId : number) => {
        try {
            let url = `/v1/fetchModuleForUser/${userId}`;
            const response: any = await this.httpWrapper.get(url);
            return response;
        } catch (error: any) {
            throw error
        }
    }

    public getSubModules = async (moduleId : number) => {
        try {
            let url = '/v1/fetchSubModule';
            url = url + "/" + moduleId;
            const response: any = await this.httpWrapper.get(url);
            return response;
        } catch (error: any) {
            throw error
        }
    }
   
}