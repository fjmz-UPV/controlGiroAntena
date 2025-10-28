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
#include <Ticker.h>

#define OK 0
//const char *ssid = "PWLB24";
//const char *password = "upqmmpmll1605";

const char *ssid = "Olimpiadas_Teleco_2.4";
const char *password = "olimpiadas";


WebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);

#define RANGO_GRADOS 180
#define GRADOS_INICIALES 92
float gradosObjetivo; 
float gradosActuales; 

#define PASOS_POR_VUELTA 200
#define MICROPASOS 1
int pasosObjetivo;
int pasosActuales;

int grados2Pasos(float grados) {
    return int( (PASOS_POR_VUELTA*MICROPASOS*grados)/360. );
}

float pasos2Grados(int pasos) {
   return (360.*pasos) / (PASOS_POR_VUELTA*MICROPASOS);
}

Ticker temporizador;
int contador = 0;
void accionPasoPaso() {
  contador++;
  Serial.print("Ejecutando acción. contador: ");
  Serial.println(contador);
  if (contador==5) {
    temporizador.detach();
  }
}

/*

Estructura de comandos:

      

  { aceleracion: a, velocidad: v, movimiento: "paro/pasos"/"posicion"/"giro" valor: pasos/posicion/(+/-1)}  



*/

// 📡 Manejador de eventos del WebSocket
void onWebSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  Serial.printf("Evento websocket");
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

      
  /*
  { aceleracion: a, velocidad: v, movimiento: "hola/paro/pasos"/"posicion"/"giro" valor: pasos/posicion/(+/-1)}  
  */

      int aceleracion = orden["aceleracion"];
      int velocidad = orden["velocidad"];
      String movimiento = orden["movimiento"];
      int valor = orden["valor"];
      
      Serial.print("aceleracion: "); Serial.print(aceleracion);
      Serial.print(" velocidad: "); Serial.print(velocidad);
      Serial.print(" movimiento: "); Serial.print(movimiento);
      Serial.print(" valor: "); Serial.println(valor);


      if (movimiento=="hola") {

      } else if (movimiento=="giro") {
        
      } else if (movimiento=="paro") {

      } else if (movimiento=="paso") {
        pasosObjetivo = pasosActuales + valor;
        gradosObjetivo = pasos2Grados(pasosObjetivo);
      } else if (movimiento=="posicion") {
        gradosObjetivo = gradosActuales + valor;
        pasosObjetivo = grados2Pasos(gradosObjetivo);
      } 

      if (pasosObjetivo!=pasosActuales) {
        contador=0;
        temporizador.attach(1.0, accionPasoPaso); 
      }

      JsonDocument respuesta;
      respuesta["resultado"]="OK";
      respuesta["grados"]=gradosObjetivo;
      respuesta["pasos"]=pasosObjetivo;

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


  gradosObjetivo = GRADOS_INICIALES;
  gradosActuales = GRADOS_INICIALES;
  pasosObjetivo = grados2Pasos(gradosObjetivo); 
  pasosActuales = grados2Pasos(gradosActuales);

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


