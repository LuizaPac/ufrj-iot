/*
  ConfigurableFirmata for Arduino Uno with stepper support
  Exposes the digital and AccelStepper features used by server.js
*/

#include <ConfigurableFirmata.h>

#define ENABLE_DIGITAL
#define ENABLE_ANALOG
#define ENABLE_SERIAL
#define ENABLE_ACCELSTEPPER

#ifdef ENABLE_DIGITAL
#include <DigitalInputFirmata.h>
DigitalInputFirmata digitalInput;

#include <DigitalOutputFirmata.h>
DigitalOutputFirmata digitalOutput;
#endif

#ifdef ENABLE_ANALOG
#include <AnalogInputFirmata.h>
AnalogInputFirmata analogInput;

#include <AnalogOutputFirmata.h>
AnalogOutputFirmata analogOutput;
#endif

#ifdef ENABLE_SERIAL
#include <SerialFirmata.h>
SerialFirmata serial;
#endif

#ifdef ENABLE_ACCELSTEPPER
#include <AccelStepperFirmata.h>
AccelStepperFirmata accelStepper;
#endif

#include <FirmataExt.h>
FirmataExt firmataExt;

#include <FirmataReporting.h>
FirmataReporting reporting;

void systemResetCallback() {
  firmataExt.reset();
}

void initTransport() {
  Firmata.begin(57600);
  Firmata.disableBlinkVersion();
}

void initFirmata() {
#ifdef ENABLE_DIGITAL
  firmataExt.addFeature(digitalInput);
  firmataExt.addFeature(digitalOutput);
#endif

#ifdef ENABLE_ANALOG
  firmataExt.addFeature(analogInput);
  firmataExt.addFeature(analogOutput);
#endif

#ifdef ENABLE_SERIAL
  firmataExt.addFeature(serial);
#endif

#ifdef ENABLE_ACCELSTEPPER
  firmataExt.addFeature(accelStepper);
#endif

  firmataExt.addFeature(reporting);
  Firmata.attach(SYSTEM_RESET, systemResetCallback);
}

void setup() {
  Firmata.setFirmwareNameAndVersion(
    "ConfigurableFirmata",
    FIRMATA_FIRMWARE_MAJOR_VERSION,
    FIRMATA_FIRMWARE_MINOR_VERSION
  );

  initTransport();
  Firmata.sendString(F("Booting device. Stand by..."));
  initFirmata();
  Firmata.parse(SYSTEM_RESET);
}

void loop() {
  while (Firmata.available()) {
    Firmata.processInput();
    if (!Firmata.isParsingMessage()) {
      break;
    }
  }

  firmataExt.report(reporting.elapsed());
}
