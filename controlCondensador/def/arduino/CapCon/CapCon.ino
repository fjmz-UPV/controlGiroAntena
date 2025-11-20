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


#include <AccelStepper.h>

// DRIVER: STEP + DIR
#define STEP_PIN  14
#define DIR_PIN   12

AccelStepper motor(AccelStepper::DRIVER, STEP_PIN, DIR_PIN);

#define OK 0
//const char *ssid = "PWLB24";
//const char *password = "upqmmpmll1605";

const char *ssid = "Olimpiadas_Teleco_2.4";
const char *password = "olimpiadas";

//const char *ssid = "MdP";
//const char *password = "lerelereleyole";


WebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);
uint8_t socket_num;



int velocidad; // pasos/segundo
int aceleracion; // pasos/segundo^2

int pasos;
int pasos_por_vuelta;
int micropasos;

float porcentaje_fc1;
float porcentaje_fc2;
float porcentaje_por_paso;
float max_grados;

boolean estado_fc1;
boolean estado_fc2;

void setMovimiento(int aceleracion, int velocidad) {
  motor.setAcceleration((float)aceleracion);
  motor.setMaxSpeed((float) velocidad);
  motor.setSpeed((float)velocidad);
}

void girar(int aceleracion, int velocidad) {
  setMovimiento(aceleracion, velocidad);
}


void parar(bool valor) {
  motor.stop();
}

void incPasos(int aceleracion, int velocidad, int pasos) {
  setMovimiento(aceleracion, velocidad);
  motor.move((long)pasos);
}

void gotoPasos(int aceleracion, int velocidad, int pasos) {
  setMovimiento(aceleracion, velocidad);
  motor.moveTo((long)pasos);
}





 /*
    { comando: "estado", 
      pasos: (pasos), 
      fin: true/false, 
      estado_fc1: true/false, 
      estado_fc2: true/false ,
      fin: true/false
    }
  */

void enviarEstado(bool fin) {
  JsonDocument respuesta;
  respuesta["comando"]    = "estado";
  respuesta["pasos"]      = pasos;
  respuesta["estado_fc1"] = estado_fc1;
  respuesta["estado_fc2"] = estado_fc2;
  respuesta["fin"]        = fin;
  String respuestaStr;
  serializeJson(respuesta, respuestaStr);
  webSocket.sendTXT(socket_num, respuestaStr);
  if (fin) {Serial.println(); Serial.print("Estado final: "); Serial.println(respuestaStr); }
}



  int   PASOS_POR_VUELTA_CFG    = 200;
  int   MICROPASOS_CFG          = 8;
  float MAX_GRADOS_CFG          = 80.;
  float PORCENTAJE_FC1_CFG      = 10.f;
  float PORCENTAJE_FC2_CFG      = 10.f;
  float PORCENTAJE_POR_PASO_CFG = (100.f * 360.f) / (PASOS_POR_VUELTA_CFG * MICROPASOS_CFG * MAX_GRADOS_CFG);
  float ESTADO_FC1_CFG          = true;
  float ESTADO_FC2_CFG          = true;



int porcentaje2Pasos(float porcentaje) {
  float grados = max_grados * porcentaje / 100.f;
  return grados2Pasos(grados);
}

int pasos2Porcentaje(int pasos) {
  float grados = pasos2Grados(pasos);
  return grados * 100.f / max_grados;
}

int grados2Pasos(float grados) {
    return int( round( (pasos_por_vuelta*micropasos*grados)/360.) );
}

float pasos2Grados(int pasos) {
   return (360.*pasos) / (pasos_por_vuelta*micropasos);
}

  float GRADOS_INIC              = 15.f;
  int   PASOS_INIC               = grados2Pasos(GRADOS_INIC);




/*
  motor->movil: (x) valor entero, [x] valor real
  { comando: "config", 
    pasos: (pasos), 
    pasos_por_vuelta: (pasos), 
    micropasos: (factor), 
    max_grados: [grados],
    porcentaje_fc1: [porcentaje], 
    porcentaje_fc2: [porcentaje], 
    porcentaje_por_paso: [porcentaje], 
    estado_fc1: true/false, 
    estado_fc2: true/false }
*/

void cargarConfigInicial() {
  pasos               = PASOS_INIC;
  pasos_por_vuelta    = PASOS_POR_VUELTA_CFG;
  micropasos          = MICROPASOS_CFG;
  max_grados          = MAX_GRADOS_CFG;
  porcentaje_fc1      = PORCENTAJE_FC1_CFG;
  porcentaje_fc2      = PORCENTAJE_FC2_CFG;
  porcentaje_por_paso = PORCENTAJE_POR_PASO_CFG;
  estado_fc1          = ESTADO_FC1_CFG;
  estado_fc2          = ESTADO_FC2_CFG;
}

void enviarConfig() {
  JsonDocument respuesta;
  respuesta["comando"]             = "config";
  respuesta["pasos"]               = pasos;
  respuesta["pasos_por_vuelta"]    = pasos_por_vuelta;
  respuesta["micropasos"]          = micropasos;
  respuesta["max_grados"]          = max_grados;
  respuesta["porcentaje_fc1"]      = porcentaje_fc1;
  respuesta["porcentaje_fc2"]      = porcentaje_fc2;
  respuesta["porcentaje_por_paso"] = porcentaje_por_paso;
  respuesta["estado_fc1"]          = estado_fc1;
  respuesta["estado_fc2"]          = estado_fc2;
  String respuestaStr;
  serializeJson(respuesta, respuestaStr);
  Serial.print("Configuración inicial a enviar: "); Serial.println(respuestaStr);
  webSocket.sendTXT(socket_num, respuestaStr);
}



  /*

   movil->motor: (x) valor entero
  { comando: "hola" }
  { comando: "pasos",    valor: (pasos),      velocidad: (pasos/s), aceleracion: (pasos/s^2) }
  { comando: "posicion", valor: (porcentaje), velocidad: (pasos/s), aceleracion: (pasos/s^2) }
  { comando: "giro",     valor: !=0./0.,      velocidad: (pasos/s), aceleracion: (pasos/s^2) }
  { comando: "paro",     valor: !=0./0.,      velocidad: (pasos/s), aceleracion: (pasos/s^2) }


  motor->movil: (x) valor entero, [x] valor real
  { comando: "config", 
    pasos: (pasos), 
    pasos_por_vuelta: (pasos), 
    micropasos: (factor), 
    max_grados: [grados],
    porcentaje_fc1: [porcentaje], 
    porcentaje_fc2: [porcentaje], 
    porcentaje_por_paso: [porcentaje], 
    estado_fc1: true/false, 
    estado_fc2: true/false }
    
  { comando: "estado", 
    pasos: (pasos), 
    fin: true/false, 
    fc1: true/false, 
    fc2: true/false 
  }

  */

// 📡 Manejador de eventos del WebSocket
void onWebSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  socket_num = num;
  Serial.println("Evento websocket");
  switch (type) {
    case WStype_CONNECTED: {
      IPAddress ip = webSocket.remoteIP(num);
      Serial.printf("[%u] Conectado desde %s\n", num, ip.toString().c_str());
      //webSocket.sendTXT(num, "Conexión establecida con ESP32");
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
        movil->motor: (x) valor entero
        { comando: "hola" }
        { comando: "pasos",    valor: (pasos),      velocidad: (pasos/s), aceleracion: (pasos/s^2) }
        { comando: "posicion", valor: [porcentaje], velocidad: (pasos/s), aceleracion: (pasos/s^2) }
        { comando: "giro",     valor: !=0./0.,      velocidad: (pasos/s), aceleracion: (pasos/s^2) }
        { comando: "paro",     valor: !=0./0.,      velocidad: (pasos/s), aceleracion: (pasos/s^2) }
      */

      String comando = orden["comando"];
      float valor    = orden["valor"];
      velocidad      = orden["velocidad"];
      aceleracion    = orden["aceleracion"];

      Serial.print(" comando: ");    Serial.print(comando);
      Serial.print(" valor: ");      Serial.println(valor);
      Serial.print(" velocidad: ");  Serial.print(velocidad);
      Serial.print("aceleracion: "); Serial.print(aceleracion);

      if (comando=="hola") {

        enviarConfig();

      } else if (comando=="giro") {

        girar(aceleracion, ((valor)?1:-1)*velocidad);        

      } else if (comando=="paro") {

        parar((bool)valor);

      } else if (comando=="pasos") {

        incPasos(aceleracion, velocidad, (int)valor);

      } else if (comando=="posicion") {

        gotoPasos(aceleracion, velocidad, porcentaje2Pasos(valor));

      } 
      
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


  cargarConfigInicial();
  motor.setCurrentPosition(pasos);

  server.begin();
  webSocket.begin();
  webSocket.onEvent(onWebSocketEvent);

  Serial.println("Servidor web/websockets iniciado");


} // setup


bool todavia=true;

void loop(void) {
  server.handleClient();
  webSocket.loop();

  if (motor.distanceToGo()!=0) {
    motor.run();
    pasos = motor.currentPosition();
    enviarEstado(false);
    todavia = false;
    Serial.print(".");
  } else if (!todavia) {
    todavia = true;
    pasos = motor.currentPosition();
    enviarEstado(true);
    Serial.println("Llegado!!!");
  }
  delay(2);  //para permitir que la CPU pueda conmutar a otras tareas
}


