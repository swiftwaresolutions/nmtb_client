class DateUtils extends Date {
    private dd;
    private mm;
    private yyyy;
    private hh;
    private MM;
    private ss;
    constructor(dateString: any = "") {
        super(dateString && dateString.trim() ? dateString : new Date().toISOString());
        this.dd = String(this.getDate() || 0).padStart(2, '0');
        this.mm = String(this.getMonth() + 1 || 0).padStart(2, '0');
        this.yyyy = this.getFullYear() || "0000";
        this.hh = String(this.getHours() || 0).padStart(2, '0');
        this.MM = String(this.getMinutes() || 0).padStart(2, '0');
        this.ss = String(this.getSeconds() || 0).padStart(2, '0');
    }
    public dateFormat(dateFormat: string | undefined) {
        if (dateFormat === "YYYY-MM-DD") {
            return `${this.yyyy}-${this.mm}-${this.dd}`
        }
        else if (dateFormat === "YYYY/MM/DD") {
            return `${this.dd}/${this.mm}/${this.yyyy}`
        }
        else if (dateFormat === "YYYY/MM/DD") {
            return `${this.dd}/${this.mm}/${this.yyyy}`
        }
        return `${this.dd}-${this.mm}-${this.yyyy}`
    }
    public timeFormat(timeFormat: string) {
        if (timeFormat === "HH:MM:SS") {
            return `${this.hh}:${this.MM}:${this.ss}`
        } else if (timeFormat === "HH:MM") {
            return `${this.hh}:${this.MM}`
        }
        console.error("Time format wrong")
    }
    public getISODate() {
        return `${this.dd}-${this.mm}-${this.yyyy} ${this.hh}:${this.MM}`
    }
    public getISODateWithSeconds() {
        return `${this.dd}-${this.mm}-${this.yyyy} ${this.hh}:${this.MM}:${this.ss}`
    }

}

export { DateUtils }