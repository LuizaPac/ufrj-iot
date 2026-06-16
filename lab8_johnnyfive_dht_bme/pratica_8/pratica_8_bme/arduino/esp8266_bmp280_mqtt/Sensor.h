#ifndef SENSOR_H
#define SENSOR_H

#include <PubSubClient.h>

class Sensor {
 public:
  virtual ~Sensor() {}
  virtual const char* name() const = 0;
  virtual bool begin() = 0;
  virtual void readAndPublish(PubSubClient& mqttClient) = 0;
};

#endif
