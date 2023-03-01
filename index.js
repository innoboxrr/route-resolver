let routes = {};

let baseUrl = window.location.hostname;

export function setRoutes(newRoutes) {

    routes = newRoutes;

}

export function setBaseUrl(newUrl = undefined) {

    baseUrl = (newUrl != undefined) ? newUrl : baseUrl;

}

export default function(name, ...args) {

    if (routes[name] === undefined) {
    
        console.error(`Unknown route ${name}`);
    
    } else {
    
        return `//${baseUrl}/${routes[name].split('/').map(s => s[0] == '{' ? args.shift() : s).join('/')}`;
    
    }

}

