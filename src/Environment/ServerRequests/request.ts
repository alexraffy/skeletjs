
import {isDefined} from "mentatjs";
import * as http from "http";
import * as https from "https";
import {IHTTPRequestDelegate} from "./IHTTPRequestDelegate";
import {ServerRequestURI_BaseURI} from "../ServerCommands";
import {Session} from "../../Session/Session";
import {SkLogger} from "../../Logging/SkLogger";



function HTTPRequestMultiPart(uri: string, params: FormData, delegate: IHTTPRequestDelegate, requestBinary: boolean = false) {

    let postData = params
    const options = {
        hostname: "localhost",
        port: 1040,
        path: uri,
        method: "POST",
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    };
    const req = http.request(options, (res) => {
        let result = "";
        let resultBinary = [];
        //console.log(`STATUS: ${res.statusCode}`);
        //console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        //res.setEncoding('utf8');
        if (requestBinary === true) {
            res.setEncoding('binary');
        }

        res.on('data', (chunk) => {
            if (requestBinary === true) {
                //let buf = Buffer.from([], "binary");
                resultBinary.push(Buffer.from(chunk, 'binary'));
                //resultBinary.push(chunk);
            } else {
                result += chunk;
            }
        });
        res.on('end', () => {
            if (requestBinary === true) {
                var buf = Buffer.concat(resultBinary);
                if (isDefined(delegate.binaryData)) {
                    delegate.binaryData(buf);
                }
            } else {
                if (isDefined(delegate.data)) {
                    delegate.data(result);
                }
            }

        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
        delegate.error(e);
    });

// Write data to request body
    req.write(postData);
    req.end();

}


export function HTTPRawRequest(uri: string, extraHeaders: {[key: string]: string}, raw: Uint8Array, delegate: IHTTPRequestDelegate) {
    let requestBinary: boolean = true;

    let postData = new Blob([new Uint8Array(raw.buffer, raw.byteOffset, raw.length)]);

    const options = {
        hostname: "localhost",
        port: 80,
        path: uri,
        method: "POST",
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Length': raw.length
        }
    };
    for (let key in extraHeaders) {
        options.headers[key] = extraHeaders[key];
    }

    const req = http.request(options, (res) => {
        let result = "";
        let resultBinary = [];
        //console.log(`STATUS: ${res.statusCode}`);
        //console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        //res.setEncoding('utf8');
        if (requestBinary === true) {
            res.setEncoding('binary');
        }

        res.on('data', (chunk) => {
            if (requestBinary === true) {
                //let buf = Buffer.from([], "binary");
                resultBinary.push(Buffer.from(chunk, 'binary'));
                //resultBinary.push(chunk);
            } else {
                result += chunk;
            }
        });
        res.on('end', () => {
            if (requestBinary === true) {
                var buf = Buffer.concat(resultBinary);
                if (isDefined(delegate.binaryData)) {
                    delegate.binaryData(buf);
                }
            } else {
                if (isDefined(delegate.data)) {
                    delegate.data(result);
                }
            }

        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
        delegate.error(e);
    });

// Write data to request body
    req.write(raw,"binary");
    req.end();
}


export function HTTPRequest(uri: string, method: "GET" | "POST", params: any, delegate: IHTTPRequestDelegate, requestBinary: boolean = false) {
    if (method === "GET") {
        return HTTPRequestDEPREC(uri, "GET", params, delegate);
    }
    let postData = JSON.stringify(params);
    const options = {
        hostname: "skelet.app",
        port: 443,
        path: uri,
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Skelet-Session': JSON.stringify(Session.instance.sessionInfo),
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    let httpOrHttps = undefined;
    httpOrHttps = https;
    if (isDefined(process)) {
        if (isDefined(process.env.SKELETAPI_HOST)) {
            options.hostname = process.env.SKELETAPI_HOST;

        }
        if (isDefined(process.env.SKELETAPI_PORT)) {
            options.port = parseInt(process.env.SKELETAPI_PORT);
            httpOrHttps = http;
        }
        SkLogger.write(options.hostname+":" + options.port + uri);
    }


    const req = httpOrHttps.request(options, (res) => {
        let result = "";
        let resultBinary = [];
        //console.log(`STATUS: ${res.statusCode}`);
        //console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        //res.setEncoding('utf8');
        if (requestBinary === true) {
            res.setEncoding('binary');
        }

        res.on('data', (chunk) => {
            if (requestBinary === true) {
                //let buf = Buffer.from([], "binary");
                resultBinary.push(Buffer.from(chunk, 'binary'));
                //resultBinary.push(chunk);
            } else {
                result += chunk;
            }
        });
        res.on('end', () => {
            if (requestBinary === true) {
                var buf = Buffer.concat(resultBinary);
                if (isDefined(delegate.binaryData)) {
                    delegate.binaryData(buf);
                }
            } else {
                if (isDefined(delegate.data)) {
                    delegate.data(result);
                }
            }

        });
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
        delegate.error(e);
    });

// Write data to request body
    req.write(postData);
    req.end();

}


export function HTTPRequestDEPREC(uri: string, method: "GET" | "POST", params: any, delegate: IHTTPRequestDelegate) {
    let url = ServerRequestURI_BaseURI + uri;

    if (isDefined(process)) {
        if (isDefined(process.env.SKELETAPI_HOST)) {
            url = "http://" + process.env.SKELETAPI_HOST + ":" + process.env.SKELETAPI_PORT + uri;
        }
    }


    let fetch = http.request(url, function(res) {
        let result = ""
        res.on('data', (chunk) => {
            result += chunk;
            if (isDefined(delegate.progress)) {
                if (isDefined(res.headers["content-length"])) {
                    let fullSize = parseFloat(res.headers["content-length"]);
                    let perc = parseInt((result.length / fullSize * 100).toString());
                    delegate.progress(perc);
                }
            }
        });

        res.on('end', function(chunk) {
            delegate.data(result);
        });
    });
    fetch.method = method;

    fetch.on('error', function(e) {
        console.log("error..........");
        console.log(e);
        delegate.error(e);
    });
    if (method === "POST") {
        let data = JSON.stringify(params);

        fetch.setHeader("Content-Type","application/json");
        //fetch.setHeader("Content-Length", data.length)

        fetch.write(data);
    }
    fetch.end();
}



