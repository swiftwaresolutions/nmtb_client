
const isDev: boolean = process.env.NODE_ENV !== 'production';

// const hostAddress = isDev ? "192.168.1.60" : "192.168.251.150"    //  window.location.hostname
const hostAddress = isDev ? "192.168.1.20" : "192.168.251.150"    //  window.location.hostname

let routerBaseUrl = "/nmtb";

const himsConfig = {
  hospitalFullName: process.env.REACT_APP_HOSPITAL_FULL_NAME || "NIGHTINGALE MEDICAL TRUST",  
  hospitalShortName: process.env.REACT_APP_HOSPITAL_SHORT_NAME || "NMTB",
  apiBaseName : process.env.REACT_APP_API_BASE_URL || "http://localhost:9090"
};

export { routerBaseUrl,isDev, hostAddress };

export default himsConfig;
