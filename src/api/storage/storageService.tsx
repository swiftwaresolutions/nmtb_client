export class StorageService {
    TOKENKEY="token";
    ROLEID_KEY="roleId";

    public setToken(token: string) {
        if (!token) {
            return;
        }
        window.sessionStorage.setItem(this.TOKENKEY, token);
    }

    public getToken() {
        return window.sessionStorage.getItem(this.TOKENKEY);
    }

    public clearToken = () => {
        window.sessionStorage.removeItem(this.TOKENKEY);
        window.sessionStorage.removeItem(this.ROLEID_KEY);
    }

    public setRoleId(roleId: number) {
        window.sessionStorage.setItem(this.ROLEID_KEY, String(roleId));
    }

    public getRoleId(): number | null {
        const val = window.sessionStorage.getItem(this.ROLEID_KEY);
        return val !== null ? Number(val) : null;
    }
}

