const ws = require("ws");

if (process.argv.length < 3) {
    console.error("First argument should be the server URL (websocket scheme) to which this script should connect.");
    process.exit();
} 

let serverURL = process.argv[2];
let maxAPI;
try {
    maxAPI = require("max-api");
} catch (e) {
    console.log("Outside of Max — running in debug mode");
}

let client; // = new ws(serverURL);;

function connect() {
    client = new ws(serverURL);
    client.on("open", () => {
        console.log(`Connected successfully to ${serverURL}`);
        if (maxAPI) {
            maxAPI.outlet(["readyState", client.readyState]);
        }
    });

    client.on("error", (err) => {
        console.log(err);
        if (maxAPI) {
            maxAPI.outlet(["readyState", client.readyState]);
        }
    });

    client.on("close", () => {
        console.log(`Disconnected`);
        if (maxAPI) {
            maxAPI.outlet(["readyState", client.readyState]);
        }
    });

    client.on("message", (data) => {
        if (maxAPI) {
            try {
                maxAPI.outlet(JSON.parse(data));
            } catch (e) {
                maxAPI.post(e.toString());
            }
        } else {
            console.log(data);
        }
    });
}

connect();

if (maxAPI) {
    maxAPI.addHandler("reset", () => {
        if (client) {
            client.close();
            connect();
        }
    });

    maxAPI.addHandler(maxAPI.MESSAGE_TYPES.ALL, (handled, ...args) => {
        if (!handled) {
            try {
                if (args.length > 1) {
                    client.send(JSON.stringify(args));
                } else {
                    client.send(JSON.stringify(args[0]));
                }
            } catch (e) {
                maxAPI.post(e.toString());
            }
        }
    });
} else {
    setInterval(() => {
        client.send(JSON.stringify(`Message ${Date.now()}`));
    }, 1000);
}
