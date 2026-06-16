/*
 * ConfigurableFirmata Minimal ESP8266 (NodeMCU) - sem I2C
 */

#include <ConfigurableFirmata.h>

// Apenas módulos essenciais
#define ENABLE_DIGITAL
#define ENABLE_ANALOG
#define ENABLE_ACCELSTEPPER  // Motor de passo

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

#ifdef ENABLE_ACCELSTEPPER
#include <AccelStepperFirmata.h>
AccelStepperFirmata accelStepper;
#endif

#include <FirmataExt.h>
FirmataExt firmataExt;

#include <FirmataReporting.h>
FirmataReporting reporting;

void systemResetCallback()
{
  firmataExt.reset();
}

void initTransport()
{
  // Serial padrão NodeMCU
  Firmata.begin(115200);
}

void initFirmata()
{
#ifdef ENABLE_DIGITAL
  firmataExt.addFeature(digitalInput);
  firmataExt.addFeature(digitalOutput);
#endif

#ifdef ENABLE_ANALOG
  firmataExt.addFeature(analogInput);
  firmataExt.addFeature(analogOutput);
#endif

#ifdef ENABLE_ACCELSTEPPER
  firmataExt.addFeature(accelStepper);
#endif

  firmataExt.addFeature(reporting);
  Firmata.attach(SYSTEM_RESET, systemResetCallback);
}

void setup()
{
  Firmata.setFirmwareNameAndVersion(
    "ConfigurableFirmata",
    FIRMATA_FIRMWARE_MAJOR_VERSION,
    FIRMATA_FIRMWARE_MINOR_VERSION
  );

  initTransport();
  initFirmata();

  Firmata.parse(SYSTEM_RESET);
}

void loop()
{
  while (Firmata.available())
  {
    Firmata.processInput();

    if (!Firmata.isParsingMessage())
    {
      break;
    }
  }

  firmataExt.report(reporting.elapsed());
}