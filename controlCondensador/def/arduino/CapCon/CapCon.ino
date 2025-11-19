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

#define MAX_GRADOS 90
#define GRADOS_INICIALES 40
float gradosObjetivo; 
float gradosActuales; 

#define PASOS_POR_VUELTA 200
#define MICROPASOS 8
int MAX_PASOS = round( (MAX_GRADOS*PASOS_POR_VUELTA*MICROPASOS)/360.0 );
int pasosObjetivo;
int pasosActuales;

int velocidad; // pasos/segundo
int aceleracion; // pasos/segundo^2

int grados2Pasos(float grados) {
    return int( round( (PASOS_POR_VUELTA*MICROPASOS*grados)/360.) );
}

float pasos2Grados(int pasos) {
   return (360.*pasos) / (PASOS_POR_VUELTA*MICROPASOS);
}

Ticker temporizador;
Ticker temporizadorGiro;
int contador = 0;

uint8_t socket_num;
float inc_t = 0.1;

void accionPasoPaso() {

  bool fin=false;

  Serial.print("pasosObjetivo: "); Serial.println(pasosObjetivo);
  Serial.print("pasosActuales: "); Serial.println(pasosActuales);

  if (pasosObjetivo > pasosActuales) {
    Serial.println("pasosObjetivo > pasosActuales");
    pasosActuales += velocidad*inc_t;
    Serial.print("Tras incremento, pasosObjetivo: "); Serial.println(pasosObjetivo);
    if (pasosActuales > pasosObjetivo) {
      pasosActuales = pasosObjetivo;
    }
  }

  if (pasosObjetivo < pasosActuales) {
    Serial.println("pasosObjetivo < pasosActuales");
    pasosActuales -= velocidad*inc_t;
    Serial.print("Tras decremento, pasosObjetivo: "); Serial.println(pasosObjetivo);
    if (pasosActuales < pasosObjetivo) {
      pasosActuales = pasosObjetivo;
    }
  }

  if (pasosActuales == pasosObjetivo) {
    fin = true;
    temporizador.detach();
    Serial.println("Objetivo alcanzado");
  }

  enviarEstado(fin);

}

bool sentido;

void girar_() {
    bool fin = false;
    if (sentido) {
      pasosActuales += velocidad*inc_t;
      if (pasosActuales>MAX_PASOS) {
        pasosActuales=MAX_PASOS; 
        fin = true; 
      }
    } else {
      pasosActuales -= velocidad*inc_t;
      if (pasosActuales<0) {
        pasosActuales=0;
        fin = true;
      }
    }
    pasosObjetivo = pasosActuales;
    enviarEstado(fin);
}

void setMovimiento(int aceleracion, int velocidad) {
  motor.setAcceleration((float)aceleracion);
  motor.setMaxSpeed((float) velocidad);
  motor.setSpeed((float)velocidad);
}

void girar(int aceleracion, int velocidad) {
  setMovimiento(aceleracion, velocidad);
}


void parar_() {
   temporizadorGiro.detach();
   enviarEstado(true);
}

void parar() {
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


int pasos;
int pasos_por_vuelta;
int micropasos;
float porcentaje_fc1;
float porcentaje_fc2;
float porcentaje_por_paso;
float grados;
boolean estado_fc1;
boolean estado_fc2;


 // { comando: "estado", pasos: (pasos), fin: true/false, estado_fc1: false/true, estado_fc2: false/true }


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
}

/*
void enviarEstado__(bool fin) {
  JsonDocument respuesta;
  respuesta["op"]="estado";
  respuesta["MAX_GRADOS"]=MAX_GRADOS;
  respuesta["pasos"]=motor.currentPosition();
  respuesta["grados"]=pasos2Grados(respuesta["pasos"]);  
  respuesta["fc1"]=false;
  respuesta["fc2"]=false;
  respuesta["fin"]= fin;
  String respuestaStr;
  serializeJson(respuesta, respuestaStr);
  //Serial.print("Estado a enviar: "); Serial.println(respuestaStr);
  webSocket.sendTXT(socket_num, respuestaStr);
}

void enviarEstado_(bool fin) {
  JsonDocument respuesta;
  respuesta["op"]="estado";
  respuesta["MAX_GRADOS"]=MAX_GRADOS;
  respuesta["grados"]=pasos2Grados(pasosActuales);
  respuesta["pasos"]=pasosActuales;
  respuesta["fc1"]=false;
  respuesta["fc2"]=false;
  respuesta["fin"]= fin;
  String respuestaStr;
  serializeJson(respuesta, respuestaStr);
  Serial.print("Estado a enviar: "); Serial.println(respuestaStr);
  webSocket.sendTXT(socket_num, respuestaStr);
}
*/

/*
  motor->movil: (x) valor entero, [x] valor real
  { comando: "config", 
    pasos: (pasos), 
    pasos_por_vuelta: (pasos), 
    micropasos: (factor), 
    porcentaje_fc1: [porcentaje], 
    porcentaje_fc2: [porcentaje], 
    porcentaje_por_paso: [porcentaje], 
    fc1: false/true, 
    fc2: false/true }
*/


  float GRADOS_INIC              = 0.f;
  float GRADOS                   = 90.f; 
  int   PASOS_INIC               = 45;
  int   PASOS_POR_VUELTA_INIC    = 200;
  int   MICROPASOS_INIC          = 8;
  float PORCENTAJE_FC1_INIC      = 10.f;
  float PORCENTAJE_FC2_INIC      = 10.f;
  float PORCENTAJE_POR_PASO_INIC = (100.f * 360.f) / (PASOS_POR_VUELTA_INIC * MICROPASOS * GRADOS);
  float ESTADO_FC1_INIC          = true;
  float ESTADO_FC2_INIC          = true;

void cargarConfigInicial() {
  pasos               = PASOS_INIC;
  pasos_por_vuelta    = PASOS_POR_VUELTA_INIC;
  micropasos          = MICROPASOS_INIC;
  porcentaje_fc1      = PORCENTAJE_FC1_INIC;
  porcentaje_fc2      = PORCENTAJE_FC2_INIC;
  porcentaje_por_paso = PORCENTAJE_POR_PASO_INIC;
  grados              = GRADOS;
  estado_fc1          = ESTADO_FC1_INIC;
  estado_fc2          = ESTADO_FC2_INIC;
}

void enviarConfig() {
  JsonDocument respuesta;
  respuesta["comando"]             = "config";
  respuesta["pasos"]               = pasos;
  respuesta["pasos_por_vuelta"]    = pasos_por_vuelta;
  respuesta["micropasos"]          = micropasos;
  respuesta["porcentaje_fc1"]      = porcentaje_fc1;
  respuesta["porcentaje_fc2"]      = porcentaje_fc2;
  respuesta["porcentaje_por_paso"] = porcentaje_por_paso;
  respuesta["grados"]              = grados;
  respuesta["estado_fc1"]          = estado_fc1;
  respuesta["estado_fc2"]          = estado_fc2;
  String respuestaStr;
  serializeJson(respuesta, respuestaStr);
  Serial.print("Saludo a enviar: "); Serial.println(respuestaStr);
  webSocket.sendTXT(socket_num, respuestaStr);
}

/*
void enviarSaludo() {
  JsonDocument respuesta;
  respuesta["op"]="hola";
  respuesta["MAX_GRADOS"]=MAX_GRADOS;
  respuesta["GRADOS_INICIALES"]=GRADOS_INICIALES;
 
  respuesta["PASOS_POR_VUELTA"]=PASOS_POR_VUELTA;
  respuesta["MICROPASOS"]=MICROPASOS;
  respuesta["pasos"]=motor.currentPosition();
  respuesta["grados"]=pasos2Grados(respuesta["pasos"]);
  respuesta["fc1"]=false;
  respuesta["fc2"]=false;
  String respuestaStr;
  serializeJson(respuesta, respuestaStr);
  Serial.print("Saludo a enviar: "); Serial.println(respuestaStr);
  webSocket.sendTXT(socket_num, respuestaStr);
}

void enviarSaludo_() {
  JsonDocument respuesta;
  respuesta["op"]="hola";
  respuesta["MAX_GRADOS"]=MAX_GRADOS;
  respuesta["GRADOS_INICIALES"]=GRADOS_INICIALES;
  respuesta["PASOS_POR_VUELTA"]=PASOS_POR_VUELTA;
  respuesta["MICROPASOS"]=MICROPASOS;
  respuesta["pasos"]=motor.currentPosition();
  respuesta["grados"]=pasos2Grados(respuesta["pasos"]);
  respuesta["fc1"]=false;
  respuesta["fc2"]=false;
  String respuestaStr;
  serializeJson(respuesta, respuestaStr);
  Serial.print("Saludo a enviar: "); Serial.println(respuestaStr);
  webSocket.sendTXT(socket_num, respuestaStr);
}
*/

  /*
  { a: aceleracion, v: velocidad, movimiento: "paro/pasos"/"posicion"/"giro" valor: pasos/posicion/(+/-1)}  

  { a: aceleracion, v: velocidad, c: comando ("hola"/"estado"/"paro"/"pasos"/"posicion"/"giro"), valor: pasos/posicion/(+/-1)}

  movil->motor: (x) valor entero
  { comando: "hola" }
  { comando: "pasos",    valor: (pasos),      velocidad: (pasos/s), aceleracion: (pasos/s^2) }
  { comando: "giro",     valor: +1/-1,        velocidad: (pasos/s), aceleracion: (pasos/s^2) }
  { comando: "posicion", valor: (porcentaje), velocidad: (pasos/s), aceleracion: (pasos/s^2) }
  { comando: "paro",     valor: true/false,   velocidad: (pasos/s), aceleracion: (pasos/s^2) }


  motor->movil: (x) valor entero, [x] valor real
  { comando: "config", pasos: (pasos), grados_fc1: [grados], grados_fc2: [grados], pasos_rev: (pasos), micropasos: (factor), fc1: false/true, fc2: false/true }

  { comando: "estado", pasos: (pasos), fin: true/false, fc1: false/true, fc2: false/true }

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
      { comando: "hola" }
      { comando: "pasos",    valor: (pasos),      velocidad: (pasos/s), aceleracion: (pasos/s^2) }
      { comando: "giro",     valor: +1/-1,        velocidad: (pasos/s), aceleracion: (pasos/s^2) }
      { comando: "posicion", valor: (porcentaje), velocidad: (pasos/s), aceleracion: (pasos/s^2) }
      { comando: "paro",     valor: true/false,   velocidad: (pasos/s), aceleracion: (pasos/s^2) }
    */

      String comando = orden["comando"];
      float valor    = orden["valor"];
      aceleracion    = orden["aceleracion"];
      velocidad      = orden["velocidad"];

      
      Serial.print("aceleracion: "); Serial.print(aceleracion);
      Serial.print(" velocidad: ");  Serial.print(velocidad);
      Serial.print(" movimiento: "); Serial.print(comando);
      Serial.print(" valor: ");      Serial.println(valor);


      if (comando=="hola") {
          //enviarSaludo();
          enviarConfig();
      } else if (comando=="giro") {
        //sentido = (valor==+1)? true : false;
        //temporizadorGiro.attach(inc_t, girar_); 
        girar(aceleracion, velocidad);
      } else if (comando=="paro") {
        //parar_();
        parar();
      } else if (comando=="pasos") {
        /*pasosObjetivo = pasosActuales + valor;
        if (pasosObjetivo > MAX_PASOS) pasosObjetivo = MAX_PASOS;
        else if (pasosObjetivo < 0 )    pasosObjetivo = 0.;
        gradosObjetivo = pasos2Grados(pasosObjetivo);
        */
        incPasos(aceleracion, velocidad, valor);
      } else if (comando=="posicion") {
        //gradosObjetivo = valor;
        //pasosObjetivo = grados2Pasos(gradosObjetivo);
        gotoPasos(aceleracion, velocidad, valor);
      } 

      /*if (pasosObjetivo!=pasosActuales) {
        temporizador.attach(inc_t, accionPasoPaso); 
      }
      */

/*
      JsonDocument respuesta;
      respuesta["resultado"]="OK";
      respuesta["grados"]=gradosObjetivo;
      respuesta["pasos"]=pasosObjetivo;

      String respuestaStr;
      serializeJson(respuesta, respuestaStr);
*/
      //webSocket.sendTXT(num, respuestaStr);

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


  cargarConfigInicial();

  gradosObjetivo = GRADOS_INICIALES;
  gradosActuales = GRADOS_INICIALES;
  pasosObjetivo = grados2Pasos(gradosObjetivo); 
  pasosActuales = grados2Pasos(gradosActuales);

  int pos_inicial = grados2Pasos(GRADOS_INICIALES);
  motor.setCurrentPosition(pos_inicial);

  server.begin();
  webSocket.begin();
  webSocket.onEvent(onWebSocketEvent);

  Serial.println("Servidor web/websockets iniciado");


} // setup



void loop(void) {
  server.handleClient();
  webSocket.loop();
  bool todavia=true;
  bool yano=true;
  int distancia = motor.distanceToGo();
  if (distancia !=0 ) {
    Serial.print("motor.distanceToGo: "); Serial.println(distancia);
    yano=false;
  }
  else if (!yano) {
    Serial.print("motor.distanceToGo: "); Serial.println(distancia);
    yano =true;
  }
  if (motor.distanceToGo()!=0) {
    motor.run();
    enviarEstado(false);
    todavia = false;
    Serial.println("Moviendo...");
  } else if (!todavia) {
    todavia = true;
    enviarEstado(true);
    Serial.println("Llegado!!!");
  }
  delay(2);  //para permitir que la CPU pueda conmutar a otras tareas
}


