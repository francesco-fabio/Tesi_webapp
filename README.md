# Tesi_webapp
bachelor degree project in computer engineering

## Hardware - ESP32 WROOM and MAX30102
The firmware used for the ESP32 is the `ESP32_GENERIC-20241129-v1.24.1.bin`.

The wiring of the MAX30102 is:

|MAX30102|ESP32|
|----|----|
|Vin |5V|
|SDA|Pin 21|
|SCL|Pin 22|
|GND|GND|

make sure to add the `SSD` and `Password` in the `file main.py` at line 55.
make sure to set the `SERVER_URL` variable in the file `main.py` at line 64 to point at the backend server.

P.S.
It takes some time to the sensor to adjust the values, at first they will be quite low.
Make sure to keep your finger still and wait.

## Database - tested with MySQL 8.0.27
create an instance of MySQL server and make sure it can be accessed by the backend before you run the WebApp.

## Server - built and tested with Node JS v.22.14.0
it consists of 2 different services:

- backend: takes care of the communication between the frontend and the ESP32
- db_api: allows the frontend to fetch info from the database

make sure to add a default.json file in the config folder of both services. It must be structured like this:
```
{
    "table": "sensor_data",
    "batchSize": 500,
    "dbConfig": {
        "host": "",
        "user": "",
        "password": "",
        "database": "smart_oximeter",
        "port": 3306
    }
}

```

the first service creates the database when it tries to use it in case it doesn't exist. For the api service make sure that the database exists before you run the service.

After downloading the modules, run `npm -i` to add the dependencies.

## Frontend - tested using LiveServer and Google Chrome
After the MySQL server and the two services that make the backend are up and running, open the index.html file to start using the WebApp

P.S if you use VS Code with LiveServer, make sure to exclude the `.csv` files in your `settings.json` in the `.vscode` folder placed in the root directory of your project. Every recording generates a `.csv` file and the new file will make the services refresh in VS Code if LiveServer is running.
