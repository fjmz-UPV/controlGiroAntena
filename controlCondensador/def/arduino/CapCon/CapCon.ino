/*
   CON2: Control de Condensador   
*/

#include <WiFi.h>
#include <NetworkClient.h>
#include <WebServer.h>
#include <WebSocketsServer.h>
#include <ESPmDNS.h>
#include <LittleFS.h>
#include <ArduinoJson.h>


#define OK 0
//const char *ssid = "PWLB24";
//const char *password = "upqmmpmll1605";

const char *ssid = "Olimpiadas_Teleco_2.4";
const char *password = "olimpiadas";


WebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);


/*

Estructura de comandos:

{c: c, p: p, v: v}

c:0->
c: PASOS -> avanzar [p] pasos (puede ser negativo)

c: POSICION -> posicion absoluta [p]

c: PRINCIPIO -> Ir a principio 
c: FIN       -> Ir a fin

v: velocidad (pasos/s)


*/

// 📡 Manejador de eventos del WebSocket
void onWebSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED: {
      IPAddress ip = webSocket.remoteIP(num);
      Serial.printf("[%u] Conectado desde %s\n", num, ip.toString().c_str());
      webSocket.sendTXT(num, "Conexión establecida con ESP32");
      break;
    }
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Desconectado\n", num);
      break;

    case WStype_TEXT: {
      String msg = String((char*)payload);
      Serial.printf("[%u] Mensaje recibido: %s\n", num, msg.c_str());


      JsonDocument orden;
      deserializeJson(orden, msg);

      int comando   = orden["c"];
      int parametro = orden["p"];
      int velocidad = orden["v"];

      JsonDocument respuesta;
      respuesta["c"]=OK;

      String respuestaStr;
      serializeJson(respuesta, respuestaStr);
      webSocket.sendTXT(num, respuestaStr);

/*
      // Responder según el mensaje
      if (msg == "LED_ON") {
        //digitalWrite(2, HIGH);
        webSocket.sendTXT(num, "LED encendido");
      } else if (msg == "LED_OFF") {
        //digitalWrite(2, LOW);
        webSocket.sendTXT(num, "LED apagado");
      } else {
        webSocket.sendTXT(num, "Comando no reconocido");
      }
*/

      break;
    }
  }
}



void handleNotFound() {
  String message = "Fichero no encontrado\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMétodo: ";
  message += (server.method() == HTTP_GET) ? "GET" : "POST";
  message += "\nArgumentos: ";
  message += server.args();
  message += "\n";

  for (uint8_t i = 0; i < server.args(); i++) {
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }

  server.send(404, "text/plain", message);
} //handleNotFound



void setup(void) {

  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.println("");

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.print("Conectado a red ");
  Serial.println(ssid);
  Serial.print("Dirección IP: ");
  Serial.println(WiFi.localIP());

  if (!LittleFS.begin()) {
    Serial.println("Error montando LittleFS");
    return;
  }
  Serial.println("LittleFS montado correctamente");

  if (MDNS.begin("con2")) {
    Serial.println("MDNS nombre servidor activo: http://con2.local");
  }

  server.onNotFound(handleNotFound);

  server.on("/", HTTP_GET, []() {
    File file = LittleFS.open("/index.html", "r");
    if (!file) {
      server.send(404, "text/plain", "Archivo no encontrado");
      return;
    }
    server.streamFile(file, "text/html");
    file.close();
  });

  // Ejemplo: servir también CSS
  server.on("/style.css", HTTP_GET, []() {
    File file = LittleFS.open("/style.css", "r");
    if (!file) {
      server.send(404, "text/plain", "Archivo no encontrado");
      return;
    }
    server.streamFile(file, "text/css");
    file.close();
  });

  // Ejemplo: servir también JS
  server.on("/script.js", HTTP_GET, []() {
    File file = LittleFS.open("/script.js", "r");
    if (!file) {
      server.send(404, "text/plain", "Archivo no encontrado");
      return;
    }
    server.streamFile(file, "application/javascript");
    file.close();
  });


  server.begin();
  webSocket.begin();
  webSocket.onEvent(onWebSocketEvent);

  Serial.println("Servidor web/websockets iniciado");


} // setup



void loop(void) {
  server.handleClient();
    webSocket.loop();
    delay(2);  //para permitir que la CPU pueda conmutar a otras tareas
}


